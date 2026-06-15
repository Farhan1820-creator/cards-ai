// app/(dashboard)/users/page.tsx
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import UsersClient from "@/app/(dashboard)/users/UsersClient";

export default async function UsersPage() {
  const user = await requireUser();

  if (!user.isAdmin) {
    redirect("/dashboard");
  }

const dbUsers = await db.select().from(users).orderBy(users.createdAt);

const formattedUsers = dbUsers.map((u) => ({
  ...u,
  createdAt: u.createdAt ? u.createdAt.toISOString() : null,
}));
  return <UsersClient dbUsers={formattedUsers} />;
}