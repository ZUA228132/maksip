import { redirect } from "next/navigation";
import { getCurrentAgent } from "@/lib/auth";

export default async function IndexPage() {
  const agent = await getCurrentAgent();
  if (!agent) {
    redirect("/login");
  }
  redirect("/dashboard");
}
