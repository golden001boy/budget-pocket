const TEST_KEY = 'a'.repeat(64);

describe('mfaCrypto', () => {
  const originalEnv = process.env.MFA_ENCRYPTION_KEY;

  beforeEach(() => {
    jest.resetModules();
    process.env.MFA_ENCRYPTION_KEY = TEST_KEY;
  });

  afterAll(() => {
    process.env.MFA_ENCRYPTION_KEY = originalEnv;
  });

  it('round-trips a secret through encrypt then decrypt', () => {
    const { encryptSecret, decryptSecret } = require('../mfaCrypto');
    const plaintext = 'JBSWY3DPEHPK3PXP';
    const encrypted = encryptSecret(plaintext);
    expect(decryptSecret(encrypted)).toBe(plaintext);
  });

  it('never stores the plaintext secret in the encrypted output', () => {
    const { encryptSecret } = require('../mfaCrypto');
    const plaintext = 'JBSWY3DPEHPK3PXP';
    expect(encryptSecret(plaintext)).not.toContain(plaintext);
  });

  it('produces a different ciphertext each time (random IV), same plaintext', () => {
    const { encryptSecret } = require('../mfaCrypto');
    const a = encryptSecret('same-secret');
    const b = encryptSecret('same-secret');
    expect(a).not.toBe(b);
  });

  it('rejects a tampered ciphertext instead of silently returning garbage', () => {
    const { encryptSecret, decryptSecret } = require('../mfaCrypto');
    const encrypted = encryptSecret('JBSWY3DPEHPK3PXP');
    const [iv, authTag, ciphertext] = encrypted.split(':');
    const tampered = `${iv}:${authTag}:${ciphertext.slice(0, -2)}00`;
    expect(() => decryptSecret(tampered)).toThrow();
  });

  it('rejects a malformed encrypted value missing a segment', () => {
    const { decryptSecret } = require('../mfaCrypto');
    expect(() => decryptSecret('not-the-right-shape')).toThrow(/Malformed/);
  });
});
