import { requireUser } from "@/lib/require-user";
import { getAdminTemplates, getUserTemplates } from "@/lib/actions/templates";
import { getCategoriesForUser } from "@/lib/actions/categories";
import { TemplatesClient } from "./TemplatesClient";
import type { OverlayConfig } from "./OverlayConfigurator";

export default async function TemplatesPage() {
  const user = await requireUser();

  // ── Admin: existing flow unchanged ────────────────────────────
  if (user.isAdmin) {
    const templates = await getAdminTemplates();
    const initialTemplates = templates.map((t) => ({
      id:            t.id,
      title:         t.name,
      categoryId:    t.categoryId,
      category:      t.category,
      imageUrl:      t.imageUrl || null,
      createdAt:     t.createdAt ? new Date(t.createdAt) : null,
      overlayConfig: t.overlayConfig ? (t.overlayConfig as OverlayConfig) : null,
    }));

    return (
      <main className="mx-auto px-4 py-8 space-y-6">
        <TemplatesClient isAdmin={true} initialTemplates={initialTemplates} />
      </main>
    );
  }

  // ── Non-admin: server se parallel prefetch ─────────────────────
  const [rawTemplates, rawCategories] = await Promise.all([
    getUserTemplates(undefined),
    getCategoriesForUser(),
  ]);

const initialUserTemplates = rawTemplates.map((t) => ({
  id:            t.id,
  name:          t.name,
  categoryId:    t.categoryId,
  category:      t.category,
  imageUrl:      t.imageUrl ?? "",
  overlayConfig: (t.overlayConfig as OverlayConfig | null) ?? undefined,
}));

  const initialCategories = rawCategories.map((c) => ({
    id:   c.id,
    name: c.name,
  }));

  return (
    <main className="mx-auto px-4 py-8 space-y-6">
      <TemplatesClient
        isAdmin={false}
        initialUserTemplates={initialUserTemplates}
        initialCategories={initialCategories}
      />
    </main>
  );
}