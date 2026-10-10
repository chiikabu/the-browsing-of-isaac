// A window "recipe": how to rebuild 1 MiB of a version-0 KAGE archive from a smaller
// download (scripts/recomp/assets/recipe.py writes them). One self-contained function,
// because the page defines it globally and hands its source text to the reader Worker
// (String(isaacRecipeDecode)); node tests evaluate this same file.
//
// Version 0 is the archive format whose entries are only XORed with a xorshift keystream
// and byte-permuted per dword (archive.py raw_encode; the engine reads it through its
// "raw XOR" codec). So a recipe can ship an entry's PLAIN bytes, coded however suits
// them, and the bytes the engine reads are made here:
//
//   recipe   = "RW" 1 | u32 outLen | u16 segments | segment*         (little endian)
//   segment  = 0 u32 len bytes                                        raw bytes, as they are
//            | 1 u32 outLen u32 key0 u8 skip u16 parts part*          a version-0 entry piece:
//              parts give the plain bytes of whole dwords from the dword holding the piece's
//              first byte; each dword is permuted by key & 15 (2: reverse, 9: swap pairs,
//              13: swap halves) and XORed with key; key then steps (xorshift 8/9/23); the
//              piece is those bytes from `skip`, `outLen` long.
//   part     = 0 u32 len bytes                                        plain bytes
//            | 1 u8 channels u32 frames u32 skip u32 take u32 coded bytes
//              16-bit PCM, `frames` frames coded below; the plain bytes are bytes
//              [skip, skip + take) of the decoded interleaved little-endian samples.
//            | 2 u8 channels u32 frames u32 skip u32 take u32 coded u16 first u16 block bytes
//              the same in blocks of `block` frames, the first `first` long (0: a whole
//              one): the blocks stay on the sound's own grid where a window cuts it.
//
// PCM code (MSB-first bits): blocks of up to 4096 frames (part 2: its block). Stereo blocks start with
// 2 bits: 0 left/right, 1 left/side, 2 right/side (side = right - left, 17-bit). Per coded
// channel: 3 bits predictor -- 0..4 FLAC's fixed order, 7 verbatim -- then verbatim
// samples, or `order` warm-up samples and the residual in 4 partitions (the first
// count % 4 one longer), each a 5-bit Rice parameter k and per residual a unary quotient
// (ones ended by a zero) and k low bits; zigzag decoded. Predictor 5: 4 bits s, then the
// channel coded at width - s, every sample shifted left by s (FLAC's wasted bits: a
// block whose low s bits are all zero, as near-lossless sound effects make them).
function isaacRecipeDecode(src) {
  var B = src;
  var p = 0;
  function u8() { return B[p++]; }
  function u16() { var v = B[p] | (B[p + 1] << 8); p += 2; return v; }
  function u32() { var v = (B[p] | (B[p + 1] << 8) | (B[p + 2] << 16) | (B[p + 3] << 24)) >>> 0; p += 4; return v; }

  function pcmDecode(code, ch, frames, first, block) {
    var n = code.length;
    var C = new Uint8Array(n + 8);
    C.set(code);
    var bp = 0;
    function word() {
      var i = bp >>> 3;
      return ((C[i] << 24) | (C[i + 1] << 16) | (C[i + 2] << 8) | C[i + 3]) >>> 0;
    }
    function bits(k) {
      if (k === 0) return 0;
      var v;
      if (k <= 24) {
        v = (word() << (bp & 7)) >>> (32 - k);
        bp += k;
        return v;
      }
      v = bits(k - 16) * 65536;
      return v + bits(16);
    }
    function signed(k) {
      var v = bits(k);
      return v >= Math.pow(2, k - 1) ? v - Math.pow(2, k) : v;
    }
    function unary() {
      var q = 0;
      for (;;) {
        var s = bp & 7;
        var x = (word() << s) | 0;
        var c = Math.clz32(~x);
        if (c < 32 - s) { q += c; bp += c + 1; return q; }
        q += 32 - s; bp += 32 - s;
      }
    }
    var out = new Int16Array(frames * ch);
    var a = new Int32Array(block), b = new Int32Array(block);
    function channel(dst, len, width) {
      var t = bits(3);
      var i;
      if (t === 5) {
        var sh = bits(4), m = Math.pow(2, sh);
        channel(dst, len, width - sh);
        for (i = 0; i < len; i++) dst[i] *= m;
        return;
      }
      if (t === 7) { for (i = 0; i < len; i++) dst[i] = signed(width); return; }
      for (i = 0; i < t; i++) dst[i] = signed(width);
      var r = len - t, q = Math.floor(r / 4), extra = r % 4, at = t;
      for (var part = 0; part < 4; part++) {
        var cnt = q + (part < extra ? 1 : 0);
        var k = bits(5), pk = Math.pow(2, k), small = k < 16;
        for (var j = 0; j < cnt; j++, at++) {
          var qq = unary();
          var u = small && qq < 32768 ? ((qq << k) | bits(k)) : qq * pk + bits(k);
          var e = (u & 1) ? -((u + 1) / 2) : u / 2;
          var x;
          if (t === 0) x = e;
          else if (t === 1) x = e + dst[at - 1];
          else if (t === 2) x = e + 2 * dst[at - 1] - dst[at - 2];
          else if (t === 3) x = e + 3 * dst[at - 1] - 3 * dst[at - 2] + dst[at - 3];
          else x = e + 4 * dst[at - 1] - 6 * dst[at - 2] + 4 * dst[at - 3] - dst[at - 4];
          dst[at] = x;
        }
      }
    }
    for (var f0 = 0, blk = first > 0 && first < block ? first : block; f0 < frames; f0 += blk, blk = block) {
      var len = Math.min(blk, frames - f0), i2;
      if (ch === 1) {
        channel(a, len, 16);
        for (i2 = 0; i2 < len; i2++) out[f0 + i2] = a[i2];
        continue;
      }
      var mode = bits(2);
      channel(a, len, 16);
      channel(b, len, mode === 0 ? 16 : 17);
      for (i2 = 0; i2 < len; i2++) {
        var L, R;
        if (mode === 0) { L = a[i2]; R = b[i2]; }
        else if (mode === 1) { L = a[i2]; R = a[i2] + b[i2]; }
        else { R = a[i2]; L = a[i2] - b[i2]; }
        out[(f0 + i2) * 2] = L;
        out[(f0 + i2) * 2 + 1] = R;
      }
    }
    var bytes = new Uint8Array(out.length * 2);
    for (var s2 = 0; s2 < out.length; s2++) { var v2 = out[s2]; bytes[s2 * 2] = v2 & 255; bytes[s2 * 2 + 1] = (v2 >> 8) & 255; }
    return bytes;
  }

  if (u8() !== 82 || u8() !== 87 || u8() !== 1) throw new Error('not a version 1 window recipe');
  var outLen = u32(), nseg = u16();
  var out = new Uint8Array(outLen), o = 0;
  for (var si = 0; si < nseg; si++) {
    var kind = u8();
    if (kind === 0) {
      var len0 = u32();
      out.set(B.subarray(p, p + len0), o); p += len0; o += len0;
      continue;
    }
    if (kind !== 1) throw new Error('recipe segment kind ' + kind);
    var segLen = u32(), key = u32(), skip = u8(), nparts = u16();
    var dw = Math.ceil((skip + segLen) / 4) * 4;
    var plain = new Uint8Array(dw), w = 0;
    for (var pi = 0; pi < nparts; pi++) {
      var pk = u8();
      if (pk === 0) {
        var ln = u32();
        plain.set(B.subarray(p, p + ln), w); p += ln; w += ln;
      } else if (pk === 1 || pk === 2) {
        var chn = u8(), fr = u32(), sk = u32(), tk = u32(), cl = u32();
        var first = pk === 2 ? u16() : 0, block = pk === 2 ? u16() : 4096;
        if (!block || block > 4096) throw new Error('recipe PCM block ' + block);
        var pcm = pcmDecode(B.subarray(p, p + cl), chn, fr, first, block);
        p += cl;
        plain.set(pcm.subarray(sk, sk + tk), w); w += tk;
      } else throw new Error('recipe part kind ' + pk);
    }
    if (w !== dw) throw new Error('recipe piece is ' + w + ' plain bytes, not ' + dw);
    for (var d = 0; d < dw; d += 4) {
      var sel = key & 15, b0 = plain[d], b1 = plain[d + 1], b2 = plain[d + 2], b3 = plain[d + 3], t0;
      if (sel === 2) { t0 = b0; b0 = b3; b3 = t0; t0 = b1; b1 = b2; b2 = t0; }
      else if (sel === 9) { t0 = b0; b0 = b1; b1 = t0; t0 = b2; b2 = b3; b3 = t0; }
      else if (sel === 13) { t0 = b0; b0 = b2; b2 = t0; t0 = b1; b1 = b3; b3 = t0; }
      plain[d] = b0 ^ (key & 255);
      plain[d + 1] = b1 ^ ((key >>> 8) & 255);
      plain[d + 2] = b2 ^ ((key >>> 16) & 255);
      plain[d + 3] = b3 ^ ((key >>> 24) & 255);
      key = (key ^ (key << 8)) >>> 0;
      key = (key ^ (key >>> 9)) >>> 0;
      key = (key ^ (key << 23)) >>> 0;
    }
    out.set(plain.subarray(skip, skip + segLen), o); o += segLen;
  }
  if (o !== outLen) throw new Error('recipe made ' + o + ' bytes, not ' + outLen);
  return out;
}
