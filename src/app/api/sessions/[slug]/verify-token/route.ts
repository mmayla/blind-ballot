import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sessions, tokens } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { slug } = params;

  try {
    const { token } = await request.json();

    const session = await db.query.sessions.findFirst({
      where: eq(sessions.slug, slug)
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.state === 'finished') {
      return NextResponse.json(
        { error: 'Voting is closed for this session' },
        { status: 403 }
      );
    }

    const tokenRecord = await db.query.tokens.findFirst({
      where: eq(tokens.token, token)
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: 'Invalid or already used token' },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.json(
      { error: 'Failed to verify token' },
      { status: 500 }
    );
  }
}
