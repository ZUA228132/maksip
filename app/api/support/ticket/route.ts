import { NextRequest, NextResponse } from "next/server";

// Простой in-memory stub. На проде лучше писать в БД (таблица tickets).
const tickets: { id: string; text: string; createdAt: string }[] = [];

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.text !== "string" || !body.text.trim()) {
    return NextResponse.json({ error: "Нет текста запроса" }, { status: 400 });
  }
  const id = `T${Date.now()}`;
  tickets.push({ id, text: body.text.trim(), createdAt: new Date().toISOString() });
  return NextResponse.json({ ok: true, id });
}
