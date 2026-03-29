/**
 * Sentinel: Security hardening module
 * Rate limiting, constant-time comparison, and brute-force protection
 */

export interface RateLimitState {
    attempts: number;
    lastAttempt: number;
    lockoutUntil?: number;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes
const rateLimitStore = new Map<string, RateLimitState>();

export const Sentinel = {
    constantTimeCompare(a: string, b: string): boolean {
        const encoder = new TextEncoder();
        const aBytes = encoder.encode(a);
        const bBytes = encoder.encode(b);

        let result = 0;
        const len = aBytes.length;

        // Length check (still constant-time)
        if (len !== bBytes.length) {
            result = 1; // Mismatch
            // Dummy operation to avoid timing clues based on string length differences
            for (let i = 0; i < bBytes.length; i++) {
                result |= bBytes[i] ^ bBytes[i];
            }
            return false;
        }

        // Byte-by-byte comparison (constant-time)
        for (let i = 0; i < len; i++) {
            result |= aBytes[i] ^ bBytes[i];
        }

        return result === 0;
    },

    /**
     * Check if operation is rate-limited
     * @param key Unique identifier (e.g., vault ID, IP, user)
     * @returns { allowed: boolean, remaining?: number, resetAt?: number }
     */
    checkRateLimit(key: string): { allowed: boolean; remaining?: number; resetAt?: number } {
        const now = Date.now();
        const state = rateLimitStore.get(key);

        // No previous attempts - allow
        if (!state) {
            rateLimitStore.set(key, {
                attempts: 1,
                lastAttempt: now,
            });
            return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
        }

        // Check if lockout period has expired
        if (state.lockoutUntil) {
            if (now < state.lockoutUntil) {
                return {
                    allowed: false,
                    resetAt: state.lockoutUntil,
                };
            }
            // Lockout expired - reset
            rateLimitStore.set(key, {
                attempts: 1,
                lastAttempt: now,
            });
            return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
        }

        // Check if we're still in the same minute window
        const timeSinceLastAttempt = now - state.lastAttempt;
        if (timeSinceLastAttempt > 60 * 1000) {
            // Window expired - reset
            rateLimitStore.set(key, {
                attempts: 1,
                lastAttempt: now,
            });
            return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
        }

        // Check if max attempts reached
        if (state.attempts >= MAX_ATTEMPTS) {
            // Lockout
            const lockoutUntil = now + LOCKOUT_DURATION;
            rateLimitStore.set(key, {
                attempts: state.attempts,
                lastAttempt: now,
                lockoutUntil,
            });
            return {
                allowed: false,
                resetAt: lockoutUntil,
            };
        }

        // Increment attempts
        rateLimitStore.set(key, {
            attempts: state.attempts + 1,
            lastAttempt: now,
        });

        return {
            allowed: true,
            remaining: MAX_ATTEMPTS - state.attempts - 1,
        };
    },

    /**
     * Reset rate limit for a key (e.g., after successful unlock)
     * @param key Unique identifier
     */
    resetRateLimit(key: string): void {
        rateLimitStore.delete(key);
    },

    /**
     * Clear all rate limit data (e.g., on app shutdown)
     */
    clearAllRateLimits(): void {
        rateLimitStore.clear();
    },
};
