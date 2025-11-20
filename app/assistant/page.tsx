"use client";

import Link from "next/link";
import { useState } from "react";

export default function AssistantPage() {
  const [ticketText, setTicketText] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!ticketText.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/support/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: ticketText }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Ошибка создания запроса");
      }
      const data = await res.json();
      setCreatedId(data.id || "draft");
      setTicketText("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleReport() {
    // Просто открываем HTML-отчёт по лидам в новой вкладке
    window.open("/api/reports/leads", "_blank");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Помогатор оператора
            </h1>
            <p className="text-xs text-slate-400">
              Сценарии звонков, полезные ссылки, запросы в тех. отдел и быстрые отчёты.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-xs rounded-full border border-slate-700 px-3 py-1 hover:bg-slate-800"
          >
            ← На дашборд
          </Link>
        </header>

        {/* Сценарии звонков */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold mb-2">
              Скрипт: первый контакт
            </h2>
            <ol className="text-[11px] text-slate-200 space-y-1 list-decimal list-inside">
              <li>Представьтесь и уточните, удобно ли сейчас говорить.</li>
              <li>Кратко объясните цель звонка (1–2 предложения).</li>
              <li>Задайте 1–2 уточняющих вопроса по ситуации клиента.</li>
              <li>Предложите понятный следующий шаг (перезвон, встреча, уточнение данных).</li>
            </ol>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold mb-2">
              Скрипт: повторный звонок (не брал трубку)
            </h2>
            <ol className="text-[11px] text-slate-200 space-y-1 list-decimal list-inside">
              <li>Сошлитесь на предыдущий попытки дозвона.</li>
              <li>Коротко напомните, кто вы и по какому вопросу.</li>
              <li>Предложите альтернативу: другой номер, мессенджер, e-mail.</li>
              <li>Зафиксируйте результат в системе (комментарий по лиду).</li>
            </ol>
          </div>
        </section>

        {/* Полезные ссылки */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold mb-2">Полезные сайты</h2>
            <ul className="text-[11px] text-emerald-300 space-y-1">
              <li>
                <a
                  href="http://sip.xho.biz/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  Панель SIP / биллинг
                </a>
              </li>
              <li>
                <a
                  href="https://www.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  Поиск по данным клиента
                </a>
              </li>
              <li>
                <a
                  href="https://whois.domaintools.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  Проверка доменов / IP
                </a>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold mb-2">
              Быстрый отчёт по обзвону
            </h2>
            <p className="text-[11px] text-slate-300 mb-3">
              Нажми на кнопку ниже, чтобы сгенерировать HTML-отчёт по текущей базе
              (кол-во звонков, отвеченные, не отвеченные).
            </p>
            <button
              onClick={handleReport}
              className="rounded-xl bg-emerald-500 text-slate-950 text-xs font-semibold px-4 py-2 hover:bg-emerald-400"
            >
              Сформировать отчёт
            </button>
          </div>
        </section>

        {/* Запрос в тех. отдел */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <h2 className="text-sm font-semibold mb-2">Запрос в тех. отдел</h2>
          <p className="text-[11px] text-slate-400 mb-3">
            Опиши проблему (номер, время, скриншоты, что именно не работает). Запрос
            можно выгрузить из БД или переслать в любой тикет-сервис.
          </p>
          <form onSubmit={handleCreateTicket} className="space-y-3">
            <textarea
              className="w-full min-h-[90px] rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-emerald-500"
              placeholder="Пример: не проходит исходящий звонок на +380..., время по Киеву 12:34, линфон показывает 503..."
              value={ticketText}
              onChange={(e) => setTicketText(e.target.value)}
            />
            {error && (
              <div className="text-[11px] text-rose-400 bg-rose-950/40 border border-rose-900 rounded-xl px-3 py-2">
                {error}
              </div>
            )}
            {createdId && (
              <div className="text-[11px] text-emerald-300 bg-emerald-950/40 border border-emerald-900 rounded-xl px-3 py-2">
                Черновик запроса сохранён (ID: {createdId}). Можно выгрузить его
                через БД или REST API.
              </div>
            )}
            <button
              type="submit"
              disabled={creating}
              className="rounded-xl bg-slate-800 text-slate-100 text-xs font-semibold px-4 py-2 hover:bg-slate-700 disabled:opacity-60"
            >
              {creating ? "Создаём..." : "Создать запрос"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
