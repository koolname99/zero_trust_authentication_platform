// Builds a stable per-browser fingerprint from signals that vary between
// browsers/installs but stay consistent across sessions on the same one.
// Hashed with SHA-256 so we don't leak raw UA/screen details to the server.

// TODO: use a library like FingerprintJS instead
const collectSignals = () => {
  const nav = window.navigator;
  const scr = window.screen;
  return [
    nav.userAgent,
    nav.language,
    (nav.languages || []).join(','),
    nav.platform,
    nav.hardwareConcurrency,
    nav.maxTouchPoints,
    scr.width,
    scr.height,
    scr.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join('|');
};

const sha256Hex = async (input) => {
  const bytes = new TextEncoder().encode(input);
  const digest = await window.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

let cached = null;

export const getDeviceFingerprint = () => {
  if (!cached) {
    cached = sha256Hex(collectSignals()).catch(() => 'unknown');
  }
  return cached;
};
