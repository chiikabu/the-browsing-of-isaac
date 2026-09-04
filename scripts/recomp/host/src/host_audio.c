/* host_audio.c -- the audio engine behind the OpenAL surface.
 *
 * host_shims_al.c used to answer the whole 26-name openal32 surface with
 * benign constants: buffers and sources were tokens nobody remembered, every
 * play was a no-op, and `alGetSourcei(AL_SOURCE_STATE)` always said
 * AL_INITIAL so the engine's slot poller reused the first slot forever. The
 * game ran silent and, more importantly, could not stream: a source that is
 * never "playing" never reports a processed buffer, so the music path had
 * nothing to unqueue.
 *
 * This file is the object model that surface needs, and it is deliberately
 * independent of whether anything can actually be heard:
 *
 *   buffers   remember their PCM (format, channels, bit depth, rate) and the
 *             duration that implies
 *   sources   have a state, a gain, a pitch, an optional static buffer and a
 *             queue; they advance on the wall clock, so a source stops when
 *             its sound would have finished and a streaming source reports
 *             buffers as processed when their audio would have played out
 *
 * That much makes the guest's audio logic behave correctly with no output
 * device at all, which is what the node profile has. A backend can then be
 * plugged underneath to make it audible; the web build's is WebAudio, in
 * host_audio_web.c. The backend hooks are weak, so a profile that provides
 * none links and runs silent.
 *
 * ISAAC_AUDIO_TRACE=1 logs every state change; isaac_audio_report() prints
 * the census with the stub report.
 */

#include "isaac_host.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#else
static double emscripten_get_now(void) { return 0.0; }
#endif

/* ---- AL constants (the subset the game uses) ---------------------------- */
#define AL_NONE               0x0000u
#define AL_PITCH              0x1003u
#define AL_POSITION           0x1004u
#define AL_LOOPING            0x1007u
#define AL_BUFFER             0x1009u
#define AL_GAIN               0x100Au
#define AL_SOURCE_STATE       0x1010u
#define AL_INITIAL            0x1011u
#define AL_PLAYING            0x1012u
#define AL_PAUSED             0x1013u
#define AL_STOPPED            0x1014u
#define AL_BUFFERS_QUEUED     0x1015u
#define AL_BUFFERS_PROCESSED  0x1016u
#define AL_SEC_OFFSET         0x1024u
#define AL_SAMPLE_OFFSET      0x1025u
#define AL_BYTE_OFFSET        0x1026u
#define AL_SOURCE_TYPE        0x1027u
#define AL_STATIC             0x1028u
#define AL_STREAMING          0x1029u
#define AL_UNDETERMINED       0x1030u

#define AL_FORMAT_MONO8       0x1100u
#define AL_FORMAT_MONO16      0x1101u
#define AL_FORMAT_STEREO8     0x1102u
#define AL_FORMAT_STEREO16    0x1103u

/* ---- backend hooks (weak: a profile with no output still links) --------- */
__attribute__((weak)) void isaac_audio_backend_buffer(uint32_t id, const void *pcm, uint32_t bytes,
                                                      int channels, int bits, int freq) {
    (void)id; (void)pcm; (void)bytes; (void)channels; (void)bits; (void)freq;
}
__attribute__((weak)) void isaac_audio_backend_play(uint32_t src, uint32_t buffer,
                                                    float gain, float pitch, int looping) {
    (void)src; (void)buffer; (void)gain; (void)pitch; (void)looping;
}
__attribute__((weak)) void isaac_audio_backend_stop(uint32_t src) { (void)src; }
__attribute__((weak)) void isaac_audio_backend_pause(uint32_t src) { (void)src; }
__attribute__((weak)) void isaac_audio_backend_gain(uint32_t src, float gain) { (void)src; (void)gain; }
__attribute__((weak)) void isaac_audio_backend_drop_buffer(uint32_t id) { (void)id; }

/* ---- objects ------------------------------------------------------------ */
#define AL_MAX_QUEUE 64

typedef struct {
    uint32_t id;
    uint8_t *pcm;
    uint32_t bytes;
    int channels, bits, freq;
    double seconds;
} al_buffer;

