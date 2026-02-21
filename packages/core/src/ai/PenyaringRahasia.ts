/**
 * PenyaringRahasia (Secret Scrubber)
 * Membersihkan data sensitif (API Keys, Passwords, Tokens) sebelum dikirim ke AI.
 */
export class PenyaringRahasia {
    private static readonly REGEX_PATTERNS = [
        /(?:api_key|secret|password|token|pwd|kunci|sandi|rahasia)\s*[:=]\s*["']?([^"'\s,|}]+)["']?/gi,
        /(?:AI[a-zA-Z0-9_-]{32,})/g,
        /(?:ghp_[a-zA-Z0-9]{36})/g,
        /(?:sk-[a-zA-Z0-9]{48})/g, // OpenAI keys
        /(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g,
        /(?:"pass(?:word)?":\s*")[^"]+(")/gi
    ];

    /**
     * Menyaring teks dari rahasia yang terdeteksi.
     */
    static saring(konten: string): string {
        if (!konten) return konten;
        let hasil = konten;
        for (const pattern of this.REGEX_PATTERNS) {
            hasil = hasil.replace(pattern, (match, p1) => {
                if (p1) {
                    return match.replace(p1, '[RAHASIA_TERLINDUNGI]');
                }
                return '[RAHASIA_TERLINDUNGI]';
            });
        }
        return hasil;
    }
}
