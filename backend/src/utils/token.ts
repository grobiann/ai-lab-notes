import crypto from 'crypto';

export function generateRandomToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

export function generateVerificationToken(): string {
  return generateRandomToken(32);
}

export function generatePasswordResetToken(): string {
  return generateRandomToken(32);
}

export function getTokenExpiration(expiresInHours: number): Date {
  const expirationTime = new Date();
  expirationTime.setHours(expirationTime.getHours() + expiresInHours);
  return expirationTime;
}

export function isTokenExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return true;
  return new Date() > expiresAt;
}
