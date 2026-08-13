import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API_KEY_MISSING' });
  }

  try {
    const { history } = req.body;
    const client = new GoogleGenAI({ apiKey });

    const response = await client.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: history,
      config: {
        systemInstruction:
          "You are a helpful veterinary and pet care assistant for PetNestle. Answer questions about pet health, training, and general care. Keep your answers concise, friendly, and helpful. Always advise users to consult a real vet for serious medical emergencies. Use markdown for formatting if needed."
      }
    });

    return res.status(200).json({ text: response.text || '' });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: 'GENERATION_FAILED' });
  }
}
