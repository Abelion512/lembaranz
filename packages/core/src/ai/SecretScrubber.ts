/**
 * SecretScrubber
 * Cleans sensitive data (API Keys, Passwords, Tokens) before sending to AI.
 */
export class SecretScrubber {
    private static readonly REGEX_PATTERNS = [
        /(?:api_key|secret|password|token|pwd|kunci|sandi|rahasia)\s*[:=]\s*["']?([^"'\s,|}]+)["']?/gi,
        /(?:AI[a-zA-Z0-9_-]{32,})/g,
        /(?:ghp_[a-zA-Z0-9]{36})/g,
        /(?:sk-[a-zA-Z0-9]{48})/g, // OpenAI keys
        /(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g,
        /(?:"pass(?:word)?":\s*")[^"]+(")/gi
    ];

    /**
     * Scrubs text of detected secrets.
     */
    static scrub(content: string): string {
        if (!content) return content;
        let result = content;
        for (const pattern of this.REGEX_PATTERNS) {
            result = result.replace(pattern, (match, p1) => {
                if (p1) {
                    return match.replace(p1, '[SECRET_PROTECTED]');
                }
                return '[SECRET_PROTECTED]';
            });
        }
        return result;
    }
}
