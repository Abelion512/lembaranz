import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Linguis: AI translation engine for Lembaran.
 * Designed to maintain the "poetic & professional" vibes.
 */
export class Linguis {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    /**
     * Translates a string (UI element) with context.
     */
    async terjemahkanTeks(teks: string, targetLang: 'id' | 'en'): Promise<string> {
        const prompt = `
            You are "Linguis", the translation spirit of Lembaran, a high-end personal archive platform.
            Your vibe is: Poetic, professional, minimal, and elegant.
            
            Translate the following text into ${targetLang === 'id' ? 'Indonesian' : 'English'}.
            Maintain the tone:
            - If Indonesian: Use "puitis", "elegan", and "profesional".
            - If English: Use "sophisticated", "clean", and "minimalist".
            
            Original Text: "${teks}"
            
            Return ONLY the translated string. No extra words or quotes.
        `;

        try {
            const result = await this.model.generateContent(prompt);
            return result.response.text().trim().replace(/^"(.*)"$/, '$1');
        } catch (error) {
            console.error('[Linguis] Translation error:', error);
            return teks; // Fallback to original
        }
    }

    /**
     * Translates Markdown documentation.
     */
    async terjemahkanDokumen(markdown: string, targetLang: 'id' | 'en'): Promise<string> {
        const prompt = `
            You are "Linguis", the translation spirit of Lembaran.
            Translate this documentation into ${targetLang === 'id' ? 'Indonesian' : 'English'}.
            
            CRITICAL RULES:
            1. Keep ALL Markdown structure (headers, links, code blocks) intact.
            2. Do NOT translate technical terms inside code blocks or specific command names like "lembaran", "ukir", "pantau".
            3. Use a professional, elegant, and poetic tone.
            4. Keep GitHub-style alerts (e.g., > [!NOTE]) exactly as they are.
            
            Markdown to translate:
            ---
            ${markdown}
            ---
            
            Return ONLY the translated Markdown.
        `;

        try {
            const result = await this.model.generateContent(prompt);
            return result.response.text().trim();
        } catch (error) {
            console.error('[Linguis] Doc translation error:', error);
            return markdown;
        }
    }
}
