import { cookies } from "next/headers";

export type Agent = {
  id: string;
  username: string;
  displayName: string;
};

const ADMIN_LOGIN = process.env.ADMIN_LOGIN ?? "admin";
const ADMIN_DISPLAY_NAME =
  process.env.ADMIN_DISPLAY_NAME ?? "Администратор";

/**
 * Простейшая авторизация по куке maksip_token.
 * Если кука есть — считаем, что зашёл админ.
 */
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

/**
 * Заглушка, чтобы старый код, который её вызывает, не падал.
 */
export async function ensureAdminSeed(): Promise<void> {
  return;
}
