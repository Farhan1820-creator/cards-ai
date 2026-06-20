"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowRight, Layers, CreditCard, Users, FileText, IdCard, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecentCardsGrid } from "@/app/(dashboard)/dashboard/RecentCardsGrid";

// ── Types ──────────────────────────────────────────────────────
interface RecentUser {
  name:      string;
  email:     string;
  image:     string | null;
  createdAt: string;
}

interface AdminData {
  totalCards:     number;
  totalUsers:     number;
  totalTemplates: number;
  recentUsers:    RecentUser[];
}

interface FormattedCard {
  id:            string;
  imageUrl:      string;
  cardType:      string;
  recipientName: string;
  prompt:        string;
  templateId:    string;
  nameColor:     string;
  messageColor:  string;
  photoUrl:      string;
  createdAt:     string;
}

interface DashboardClientProps {
  userName:       string;
  isAdmin:        boolean;
  recentCards:    FormattedCard[];
  userCardCount:  number;
  totalTemplates: number;
  adminData:      AdminData | null;
}

// ── Helpers ────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

// ── Sub-components ─────────────────────────────────────────────

/** Single stat tile — admin stats grid mein use hota hai */
interface StatCardProps {
  title:     string;
  value:     number;
  icon:      React.ReactNode;
  color:     string;
  iconColor: string;
}
function StatCard({ title, value, icon, color, iconColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className={`${color} p-3 rounded-xl`}>
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
      <p className="text-xs font-semibold text-gray-500 mb-1 tracking-wide">{title}</p>
      <p className="text-4xl font-bold text-gray-900">{value.toLocaleString()}</p>
    </div>
  );
}

/** Single user row — recent users list mein use hota hai */
function UserRow({ user }: { user: RecentUser }) {
  const initials = user.name.charAt(0).toUpperCase();
  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "—";

  return (
    <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
      {/* Avatar — next/image se instant render, no layout shift */}
      <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 shadow-sm">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name}
            fill
            sizes="40px"
            className="object-cover"
            // priority: above-the-fold content hai, eagerly load karo
            priority
          />
        ) : (
          <div className="w-full h-full bg-primary flex items-center justify-center text-white text-sm font-bold">
            {initials}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
        <p className="text-xs text-gray-400 truncate">{user.email}</p>
      </div>

      <div className="text-right flex-shrink-0">
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Active
        </span>
        <p className="text-[10px] text-gray-400 mt-1">{joinDate}</p>
      </div>
    </div>
  );
}

/** Live clock + date widget */
function ClockWidget() {
  // mounted guard: SSR pe time nahi render karte — hydration mismatch avoid
  const [mounted, setMounted] = useState(false);
  const [time,    setTime]    = useState("");
  const [date,    setDate]    = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
      setDate(now.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
    };
    update();
    setMounted(true);
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-primary rounded-2xl p-6 text-white">
      {/* Placeholder height taake layout shift na ho before mount */}
      <p className="text-sm font-medium tracking-wide text-white/80 min-h-[20px]">
        {mounted ? date : ""}
      </p>
      <h1 className="text-4xl font-bold tracking-wider mt-1 min-h-[44px]">
        {mounted ? time : ""}
      </h1>
    </div>
  );
}

/** Single quick-link tile */
interface QuickLinkProps {
  icon:  React.ReactNode;
  label: string;
  href:  string;
}
function QuickLink({ icon, label, href }: QuickLinkProps) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-primary/5 hover:text-primary rounded-xl transition-all group"
    >
      <div className="text-gray-600 group-hover:text-primary transition-colors">{icon}</div>
      <span className="text-xs font-semibold text-gray-700 group-hover:text-primary transition-colors text-center">
        {label}
      </span>
    </Link>
  );
}

// ── Static data (component ke bahar — re-render pe recreate nahi hoga) ──
const ADMIN_QUICK_LINKS: QuickLinkProps[] = [
  { icon: <FileText   className="w-5 h-5" />, label: "New Template", href: "/templates"              },
  { icon: <Users      className="w-5 h-5" />, label: "Manage Users", href: "/users"                  },
  { icon: <IdCard     className="w-5 h-5" />, label: "Manage Cards", href: "/my-cards"               },
  { icon: <HelpCircle className="w-5 h-5" />, label: "Get Help",     href: "mailto:support@cards.ai" },
];

