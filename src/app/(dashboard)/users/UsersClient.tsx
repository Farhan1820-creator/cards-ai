"use client";

import { useState } from "react";
import { UserStatsCards } from "./UserStatsCards";
import { UserTable } from "./UserTable";
import { UserDeleteDialog } from "./UserDeleteDialog";

// ── Types ─────────────────────────────────────────────────────────
export type UserStatus = "Active";

export interface DBUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  isAdmin: boolean;
  isBanned: boolean;
  createdAt: string | null;
}

export interface User {
  id: string;
  dbId: string;
  name: string;
  email: string;
  image: string | null;
  initials: string;
  avatarColor: string;
  isAdmin: boolean;
  isBanned: boolean;
  status: UserStatus;
  createdAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────
const AVATAR_COLORS = ["#A121F0"];

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function transformUsers(dbUsers: DBUser[]): User[] {
  return dbUsers.map((u, i) => {
    const name = u.name?.trim() || u.email.split("@")[0];
    return {
      id: `USR-${String(i + 1).padStart(4, "0")}`,
      dbId: u.id,
      name,
      email: u.email,
      image: u.image,
      initials: getInitials(name),
      avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
      status: "Active" as UserStatus,
      isAdmin: u.isAdmin,
      isBanned: u.isBanned,
      createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : "",
    };
  });
}

// ── Main Client ───────────────────────────────────────────────────
export default function UsersClient({ dbUsers }: { dbUsers: DBUser[] }) {
  const [users, setUsers] = useState<DBUser[]>(dbUsers);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const USERS = transformUsers(users);

  async function handleDeleteUser(dbId: string) {
    setDeletingId(dbId);
    setDeleteTarget(null);
    try {
      const res = await fetch(`/api/admin/users/${dbId}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== dbId));
      } else {
        const data = await res.json();
        alert(data.error || "Delete failed");
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-[#f5f6fa] font-sans p-6 lg:p-8">
      <UserStatsCards users={USERS} />
      <UserTable
        users={USERS}
        deletingId={deletingId}
        onDeleteClick={setDeleteTarget}
      />
      <UserDeleteDialog
        target={deleteTarget}
        deletingId={deletingId}
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}