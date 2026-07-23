// Deep coverage of the underlying crypto (randomness, determinism,
// hash-matching) lives in tokens.test.ts, story 15.12's refactor target —
// these just confirm the domain-specific wrapper delegates correctly.
import { generatePasswordResetToken, hashPasswordResetToken, PASSWORD_RESET_TOKEN_TTL_SECONDS } from '../passwordReset';

describe('generatePasswordResetToken', () => {
  it('returns a raw token whose hash matches hashPasswordResetToken', () => {
    const { rawToken, tokenHash } = generatePasswordResetToken();
    expect(hashPasswordResetToken(rawToken)).toBe(tokenHash);
  });
});

describe('PASSWORD_RESET_TOKEN_TTL_SECONDS', () => {
  it('is set to 1 hour', () => {
    expect(PASSWORD_RESET_TOKEN_TTL_SECONDS).toBe(3600);
  });
});
