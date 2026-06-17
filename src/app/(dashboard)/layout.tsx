import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Poppins } from "next/font/google";
import { DashboardSidebar } from "@/app/(dashboard)/DashboardSidebar";
import { PageHeadingWrapper } from "@/app/(dashboard)/PageHeadingWrapper";
import { requireUser } from "@/lib/require-user";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Cards AI Dashboard",
  description: "AI-powered card generator",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🔐 AUTH GUARD (ONLY PURPOSE)
  const user = await requireUser();

  return (
    <html>
      <body className={`${poppins.variable} font-[family-name:var(--font-poppins)]`}>
        <TooltipProvider>
          <div className="min-h-screen bg-background flex">
            
            {/* Sidebar gets only what it needs */}
<DashboardSidebar
  user={{
    id: user.id,
    name: user.name ?? null,
    email: user.email ?? null,
    image: user.image ?? null,
    isAdmin: user.isAdmin,
  }}
/>

            <div className="flex-1 flex flex-col overflow-y-auto pb-20 md:pb-0">
              <PageHeadingWrapper />
              
              <main className="flex-1">
                {children}
              </main>
            </div>

          </div>

          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}