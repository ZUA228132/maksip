import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

async function ensureAdmin() {
  // берём данные админа из env, с дефолтами
  const username = process.env.ADMIN_LOGIN ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const displayName = process.env.ADMIN_DISPLAY_NAME ?? "Администратор";

  // если таблицы нет или другая ошибка схемы — сразу пробрасываем, чтобы увидеть в логах
  try {
    const existing = await prisma.agent.findUnique({
      where: { username },
    });

    if (existing) return existing;
  } catch (e) {
    console.error("ensureAdmin: prisma.agent.findUnique error", e);
    throw e;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const admin = await prisma.agent.create({
      data: {
        username,
        passwordHash,
        displayName,
        role: "admin",
      },
    });

    console.log("Admin created:", admin.username);
    return admin;
  } catch (e) {
    console.error("ensureAdmin: prisma.agent.create error", e);
    throw e;
  }
}

export async function POST(req: NextRequest) {
  try {
    // гарантированно создаём админа, если его нет
    await ensureAdmin();

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Некорректный формат запроса" },
        { status: 400 }
      );
    }

    const { username, password } = body as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      return NextResponse.json(
        { error: "Введите логин и пароль" },
        { status: 400 }
      );
    }

    const agent = await prisma.agent.findUnique({
      where: { username },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Неверный логин или пароль" },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(password, agent.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: "Неверный логин или пароль" },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ ok: true });

    // ВАЖНО: именно эту куку ждёт защита /dashboard
    res.cookies.set("agentId", agent.id, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (e: any) {
    console.error("auth/login error", e);
    return NextResponse.json(
      {
        error:
          "Внутренняя ошибка авторизации: " +
          (e?.message ?? "unknown"),
      },
      { status: 500 }
    );
  }
}
