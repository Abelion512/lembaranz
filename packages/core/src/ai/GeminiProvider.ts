import { GoogleGenerativeAI } from '@google/generative-ai';
import { PujanggaProvider, PujanggaPlan } from './types';

export class GeminiProvider implements PujanggaProvider {
    id = 'gemini';
    name = 'Google Gemini';

    async berpikir(konteks: string, instruksi: string): Promise<PujanggaPlan> {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('GEMINI_API_KEY tidak ditemukan.');

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
KONTEKS:
${konteks}

INSTRUKSI:
${instruksi}

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
