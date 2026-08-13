import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('Missing GEMINI_API_KEY');
    return res.status(500).json({ error: 'API_KEY_MISSING' });
  }

  try {
    const { history } = req.body;
    
    if (!history) {
      return res.status(400).json({ error: 'Missing history' });
    }

    const client = new GoogleGenAI({ apiKey });

    const response = await client.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: history,
      config: {
        systemInstruction:
          "You are a helpful veterinary and pet care assistant for PetNestle. Answer questions about pet health, training, and general care. Keep your answers concise, friendly, and helpful. Always advise users to consult a real vet for serious medical emergencies. Use markdown for formatting if needed."
      }
    });

    return res.status(200).json({ text: response.text || '' });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: 'GENERATION_FAILED' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
