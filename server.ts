import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check API
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'BudgetMate' });
  });

  // AI Insights endpoint powered by Gemini API
  app.post('/api/ai-insights', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: 'GEMINI_API_KEY environment variable is not set.',
          fallback: true
        });
      }

      const { expenses, budgets, roommates, currencySymbol = '$' } = req.body;

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
You are BudgetMate's expert financial roommate advisor. Analyze the following household expense dataset for roommates:

Household Currency: ${currencySymbol}
Roommates: ${JSON.stringify(roommates)}
Monthly Budgets: ${JSON.stringify(budgets)}
Expenses Log: ${JSON.stringify(expenses)}

Provide 3 concise, highly actionable, friendly financial insights/suggestions in JSON format:
An array of objects with fields:
- "id": string
- "type": "warning" | "tip" | "positive" | "prediction"
- "title": string
- "message": string
- "impactAmount": optional number

Respond ONLY with valid JSON array of insights.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = response.text || '';
      // Clean JSON if wrapped in markdown
      const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
      const insights = JSON.parse(cleanJson);

      return res.json({ insights });
    } catch (error: any) {
      console.error('Error generating AI insights:', error);
      return res.status(500).json({ error: error.message || 'Failed to generate AI insights' });
    }
  });

  // Vite middleware for dev mode or static files for prod mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BudgetMate server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
