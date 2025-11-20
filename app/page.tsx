import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function Home() {
  const cookieStore = cookies();
  const agentId = cookieStore.get("agentId")?.value;

  if (!agentId) {
    redirect("/login");
  } else {
    redirect("/dashboard");
  }
}
