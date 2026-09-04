/* host_audio_web.c -- the WEB build's audio backend: WebAudio.
 *
 * host_audio.c owns the OpenAL object model and its timing; this file is the
 * part that makes it audible, and it compiles only with -DISAAC_WEB=1
 * (build_boot.py --web), exactly like host_gl_webgl.c. The node profile links
 * host_audio.c's weak no-op hooks instead and runs silent, which is what a
 * headless run wants.
 *
 * The mapping is direct. An AL buffer becomes an AudioBuffer: the guest hands
 * over interleaved PCM (8- or 16-bit, mono or stereo) and it is de-interleaved
 * into the float channels WebAudio wants. An AL source becomes a
 * BufferSource -> GainNode -> destination chain, rebuilt on every play because
 * a BufferSource is single-use. Gain and pitch map to gain.value and
 * playbackRate; looping maps to loop.
 *
 * Two browser realities this has to respect:
 *   - An AudioContext starts suspended until a user gesture. resume() is
 *     called on every play attempt; in the headless runner the page is
 *     launched with --autoplay-policy=no-user-gesture-required so it starts
 *     running.
 *   - Nothing here may throw into the guest. Every entry point swallows its
 *     own errors: silence is a bad outcome, a trap in the middle of a lifted
 *     call is a worse one.
 */

#ifdef ISAAC_WEB
#include "isaac_host.h"

#include <emscripten.h>
#include <stdint.h>

EM_JS(void, isaac_audio_js_buffer, (uint32_t id, const uint8_t *pcm, uint32_t bytes,
                                    int channels, int bits, int freq), {
  try {
    if (!Module.isaacAudio) Module.isaacAudio = { ctx: null, buffers: new Map(), sources: new Map() };
    var A = Module.isaacAudio;
    if (!A.ctx) {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return;
      A.ctx = new C();
    }
    var frame = channels * (bits >> 3);
    var frames = frame ? Math.floor(bytes / frame) : 0;
    if (!frames || !freq) return;
    var ab = A.ctx.createBuffer(channels, frames, freq);
    for (var c = 0; c < channels; c++) {
      var out = ab.getChannelData(c);
      if (bits === 16) {
        for (var i = 0; i < frames; i++) {
          var o = pcm + (i * channels + c) * 2;
          var v = HEAPU8[o] | (HEAPU8[o + 1] << 8);
          if (v & 0x8000) v -= 0x10000;
          out[i] = v / 32768;
        }
      } else {
        for (var j = 0; j < frames; j++) out[j] = (HEAPU8[pcm + j * channels + c] - 128) / 128;
      }
    }
    A.buffers.set(id, ab);
  } catch (e) { /* audio must never trap into the guest */ }
});

EM_JS(void, isaac_audio_js_play, (uint32_t src, uint32_t buffer, float gain, float pitch, int looping), {
  try {
    var A = Module.isaacAudio;
    if (!A || !A.ctx) return;
    if (A.ctx.state === "suspended") A.ctx.resume();
    var ab = A.buffers.get(buffer);
    if (!ab) return;
    var prev = A.sources.get(src);
    if (prev) { try { prev.node.stop(); } catch (e) {} }
    var node = A.ctx.createBufferSource();
    node.buffer = ab;
    node.loop = !!looping;
    node.playbackRate.value = pitch > 0.01 ? pitch : 1;
    var g = A.ctx.createGain();
    g.gain.value = gain;
    node.connect(g);
    g.connect(A.ctx.destination);
    node.start();
    A.sources.set(src, { node: node, gain: g });
    A.played = (A.played || 0) + 1;
  } catch (e) {}
});

EM_JS(void, isaac_audio_js_stop, (uint32_t src), {
  try {
    var A = Module.isaacAudio;
    if (!A) return;
    var s = A.sources.get(src);
    if (!s) return;
    try { s.node.stop(); } catch (e) {}
    A.sources.delete(src);
  } catch (e) {}
});

EM_JS(void, isaac_audio_js_gain, (uint32_t src, float gain), {
  try {
    var A = Module.isaacAudio;
    var s = A && A.sources.get(src);
    if (s) s.gain.gain.value = gain;
  } catch (e) {}
});

EM_JS(void, isaac_audio_js_drop, (uint32_t id), {
  try { if (Module.isaacAudio) Module.isaacAudio.buffers.delete(id); } catch (e) {}
});

EM_JS(int, isaac_audio_js_state, (void), {
  try {
    var A = Module.isaacAudio;
    if (!A || !A.ctx) return 0;
    return (A.ctx.state === "running" ? 1 : 2);
  } catch (e) { return 0; }
});

/* ---- the hooks host_audio.c calls (strong here, weak there) ------------- */

void isaac_audio_backend_buffer(uint32_t id, const void *pcm, uint32_t bytes,
                                int channels, int bits, int freq) {
    isaac_audio_js_buffer(id, (const uint8_t *)pcm, bytes, channels, bits, freq);
}

void isaac_audio_backend_play(uint32_t src, uint32_t buffer, float gain, float pitch, int looping) {
    isaac_audio_js_play(src, buffer, gain, pitch, looping);
}

void isaac_audio_backend_stop(uint32_t src) { isaac_audio_js_stop(src); }
void isaac_audio_backend_pause(uint32_t src) { isaac_audio_js_stop(src); }
void isaac_audio_backend_gain(uint32_t src, float gain) { isaac_audio_js_gain(src, gain); }
void isaac_audio_backend_drop_buffer(uint32_t id) { isaac_audio_js_drop(id); }

/* Reported with the stub report so a run says whether the page ever got an
 * AudioContext out of suspension -- silence with a suspended context is an
 * autoplay-policy problem, not a pipeline one. */
void isaac_audio_web_report(void) {
    int st = isaac_audio_js_state();
    isaac_log("[isaac][audio] WebAudio context: %s",
              st == 1 ? "running" : st == 2 ? "suspended (autoplay policy)" : "never created");
}
#endif /* ISAAC_WEB */
