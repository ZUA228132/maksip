import { redirect } from "next/navigation";
import { getCurrentAgent } from "@/lib/auth";
import { TopBar } from "@/components/TopBar";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getLeads(search: string | null) {
  if (search && search.trim().length > 0) {
    const q = search.trim();
    return prisma.lead.findMany({
      where: {
        OR: [
          { phoneNormalized: { contains: q } },
          { fullName: { contains: q, mode: "insensitive" } },
          { unit: { contains: q, mode: "insensitive" } }
        ]
      },
      orderBy: { createdAt: "desc" },
      take: 500
    });
  }

  return prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 500
  });
}

export default async function LeadsPage({
  searchParams
}: {
  searchParams: { q?: string };
}) {
  const agent = await getCurrentAgent();
  if (!agent) redirect("/login");

  const leads = await getLeads(searchParams.q ?? null);

  return (
    <div className="flex flex-1 flex-col">
      <TopBar />
      <main className="flex-1 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-sm font-semibold">
              Лиды / база номеров
            </h1>
            <p className="text-xs text-slate-400">
              До 500 последних строк из таблицы Lead.
            </p>
          </div>
          <form className="flex items-center gap-2">
            <input
              name="q"
              placeholder="Поиск по номеру / ФИО / части..."
              defaultValue={searchParams.q ?? ""}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs outline-none focus:border-emerald-400 min-w-[220px]"
            />
            <button className="rounded-lg border border-slate-700 bg-slate-800/80 text-xs px-3 py-1.5 hover:border-emerald-400">
              Найти
            </button>
          </form>
        </div>

        <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
          <table className="w-full text-xs border-collapse">
            <thead className="bg-slate-900/80 border-b border-slate-800">
              <tr>
                <th className="text-left py-2 px-3 border-r border-slate-800">
                  Телефон
                </th>
                <th className="text-left py-2 px-3 border-r border-slate-800">
                  ФИО
                </th>
                <th className="text-left py-2 px-3 border-r border-slate-800">
                  Должность / звание
                </th>
                <th className="text-left py-2 px-3 border-r border-slate-800">
                  Подразделение
                </th>
                <th className="text-left py-2 px-3">
                  Примечания
                </th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-6 text-slate-500"
                  >
                    База пуста. Залей файл через API /upload или напрямую
                    в Supabase.
                  </td>
                </tr>
              )}
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-slate-800/80 hover:bg-slate-800/40"
                >
                  <td className="py-1.5 px-3 whitespace-nowrap">
                    {lead.phoneNormalized || lead.phoneRaw || "—"}
                  </td>
                  <td className="py-1.5 px-3">
                    {lead.fullName || "—"}
                  </td>
                  <td className="py-1.5 px-3">
                    {(lead.position || "") +
                      (lead.rank ? ` / ${lead.rank}` : "")}
                  </td>
                  <td className="py-1.5 px-3">{lead.unit || "—"}</td>
                  <td className="py-1.5 px-3 max-w-[260px]">
                    {lead.notes || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
