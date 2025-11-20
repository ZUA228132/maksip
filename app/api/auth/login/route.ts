import { NextRequest, NextResponse } from "next/server";

const ADMIN_LOGIN = process.env.ADMIN_LOGIN ?? "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const username = (body.username ?? body.login ?? "").toString();
    const password = (body.password ?? "").toString();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Укажи логин и пароль" },
        { status: 400 }
      );
    }

    if (username !== ADMIN_LOGIN || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Неверный логин или пароль" },
        { status: 401 }
      );
    }

    // простой токен с кукой
    const token = "maksip-admin-" + Math.random().toString(36).slice(2);

    const res = NextResponse.json(
      { ok: true, token },
      { status: 200 }
    );

    res.cookies.set("maksip_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 дней
    });

    return res;
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json(
      {
        error:
          "Внутренняя ошибка авторизации: " +
          (err?.message ?? "unknown"),
      },
      { status: 500 }
    );
  }
}
