import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const ISSUER = 'Budget-Pocket';
const RECOVERY_CODE_COUNT = 10;

export function generateTotpSecret(): string {
  return authenticator.generateSecret();
}

export async function generateQrCodeDataUrl(email: string, secret: string): Promise<string> {
  const otpauthUrl = authenticator.keyuri(email, ISSUER, secret);
  return QRCode.toDataURL(otpauthUrl);
}

export function verifyTotpToken(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    // otplib throws on a malformed token (e.g. non-numeric) rather than
    // returning false — treat that the same as an invalid code instead of
    // letting it surface as a 500.
    return false;
  }
}

/** Human-typeable, not just random bytes: XXXX-XXXX, uppercase hex. */
function generateOneRecoveryCode(): string {
  const raw = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
}

export interface RecoveryCodeSet {
  /** Shown to the user once, never stored. */
  raw: string[];
  /** What actually gets persisted. */
  hashed: string[];
}

export async function generateRecoveryCodes(): Promise<RecoveryCodeSet> {
  const raw = Array.from({ length: RECOVERY_CODE_COUNT }, generateOneRecoveryCode);
  const hashed = await Promise.all(raw.map((code) => bcrypt.hash(code, 10)));
  return { raw, hashed };
}

/**
 * Checks `code` against the stored hashes and returns the remaining set
 * (with the matched one removed — recovery codes are one-time use) if it
 * matched, or `null` if it didn't match any of them.
 */
export async function consumeRecoveryCode(code: string, hashedCodes: string[]): Promise<string[] | null> {
  for (let i = 0; i < hashedCodes.length; i++) {
    if (await bcrypt.compare(code, hashedCodes[i])) {
      return [...hashedCodes.slice(0, i), ...hashedCodes.slice(i + 1)];
    }
  }
  return null;
}