const ADMIN_STATS = (data: AdminData) => [
  { title: "TOTAL TEMPLATES", value: data.totalTemplates, icon: <Layers    className="w-6 h-6" />, color: "bg-primary/10", iconColor: "text-muted-foreground" },
  { title: "TOTAL CARDS",     value: data.totalCards,     icon: <CreditCard className="w-6 h-6" />, color: "bg-primary/10", iconColor: "text-muted-foreground" },
  { title: "TOTAL USERS",     value: data.totalUsers,     icon: <Users      className="w-6 h-6" />, color: "bg-primary/10", iconColor: "text-muted-foreground" },
];

// ── Main Component ─────────────────────────────────────────────
export function DashboardClient({
  userName, isAdmin, recentCards, userCardCount, totalTemplates, adminData,
}: DashboardClientProps) {
  const firstName = userName ? userName.split(" ")[0] : "";

  return (
    <div className="min-h-screen bg-[#f8f7ff]">
      <div className="px-6 lg:px-8 py-8 space-y-8">

        {/* ── Generate Banner ── */}
        <div className="relative rounded-2xl overflow-hidden  bg-linear-175 from-black via-black to-black shadow-lg">
          <div className="flex items-center justify-between min-h-[180px]">
            <div className="px-8 py-8 flex-1 z-10">
              <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                {getGreeting()}{firstName ? `, ${firstName}` : ""}!<br />
                <span className="font-normal text-violet-100 text-lg">Create a new card with Card AI</span>
              </h2>
              <p className="text-violet-100 text-sm mb-5">
                Generate beautiful greeting cards in seconds<br />
                with our advanced creative engine.
              </p>
              <Link href="/generate">
                <Button className="bg-primary text-primary-foreground hover:bg-violet-50 hover:text-primary cursor-pointer font-semibold shadow-sm rounded-full px-5">
                  Generate Card
                </Button>
              </Link>
            </div>

            {/* User stats — inside banner, admin only */}
            {isAdmin && (
              <div className="hidden sm:flex flex-col gap-3 pr-8 shrink-0">
                <div className="bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3 text-white text-center min-w-[120px]">
                  <p className="text-2xl font-bold">{userCardCount}</p>
                  <p className="text-xs text-violet-100 mt-0.5">My Cards</p>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3 text-white text-center min-w-[120px]">
                  <p className="text-2xl font-bold">{totalTemplates}</p>
                  <p className="text-xs text-violet-100 mt-0.5">Templates</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Admin Stats ── */}
        {isAdmin && adminData && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {ADMIN_STATS(adminData).map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>
        )}

        {/* ── Admin Bottom Section ── */}
        {isAdmin && adminData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

            {/* Recent Users */}
            <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-bold text-gray-900">Recent Users</h4>
                <Link href="/users" className="text-primary font-semibold hover:opacity-80 transition-opacity text-sm">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {adminData.recentUsers.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No users yet</p>
                ) : (
                  adminData.recentUsers.map((user) => (
                    <UserRow key={user.email} user={user} />
                  ))
                )}
              </div>
            </div>

            {/* Clock + Quick Links */}
            <div className="space-y-4">
              <ClockWidget />
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-4 tracking-widest uppercase">Quick Links</h4>
                <div className="grid grid-cols-2 gap-3">
                  {ADMIN_QUICK_LINKS.map((link) => (
                    <QuickLink key={link.label} {...link} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Recent Cards (user only) ── */}
        {!isAdmin && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-base font-semibold text-muted-foreground">Recents</h2>
              </div>
              {recentCards.length > 0 && (
                <Link
                  href="/my-cards"
                  className="flex items-center gap-1 text-sm text-black hover:text-primary font-medium transition-colors"
                >
                  View all
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
            <RecentCardsGrid cards={recentCards} />
          </section>
        )}

      </div>
    </div>
  );
}