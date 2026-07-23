import { generateEmailVerificationToken, hashEmailVerificationToken, EMAIL_VERIFICATION_TOKEN_TTL_SECONDS } from '../emailVerification';

describe('generateEmailVerificationToken', () => {
  it('returns a raw token whose hash matches hashEmailVerificationToken', () => {
    const { rawToken, tokenHash } = generateEmailVerificationToken();
    expect(hashEmailVerificationToken(rawToken)).toBe(tokenHash);
  });
});

describe('EMAIL_VERIFICATION_TOKEN_TTL_SECONDS', () => {
  it('is set to 24 hours — longer-lived than the 1h password reset window', () => {
    expect(EMAIL_VERIFICATION_TOKEN_TTL_SECONDS).toBe(86400);
  });
});
