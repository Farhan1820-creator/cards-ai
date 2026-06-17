import { requireUser } from "./require-user";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const user = await requireUser();

  if (!user.isAdmin) {
    redirect("/dashboard");
  }

  return user;
}