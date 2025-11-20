"use client";

import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: login, password })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          (data && data.error) ||
            "Ошибка авторизации. Проверь логин/пароль."
        );
        return;
      }

      window.location.href = "/dashboard";
    } catch (err: any) {
      setError("Сетевая ошибка: " + (err?.message ?? "unknown"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-slate-950">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/40">
        <div className="mb-4">
          <h1 className="text-lg font-semibold mb-1">
            Вход в панель прозвона
          </h1>
          <p className="text-xs text-slate-400">
            Логин/пароль задаются через переменные окружения
            <span className="font-mono"> ADMIN_LOGIN / ADMIN_PASSWORD</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Логин</label>
            <input
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400"
              placeholder="admin"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full rounded-lg bg-emerald-500 text-slate-950 text-sm font-semibold py-2 mt-2 disabled:opacity-60"
          >
            {loading ? "Входим..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}
