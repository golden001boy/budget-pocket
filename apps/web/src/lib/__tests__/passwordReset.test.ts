import { generatePasswordResetToken, hashPasswordResetToken, PASSWORD_RESET_TOKEN_TTL_SECONDS } from '../passwordReset';

describe('generatePasswordResetToken', () => {
  it('returns a raw token and a hash that are different from each other', () => {
    const { rawToken, tokenHash } = generatePasswordResetToken();
    expect(rawToken).not.toBe(tokenHash);
    expect(rawToken).toHaveLength(64); // 32 bytes, hex-encoded
    expect(tokenHash).toHaveLength(64); // sha256, hex-encoded
  });

  it('produces a different token on every call', () => {
    const a = generatePasswordResetToken();
    const b = generatePasswordResetToken();
    expect(a.rawToken).not.toBe(b.rawToken);
    expect(a.tokenHash).not.toBe(b.tokenHash);
  });

  it('the returned tokenHash matches hashing the raw token independently', () => {
    const { rawToken, tokenHash } = generatePasswordResetToken();
    expect(hashPasswordResetToken(rawToken)).toBe(tokenHash);
  });
});

describe('hashPasswordResetToken', () => {
  it('is deterministic — the same input always hashes the same way', () => {
    expect(hashPasswordResetToken('same-token')).toBe(hashPasswordResetToken('same-token'));
  });

  it('different inputs hash differently', () => {
    expect(hashPasswordResetToken('token-a')).not.toBe(hashPasswordResetToken('token-b'));
  });
});

describe('PASSWORD_RESET_TOKEN_TTL_SECONDS', () => {
  it('is set to 1 hour', () => {
    expect(PASSWORD_RESET_TOKEN_TTL_SECONDS).toBe(3600);
  });
});
