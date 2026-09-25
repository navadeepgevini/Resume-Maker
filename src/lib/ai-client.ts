interface AIConfig {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  jsonMode?: boolean;
}

export async function generateWithAI({ systemPrompt, userPrompt, temperature = 0.1, jsonMode = true }: AIConfig): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (!geminiKey && !groqKey) {
    return null;
  }

  let responseText = '';

  // Try Groq first
  if (groqKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature,
          ...(jsonMode ? { response_format: { type: 'json_object' } } : {})
        })
      });

      if (response.ok) {
        const data = await response.json();
        responseText = data.choices[0]?.message?.content || '';
      } else {
        console.error('Groq API error:', await response.text());
      }
    } catch (e) {
      console.error('Groq fetch failed:', e);
    }
  }

  // Fallback to Gemini
  if (!responseText && geminiKey) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        systemInstruction: systemPrompt
      });

      const result = await model.generateContent(userPrompt);
      responseText = result.response.text();
    } catch (e) {
      console.error('Gemini API error:', e);
    }
  }

  return responseText || null;
}

export function cleanAndParseJSON(responseText: string): Record<string, unknown> | null {
  const cleaned = responseText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('Failed to parse AI response as JSON:', e);
    return null;
  }
}
