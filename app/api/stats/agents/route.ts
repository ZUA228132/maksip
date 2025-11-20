import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const calls = await prisma.call.findMany({
    where: {
      startedAt: {
        gte: dayStart,
        lte: now,
      },
    },
    include: {
      agent: true,
    },
  });

  const map = new Map<
    string,
    {
      id: string;
      displayName: string;
      totalCalls: number;
      totalAnswered: number;
      totalDuration: number;
    }
  >();

  for (const c of calls) {
    const agentId = c.agentId || "unknown";
    const agentName = c.agent?.displayName || "Не назначено";
    if (!map.has(agentId)) {
      map.set(agentId, {
        id: agentId,
        displayName: agentName,
        totalCalls: 0,
        totalAnswered: 0,
        totalDuration: 0,
      });
    }
    const agg = map.get(agentId)!;
    agg.totalCalls += 1;
    if (c.status === "answered") {
      agg.totalAnswered += 1;
      agg.totalDuration += c.durationSec || 0;
    }
  }

  const list = Array.from(map.values()).map((a) => ({
    ...a,
    avgDurationSec: a.totalAnswered ? Math.round(a.totalDuration / a.totalAnswered) : 0,
  }));

  return NextResponse.json(list);
}
