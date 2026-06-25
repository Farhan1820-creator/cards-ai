import { requireUser } from "@/lib/require-user";
import { getAdminTemplates } from "@/lib/actions/templates";
import { TemplatesClient } from "./TemplatesClient";
import type { OverlayConfig } from "./OverlayConfigurator";

export default async function TemplatesPage() {
  const user = await requireUser();

  let initialTemplates = null;

  if (user.isAdmin) {
    const templates = await getAdminTemplates();

    initialTemplates = templates.map((t) => ({
      id: t.id,
      title: t.name,
      categoryId: t.categoryId,
      category: t.category,
      imageUrl: t.imageUrl || null,

      createdAt: t.createdAt ? new Date(t.createdAt) : null,

      overlayConfig: t.overlayConfig
        ? (t.overlayConfig as OverlayConfig)
        : null,
    }));
  }

  return (
    <main className=" mx-auto px-4 py-8 space-y-6">
      <TemplatesClient
        isAdmin={user.isAdmin}
        initialTemplates={initialTemplates}
      />
    </main>
  );
}