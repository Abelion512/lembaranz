/**
 * Integrity Module: Handles data hashing for integrity checks.
 * Follows Data Integrity Policy: Excludes metadata (_hash, _timestamp) during calculation.
 */

const encoder = new TextEncoder();
const HEX_CHARS = '0123456789abcdef';

export const Integrity = {
    /**
     * Calculates a SHA-256 hash of an object for integrity verification.
     * Metadata fields are stripped before calculation using a replacer function.
     * This is more efficient than cloning and deleting keys.
     */
    async computeHash(data: unknown): Promise<string> {
        // Exclude transient metadata per policy using JSON.stringify replacer
        const text = JSON.stringify(data, (key, value) => {
            if (key === '_hash' || key === '_timestamp' || key === 'updatedAt') {
                return undefined;
            }
            return value;
        });

        const buffer = encoder.encode(text);

        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = new Uint8Array(hashBuffer);

        // Optimized bytes-to-hex conversion using a pre-allocated string and bitwise operations
        // This avoids the overhead of .toString(16) and .padStart() calls in each iteration
        let hashHex = '';
        for (let i = 0; i < hashArray.length; i++) {
            const v = hashArray[i];
            hashHex += HEX_CHARS[v >> 4] + HEX_CHARS[v & 15];
        }

        return hashHex;
    }
};
