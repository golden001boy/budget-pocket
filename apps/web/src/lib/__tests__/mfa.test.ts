import { authenticator } from 'otplib';
import {
  generateTotpSecret,
  generateQrCodeDataUrl,
  verifyTotpToken,
  generateRecoveryCodes,
  consumeRecoveryCode,
} from '../mfa';

describe('generateTotpSecret', () => {
  it('generates a non-empty base32 secret, different each time', () => {
    const a = generateTotpSecret();
    const b = generateTotpSecret();
    expect(a).toMatch(/^[A-Z2-7]+$/);
    expect(a).not.toBe(b);
  });
});

describe('generateQrCodeDataUrl', () => {
  it('returns a PNG data URL', async () => {
    const secret = generateTotpSecret();
    const dataUrl = await generateQrCodeDataUrl('demo@budget-pocket.app', secret);
    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
  });
});

describe('verifyTotpToken', () => {
  it('accepts the current valid code for a secret', () => {
    const secret = generateTotpSecret();
    const token = authenticator.generate(secret);
    expect(verifyTotpToken(token, secret)).toBe(true);
  });

  it('rejects a wrong code', () => {
    const secret = generateTotpSecret();
    const realToken = authenticator.generate(secret);
    const wrongToken = realToken === '000000' ? '111111' : '000000';
    expect(verifyTotpToken(wrongToken, secret)).toBe(false);
  });

  it('rejects a code generated for a different secret', () => {
    const secretA = generateTotpSecret();
    const secretB = generateTotpSecret();
    const tokenForB = authenticator.generate(secretB);
    expect(verifyTotpToken(tokenForB, secretA)).toBe(false);
  });

  it('returns false instead of throwing on a malformed token', () => {
    const secret = generateTotpSecret();
    expect(verifyTotpToken('not-a-number', secret)).toBe(false);
  });
});

describe('generateRecoveryCodes', () => {
  it('generates 10 unique, human-typeable codes', async () => {
    const { raw } = await generateRecoveryCodes();
    expect(raw).toHaveLength(10);
    expect(new Set(raw).size).toBe(10);
    raw.forEach((code) => expect(code).toMatch(/^[0-9A-F]{4}-[0-9A-F]{4}$/));
  });

  it('hashes each code so the raw value is never persisted as-is', async () => {
    const { raw, hashed } = await generateRecoveryCodes();
    hashed.forEach((hash, i) => {
      expect(hash).not.toBe(raw[i]);
      expect(hash.startsWith('$2')).toBe(true); // bcrypt hash format
    });
  });
});

describe('consumeRecoveryCode', () => {
  it('matches a valid code and returns the remaining hashes without it', async () => {
    const { raw, hashed } = await generateRecoveryCodes();
    const remaining = await consumeRecoveryCode(raw[3], hashed);
    expect(remaining).not.toBeNull();
    expect(remaining).toHaveLength(9);
    expect(remaining).not.toContain(hashed[3]);
  });

  it('returns null for a code that matches nothing, leaving the caller free to reject', async () => {
    const { hashed } = await generateRecoveryCodes();
    const result = await consumeRecoveryCode('FFFF-FFFF', hashed);
    expect(result).toBeNull();
  });

  it('returns null (not throw) against an empty list', async () => {
    const result = await consumeRecoveryCode('ANY-CODE', []);
    expect(result).toBeNull();
  });
});