typedef struct {
    uint32_t id;
    uint32_t state;
    uint32_t buffer;                 /* AL_BUFFER, static play */
    float gain, pitch;
    int looping;
    double start_ms;                 /* when the CURRENT buffer began */
    double pause_ms;                 /* offset held while paused */
    uint32_t queue[AL_MAX_QUEUE];    /* streaming: not-yet-unqueued buffers */
    unsigned qn;                     /* entries in queue[] */
    unsigned processed;              /* how many of them have played out */
    uint32_t type;                   /* AL_STATIC / AL_STREAMING / AL_UNDETERMINED */
} al_source;

static al_buffer *g_buf;
static unsigned g_nbuf, g_cbuf;
static al_source *g_src;
static unsigned g_nsrc, g_csrc;
static uint32_t g_next_token = 0x7788c000u;
static int g_trace = -1;

/* census, printed with the stub report */
static unsigned g_stat_buffers, g_stat_plays, g_stat_queued, g_stat_unqueued;
static unsigned long long g_stat_pcm_bytes;
static double g_stat_seconds;

static int trace_on(void) {
    if (g_trace < 0) {
        const char *e = getenv("ISAAC_AUDIO_TRACE");
        g_trace = (e && *e && *e != '0') ? 1 : 0;
    }
    return g_trace;
}

static double now_ms(void) { return emscripten_get_now(); }

static al_buffer *buf_find(uint32_t id) {
    for (unsigned i = 0; i < g_nbuf; ++i) if (g_buf[i].id == id) return &g_buf[i];
    return NULL;
}
static al_source *src_find(uint32_t id) {
    for (unsigned i = 0; i < g_nsrc; ++i) if (g_src[i].id == id) return &g_src[i];
    return NULL;
}

static al_buffer *buf_new(void) {
    if (g_nbuf == g_cbuf) {
        unsigned c = g_cbuf ? g_cbuf * 2u : 64u;
        al_buffer *p = (al_buffer *)realloc(g_buf, c * sizeof *p);
        if (!p) return NULL;
        g_buf = p; g_cbuf = c;
    }
    al_buffer *b = &g_buf[g_nbuf++];
    memset(b, 0, sizeof *b);
    b->id = (g_next_token += 0x10u);
    return b;
}
static al_source *src_new(void) {
    if (g_nsrc == g_csrc) {
        unsigned c = g_csrc ? g_csrc * 2u : 64u;
        al_source *p = (al_source *)realloc(g_src, c * sizeof *p);
        if (!p) return NULL;
        g_src = p; g_csrc = c;
    }
    al_source *s = &g_src[g_nsrc++];
    memset(s, 0, sizeof *s);
    s->id = (g_next_token += 0x10u);
    s->state = AL_INITIAL;
    s->gain = 1.0f;
    s->pitch = 1.0f;
    s->type = AL_UNDETERMINED;
    return s;
}

static double buf_seconds(const al_buffer *b) { return b ? b->seconds : 0.0; }

/* The head of a streaming source is the first queue entry not yet processed;
 * a static source plays s->buffer. */
static uint32_t src_current_buffer(const al_source *s) {
    if (s->qn > s->processed) return s->queue[s->processed];
    return s->buffer;
}

/* Advance a playing source over the wall clock: retire whole buffers whose
 * audio would have finished, and stop (or loop) when nothing is left. */
static void src_advance(al_source *s) {
    if (s->state != AL_PLAYING) return;
    double pitch = s->pitch > 0.01f ? (double)s->pitch : 1.0;
    for (;;) {
        uint32_t cur = src_current_buffer(s);
        al_buffer *b = buf_find(cur);
        double dur = buf_seconds(b) * 1000.0 / pitch;
        if (dur <= 0.0) {
            /* nothing playable: a source with no buffer is not playing */
            if (s->qn > s->processed) { ++s->processed; continue; }
            s->state = AL_STOPPED;
            return;
        }
        if (now_ms() - s->start_ms < dur) return;      /* still inside it */
        s->start_ms += dur;
        if (s->qn > s->processed) {
            ++s->processed;                            /* streaming: retire it */
            if (s->qn > s->processed) continue;        /* next queued buffer */
            s->state = AL_STOPPED;                     /* queue ran dry */
            return;
        }
        if (s->looping) continue;                      /* static loop: keep going */
        s->state = AL_STOPPED;
        return;
    }
}

/* ---- the surface host_shims_al.c calls --------------------------------- */

