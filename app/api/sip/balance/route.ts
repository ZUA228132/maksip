import { NextRequest, NextResponse } from "next/server";
import { SipXhoClient } from "@/lib/sipClient";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const client = new SipXhoClient();
  const balance = await client.getBalance();
  return NextResponse.json({ balance });
}
