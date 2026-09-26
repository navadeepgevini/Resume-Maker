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
          model: 'openai/gpt-oss-120b',
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
    const geminiModels = ['gemini-3.8-flash', 'gemini-3.5-flash-lite'];
    for (const modelName of geminiModels) {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          systemInstruction: systemPrompt
        });

        const result = await model.generateContent(userPrompt);
        responseText = result.response.text();
        if (responseText) break;
      } catch (e) {
        console.warn(`Gemini model ${modelName} error, trying next fallback:`, e);
      }
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
