import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ensureAdminSeed } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await ensureAdminSeed();

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Некорректный формат запроса" },
        { status: 400 },
      );
    }

    const { username, password } = body as { username?: string; password?: string };

    if (!username || !password) {
      return NextResponse.json(
        { error: "Введите логин и пароль" },
        { status: 400 },
      );
    }

    const agent = await prisma.agent.findUnique({
      where: { username },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Неверный логин или пароль" },
        { status: 401 },
      );
    }

    const ok = await bcrypt.compare(password, agent.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: "Неверный логин или пароль" },
        { status: 401 },
      );
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set("agentId", agent.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
    });
    return res;
  } catch (e) {
    console.error("auth/login error", e);
    // Всегда возвращаем JSON, чтобы фронт нормально распарсил
    return NextResponse.json(
      { error: "Ошибка подключения к базе или внутренний сбой сервера" },
      { status: 500 },
    );
  }
}