void isaac_audio_gen_buffers(uint32_t n, uint32_t out_va) {
    for (uint32_t i = 0; i < n; ++i) {
        al_buffer *b = buf_new();
        if (isaac_is_guest_va(out_va + 4u * i))
            isaac_w32(out_va + 4u * i, b ? b->id : 0u);
    }
}

void isaac_audio_gen_sources(uint32_t n, uint32_t out_va) {
    for (uint32_t i = 0; i < n; ++i) {
        al_source *s = src_new();
        if (isaac_is_guest_va(out_va + 4u * i))
            isaac_w32(out_va + 4u * i, s ? s->id : 0u);
    }
}

void isaac_audio_delete_buffers(uint32_t n, uint32_t va) {
    for (uint32_t i = 0; i < n; ++i) {
        if (!isaac_is_guest_va(va + 4u * i)) continue;
        uint32_t id = isaac_r32(va + 4u * i);
        al_buffer *b = buf_find(id);
        if (!b) continue;
        isaac_audio_backend_drop_buffer(id);
        free(b->pcm);
        *b = g_buf[--g_nbuf];
    }
}

void isaac_audio_delete_sources(uint32_t n, uint32_t va) {
    for (uint32_t i = 0; i < n; ++i) {
        if (!isaac_is_guest_va(va + 4u * i)) continue;
        uint32_t id = isaac_r32(va + 4u * i);
        al_source *s = src_find(id);
        if (!s) continue;
        isaac_audio_backend_stop(id);
        *s = g_src[--g_nsrc];
    }
}

void isaac_audio_buffer_data(uint32_t buf, uint32_t format, uint32_t data_va,
                             uint32_t bytes, uint32_t freq) {
    al_buffer *b = buf_find(buf);
    if (!b) return;
    int channels = (format == AL_FORMAT_STEREO8 || format == AL_FORMAT_STEREO16) ? 2 : 1;
    int bits = (format == AL_FORMAT_MONO16 || format == AL_FORMAT_STEREO16) ? 16 : 8;
    uint32_t frame = (uint32_t)channels * (uint32_t)(bits / 8);
    free(b->pcm);
    b->pcm = NULL;
    b->bytes = 0;
    b->channels = channels;
    b->bits = bits;
    b->freq = (int)freq;
    b->seconds = (freq && frame) ? (double)bytes / (double)(frame * freq) : 0.0;
    if (bytes && isaac_is_guest_va(data_va) && isaac_is_guest_va(data_va + bytes - 1u)) {
        b->pcm = (uint8_t *)malloc(bytes);
        if (b->pcm) {
            memcpy(b->pcm, isaac_g(data_va), bytes);
            b->bytes = bytes;
        }
    }
    ++g_stat_buffers;
    g_stat_pcm_bytes += bytes;
    g_stat_seconds += b->seconds;
    if (b->pcm) isaac_audio_backend_buffer(b->id, b->pcm, b->bytes, channels, bits, (int)freq);
    if (trace_on())
        isaac_log("[isaac][audio] buffer %u: %u bytes, %d ch, %d bit, %u Hz, %.3f s",
                  buf, bytes, channels, bits, freq, b->seconds);
}

void isaac_audio_source_i(uint32_t src, uint32_t param, int32_t value) {
    al_source *s = src_find(src);
    if (!s) return;
    switch (param) {
    case AL_BUFFER:
        s->buffer = (uint32_t)value;
        s->type = value ? AL_STATIC : AL_UNDETERMINED;
        s->qn = s->processed = 0;
        break;
    case AL_LOOPING: s->looping = value != 0; break;
    default: break;
    }
}

void isaac_audio_source_f(uint32_t src, uint32_t param, float value) {
    al_source *s = src_find(src);
    if (!s) return;
    switch (param) {
    case AL_GAIN:
        s->gain = value;
        isaac_audio_backend_gain(src, value);
        break;
    case AL_PITCH: s->pitch = value; break;
    default: break;
    }
}

