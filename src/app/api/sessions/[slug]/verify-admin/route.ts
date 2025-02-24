import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { verifyAdminJwt } from "@/lib/jwt";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAdminJwt(token);

    if (!decoded || decoded.sessionSlug !== params.slug) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Verify the session exists and matches the token
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.slug, params.slug),
    });

    if (!session || session.id !== decoded.sessionId) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Error verifying admin token:", error);
    return NextResponse.json(
      { error: "Failed to verify token" },
      { status: 500 }
    );
  }
}
