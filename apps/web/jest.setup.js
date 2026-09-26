// Tests must not depend on a developer's local .env (absent in CI): lib/mfaCrypto.ts
// reads MFA_ENCRYPTION_KEY straight from process.env. Fixed test-only value,
// applied only when nothing is set.
process.env.MFA_ENCRYPTION_KEY = process.env.MFA_ENCRYPTION_KEY || 'a'.repeat(64);