int32_t isaac_audio_get_source_i(uint32_t src, uint32_t param) {
    al_source *s = src_find(src);
    if (!s) return 0;
    src_advance(s);
    switch (param) {
    case AL_SOURCE_STATE:      return (int32_t)s->state;
    case AL_BUFFERS_QUEUED:    return (int32_t)(s->qn - s->processed);
    case AL_BUFFERS_PROCESSED: return (int32_t)s->processed;
    case AL_BUFFER:            return (int32_t)src_current_buffer(s);
    case AL_LOOPING:           return s->looping;
    case AL_SOURCE_TYPE:       return (int32_t)s->type;
    case AL_SAMPLE_OFFSET:
    case AL_BYTE_OFFSET: {
        al_buffer *b = buf_find(src_current_buffer(s));
        if (!b || s->state != AL_PLAYING) return 0;
        double sec = (now_ms() - s->start_ms) / 1000.0;
        if (sec < 0.0) sec = 0.0;
        double samples = sec * (double)b->freq;
        if (param == AL_SAMPLE_OFFSET) return (int32_t)samples;
        return (int32_t)(samples * (double)b->channels * (double)(b->bits / 8));
    }
    default: return 0;
    }
}

float isaac_audio_get_source_f(uint32_t src, uint32_t param) {
    al_source *s = src_find(src);
    if (!s) return 0.0f;
    src_advance(s);
    switch (param) {
    case AL_GAIN:  return s->gain;
    case AL_PITCH: return s->pitch;
    case AL_SEC_OFFSET:
        if (s->state != AL_PLAYING) return 0.0f;
        return (float)((now_ms() - s->start_ms) / 1000.0);
    default: return 0.0f;
    }
}

void isaac_audio_play(uint32_t src) {
    al_source *s = src_find(src);
    if (!s) return;
    if (s->state == AL_PAUSED) {
        s->start_ms = now_ms() - s->pause_ms;     /* resume where it stopped */
    } else {
        s->start_ms = now_ms();
    }
    s->state = AL_PLAYING;
    uint32_t cur = src_current_buffer(s);
    ++g_stat_plays;
    isaac_audio_backend_play(src, cur, s->gain, s->pitch, s->looping);
    if (trace_on())
        isaac_log("[isaac][audio] play source %u buffer %u gain %.2f pitch %.2f%s",
                  src, cur, (double)s->gain, (double)s->pitch, s->looping ? " looping" : "");
}

void isaac_audio_stop(uint32_t src) {
    al_source *s = src_find(src);
    if (!s) return;
    s->state = AL_STOPPED;
    s->pause_ms = 0.0;
    isaac_audio_backend_stop(src);
    if (trace_on()) isaac_log("[isaac][audio] stop source %u", src);
}

void isaac_audio_pause(uint32_t src) {
    al_source *s = src_find(src);
    if (!s) return;
    if (s->state == AL_PLAYING) s->pause_ms = now_ms() - s->start_ms;
    s->state = AL_PAUSED;
    isaac_audio_backend_pause(src);
}

void isaac_audio_queue(uint32_t src, uint32_t n, uint32_t bufs_va) {
    al_source *s = src_find(src);
    if (!s) return;
    s->type = AL_STREAMING;
    for (uint32_t i = 0; i < n; ++i) {
        if (!isaac_is_guest_va(bufs_va + 4u * i)) break;
        if (s->qn >= AL_MAX_QUEUE) {
            /* compact: drop the already-processed head entries */
            if (s->processed) {
                memmove(s->queue, s->queue + s->processed,
                        (s->qn - s->processed) * sizeof s->queue[0]);
                s->qn -= s->processed;
                s->processed = 0;
            }
            if (s->qn >= AL_MAX_QUEUE) break;
        }
        s->queue[s->qn++] = isaac_r32(bufs_va + 4u * i);
        ++g_stat_queued;
    }
    if (trace_on()) isaac_log("[isaac][audio] queue %u buffer(s) on source %u (%u waiting)",
                              n, src, s->qn - s->processed);
}

uint32_t isaac_audio_unqueue(uint32_t src, uint32_t n, uint32_t out_va) {
    al_source *s = src_find(src);
    if (!s) return 0;
    src_advance(s);
    uint32_t take = n < s->processed ? n : s->processed;
    for (uint32_t i = 0; i < take; ++i)
        if (isaac_is_guest_va(out_va + 4u * i))
            isaac_w32(out_va + 4u * i, s->queue[i]);
    if (take) {
        memmove(s->queue, s->queue + take, (s->qn - take) * sizeof s->queue[0]);
        s->qn -= take;
        s->processed -= take;
        g_stat_unqueued += take;
    }
    return take;
}

