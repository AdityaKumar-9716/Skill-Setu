import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: 'Document ID required' }, { status: 400 });
  }

  try {
    const res = await fetch(`http://localhost:5000/api/analyze/roadmap/${encodeURIComponent(id)}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: `Could not reach backend service to query Firestore: ${err.message}`,
    }, { status: 502 });
  }
}
