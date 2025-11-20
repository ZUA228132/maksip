import { cookies } from "next/headers";

export type Agent = {
  id: string;
  username: string;
  displayName: string;
};

const ADMIN_LOGIN = process.env.ADMIN_LOGIN ?? "admin";
const ADMIN_DISPLAY_NAME =
  process.env.ADMIN_DISPLAY_NAME ?? "Администратор";

// Читаем только куку maksip_token — никакого Prisma тут нет
export async function getCurrentAgent(): Promise<Agent | null> {
  const store = cookies();
  const token = store.get("maksip_token")?.value;

  if (!token) return null;

  return {
    id: "admin",
    username: ADMIN_LOGIN,
    displayName: ADMIN_DISPLAY_NAME
  };
}

// Заглушка, чтобы старые импорты не падали
export async function ensureAdminSeed(): Promise<void> {
  // Раньше тут был prisma.agent.create / prisma.agent.findUnique
  // Теперь НИЧЕГО не делаем
  return;
}
