import { redirect } from "next/navigation";
import { requireUser } from "@/lib/require-user";
import { db } from "@/db";
import { users } from "@/db/schema";
import UsersClient from "@/app/(dashboard)/users/UsersClient";

export default async function UsersPage() {
  const user = await requireUser();

  // 🔐 ADMIN GUARD
  if (!user.isAdmin) {
    redirect("/dashboard");
  }

  const dbUsers = await db
    .select()
    .from(users)
    .orderBy(users.createdAt);

  const formattedUsers = dbUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    image: u.image,
    isAdmin: u.isAdmin,
    isBanned: u.isBanned,
    createdAt: u.createdAt ? u.createdAt.toISOString() : null,
  }));

  return <UsersClient dbUsers={formattedUsers} />;
}