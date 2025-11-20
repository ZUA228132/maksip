import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export async function getCurrentAgent() {
  const cookieStore = cookies();
  const agentId = cookieStore.get("agentId")?.value;
  if (!agentId) return null;
  const agent = await prisma.agent.findUnique({ where: { id: agentId } });
  return agent;
}

export async function ensureAdminSeed() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const displayName = process.env.ADMIN_DISPLAY_NAME || "Admin";

  if (!username || !password) return;

  const existing = await prisma.agent.findUnique({ where: { username } });
  if (!existing) {
    const hash = await bcrypt.hash(password, 10);
    await prisma.agent.create({
      data: {
        username,
        passwordHash: hash,
        displayName,
      },
    });
  }
}
