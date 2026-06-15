import { requireUser } from "@/lib/auth";
import { getAllTemplates } from "@/lib/actions/templates";
import { TemplatesClient } from "./TemplatesClient";
import type { OverlayConfig } from "./OverlayConfigurator";

export default async function TemplatesPage() {
  const user = await requireUser();

  // admin ke liye SSR se templates fetch karo
  const initialTemplates = user.isAdmin
    ? (await getAllTemplates()).map((t) => ({
        id:            t.id,
        title:         t.name,
        category:      t.category,
        imageUrl:      t.thumbnailUrl ?? t.imageUrl ?? null,
        createdAt:     t.createdAt ? new Date(t.createdAt) : null,
        overlayConfig: (t.overlayConfig ?? null) as OverlayConfig | null,      }))
    : null;

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <TemplatesClient isAdmin={user.isAdmin} initialTemplates={initialTemplates} />
    </main>
  );
}