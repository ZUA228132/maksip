import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const calls = await prisma.call.findMany({
      where: {
        startedAt: {
          gte: dayStart,
          lte: now,
        },
      },
    });

    const total = calls.length;
    const answeredCalls = calls.filter((c) => c.status === "answered");
    const missedCalls = calls.filter((c) => c.status !== "answered");

    const answered = answeredCalls.length;
    const missed = missedCalls.length;

    const avgDurationSec = answered
      ? Math.round(
          answeredCalls.reduce((sum, c) => sum + (c.durationSec || 0), 0) / answered
        )
      : 0;

    const answeredRate = total ? Math.round((answered / total) * 100) : 0;
    const missedRate = total ? Math.round((missed / total) * 100) : 0;

    const dateHuman = dayStart.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    return NextResponse.json({
      total,
      answered,
      missed,
      avgDurationSec,
      answeredRate,
      missedRate,
      dateHuman,
    });
  } catch (e) {
    console.error("stats/today DB error", e);
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateHuman = dayStart.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    // Возвращаем нули, чтобы билд/рендер не падал
    return NextResponse.json({
      total: 0,
      answered: 0,
      missed: 0,
      avgDurationSec: 0,
      answeredRate: 0,
      missedRate: 0,
      dateHuman,
      error: "db_unreachable",
    });
  }
}
