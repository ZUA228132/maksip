import { redirect } from "next/navigation";
import { getCurrentAgent } from "@/lib/auth";
import { TopBar } from "@/components/TopBar";
import { fetchSipBalance } from "@/lib/sip";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getTodayStats() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const calls = await prisma.call.findMany({
    where: {
      startedAt: {
        gte: start,
        lte: end
      }
    }
  });

  const total = calls.length;
  const answered = calls.filter((c) =>
    ["answered", "ok", "success"].includes(c.status.toLowerCase())
  ).length;
  const missed = calls.filter((c) =>
    ["missed", "noanswer", "busy"].includes(c.status.toLowerCase())
  ).length;

  return { total, answered, missed };
}

export default async function DashboardPage() {
  const agent = await getCurrentAgent();
  if (!agent) redirect("/login");

  const [stats, sipBalance] = await Promise.all([
    getTodayStats(),
    fetchSipBalance()
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <TopBar />
      <main className="flex-1 p-4 flex flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[180px] rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="text-xs text-slate-400 mb-1">
              Оператор
            </div>
            <div className="text-sm font-semibold">
              {agent.displayName} ({agent.username})
            </div>
          </div>
          <div className="flex-1 min-w-[180px] rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="text-xs text-slate-400 mb-1">
              Баланс SIP
            </div>
            <div className="text-lg font-semibold">
              {sipBalance
                ? `${sipBalance.balance.toFixed(
                    2
                  )} ${sipBalance.currency ?? ""}`
                : "не настроен"}
            </div>
          </div>
          <div className="flex-1 min-w-[180px] rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="text-xs text-slate-400 mb-1">
              Звонки за сегодня
            </div>
            <div className="text-sm">
              Всего:{" "}
              <span className="font-semibold">
                {stats.total}
              </span>
            </div>
            <div className="text-xs text-emerald-300">
              Отвечено: {stats.answered}
            </div>
            <div className="text-xs text-red-300">
              Пропущено: {stats.missed}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold mb-2">
              Быстрые сценарии
            </h2>
            <ul className="text-xs text-slate-300 space-y-1">
              <li>
                • Приветствие, проверка ФИО, должности, актуальности
                номера.
              </li>
              <li>
                • Мини-скрипт для прозвона военных / волонтёров.
              </li>
              <li>
                • Шаблон фиксации результата звонка: взял / не взял /
                сброс / не тот номер.
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold mb-2">
              Краткая сводка
            </h2>
            <p className="text-xs text-slate-300 mb-2">
              Здесь можно будет допилить журналы звонков, актуальную
              нагрузку по операторам и т.д. Сейчас дашборд уже
              подтягивает данные из таблицы <code>Call</code> и интегруется
              c SIP-балансом.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
