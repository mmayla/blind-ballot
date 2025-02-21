import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sessions } from '@/db/schema';

export async function POST(request: Request) {
  try {
    const { name, password } = await request.json();

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Create session
    const [session] = await db
      .insert(sessions)
      .values({
        name,
        slug,
        hashedPassword: password,
      })
      .returning();

    return NextResponse.json({
      session: {
        id: session.id,
        slug: session.slug,
        name: session.name,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
