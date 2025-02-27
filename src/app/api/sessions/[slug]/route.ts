import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyAdmin } from '@/middleware/auth';

export async function GET(request: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.slug, params.slug)
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({
      session: {
        id: session.id,
        name: session.name,
        slug: session.slug,
        state: session.state,
        type: session.type,
        minVotes: session.minVotes,
        maxVotes: session.maxVotes,
      }
    });
  } catch (error) {
    console.error('Failed to fetch session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { slug } = params;

  try {
    const authError = await verifyAdmin(request, slug);
    if (authError) return authError;

    const { minVotes, maxVotes } = await request.json();

    if (minVotes === undefined || maxVotes === undefined) {
      return NextResponse.json(
        { error: 'Both minVotes and maxVotes are required' },
        { status: 400 }
      );
    }

    if (typeof minVotes !== 'number' || typeof maxVotes !== 'number') {
      return NextResponse.json(
        { error: 'minVotes and maxVotes must be numbers' },
        { status: 400 }
      );
    }

    if (minVotes < 0 || maxVotes < 0) {
      return NextResponse.json(
        { error: 'minVotes and maxVotes cannot be negative' },
        { status: 400 }
      );
    }

    if (minVotes > maxVotes) {
      return NextResponse.json(
        { error: 'minVotes cannot be greater than maxVotes' },
        { status: 400 }
      );
    }

    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.slug, slug)
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.state !== 'initiated') {
      return NextResponse.json(
        { error: 'Session settings can only be updated in initiated state' },
        { status: 400 }
      );
    }

    const [updatedSession] = await db
      .update(sessions)
      .set({
        minVotes,
        maxVotes,
      })
      .where(eq(sessions.slug, slug))
      .returning();

    return NextResponse.json({
      session: {
        id: updatedSession.id,
        name: updatedSession.name,
        slug: updatedSession.slug,
        state: updatedSession.state,
        type: updatedSession.type,
        minVotes: updatedSession.minVotes,
        maxVotes: updatedSession.maxVotes,
      }
    });
  } catch (error) {
    console.error('Failed to update session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}
