import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { JSDOM } from "jsdom";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";
import { getCurrentAgent } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const agent = await getCurrentAgent();
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  type Row = { phone: string; fullName?: string; position?: string; rank?: string };
  const rows: Row[] = [];

  if (file.name.endsWith(".xlsx") || file.name.endsWith(".ods")) {
    const wb = XLSX.read(buffer, { type: "buffer" });
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const json: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

    json.forEach((r) => {
      rows.push({
        phone: String(r["phone"] || r["телефон"] || r["номер"] || "").trim(),
        fullName: (r["fio"] || r["ФИО"] || r["ПІБ"] || "").toString().trim(),
        position: (r["должность"] || r["посада"] || "").toString().trim(),
        rank: (r["звание"] || r["звання"] || "").toString().trim(),
      });
    });
  } else if (file.name.endsWith(".html")) {
    const dom = new JSDOM(buffer.toString("utf8"));
    const document = dom.window.document;
    const trs = Array.from(document.querySelectorAll("table tr"));
    trs.slice(1).forEach((tr) => {
      const tds = tr.querySelectorAll("td");
      if (tds.length === 0) return;
      const phone = tds[0].textContent?.trim() ?? "";
      const fullName = tds[1]?.textContent?.trim() ?? "";
      const position = tds[2]?.textContent?.trim() ?? "";
      const rank = tds[3]?.textContent?.trim() ?? "";
      rows.push({ phone, fullName, position, rank });
    });
  } else {
    return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
  }

  const upload = await prisma.upload.create({
    data: {
      filename: file.name,
      rowsCount: rows.length,
      createdById: agent.id,
    },
  });

  const leadData = rows
    .map((r) => {
      const phone = normalizePhone(r.phone);
      if (!phone) return null;
      return {
        uploadId: upload.id,
        phoneNormalized: phone,
        fullName: r.fullName || null,
        position: r.position || null,
        rank: r.rank || null,
      };
    })
    .filter(Boolean) as any[];

  if (leadData.length) {
    await prisma.lead.createMany({ data: leadData, skipDuplicates: true });
  }

  return NextResponse.json({ ok: true, uploadId: upload.id, imported: leadData.length });
}
