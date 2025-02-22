import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyAdmin } from '@/middleware/auth';

export async function POST(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { slug } = params;

  try {
    const authError = await verifyAdmin(request, slug);
    if (authError) return authError;

    await db.update(sessions)
      .set({ state: 'finished' })
      .where(eq(sessions.slug, slug));

    return NextResponse.json({ message: 'Session closed successfully' });
  } catch (error) {
    console.error('Error closing session:', error);
    return NextResponse.json(
      { error: 'Failed to close session' },
      { status: 500 }
    );
  }
}
