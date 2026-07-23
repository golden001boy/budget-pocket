import { generateSecureToken, hashToken } from '../tokens';

describe('generateSecureToken', () => {
  it('returns a raw token and a hash that are different from each other', () => {
    const { rawToken, tokenHash } = generateSecureToken();
    expect(rawToken).not.toBe(tokenHash);
    expect(rawToken).toHaveLength(64); // 32 bytes, hex-encoded
    expect(tokenHash).toHaveLength(64); // sha256, hex-encoded
  });

  it('produces a different token on every call', () => {
    const a = generateSecureToken();
    const b = generateSecureToken();
    expect(a.rawToken).not.toBe(b.rawToken);
    expect(a.tokenHash).not.toBe(b.tokenHash);
  });

  it('the returned tokenHash matches hashing the raw token independently', () => {
    const { rawToken, tokenHash } = generateSecureToken();
    expect(hashToken(rawToken)).toBe(tokenHash);
  });
});

describe('hashToken', () => {
  it('is deterministic — the same input always hashes the same way', () => {
    expect(hashToken('same-token')).toBe(hashToken('same-token'));
  });

  it('different inputs hash differently', () => {
    expect(hashToken('token-a')).not.toBe(hashToken('token-b'));
  });
});
