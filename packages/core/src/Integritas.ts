/**
 * Integritas Module: Handles data hashing for integrity checks.
 * Follows Data Integrity Policy: Excludes metadata (_hash, _timestamp) during calculation.
 */

export const Integritas = {
    /**
     * Calculates a SHA-256 hash of an object for integrity verification.
     * Metadata fields are stripped before calculation using a replacer function.
     * This is more efficient than cloning and deleting keys.
     */
    async hitungHash(data: unknown): Promise<string> {
        // Exclude transient metadata per policy using JSON.stringify replacer
        const text = JSON.stringify(data, (key, value) => {
            if (key === '_hash' || key === '_timestamp' || key === 'updatedAt') {
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
