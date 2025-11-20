import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";

export const runtime = "nodejs";

/**
 * Этот endpoint нужно указать в панели sip.xho.biz как webhook / CDR URL.
 * Ожидается JSON вида:
 * {
 *   "id": "external-call-id",
 *   "from": "+380...",
 *   "to": "+380...",
 *   "direction": "outbound" | "inbound",
 *   "status": "answered" | "no_answer" | "busy" | ...,
 *   "started_at": "2025-11-20T10:00:00Z",
 *   "finished_at": "2025-11-20T10:02:13Z",
 *   "duration_sec": 133,
 *   "agent_sip_id": "9571421515"
 * }
 * Подгони под реальный формат sip.xho.biz.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();

  const toNumber = normalizePhone(body.to);
  const fromNumber = normalizePhone(body.from);

  const lead = toNumber
    ? await prisma.lead.findFirst({
        where: { phoneNormalized: toNumber },
      })
    : null;

  const agent =
    body.agent_sip_id &&
    (await prisma.agent.findFirst({
      where: { sipId: body.agent_sip_id },
    }));

  const call = await prisma.call.create({
    data: {
      externalId: body.id,
      fromNumber: fromNumber || body.from,
      toNumber: toNumber || body.to,
      direction: body.direction || "outbound",
      status: body.status || "unknown",
      startedAt: body.started_at ? new Date(body.started_at) : null,
      finishedAt: body.finished_at ? new Date(body.finished_at) : null,
      durationSec: body.duration_sec ?? null,
      agentId: agent?.id,
      leadId: lead?.id,
      raw: body,
    },
  });

  if (lead) {
    const isAnswered = body.status === "answered";
    await prisma.leadStats.upsert({
      where: { leadId: lead.id },
      update: {
        totalCalls: { increment: 1 },
        totalAnswered: { increment: isAnswered ? 1 : 0 },
        lastCallAt: body.finished_at ? new Date(body.finished_at) : new Date(),
        lastStatus: body.status,
        lastAgentId: agent?.id ?? undefined,
      },
      create: {
        leadId: lead.id,
        totalCalls: 1,
        totalAnswered: isAnswered ? 1 : 0,
        lastCallAt: body.finished_at ? new Date(body.finished_at) : new Date(),
        lastStatus: body.status,
        lastAgentId: agent?.id,
      },
    });
  }

  return NextResponse.json({ ok: true, callId: call.id });
}
