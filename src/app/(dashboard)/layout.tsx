import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Poppins } from "next/font/google";
import { DashboardChrome } from "@/app/(dashboard)/DashboardChrome";
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
  // 🔐 AUTH GUARD (sab routes ke liye, generate samait — sirf chrome render skip hota hai)
  const user = await requireUser();

  return (
    <div className={`${poppins.variable} font-(family-name:--font-poppins)`}>
      <TooltipProvider>
        <DashboardChrome
          user={{
            id: user.id,
            name: user.name ?? null,
            email: user.email ?? null,
            image: user.image ?? null,
            isAdmin: user.isAdmin,
          }}
        >
          {children}
        </DashboardChrome>
        <Toaster />
      </TooltipProvider>
    </div>
  );
}