import { NextRequest, NextResponse } from "next/server";
import { ensureAdminSeed } from "@/lib/auth";

const ADMIN_LOGIN = process.env.ADMIN_LOGIN ?? "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // просто вызываем заглушку — внутри ничего не делается
    await ensureAdminSeed();

    const body = await req.json().catch(() => ({} as any));
    const username = (body.username ?? body.login ?? "").toString();
    const password = (body.password ?? "").toString();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Введите логин и пароль" },
        { status: 400 }
      );
    }

    if (username !== ADMIN_LOGIN || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Неверный логин или пароль" },
        { status: 401 }
      );
    }

    const token = "maksip-" + Math.random().toString(36).slice(2);

    const res = NextResponse.json({ ok: true }, { status: 200 });

    // Эту куку проверяет getCurrentAgent
    res.cookies.set("maksip_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });

    return res;
  } catch (e: any) {
    console.error("Login error:", e);
    return NextResponse.json(
      {
        error:
          "Внутренняя ошибка авторизации: " +
          (e?.message ?? "unknown")
      },
      { status: 500 }
    );
  }
}
