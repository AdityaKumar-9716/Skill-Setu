import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  // Check if express server is reachable first
  try {
    const res = await fetch('http://localhost:5000/api/analyze/firebase-status', {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 10 },
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Backend offline, fallback to checking local key file
  }

  // Check local key file directly
  const localKeyPath = path.join(process.cwd(), 'server', 'firebase-key.json');
  const hasKey = fs.existsSync(localKeyPath);

  let projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'skill-setu3993';
  if (hasKey) {
    try {
      const content = JSON.parse(fs.readFileSync(localKeyPath, 'utf8'));
      if (content.project_id) projectId = content.project_id;
    } catch {
      // ignore read error
    }
  }

  return NextResponse.json({
    success: true,
    database: {
      connected: hasKey,
      isConfigured: hasKey,
      projectId,
      provider: 'Google Cloud / Firebase Firestore',
      source: 'Next.js App Router',
      testedAt: new Date().toISOString(),
    },
  });
}
