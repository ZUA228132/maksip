import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const now = new Date();
  let leads: any[] = [];
  let totalLeads = 0;
  let touched = 0;
  let answered = 0;
  let notAnswered = 0;
  let error: string | null = null;

  try {
    leads = await prisma.lead.findMany({
      include: { stats: true },
      take: 5000,
    });

    totalLeads = leads.length;
    touched = leads.filter((l) => (l.stats?.totalCalls ?? 0) > 0).length;
    answered = leads.filter((l) => (l.stats?.totalAnswered ?? 0) > 0).length;
    notAnswered = touched - answered;
  } catch (e) {
    console.error("reports/leads DB error", e);
    error = "db_unreachable";
    leads = [];
    totalLeads = 0;
    touched = 0;
    answered = 0;
    notAnswered = 0;
  }

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <title>Отчёт по обзвону</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#0f172a; color:#e5e7eb; padding:24px; }
    h1 { font-size:20px; margin-bottom:4px; }
    h2 { font-size:14px; margin-top:24px; margin-bottom:8px; }
    .kpi { display:flex; gap:12px; margin:12px 0 20px; flex-wrap: wrap; }
    .card { border-radius:12px; border:1px solid #1f2937; background:#020617; padding:10px 14px; font-size:12px; min-width: 140px; }
    table { width:100%; border-collapse:collapse; font-size:11px; margin-top:8px; }
    th, td { border:1px solid #1f2937; padding:4px 6px; }
    th { background:#020617; color:#9ca3af; text-align:left; }
    .badge-ok { display:inline-block; padding:1px 6px; border-radius:999px; background:#04785733; color:#6ee7b7; border:1px solid #05966955; font-size:10px; }
    .badge-bad { display:inline-block; padding:1px 6px; border-radius:999px; background:#b91c1c33; color:#fecaca; border:1px solid #f9737355; font-size:10px; }
    .error { margin-top: 12px; font-size: 11px; color: #fecaca; }
  </style>
</head>
<body>
  <h1>Отчёт по обзвону</h1>
  <div style="font-size:11px; color:#9ca3af;">Сформировано: ${now.toLocaleString("ru-RU")} (за весь период накопленных статусов)</div>

  ${error ? `<div class="error">Внимание: база данных сейчас недоступна (db_unreachable). Показаны нулевые значения.</div>` : ""}

  <div class="kpi">
    <div class="card">
      <div style="font-size:10px; color:#9ca3af;">Лидов в базе</div>
      <div style="font-size:18px; font-weight:600;">${totalLeads}</div>
    </div>
    <div class="card">
      <div style="font-size:10px; color:#9ca3af;">Обработано (есть звонки)</div>
      <div style="font-size:18px; font-weight:600;">${touched}</div>
    </div>
    <div class="card">
      <div style="font-size:10px; color:#9ca3af;">Брали трубку</div>
      <div style="font-size:18px; font-weight:600;">${answered}</div>
    </div>
    <div class="card">
      <div style="font-size:10px; color:#9ca3af;">Не брали трубку</div>
      <div style="font-size:18px; font-weight:600;">${notAnswered}</div>
    </div>
  </div>

  <h2>Список лидов</h2>
  <table>
    <thead>
      <tr>
        <th>Телефон</th>
        <th>ФИО</th>
        <th>Должность / звание</th>
        <th>Звонки</th>
        <th>Статус</th>
        <th>Последний звонок</th>
      </tr>
    </thead>
    <tbody>
      ${leads
        .map((l) => {
          const answeredFlag = (l.stats?.totalAnswered ?? 0) > 0;
          const statusBadge = answeredFlag
            ? '<span class="badge-ok">Брал трубку</span>'
            : '<span class="badge-bad">Не брал</span>';
          const dt = l.stats?.lastCallAt
            ? new Date(l.stats.lastCallAt as any).toLocaleString("ru-RU")
            : "—";
          const posRank = [l.position, l.rank].filter(Boolean).join(" · ") || "—";
          return `<tr>
            <td>${l.phoneNormalized}</td>
            <td>${l.fullName || "—"}</td>
            <td>${posRank}</td>
            <td>${l.stats?.totalCalls ?? 0} / ${l.stats?.totalAnswered ?? 0}</td>
            <td>${statusBadge}</td>
            <td>${dt}</td>
          </tr>`;
        })
        .join("")}
    </tbody>
  </table>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
