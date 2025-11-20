import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * GET /api/leads
 * Параметры:
 *  - status: answered | not_answered | all
 *  - uploadId: string (id загрузки)
 *  - q: строка поиска (по телефону или ФИО)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // answered / not_answered / all
  const uploadId = searchParams.get("uploadId");
  const q = searchParams.get("q");

  const whereAny: any = {};
  if (uploadId) whereAny.uploadId = uploadId;

  if (q) {
    const like = `%${q}%`;
    whereAny.OR = [
      { phoneNormalized: { contains: q } },
      { fullName: { contains: q, mode: "insensitive" } },
    ];
  }

  const leads = await prisma.lead.findMany({
    where: whereAny,
    include: {
      stats: true,
    },
    take: 1000,
    orderBy: {
      fullName: "asc",
    },
  });

  const filtered = leads.filter((l) => {
    if (!status || status === "all") return true;
    const answered = l.stats?.totalAnswered ?? 0;
    if (status === "answered") return answered > 0;
    if (status === "not_answered") return answered === 0;
    return true;
  });

  const result = filtered.map((l) => ({
    id: l.id,
    phone: l.phoneNormalized,
    fullName: l.fullName,
    position: l.position,
    rank: l.rank,
    totalCalls: l.stats?.totalCalls ?? 0,
    totalAnswered: l.stats?.totalAnswered ?? 0,
    lastCallAt: l.stats?.lastCallAt,
    lastStatus: l.stats?.lastStatus,
  }));

  return NextResponse.json(result);
}
