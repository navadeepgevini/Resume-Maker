import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP } from '../generate/rate-limiter';
import { generateWithAI, cleanAndParseJSON } from '@/lib/ai-client';

const MAX_BULLET_LENGTH = 400;

function buildPrompt(bullet: string, projectName?: string, techStack?: string[], jobDescription?: string): string {
  return `You are an expert resume writer specializing in ATS-optimized bullet points.

Rewrite the following resume bullet point into 3 distinct, improved versions. Each version must:
- Start with a strong past-tense action verb (e.g., Built, Engineered, Optimized, Automated, Reduced)
- Include a quantified, measurable outcome (%, time saved, users, requests, latency, scale) — invent a plausible, conservative metric ONLY if the original gives no number, and phrase it so the user can easily edit it (e.g., "reducing load time by [X]%")
- Stay factually consistent with the original bullet — do not invent new technologies or claims not implied by the original
- Be a single line, under 200 characters, no bullet symbol, no trailing period
- Avoid passive voice and weak phrases like "responsible for" or "worked on"

${projectName ? `Project context: ${projectName}` : ''}
${techStack && techStack.length > 0 ? `Tech stack: ${techStack.join(', ')}` : ''}
${jobDescription ? `Target job description (weave in relevant keywords naturally where truthful):\n${jobDescription.slice(0, 1500)}` : ''}

Original bullet:
"${bullet}"

Return ONLY valid JSON, no markdown, no backticks, matching exactly this schema:
{ "suggestions": ["string", "string", "string"] }`;
}

async function rewriteWithAI(prompt: string): Promise<{ suggestions: string[] } | null> {
  const responseText = await generateWithAI({
    systemPrompt: prompt,
    userPrompt: 'Please provide the suggestions now.',
    temperature: 0.4,
    jsonMode: true
  });

  if (!responseText) return null;
  
  const parsed = cleanAndParseJSON(responseText);
  if (parsed && Array.isArray(parsed.suggestions)) {
    return { suggestions: parsed.suggestions.filter((s: unknown) => typeof s === 'string').slice(0, 3) as string[] };
  }
  return null;
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  if (!checkRateLimit(ip, 15)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment and try again.' },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const bullet = typeof body.bullet === 'string' ? body.bullet.trim() : '';
    const projectName = typeof body.projectName === 'string' ? body.projectName : undefined;
    const techStack = Array.isArray(body.techStack) ? body.techStack.filter((t: unknown) => typeof t === 'string') : undefined;
    const jobDescription = typeof body.jobDescription === 'string' ? body.jobDescription : undefined;

    if (!bullet) {
      return NextResponse.json({ error: 'Bullet text is required.' }, { status: 400 });
    }
    if (bullet.length > MAX_BULLET_LENGTH) {
      return NextResponse.json({ error: 'Bullet text is too long.' }, { status: 400 });
    }

    const prompt = buildPrompt(bullet, projectName, techStack, jobDescription);
    const result = await rewriteWithAI(prompt);

    if (!result || result.suggestions.length === 0) {
      return NextResponse.json(
        { error: 'AI could not generate suggestions. Try again.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, suggestions: result.suggestions });
  } catch (err) {
    console.error('Bullet rewrite failed:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 },
    );
  }
}
