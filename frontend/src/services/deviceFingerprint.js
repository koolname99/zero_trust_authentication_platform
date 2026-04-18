import FingerprintJS from '@fingerprintjs/fingerprintjs';

let cached = null;

export const getDeviceFingerprint = () => {
  if (!cached) {
    cached = FingerprintJS.load()
      .then((agent) => agent.get())
      .then((result) => result.visitorId)
      .catch(() => 'unknown');
  }
  return cached;
};
