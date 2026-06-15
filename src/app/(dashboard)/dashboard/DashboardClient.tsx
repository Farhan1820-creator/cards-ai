"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Clock, ArrowRight, Layers, CreditCard, Users, FileText, IdCard, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecentCardsGrid } from "@/app/(dashboard)/dashboard/RecentCardsGrid";

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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

const adminQuickLinks = [
  { icon: <FileText className="w-5 h-5" />, label: "New Template", href: "/templates"  },
  { icon: <Users    className="w-5 h-5" />, label: "Manage Users", href: "/users"      },
  { icon: <IdCard   className="w-5 h-5" />, label: "Manage Cards", href: "/my-cards"   },
  { icon: <HelpCircle className="w-5 h-5"/>, label: "Get Help",   href: "mailto:support@cards.ai" },
];

export function DashboardClient({
  userName, isAdmin, recentCards, userCardCount, totalTemplates, adminData,
}: DashboardClientProps) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
      setDate(now.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f7ff]">
      <div className="px-6 lg:px-8 py-8 space-y-8">

        {/* ── Generate Banner ── */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-violet-700 via-purple-600 to-pink-500 shadow-lg">
          <div className="flex items-center justify-between min-h-[180px]">
            <div className="px-8 py-8 flex-1 z-10">
              <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                {getGreeting()}{userName ? `, ${userName.split(" ")[0]}` : ""}!<br />
                <span className="font-normal text-violet-100 text-lg">Create a new card with Card AI</span>
              </h2>
              <p className="text-violet-100 text-sm mb-5">
                Generate beautiful greeting cards in seconds<br />
                with our advanced creative engine.
              </p>
              <Link href="/generate">
                <Button className="bg-white text-violet-600 hover:bg-violet-50 font-semibold shadow-sm rounded-full px-5">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Generate Card
                </Button>
              </Link>
            </div>

       {/* User stats — inside banner */}
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
            {[
              { title: "TOTAL TEMPLATES", value: adminData.totalTemplates, icon: <Layers className="w-6 h-6" />, color: "bg-purple-100", iconColor: "text-purple-600" },
              { title: "TOTAL CARDS",     value: adminData.totalCards,     icon: <CreditCard className="w-6 h-6" />, color: "bg-purple-100", iconColor: "text-purple-600" },
              { title: "TOTAL USERS",     value: adminData.totalUsers,     icon: <Users className="w-6 h-6" />,     color: "bg-purple-100",   iconColor: "text-purple-600"   },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-xl`}>
                    <div className={stat.iconColor}>{stat.icon}</div>
                  </div>
                </div>
                <p className="text-xs font-semibold text-gray-500 mb-1 tracking-wide">{stat.title}</p>
                <p className="text-4xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Admin Bottom Section: Recent Users + Clock + Quick Links ── */}
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
                  adminData.recentUsers.map((user, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      {user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Clock + Quick Links */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
                <p className="text-sm font-medium tracking-wide text-white/80">{date}</p>
                <h1 className="text-4xl font-bold tracking-wider mt-1">{time}</h1>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-4 tracking-widest uppercase">Quick Links</h4>
                <div className="grid grid-cols-2 gap-3">
                  {adminQuickLinks.map((link, i) => (
                    <Link
                      key={i}
                      href={link.href}
                      className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-primary/5 hover:text-primary rounded-xl transition-all group"
                    >
                      <div className="text-gray-600 group-hover:text-primary transition-colors">{link.icon}</div>
                      <span className="text-xs font-semibold text-gray-700 group-hover:text-primary transition-colors text-center">{link.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Recent Cards ── */}
        {!isAdmin && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-base font-semibold text-foreground">Recents</h2>
            </div>
            {recentCards.length > 0 && (
              <Link
                href="/my-cards"
                className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 font-medium transition-colors"
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