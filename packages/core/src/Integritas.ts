/**
 * Integritas Module: Handles data hashing for integrity checks.
 * Follows Data Integrity Policy: Excludes metadata (_hash, _timestamp) during calculation.
 */

export const Integritas = {
    /**
     * Constant-time comparison to prevent timing attacks.
     */
    amanBandingkan(a: string, b: string): boolean {
        if (a.length !== b.length) return false;
        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }
        return result === 0;
    },

    /**
     * Calculates a SHA-256 hash of an object for integrity verification.
     * Metadata fields are stripped before calculation using a replacer function.
     * This is more efficient than cloning and deleting keys.
     */
    async hitungHash(data: unknown): Promise<string> {
        // Hashing policy: Include ALL relevant data for integrity.
        // We only exclude technical metadata like the hash itself.
        const text = JSON.stringify(data, (key, value) => {
            if (key === '_hash' || key === '_timestamp') {
                return undefined;
            }
            return value;
        });

        const encoder = new TextEncoder();
        const buffer = encoder.encode(text);

        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        return hashHex;
    }
};
