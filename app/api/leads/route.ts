import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";

export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 500
    });
    return NextResponse.json(leads);
  } catch (e: any) {
    console.error("GET /api/leads error", e);
    return NextResponse.json(
      { error: "Ошибка чтения лидов" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Некорректный JSON" },
        { status: 400 }
      );
    }

    const { phone, fullName, position, rank, unit, notes } = body as any;
    const normalized = normalizePhone(phone ?? null);

    if (!normalized) {
      return NextResponse.json(
        { error: "Не удалось распознать номер телефона" },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.upsert({
      where: { phoneNormalized: normalized },
      create: {
        phoneRaw: phone,
        phoneNormalized: normalized,
        fullName: fullName || null,
        position: position || null,
        rank: rank || null,
        unit: unit || null,
        notes: notes || null
      },
      update: {
        fullName: fullName || null,
        position: position || null,
        rank: rank || null,
        unit: unit || null,
        notes: notes || null
      }
    });

    return NextResponse.json(lead);
  } catch (e: any) {
    console.error("POST /api/leads error", e);
    return NextResponse.json(
      { error: "Ошибка сохранения лида" },
      { status: 500 }
    );
  }
}
