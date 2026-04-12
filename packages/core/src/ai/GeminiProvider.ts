import { GoogleGenerativeAI } from '@google/generative-ai';
import { PoetProvider, PoetPlan } from './types';

export class GeminiProvider implements PoetProvider {
    id = 'gemini';
    name = 'Google Gemini';

    async think(context: string, instruction: string): Promise<PoetPlan> {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('GEMINI_API_KEY tidak ditemukan.');

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
KONTEKS:
${context}

INSTRUKSI:
${instruction}

Kembalikan ONLY JSON valid:
{
  "keputusan": "STRING",
  "alasan": "STRING",
  "perintah_sistem": "STRING | null",
  "catatan_internal": "STRING"
}
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonStr = text.replace(/```json|```/g, '').trim();
        return JSON.parse(jsonStr);
    }
}
