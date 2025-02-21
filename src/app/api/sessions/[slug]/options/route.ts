import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sessions, options } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyAdmin } from '@/middleware/auth';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.slug, params.slug)
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const sessionOptions = await db.query.options.findMany({
      where: (options, { eq }) => eq(options.sessionId, session.id)
    });

    return NextResponse.json({ options: sessionOptions });
  } catch (error) {
    console.error('Failed to fetch options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch options' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const authError = await verifyAdmin(request, params.slug);
    if (authError) return authError;

    const { options: newOptions } = await request.json();

    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.slug, params.slug)
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.state !== 'initiated') {
      return NextResponse.json(
        { error: 'Session is already configured' },
        { status: 400 }
      );
    }

    const result = await db.transaction(async (tx) => {
      await tx.insert(options).values(
        newOptions.map((opt: { label: string }) => ({
          sessionId: session.id,
          label: opt.label,
        }))
      );

      await tx
        .update(sessions)
        .set({ state: 'configured' })
        .where(eq(sessions.id, session.id));

      return await tx.query.options.findMany({
        where: (options, { eq }) => eq(options.sessionId, session.id)
      });
    });

    return NextResponse.json({ options: result });
  } catch (error) {
    console.error('Failed to save options:', error);
    return NextResponse.json(
      { error: 'Failed to save options' },
      { status: 500 }
    );
  }
}
