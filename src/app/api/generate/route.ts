import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP } from './rate-limiter';
import { sanitizeForDocument } from '@/lib/sanitize';
import { buildDocx } from './docx-builder';
import { buildPdf } from './pdf-builder';

import type { ResumeData } from '@/types/resume';

const CONTENT_TYPES: Record<string, string> = {
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pdf: 'text/html; charset=utf-8',
};

/**
 * Deep-sanitize every string value in the resume data tree.
 */
function sanitizeResumeData(data: ResumeData): ResumeData {
  function sanitize(value: unknown): unknown {
    if (typeof value === 'string') return sanitizeForDocument(value);
    if (Array.isArray(value)) return value.map(sanitize);
    if (value !== null && typeof value === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        out[k] = sanitize(v);
      }
      return out;
    }
    return value;
  }
  return sanitize(data) as ResumeData;
}

export async function POST(request: NextRequest) {
  // --- Rate limiting: 5 requests / minute per IP ---
  const ip = getClientIP(request);
  if (!checkRateLimit(ip, 5)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  try {
    const rawData: ResumeData = await request.json();
    const format = request.nextUrl.searchParams.get('format') ?? 'docx';

    if (format !== 'docx' && format !== 'pdf') {
      return NextResponse.json(
        { error: `Unsupported format "${format}". Use "docx" or "pdf".` },
        { status: 400 },
      );
    }

    // Sanitize all text fields
    const data = sanitizeResumeData(rawData);

    // Build the document
    let buffer: Buffer;
    if (format === 'docx') {
      buffer = await buildDocx(data);
    } else {
      buffer = await buildPdf(data);
    }

    // Build the filename from the user's name
    const firstName = data.personal.fullName.split(' ')[0] || 'Resume';
    const lastName = data.personal.fullName.split(' ').slice(1).join('_') || '';
    const namePart = lastName ? `${firstName}_${lastName}` : firstName;
    const filename = `${namePart}_Resume.${format}`;

    const headers: Record<string, string> = {
      'Content-Type': CONTENT_TYPES[format],
      'Content-Length': String(buffer.length),
    };
    if (format === 'docx') {
      headers['Content-Disposition'] = `attachment; filename="${filename}"`;
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error(`Document generation failed:`, err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Failed to generate document',
      },
      { status: 500 },
    );
  }
}
