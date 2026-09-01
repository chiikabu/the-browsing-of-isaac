/* host_shims_al.c -- strong implementations for the OpenAL surface.
 *
 * Reachability: the game's audio engine (0x00a7d2a0 init / 0x00a7d5f8+ dtor /
 * 0x00a7d960 slot poller / 0x00a7dac0+ vtable family) calls the 26-name
 * surface through the static IAT (0x00b18504..0x00b18570). All rows are
 * cdecl (the guest cleans its own pushes), so these bodies never purge.
 *
 * Policy (headless native port): benign answers chosen so init succeeds and
 * the engine keeps running silent:
 *   alcOpenDevice(NULL)          -> fake device token (init stores it at
 *                                   [eng+0x38], NULL would be the error path)
 *   alcCreateContext(dev, attr)  -> fake context token ([eng+0x34])
 *   alcMakeContextCurrent(ctx)   -> 1  (init gates on `test al,al`)
 *   alcProcessContext(ctx)       -> no-op
 *   alcGetString(dev, 0x1006)    -> "" (ALC_EXTENSIONS; logged with %s)
 *   alcIsExtensionPresent        -> 0  (feature probes fall back)
 *   alGetError()                 -> 0  (the engine logs errors; stay clean)
 *   alGetString(0xB001/2/3)      -> vendor/renderer/version scratch strings
 *   alGenSources/alGenBuffers    -> fake object tokens written into guest
 *   alGetSourcei(...,0x1010,out) -> *out = AL_INITIAL (slot poller reuses
 *                                   the first slot instead of treating
 *                                   everything as playing)
 *   everything else              -> no-op
 */
#include "isaac_host.h"
#include "shim_decls.h"

#include <string.h>
#include <stdio.h>

/* Guest-visible scratch for the AL string answers. 0x0e006000 holds the GL
 * version string; module tokens start at 0x0e010000. 0x0e006100..0x0e006180
 * sits between, below ISAAC_GUEST_LIMIT_VA, written by the host only. */
#define AL_SCRATCH_VA 0x0e006100u

static void al_log_once(const char *name, const char *args) {
    static const char *seen[128];
    static unsigned nseen = 0;
    for (unsigned i = 0; i < nseen; ++i)
        if (seen[i] == name) return;
    if (nseen < 128) seen[nseen++] = name;
    fprintf(stderr, "[al] %s(%s)\n", name, args);
}

static uint32_t al_next_token(void) {
    static uint32_t n = 0x7788c000u;
    return n += 0x10u;
}

static void al_write_tokens(uint32_t count, uint32_t out) {
    for (uint32_t i = 0; i < count; ++i) {
        if (isaac_is_guest_va(out + 4 * i))
            isaac_w32(out + 4 * i, al_next_token());
    }
}

/* ALCdevice *alcOpenDevice(const ALCchar *devicename) */
void imp_openal32__alcOpenDevice(CpuState *restrict cpu) {
    uint32_t name = isaac_arg(cpu, 0);
    if (isaac_is_guest_va(name)) {
        char buf[64];
        size_t n = 0;
        const char *q = (const char *)isaac_g(name);
        while (n + 1 < sizeof buf && q[n]) { buf[n] = q[n]; ++n; }
        buf[n] = 0;
        al_log_once("alcOpenDevice", buf);
    } else {
        al_log_once("alcOpenDevice", "NULL");
    }
    cpu->EAX = al_next_token();
}

/* ALCcontext *alcCreateContext(ALCdevice *device, const ALCint *attrlist) */
void imp_openal32__alcCreateContext(CpuState *restrict cpu) {
    al_log_once("alcCreateContext", "dev, attrlist");
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    cpu->EAX = al_next_token();
}

/* ALCboolean alcMakeContextCurrent(ALCcontext *ctx) */
void imp_openal32__alcMakeContextCurrent(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    cpu->EAX = 1;
}

/* void alcProcessContext(ALCcontext *ctx) */
void imp_openal32__alcProcessContext(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    cpu->EAX = 0;
}

/* void alcDestroyContext(ALCcontext *ctx) */
void imp_openal32__alcDestroyContext(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    cpu->EAX = 0;
}

/* ALCboolean alcCloseDevice(ALCdevice *device) */
void imp_openal32__alcCloseDevice(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    cpu->EAX = 1;
}

/* const ALCchar *alcGetString(ALCdevice *device, ALCenum param) */
void imp_openal32__alcGetString(CpuState *restrict cpu) {
    uint32_t param = isaac_arg(cpu, 1);
    if (param == 0x1006u) {            /* ALC_EXTENSIONS: empty string */
        memcpy(isaac_g(AL_SCRATCH_VA), "", 1);
        cpu->EAX = AL_SCRATCH_VA;
        return;
    }
    cpu->EAX = 0;
}

/* ALCboolean alcIsExtensionPresent(ALCdevice *device, const ALCchar *ext) */
void imp_openal32__alcIsExtensionPresent(CpuState *restrict cpu) {
    uint32_t ext = isaac_arg(cpu, 1);
    if (isaac_is_guest_va(ext)) {
        char buf[64];
        size_t n = 0;
        const char *q = (const char *)isaac_g(ext);
        while (n + 1 < sizeof buf && q[n]) { buf[n] = q[n]; ++n; }
        buf[n] = 0;
        al_log_once("alcIsExtensionPresent", buf);
    }
    cpu->EAX = 0;                     /* no extensions: engine falls back */
}

