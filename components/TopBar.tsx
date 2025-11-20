"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard", label: "Дашборд" },
  { href: "/leads", label: "Лиды" },
  { href: "/assistant", label: "Помогатор" }
];

export function TopBar() {
  const pathname = usePathname();

  return (
    <header className="w-full border-b border-slate-800 bg-slate-950/70 backdrop-blur flex items-center justify-between px-4 py-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-xs font-semibold text-emerald-300">
          SIP
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">maksip</span>
          <span className="text-[11px] text-slate-400">
            Колл-центр / SIP.xho.biz
          </span>
        </div>
      </div>
      <nav className="flex items-center gap-2">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={
                "px-3 py-1 rounded-full text-xs border transition-colors " +
                (active
                  ? "bg-emerald-500/20 border-emerald-400 text-emerald-200"
                  : "border-slate-800 text-slate-300 hover:border-slate-600")
              }
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