/* Round 16d probe, kept for re-use: it answered why the game submits no
 * PCM and is not wired in by default, because a permanent WRAP_PATCHES entry
 * would have to follow the fastpath-wrapper contract (mode check, owns the
 * ret) that tests/recomp-fastpath.test.js pins, and this only observes. To
 * re-enable, add a wrapper for 0x00a9fb80 that calls this and then
 * sub_00a9fb80__lifted(s).
 *
 * Why the game never submits PCM. sub_00a9fb80 binds a free AL
 * source to a sound and uploads its buffer, but only when
 *
 *     vt[0x38](this) == 0 && this[10] != 0 && this[0xb] != 0
 *
 * where this[10] and this[0xb] are the sample's PCM pointer and length. The
 * wrapper in lift_patches.py calls this first, so a run says which of the
 * three is the one that fails. */
void isaac_audio_probe_bind(uint32_t self) {
    static unsigned n;
    if (n >= 12u || !isaac_is_guest_va(self + 0x40u)) return;
    ++n;
    uint32_t vt = isaac_r32(self);
    isaac_log("[isaac][audio] bind probe #%u: this=0x%08x vtable=0x%08x pcm=0x%08x bytes=%u "
              "format=0x%x rate=%u source=%u",
              n, self, vt, isaac_r32(self + 40u), isaac_r32(self + 44u),
              isaac_r32(self + 48u), isaac_r32(self + 36u), isaac_r32(self + 52u));
    /* this[0x44] is the sample descriptor {ptr, len} that vt+0x08 hands to
     * vt+0x04 (FUN_00a9fb00), which is what fills this[10]/this[0xb]. If it
     * is null or empty, nothing ever loaded the sample. */
    uint32_t desc = isaac_r32(self + 0x44u);
    isaac_log("[isaac][audio]   sample descriptor this[0x44]=0x%08x -> ptr=0x%08x len=%u, loaded flag this[8]=%u",
              desc,
              (desc && isaac_is_guest_va(desc + 8u)) ? isaac_r32(desc) : 0u,
              (desc && isaac_is_guest_va(desc + 8u)) ? isaac_r32(desc + 4u) : 0u,
              *(const uint8_t *)isaac_g(self + 8u));
    if (n == 1u && isaac_is_guest_va(vt + 0x50u)) {
        /* the class's methods, read from the live image: the loader that
         * should have filled the PCM fields is one of these */
        for (uint32_t i = 0; i < 0x50u; i += 0x10u)
            isaac_log("[isaac][audio]   vt+0x%02x: %08x %08x %08x %08x", i,
                      isaac_r32(vt + i), isaac_r32(vt + i + 4u),
                      isaac_r32(vt + i + 8u), isaac_r32(vt + i + 12u));
    }
}

/* ---- driving the game's audio thread ------------------------------------
 * The engine runs its mixer on a thread (FUN_00a7da80) whose body is
 *
 *     while ((self[1] & 4) == 0) {
 *         if (!vt[0x20](self)) vt[0x3c](self);
 *         Sleep(5);
 *     }
 *
 * and which therefore never returns. The port has no threads, and running
 * that job inline hangs the boot. Since one iteration is a pair of virtual
 * calls, the host can be the thread instead: host_shims_module.c hands the
 * `this` pointer over when the job is spawned, and the frame present pumps
 * one iteration. That is the whole reason the game submits no audio without
 * it: every alBufferData and alSourcePlay is downstream of this loop. */
static uint32_t g_pump_this;
static unsigned g_pump_iters, g_pump_idle;

void isaac_audio_pump_register(uint32_t this_va) {
    g_pump_this = this_va;
    isaac_log("[isaac][audio] mixer object 0x%08x adopted: the frame present now "
              "pumps one iteration of the engine's audio thread per frame", this_va);
}

/* One call of a guest thiscall method: `this` in ECX, a fake return address,
 * and a stack well below the caller's frame (the same shape the cooperative
 * thread runner and _initterm use). */
static void pump_call(const CpuState *cpu, uint32_t fn, uint32_t self, uint32_t *eax_out) {
    CpuState sub = *cpu;
    sub.ECX = self;
    sub.ESP = (cpu->ESP - 0x4000u) & ~0xFu;
    sub.ESP -= 4u;
    isaac_w32(sub.ESP, 0u);
    isaac_guest_call(fn, &sub);
    if (eax_out) *eax_out = sub.EAX;
}

