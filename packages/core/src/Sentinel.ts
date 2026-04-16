/**
 * Sentinel: Security hardening module
 * Rate limiting, constant-time comparison, brute-force protection,
 * and automatic expired-entry cleanup to prevent memory leaks.
 */

export interface RateLimitState {
    attempts: number;
    lastAttempt: number;
    lockoutUntil?: number;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window
const CLEANUP_INTERVAL = 5 * 60 * 1000; // Cleanup every 5 minutes
const MAX_STORE_SIZE = 10_000; // Hard cap to prevent unbounded growth

const rateLimitStore = new Map<string, RateLimitState>();
let lastCleanupTime = Date.now();

/**
 * Internal: Clean up expired and stale entries to prevent memory leaks.
 */
function cleanupExpiredEntries(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, state] of rateLimitStore) {
        // Remove if lockout has expired and no recent activity
        if (state.lockoutUntil && now >= state.lockoutUntil) {
            if (now - state.lastAttempt > RATE_LIMIT_WINDOW) {
                toDelete.push(key);
            }
        }
        // Remove if the window has expired
        if (now - state.lastAttempt > RATE_LIMIT_WINDOW * 2) {
            toDelete.push(key);
        }
    }

    for (const key of toDelete) {
        rateLimitStore.delete(key);
    }
}

/**
 * Internal: Enforce hard cap on store size using LRU-like eviction.
 */
function enforceMaxSize(): void {
    if (rateLimitStore.size > MAX_STORE_SIZE) {
        // Delete oldest entries (first inserted)
        const excess = rateLimitStore.size - MAX_STORE_SIZE;
        const keysToDelete = [...rateLimitStore.keys()].slice(0, excess);
        for (const key of keysToDelete) {
            rateLimitStore.delete(key);
        }
    }
}

export const Sentinel = {
    /**
     * Constant-time string comparison to prevent timing attacks.
     */
    constantTimeCompare(a: string, b: string): boolean {
        const aBytes = new TextEncoder().encode(a);
        const bBytes = new TextEncoder().encode(b);

        if (aBytes.length !== bBytes.length) {
            return false;
        }

        let result = 0;
        for (let i = 0; i < aBytes.length; i++) {
            result |= aBytes[i] ^ bBytes[i];
        }

        return result === 0;
    },

    /**
     * Check if operation is rate-limited.
     * @param key Unique identifier (e.g., vault ID, IP, user)
     * @returns Rate limit decision with remaining attempts info
     */
    checkRateLimit(key: string): { allowed: boolean; remaining?: number; resetAt?: number } {
        const now = Date.now();

        // Periodic cleanup to prevent memory leaks
        if (now - lastCleanupTime > CLEANUP_INTERVAL) {
            cleanupExpiredEntries();
            enforceMaxSize();
            lastCleanupTime = now;
        }

        const state = rateLimitStore.get(key);

        // First attempt - allow
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

        // Check if window has expired
        const timeSinceLastAttempt = now - state.lastAttempt;
        if (timeSinceLastAttempt > RATE_LIMIT_WINDOW) {
            rateLimitStore.set(key, {
                attempts: 1,
                lastAttempt: now,
            });
            return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
        }

        // Check if max attempts reached
        if (state.attempts >= MAX_ATTEMPTS) {
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
     * Reset rate limit for a key (e.g., after successful unlock).
     */
    resetRateLimit(key: string): void {
        rateLimitStore.delete(key);
    },

    /**
     * Clear all rate limit data (e.g., on app shutdown).
     */
    clearAllRateLimits(): void {
        rateLimitStore.clear();
    },

    /**
     * Get current rate limit store size (for monitoring/debugging).
     */
    getStoreSize(): number {
        return rateLimitStore.size;
    },
};
