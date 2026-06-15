"use client";

import { User } from "./UsersClient";

function StatCard({
  label,
  value,
  sub,
  highlight,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  highlight?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`
        rounded-2xl p-5 flex flex-col gap-3
        transition-all duration-300 cursor-pointer group
        ${highlight ? "bg-primary text-white" : "bg-white border border-slate-200 hover:bg-primary"}
      `}
    >
      <div className="flex items-start justify-between">
        <p className={`text-xs font-semibold tracking-widest uppercase ${
          highlight ? "text-primary-foreground/70" : "text-slate-400 group-hover:text-primary-foreground/70"
        }`}>
          {label}
        </p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
          highlight ? "bg-primary/80" : "bg-slate-50 border border-slate-200 group-hover:bg-slate-50 group-hover:border-primary"
        }`}>
          <div className={`${highlight ? "text-primary-foreground/70" : "text-slate-500 group-hover:text-white"}`}>
            {icon}
          </div>
        </div>
      </div>
      <p className={`text-4xl font-bold tracking-tight transition-colors ${
        highlight ? "text-white" : "text-slate-800 group-hover:text-white"
      }`}>
        {value}
      </p>
      {sub && (
        <p className={`text-xs transition-colors ${
          highlight ? "text-primary-foreground/70" : "text-slate-500 group-hover:text-primary-foreground/70"
        }`}>
          {sub}
        </p>
      )}
    </div>
  );
}

export function UserStatsCards({ users }: { users: User[] }) {
  const thisMonth = users.filter((u) => {
    const d = new Date(u.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        label="Total Users"
        value={users.length}
        sub="Registered accounts"
        icon={<svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0zm6 4a4 4 0 00-3-3.87" /></svg>}
      />
      <StatCard
        label="Active Users"
        value={users.length}
        sub="All users active"
        icon={<svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728M12 9v3l2 2m-2-8a7 7 0 100 14A7 7 0 0012 4z" /></svg>}
      />
      <StatCard
        label="This Month"
        value={thisMonth}
        sub="New registrations"
        icon={<svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
      />
      <StatCard
        label="Suspended"
        value={users.filter((u) => u.isBanned).length}
        sub="No suspensions"
        icon={<svg className="w-5 h-5 text-primary-foreground/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>}
      />
    </div>
  );
}