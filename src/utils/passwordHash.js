// Password hashing for student accounts (PBKDF2-HMAC-SHA256, random salt)
//
// Passwords are never stored: only { salt, hash, iterations }. Nobody, including the
// admin, can read a password back; the admin can only set a new one.
//
// Uses the browser's Web Crypto API when available. Browsers disable it on plain
// http:// pages other than localhost (e.g. testing from a phone via a LAN IP), so a
// pure-JS PBKDF2 fallback produces the identical hash there.
//
// NOTE: Because this app has no server, accounts live in this browser's storage.
// Move registration/login to a backend before relying on it for real security.

export const PBKDF2_ITERATIONS = 60000;
const KEY_BYTES = 32;

const enc = new TextEncoder();
const toB64 = (bytes) => btoa(String.fromCharCode(...bytes));
const fromB64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

// ---- Pure-JS SHA-256 / HMAC / PBKDF2 (fallback) ------------------------------
const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]);
const ror = (x, n) => (x >>> n) | (x << (32 - n));

const sha256 = (bytes) => {
  const len = bytes.length;
  const padded = new Uint8Array(((len + 9 + 63) >> 6) << 6);
  padded.set(bytes);
  padded[len] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, Math.floor((len * 8) / 0x100000000));
  view.setUint32(padded.length - 4, (len * 8) >>> 0);

  const H = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
  const W = new Uint32Array(64);
  for (let off = 0; off < padded.length; off += 64) {
    for (let t = 0; t < 16; t++) W[t] = view.getUint32(off + t * 4);
    for (let t = 16; t < 64; t++) {
      const s0 = ror(W[t - 15], 7) ^ ror(W[t - 15], 18) ^ (W[t - 15] >>> 3);
      const s1 = ror(W[t - 2], 17) ^ ror(W[t - 2], 19) ^ (W[t - 2] >>> 10);
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let t = 0; t < 64; t++) {
      const t1 = (h + (ror(e, 6) ^ ror(e, 11) ^ ror(e, 25)) + ((e & f) ^ (~e & g)) + K[t] + W[t]) | 0;
      const t2 = ((ror(a, 2) ^ ror(a, 13) ^ ror(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    H[0] += a; H[1] += b; H[2] += c; H[3] += d; H[4] += e; H[5] += f; H[6] += g; H[7] += h;
  }
  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  H.forEach((v, i) => outView.setUint32(i * 4, v));
  return out;
};

const concat = (a, b) => {
  const out = new Uint8Array(a.length + b.length);
  out.set(a);
  out.set(b, a.length);
  return out;
};

const makeHmac = (keyBytes) => {
  let key = keyBytes.length > 64 ? sha256(keyBytes) : keyBytes;
  const block = new Uint8Array(64);
  block.set(key);
  const ipad = block.map((b) => b ^ 0x36);
  const opad = block.map((b) => b ^ 0x5c);
  return (msg) => sha256(concat(opad, sha256(concat(ipad, msg))));
};

const pbkdf2Js = (passwordBytes, salt, iterations) => {
  const hmac = makeHmac(passwordBytes);
  // One output block is enough for a 32-byte key
  let u = hmac(concat(salt, new Uint8Array([0, 0, 0, 1])));
  const t = u.slice();
  for (let i = 1; i < iterations; i++) {
    u = hmac(u);
    for (let j = 0; j < t.length; j++) t[j] ^= u[j];
  }
  return t;
};

// ---- Public API ----------------------------------------------------------------
const derive = async (password, salt, iterations) => {
  const pwBytes = enc.encode(password);
  const subtle = typeof crypto !== 'undefined' ? crypto.subtle : undefined;
  if (subtle) {
    const key = await subtle.importKey('raw', pwBytes, 'PBKDF2', false, ['deriveBits']);
    const bits = await subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, KEY_BYTES * 8);
    return new Uint8Array(bits);
  }
  return pbkdf2Js(pwBytes, salt, iterations);
};

/** Returns { algo, iterations, salt, hash } to store instead of the password. */
export const hashPassword = async (password) => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt, PBKDF2_ITERATIONS);
  return { algo: 'pbkdf2-sha256', iterations: PBKDF2_ITERATIONS, salt: toB64(salt), hash: toB64(hash) };
};

/** True when `password` matches the stored { salt, hash, iterations }. */
export const verifyPassword = async (password, stored) => {
  if (!stored?.salt || !stored?.hash) return false;
  const actual = await derive(password, fromB64(stored.salt), stored.iterations || PBKDF2_ITERATIONS);
  const expected = fromB64(stored.hash);
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
  return diff === 0;
};

/** Readable temporary password for admin resets, e.g. "kwa-7342-mxq". */
export const generateTempPassword = () => {
  const letters = 'abcdefghjkmnpqrstuvwxyz';
  const rand = crypto.getRandomValues(new Uint32Array(7));
  const pick = (i) => letters[rand[i] % letters.length];
  const digits = String(rand[3] % 10000).padStart(4, '0');
  return `${pick(0)}${pick(1)}${pick(2)}-${digits}-${pick(4)}${pick(5)}${pick(6)}`;
};

// Exposed for tests
export const __test = { sha256, pbkdf2Js };
