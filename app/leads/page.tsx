"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Lead = {
  id: string;
  phone: string;
  fullName: string | null;
  position: string | null;
  rank: string | null;
  totalCalls: number;
  totalAnswered: number;
  lastCallAt: string | null;
  lastStatus: string | null;
};

const STATUS_TABS = [
  { id: "all", label: "Все" },
  { id: "answered", label: "Брали трубку" },
  { id: "not_answered", label: "Не брали трубку" },
];

export default function LeadsPage() {
  const [status, setStatus] = useState<string>("all");
  const [q, setQ] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function loadLeads() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (status && status !== "all") params.set("status", status);
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/leads?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Ошибка загрузки лидов");
      }
      const data: Lead[] = await res.json();
      setLeads(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function formatDate(iso: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="flex items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">База лидов</h1>
            <p className="text-xs text-slate-400">
              Номера, ФИО, должности, статусы звонков (брал / не брал трубку).
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-xs rounded-full border border-slate-700 px-3 py-1 hover:bg-slate-800"
          >
            ← На дашборд
          </Link>
        </header>

        <section className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 p-1 text-xs">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatus(tab.id)}
                className={`rounded-full px-3 py-1 transition ${
                  status === tab.id
                    ? "bg-emerald-500 text-slate-950"
                    : "text-slate-400 hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form
            className="flex items-center gap-2 w-full sm:w-auto"
            onSubmit={(e) => {
              e.preventDefault();
              loadLeads();
            }}
          >
            <input
              placeholder="Поиск по телефону или ФИО"
              className="flex-1 sm:w-72 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-emerald-500"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button
              type="submit"
              className="rounded-xl bg-emerald-500 text-slate-950 text-xs font-semibold px-3 py-2 hover:bg-emerald-400"
            >
              Найти
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
            <div className="text-[11px] text-slate-400">
              Найдено:{" "}
              <span className="font-semibold text-slate-100">{leads.length}</span>
            </div>
            <button
              onClick={loadLeads}
              disabled={loading}
              className="text-[11px] rounded-full border border-slate-700 px-3 py-1 hover:bg-slate-800 disabled:opacity-60"
            >
              Обновить
            </button>
          </div>

          {error && (
            <div className="px-4 py-2 text-xs text-rose-400 bg-rose-950/40 border-b border-rose-900">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-900/80">
                <tr>
                  <th className="px-3 py-2 text-left text-slate-400 font-medium">
                    Телефон
                  </th>
                  <th className="px-3 py-2 text-left text-slate-400 font-medium">
                    ФИО
                  </th>
                  <th className="px-3 py-2 text-left text-slate-400 font-medium">
                    Должность / звание
                  </th>
                  <th className="px-3 py-2 text-left text-slate-400 font-medium">
                    Звонки
                  </th>
                  <th className="px-3 py-2 text-left text-slate-400 font-medium">
                    Статус
                  </th>
                  <th className="px-3 py-2 text-left text-slate-400 font-medium">
                    Последний звонок
                  </th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-slate-500 text-xs"
                    >
                      Лиды не найдены. Загрузите базу или измените фильтры.
                    </td>
                  </tr>
                )}
                {leads.map((lead) => {
                  const answered = lead.totalAnswered > 0;
                  return (
                    <tr
                      key={lead.id}
                      className="border-t border-slate-800/80 hover:bg-slate-800/40 transition"
                    >
                      <td className="px-3 py-2 font-mono text-[11px]">
                        {lead.phone}
                      </td>
                      <td className="px-3 py-2">{lead.fullName || "—"}</td>
                      <td className="px-3 py-2 text-slate-300">
                        {lead.position || lead.rank
                          ? [lead.position, lead.rank].filter(Boolean).join(" · ")
                          : "—"}
                      </td>
                      <td className="px-3 py-2">
                        {lead.totalCalls} /{" "}
                        <span className="text-emerald-400">
                          {lead.totalAnswered}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            answered
                              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-600/40"
                              : "bg-rose-500/10 text-rose-300 border border-rose-600/40"
                          }`}
                        >
                          {answered ? "Брал трубку" : "Не брал"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-300">
                        {formatDate(lead.lastCallAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {loading && (
            <div className="px-4 py-3 text-[11px] text-slate-400 border-t border-slate-800">
              Загрузка...
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