void isaac_audio_pump(const CpuState *cpu) {
    if (!g_pump_this || !cpu) return;
    if (!isaac_is_guest_va(g_pump_this + 8u)) return;
    if (*(const uint8_t *)isaac_g(g_pump_this + 4u) & 4u) return;   /* stopping */
    uint32_t vt = isaac_r32(g_pump_this);
    if (!isaac_is_guest_va(vt + 0x40u)) return;
    uint32_t step = isaac_r32(vt + 0x20u), idle = isaac_r32(vt + 0x3cu);
    if (!step) return;
    if (g_pump_iters == 0u)
        isaac_log("[isaac][audio] mixer vtable 0x%08x: step=vt[0x20]=0x%08x idle=vt[0x3c]=0x%08x, "
                  "flags byte 0x%02x, drain gate [this+0x60]=%u, pending list 0x%08x..0x%08x",
                  vt, step, idle, *(const uint8_t *)isaac_g(g_pump_this + 4u),
                  isaac_is_guest_va(g_pump_this + 0x60u) ? *(const uint8_t *)isaac_g(g_pump_this + 0x60u) : 0xFFu,
                  isaac_is_guest_va(g_pump_this + 0x20u) ? isaac_r32(g_pump_this + 0x1cu) : 0u,
                  isaac_is_guest_va(g_pump_this + 0x24u) ? isaac_r32(g_pump_this + 0x20u) : 0u);
    if (g_pump_iters && (g_pump_iters % 600u) == 0u)
        isaac_log("[isaac][audio] pump %u: gate=%u pending=%u sounds",
                  g_pump_iters,
                  isaac_is_guest_va(g_pump_this + 0x60u) ? *(const uint8_t *)isaac_g(g_pump_this + 0x60u) : 0xFFu,
                  (isaac_r32(g_pump_this + 0x20u) - isaac_r32(g_pump_this + 0x1cu)) / 4u);
    /* ISAAC_AUDIO_DEVICE_EVENT=1: set the byte the OpenAL-SOFT
     * device-changed callback would set. The engine's audio thread handler
     * (FUN_00a9e720) does all of its work inside `if (this[0x60])`, and the
     * only thing that ever sets that byte is the ALC_SOFT_system_events
     * callback (FUN_00a9e890, "OpenAL-SOFT device has changed") -- which this
     * port never delivers, because alcIsExtensionPresent says no and
     * alcGetProcAddress returns null. This is the probe for whether that is
     * what keeps the queued sounds from being bound to a source. */
    {
        static int forced = -1;
        if (forced < 0) {
            const char *e = getenv("ISAAC_AUDIO_DEVICE_EVENT");
            forced = (e && *e && *e != '0') ? 1 : 0;
        }
        if (forced == 1 && isaac_is_guest_va(g_pump_this + 0x60u)) {
            *(uint8_t *)isaac_g(g_pump_this + 0x60u) = 1u;
            forced = 2;
            isaac_log("[isaac][audio] forced the device-changed flag at 0x%08x", g_pump_this + 0x60u);
        }
    }
    uint32_t eax = 0;
    ++g_pump_iters;
    pump_call(cpu, step, g_pump_this, &eax);
    if (!(eax & 0xFFu) && idle) {
        ++g_pump_idle;
        pump_call(cpu, idle, g_pump_this, NULL);
    }
}

void isaac_audio_report(void) {
    { extern void isaac_al_census(void); isaac_al_census(); }
    if (!g_stat_buffers && !g_stat_plays) {
        isaac_log("[isaac][audio] no audio data was ever submitted (mixer pumped %u iteration(s)).", g_pump_iters);
        return;
    }
    unsigned playing = 0;
    for (unsigned i = 0; i < g_nsrc; ++i) {
        src_advance(&g_src[i]);
        if (g_src[i].state == AL_PLAYING) ++playing;
    }
    isaac_log("[isaac][audio] mixer pumped %u iteration(s), %u of them idle",
              g_pump_iters, g_pump_idle);
    isaac_log("[isaac][audio] %u buffer uploads (%.1f MB of PCM, %.1f s of audio), "
              "%u plays, %u queued / %u unqueued, %u source(s) live (%u playing), %u buffer(s) live",
              g_stat_buffers, (double)g_stat_pcm_bytes / 1048576.0, g_stat_seconds,
              g_stat_plays, g_stat_queued, g_stat_unqueued, g_nsrc, playing, g_nbuf);
}
