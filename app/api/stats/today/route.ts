import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const calls = await prisma.call.findMany({
      where: {
        startedAt: {
          gte: start,
          lte: end
        }
      }
    });

    const total = calls.length;
    const answered = calls.filter((c) =>
      ["answered", "ok", "success"].includes(c.status.toLowerCase())
    ).length;
    const missed = calls.filter((c) =>
      ["missed", "noanswer", "busy"].includes(c.status.toLowerCase())
    ).length;

    return NextResponse.json({ total, answered, missed });
  } catch (e: any) {
    console.error("GET /api/stats/today error", e);
    return NextResponse.json(
      { error: "Ошибка статистики" },
      { status: 500 }
    );
  }
}
