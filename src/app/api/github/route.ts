import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP } from '../generate/rate-limiter';

import type { GitHubRepo } from '@/types/resume';

const GITHUB_API = 'https://api.github.com';

export async function GET(request: NextRequest) {
  // --- Rate limiting: 10 requests / minute per IP ---
  const ip = getClientIP(request);
  if (!checkRateLimit(ip, 10)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  // --- Validate query params ---
  const { searchParams } = request.nextUrl;
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json(
      { error: 'Missing required query parameter: username' },
      { status: 400 },
    );
  }

  // Extract clean username if a full URL or path was provided
  const cleanUsername = username
    .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
    .replace(/\/.*$/, '')
    .trim();

  try {
    const res = await fetch(
      `${GITHUB_API}/users/${encodeURIComponent(cleanUsername)}/repos?sort=pushed&per_page=30`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'RESUMEMAKER/1.0',
          ...(process.env.GITHUB_TOKEN
            ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
            : {}),
        },
        next: { revalidate: 300 }, // cache for 5 min on the edge
      },
    );

    if (!res.ok) {
      const text = await res.text();
      console.error(`GitHub API error ${res.status}: ${text}`);
      return NextResponse.json(
        { error: `GitHub API responded with ${res.status}`, fallback: true },
        { status: 500 },
      );
    }

    const raw: unknown[] = await res.json();

    const repos: GitHubRepo[] = raw.map((r: unknown) => {
      const repo = r as Record<string, unknown>;
      return {
        name: (repo.name as string) ?? '',
        description: (repo.description as string | null) ?? null,
        language: (repo.language as string | null) ?? null,
        topics: (repo.topics as string[]) ?? [],
        pushed_at: (repo.pushed_at as string) ?? '',
        html_url: (repo.html_url as string) ?? '',
      };
    });

    return NextResponse.json(repos);
  } catch (err) {
    console.error('GitHub fetch failed:', err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Failed to fetch GitHub repos',
        fallback: true,
      },
      { status: 500 },
    );
  }
}
