import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { checkRateLimit, getClientIP } from '../generate/rate-limiter';
import { ACCEPTED_PHOTO_TYPES, MAX_PHOTO_SIZE } from '@/lib/constants';

export async function POST(request: NextRequest) {
  // --- Rate limiting: 10 requests / minute per IP ---
  const ip = getClientIP(request);
  if (!checkRateLimit(ip, 10)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('photo');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No photo file provided. Send a "photo" field in FormData.' },
        { status: 400 },
      );
    }

    // --- Validate MIME type ---
    if (!(ACCEPTED_PHOTO_TYPES as readonly string[]).includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type "${file.type}". Accepted: ${ACCEPTED_PHOTO_TYPES.join(', ')}`,
        },
        { status: 400 },
      );
    }

    // --- Validate file size ---
    if (file.size > MAX_PHOTO_SIZE) {
      return NextResponse.json(
        {
          error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum: ${MAX_PHOTO_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 },
      );
    }

    // --- Process the image ---
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    const processedBuffer = await sharp(inputBuffer)
      .resize(400, 400, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toBuffer();

    const base64 = processedBuffer.toString('base64');
    const dataUri = `data:image/jpeg;base64,${base64}`;

    return NextResponse.json({ image: dataUri });
  } catch (err) {
    console.error('Photo upload processing failed:', err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Failed to process photo',
      },
      { status: 500 },
    );
  }
}
