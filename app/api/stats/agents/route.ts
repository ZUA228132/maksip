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

    const map = new Map<
      string,
      { label: string; total: number; answered: number; missed: number }
    >();

    for (const c of calls) {
      const label = c.agentLabel || "Unknown";
      if (!map.has(label)) {
        map.set(label, {
          label,
          total: 0,
          answered: 0,
          missed: 0
        });
      }
      const s = map.get(label)!;
      s.total += 1;
      if (["answered", "ok", "success"].includes(c.status.toLowerCase())) {
        s.answered += 1;
      } else if (
        ["missed", "noanswer", "busy"].includes(c.status.toLowerCase())
      ) {
        s.missed += 1;
      }
    }

    return NextResponse.json(Array.from(map.values()));
  } catch (e: any) {
    console.error("GET /api/stats/agents error", e);
    return NextResponse.json(
      { error: "Ошибка статистики" },
      { status: 500 }
    );
  }
}
