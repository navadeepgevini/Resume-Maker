import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages, resumeData } = await request.json();
    const groqKey = process.env.GROQ_API_KEY;

    if (!groqKey) {
      return NextResponse.json(
        { error: 'Groq API Key not configured' },
        { status: 500 }
      );
    }

    // Format resume data into a concise summary to save tokens
    const contextStr = JSON.stringify({
      personal: resumeData.personal,
      education: resumeData.education,
      experience: resumeData.experience,
      projects: resumeData.projects,
      skills: resumeData.skills,
    }, null, 2);

    const systemPrompt = `You are a professional Resume Assistant.
You are helping the user build and refine their resume.
Below is the current state of their resume in JSON format.
Use this context to give specific, tailored advice.
If they ask you to write bullet points, provide high-impact, action-oriented bullets with metrics where possible.
Be concise, friendly, and professional. Do NOT use markdown code blocks unless writing code.

--- CURRENT RESUME CONTEXT ---
${contextStr}
`;

    // Map messages to Groq API format
    // Filter out system messages generated locally (e.g. error messages)
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
        .filter((m: { role: string; content: string }) => m.role === 'user' || m.role === 'assistant')
        .map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
    ];

    // --- JEV (TypeSafe AI) Decision Routing ---
    // Try to route the decision if TYPESAFE_API_KEY is available
    const typesafeKey = process.env.TYPESAFE_API_KEY;
    if (typesafeKey && typesafeKey !== 'your-typesafe-api-key-here') {
      try {
        const { TypeSafeClient, choice } = await import('@typesafe-ai/sdk');
        const client = new TypeSafeClient({ apiKey: typesafeKey });
        const lastUserMessage = messages.filter((m: { role: string; content: string }) => m.role === 'user').pop()?.content || '';
        
        const route = await client.systemOne({
          state: { userMessage: lastUserMessage },
          questions: {
            intent: choice("What is the primary intent of the user?", {
              check_ats: null,
              rewrite_bullet: null,
              general_advice: null
            })
          }
        });

        const intent = route.answers.intent.choice;
        if (intent === 'check_ats') {
          apiMessages.push({
            role: 'system',
            content: 'The user is asking about ATS scoring. Remind them they can use the "Live ATS Score" widget on the right sidebar or the "Check ATS Compatibility" button on the landing page.'
          });
        } else if (intent === 'rewrite_bullet') {
          apiMessages.push({
            role: 'system',
            content: 'The user wants to rewrite bullet points. Inform them they can use the ✨ AI Improve button directly inside the project or experience bullet inputs for targeted rewrites.'
          });
        }
      } catch (e) {
        console.warn('TypeSafe AI routing failed, falling back to standard LLM flow', e);
      }
    }
    // ------------------------------------------

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: apiMessages,
        temperature: 0.6,
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq Chat Error:', errText);
      return NextResponse.json(
        { error: 'Failed to generate response' },
        { status: 502 }
      );
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || 'I am not sure how to respond to that.';

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('Chat API Error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
