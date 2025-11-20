import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Некорректный JSON" },
        { status: 400 }
      );
    }

    const { subject, body: text } = body as any;
    if (!subject || !text) {
      return NextResponse.json(
        { error: "Нужны subject и body" },
        { status: 400 }
      );
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        subject,
        body: text
      }
    });

    return NextResponse.json(ticket);
  } catch (e: any) {
    console.error("POST /api/support/ticket error", e);
    return NextResponse.json(
      { error: "Ошибка записи тикета" },
      { status: 500 }
    );
  }
}
