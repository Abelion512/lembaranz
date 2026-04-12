import { GoogleGenerativeAI } from '@google/generative-ai';
import { PoetProvider, PoetPlan } from './types';
import { SecretScrubber } from './SecretScrubber';

// Strict prompt template - user content is never directly interpolated
const SYSTEM_PROMPT = `You are a structured JSON output assistant. You MUST respond with ONLY valid JSON matching this schema:
{
  "keputusan": "STRING",
  "alasan": "STRING",
  "perintah_sistem": "STRING | null",
  "catatan_internal": "STRING"
}

Rules:
- Do NOT include markdown code fences
- Do NOT include any text outside the JSON object
- All string values must be valid JSON strings (escape quotes, backslashes, etc.)`;

const MAX_CONTEXT_LENGTH = 8000; // Character limit to prevent prompt injection via size
const MAX_INSTRUCTION_LENGTH = 2000;

export class GeminiProvider implements PoetProvider {
    id = 'gemini';
    name = 'Google Gemini';
    private apiKey: string | null = null;
    private modelInstance: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null;

    /**
     * Validates and caches the API key.
     */
    private initKey(): void {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey.length < 10) {
            throw new Error('GEMINI_API_KEY is not configured or invalid');
        }
        this.apiKey = apiKey;
    }

    /**
     * Gets or creates the Gemini model instance (lazy initialization).
     */
    private getModel() {
        if (!this.modelInstance) {
            this.initKey();
            const genAI = new GoogleGenerativeAI(this.apiKey!);
            this.modelInstance = genAI.getGenerativeModel({
                model: 'gemini-1.5-flash',
                generationConfig: {
                    maxOutputTokens: 500,
                    temperature: 0.1, // Low temperature for deterministic JSON
                },
            });
        }
        return this.modelInstance;
    }

    /**
     * Sanitizes user input to prevent prompt injection.
     * - Scrubs secrets
     * - Truncates to max length
     * - Escapes problematic characters
     */
    private sanitizeInput(input: string, maxLength: number): string {
        // First scrub secrets
        let sanitized = SecretScrubber.scrub(input);

        // Truncate to prevent oversized prompts
        if (sanitized.length > maxLength) {
            sanitized = sanitized.substring(0, maxLength) + '...[truncated]';
        }

        // Escape backslashes and quotes that could break JSON parsing
        sanitized = sanitized
            .replace(/\\/g, '\\\\')
            .replace(/"""/g, '\\"')
            .replace(/```/g, '');

        return sanitized;
    }

    async think(context: string, instruction: string): Promise<PoetPlan> {
        const model = this.getModel();

        const safeContext = this.sanitizeInput(context, MAX_CONTEXT_LENGTH);
        const safeInstruction = this.sanitizeInput(instruction, MAX_INSTRUCTION_LENGTH);

        const prompt = `${SYSTEM_PROMPT}

Context:
${safeContext}

Instruction:
${safeInstruction}

Respond with JSON only:`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Strip any markdown fences and extract JSON
        const jsonStr = text
            .replace(/```json\s*/g, '')
            .replace(/```\s*/g, '')
            .trim();

        // Validate JSON before returning
        try {
            const parsed = JSON.parse(jsonStr);

            // Validate required fields exist
            if (typeof parsed.keputusan !== 'string') {
                throw new Error('Missing required field: keputusan');
            }
            if (typeof parsed.alasan !== 'string') {
                throw new Error('Missing required field: alasan');
            }

            return {
                keputusan: parsed.keputusan,
                reason: parsed.alasan,
                system_command: parsed.perintah_sistem ?? null,
                internal_note: parsed.catatan_internal ?? '',
            } as PoetPlan;
        } catch (parseError) {
            // Fallback with safe defaults
            console.error('[POET] Failed to parse AI response:', parseError);
            return {
                decision: 'unknown',
                reason: 'AI response could not be parsed',
                system_command: null,
                internal_note: `Parse error: ${parseError instanceof Error ? parseError.message : 'Unknown'}`,
            };
        }
    }
}
