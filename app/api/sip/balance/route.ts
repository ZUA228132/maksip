import { NextResponse } from "next/server";
import { fetchSipBalance } from "@/lib/sip";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await fetchSipBalance();
    if (!data) {
      return NextResponse.json(
        { error: "SIP не настроен" },
        { status: 400 }
      );
    }
    return NextResponse.json(data);
  } catch (e: any) {
    console.error("GET /api/sip/balance error", e);
    return NextResponse.json(
      { error: "Ошибка SIP-баланса" },
      { status: 500 }
    );
  }
}
