/**
 * Time Utilities
 * 
 * Helpers for timestamp handling and time-based operations.
 */

/**
 * Get current Unix timestamp in milliseconds
 */
export function nowUnixMs(): number {
  return Date.now();
}

/**
 * Get current Unix timestamp in seconds
 */
export function nowUnixSec(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Convert Unix seconds to milliseconds
 */
export function secToMs(seconds: number): number {
  return seconds * 1000;
}

/**
 * Convert Unix milliseconds to seconds
 */
export function msToSec(milliseconds: number): number {
  return Math.floor(milliseconds / 1000);
}

/**
 * Get ISO timestamp string
 */
export function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Parse ISO string to Unix milliseconds
 */
export function isoToMs(iso: string): number {
  return new Date(iso).getTime();
}

/**
 * Check if a Unix timestamp (seconds) has expired
 */
export function isExpiredSec(expiry: number): boolean {
  return nowUnixSec() >= expiry;
}

/**
 * Check if a Unix timestamp (milliseconds) has expired
 */
export function isExpiredMs(expiry: number): boolean {
  return nowUnixMs() >= expiry;
}

/**
 * Calculate time remaining until expiry (in seconds)
 */
export function timeUntilExpirySec(expiry: number): number {
  return Math.max(0, expiry - nowUnixSec());
}

/**
 * Calculate time remaining until expiry (in milliseconds)
 */
export function timeUntilExpiryMs(expiry: number): number {
  return Math.max(0, expiry - nowUnixMs());
}

/**
 * Create an expiry timestamp N seconds from now
 */
export function expiryFromNowSec(seconds: number): number {
  return nowUnixSec() + seconds;
}

/**
 * Create an expiry timestamp N milliseconds from now
 */
export function expiryFromNowMs(milliseconds: number): number {
  return nowUnixMs() + milliseconds;
}
