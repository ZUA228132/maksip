import { redirect } from "next/navigation";
import { getCurrentAgent } from "@/lib/auth";
import { TopBar } from "@/components/TopBar";

export default async function AssistantPage() {
  const agent = await getCurrentAgent();
  if (!agent) redirect("/login");

  return (
    <div className="flex flex-1 flex-col">
      <TopBar />
      <main className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <h2 className="text-sm font-semibold mb-2">
            Сценарии разговора
          </h2>
          <ul className="text-xs text-slate-300 space-y-1">
            <li>• Приветствие, представление, откуда звонишь.</li>
            <li>• Быстрая верификация ФИО и части.</li>
            <li>• Уточнение статуса: на связи / в бою / в отпуске.</li>
            <li>• Фиксация результата в базе и чек-лист по закрытию.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <h2 className="text-sm font-semibold mb-2">
            Полезные ссылки
          </h2>
          <ul className="text-xs text-emerald-300 space-y-1">
            <li>
              • ЛК оператора SIP.xho.biz (допиши ссылку на веб-панель).
            </li>
            <li>
              • Гугл-диск с базами / отчётами.
            </li>
            <li>
              • Внутренний тех-чат / Jira / Telegram-бот для заявок.
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:col-span-2">
          <h2 className="text-sm font-semibold mb-2">
            Черновик заявки в техподдержку
          </h2>
          <p className="text-xs text-slate-400 mb-2">
            Здесь можно будет завести реальные тикеты через
            <code> /api/support/ticket</code>. Пока это просто шаблон
            текста.
          </p>
          <pre className="text-[11px] bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-slate-200 overflow-auto">
{`Тема: Проблема с прозвоном / SIP

Описание:
- Дата/время:
- Номер абонента:
- Скриншот/запись:
- Что ожидалось:
- Что по факту:`}
          </pre>
        </section>
      </main>
    </div>
  );
}
