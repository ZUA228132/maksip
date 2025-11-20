import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

async function getTodayStats() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/stats/today`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

async function getAgentsStats() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/stats/agents`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

async function getSipBalance() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sip/balance`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function DashboardPage() {
  const cookieStore = cookies();
  const agentId = cookieStore.get("agentId")?.value;
  if (!agentId) redirect("/login");

  const [today, agents, balanceData] = await Promise.all([
    getTodayStats(),
    getAgentsStats(),
    getSipBalance(),
  ]);

  const balance = balanceData?.balance ?? null;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="flex items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Call Center Control
            </h1>
            <p className="text-sm text-slate-400">
              Центр управления звонками: sip.xho.biz + ваши базы
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="rounded-full bg-slate-900/70 px-4 py-2 text-xs text-slate-400 border border-slate-700">
              Сегодня: {today?.dateHuman ?? "-"}
            </div>
            <div className="text-[11px] text-emerald-300">
              Баланс IP-телефонии:{" "}
              <span className="font-semibold">
                {balance !== null ? `${balance.toFixed?.(2) ?? balance} ₴` : "—"}
              </span>
            </div>
          </div>
        </header>

        {/* Верхние кнопки навигации */}
        <div className="flex flex-wrap gap-2 mb-6 text-xs">
          <Link
            href="/leads"
            className="rounded-full border border-slate-700 px-3 py-1 hover:bg-slate-800"
          >
            База лидов
          </Link>
          <Link
            href="/assistant"
            className="rounded-full border border-slate-700 px-3 py-1 hover:bg-slate-800"
          >
            Помогатор оператора
          </Link>
        </div>

        {/* KPI карточки */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard title="Звонков сегодня" value={today?.total ?? 0} subtitle="Все попытки" />
          <KpiCard
            title="Отвеченных"
            value={today?.answered ?? 0}
            subtitle={`${today?.answeredRate ?? 0}% от общего`}
          />
          <KpiCard
            title="Не отвечено"
            value={today?.missed ?? 0}
            subtitle={`${today?.missedRate ?? 0}% от общего`}
          />
          <KpiCard
            title="Среднее время разговора"
            value={`${today?.avgDurationSec ?? 0}s`}
            subtitle="по отвеченным"
          />
        </section>

        {/* Статистика по операторам */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Операторы</h2>
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-900/80">
                <tr>
                  <th className="px-4 py-3 text-left text-slate-400 font-medium">
                    Оператор
                  </th>
                  <th className="px-4 py-3 text-left text-slate-400 font-medium">
                    Звонки
                  </th>
                  <th className="px-4 py-3 text-left text-slate-400 font-medium">
                    Отвечено
                  </th>
                  <th className="px-4 py-3 text-left text-slate-400 font-medium">
                    Конверсия
                  </th>
                  <th className="px-4 py-3 text-left text-slate-400 font-medium">
                    Сред. длительность
                  </th>
                </tr>
              </thead>
              <tbody>
                {agents.map((a: any) => (
                  <tr
                    key={a.id}
                    className="border-t border-slate-800/80 hover:bg-slate-800/40 transition"
                  >
                    <td className="px-4 py-3 font-medium">{a.displayName}</td>
                    <td className="px-4 py-3">{a.totalCalls}</td>
                    <td className="px-4 py-3">{a.totalAnswered}</td>
                    <td className="px-4 py-3">
                      {a.totalCalls ? Math.round((a.totalAnswered / a.totalCalls) * 100) : 0}%
                    </td>
                    <td className="px-4 py-3">{a.avgDurationSec ?? 0}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Быстрый фильтр по базе */}
        <section>
          <div className="flex items-center justify-between mb-4 gap-4">
            <h2 className="text-lg font-semibold">База звонков</h2>
            <div className="flex gap-2">
              <span className="text-[11px] text-slate-500">
                Перейти к детальной таблице:{" "}
                <Link href="/leads" className="text-emerald-300 hover:underline">
                  /leads
                </Link>
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            Здесь можно быстро оценить общую нагрузку по звонкам, а детально работать с
            каждым номером и статусом — на странице &quot;База лидов&quot;.
          </p>
        </section>
      </div>
    </main>
  );
}

function KpiCard(props: { title: string; value: string | number; subtitle?: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 flex flex-col justify-between">
      <div className="text-xs text-slate-400 mb-1">{props.title}</div>
      <div className="text-2xl font-semibold mb-1">{props.value}</div>
      {props.subtitle && (
        <div className="text-[11px] text-slate-500">{props.subtitle}</div>
      )}
    </div>
  );
}