/* void *alcGetProcAddress(const ALCchar *funcname) -- never statically
 * called by the game (census: 0 sites); defined for completeness. */
void imp_openal32__alcGetProcAddress(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    cpu->EAX = 0;
}

/* ALenum alGetError(void) */
void imp_openal32__alGetError(CpuState *restrict cpu) {
    cpu->EAX = 0;                     /* AL_NO_ERROR */
}

/* const ALchar *alGetString(ALenum param) */
void imp_openal32__alGetString(CpuState *restrict cpu) {
    uint32_t param = isaac_arg(cpu, 0);
    static const char vendor[] = "Isaac Native Headless";
    static const char renderer[] = "wasm headless";
    static const char version[] = "1.1";
    uint32_t va = 0;
    switch (param) {
    case 0xB001u:                     /* AL_VENDOR */
        memcpy(isaac_g(AL_SCRATCH_VA), vendor, sizeof vendor);
        va = AL_SCRATCH_VA; break;
    case 0xB002u:                     /* AL_RENDERER */
        memcpy(isaac_g(AL_SCRATCH_VA), renderer, sizeof renderer);
        va = AL_SCRATCH_VA; break;
    case 0xB003u:                     /* AL_VERSION */
        memcpy(isaac_g(AL_SCRATCH_VA), version, sizeof version);
        va = AL_SCRATCH_VA; break;
    default:
        break;
    }
    cpu->EAX = va;
}

/* void alGenSources(ALsizei n, ALuint *sources) */
void imp_openal32__alGenSources(CpuState *restrict cpu) {
    al_log_once("alGenSources", "n, out");
    al_write_tokens(isaac_arg(cpu, 0), isaac_arg(cpu, 1));
    cpu->EAX = 0;
}

/* void alDeleteSources(ALsizei n, const ALuint *sources) */
void imp_openal32__alDeleteSources(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    cpu->EAX = 0;
}

/* void alGenBuffers(ALsizei n, ALuint *buffers) */
void imp_openal32__alGenBuffers(CpuState *restrict cpu) {
    al_log_once("alGenBuffers", "n, out");
    al_write_tokens(isaac_arg(cpu, 0), isaac_arg(cpu, 1));
    cpu->EAX = 0;
}

/* void alDeleteBuffers(ALsizei n, const ALuint *buffers) */
void imp_openal32__alDeleteBuffers(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    cpu->EAX = 0;
}

/* void alSourcei(ALuint src, ALenum param, ALint value) */
void imp_openal32__alSourcei(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1); (void)isaac_arg(cpu, 2);
    cpu->EAX = 0;
}

/* void alSourcef(ALuint src, ALenum param, ALfloat value) */
void imp_openal32__alSourcef(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1); (void)isaac_arg(cpu, 2);
    cpu->EAX = 0;
}

/* void alSource3f(ALuint src, ALenum param, ALfloat v1, v2, v3) */
void imp_openal32__alSource3f(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    (void)isaac_arg(cpu, 2); (void)isaac_arg(cpu, 3); (void)isaac_arg(cpu, 4);
    cpu->EAX = 0;
}

/* void alSourcePlay(ALuint src) */
void imp_openal32__alSourcePlay(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    cpu->EAX = 0;
}

/* void alSourceStop(ALuint src) */
void imp_openal32__alSourceStop(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    cpu->EAX = 0;
}

/* void alSourcePause(ALuint src) */
void imp_openal32__alSourcePause(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    cpu->EAX = 0;
}

/* void alSourceQueueBuffers(ALuint src, ALsizei n, const ALuint *bufs) */
void imp_openal32__alSourceQueueBuffers(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1); (void)isaac_arg(cpu, 2);
    cpu->EAX = 0;
}

/* void alSourceUnqueueBuffers(ALuint src, ALsizei n, ALuint *bufs) */
void imp_openal32__alSourceUnqueueBuffers(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1); (void)isaac_arg(cpu, 2);
    cpu->EAX = 0;
}

/* void alGetSourcei(ALuint src, ALenum param, ALint *out) */
void imp_openal32__alGetSourcei(CpuState *restrict cpu) {
    uint32_t out = isaac_arg(cpu, 2);
    if (isaac_is_guest_va(out)) isaac_w32(out, 0);   /* AL_INITIAL / 0 */
    cpu->EAX = 0;
}

/* void alGetSourcef(ALuint src, ALenum param, ALfloat *out) */
void imp_openal32__alGetSourcef(CpuState *restrict cpu) {
    uint32_t out = isaac_arg(cpu, 2);
    if (isaac_is_guest_va(out)) isaac_w32(out, 0);   /* 0.0f */
    cpu->EAX = 0;
}

/* void alBufferData(ALuint buf, ALenum format, const ALvoid *data,
 *                   ALsizei size, ALsizei freq) */
void imp_openal32__alBufferData(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1); (void)isaac_arg(cpu, 2);
    (void)isaac_arg(cpu, 3); (void)isaac_arg(cpu, 4);
    cpu->EAX = 0;
}

/* void alListener3f(ALenum param, ALfloat v1, v2, v3) */
void imp_openal32__alListener3f(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    (void)isaac_arg(cpu, 2); (void)isaac_arg(cpu, 3);
    cpu->EAX = 0;
}

/* void alListenerfv(ALenum param, const ALfloat *vals) */
void imp_openal32__alListenerfv(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    cpu->EAX = 0;
}
