// src/app/api/admin/templates/route.ts
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/api-auth";
import {
  getAdminTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "@/lib/actions/templates";
import type { OverlayConfig } from "@/app/(dashboard)/templates/OverlayConfigurator";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

// ── GET — sab templates ───────────────────────────────────────
export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const result = await getAdminTemplates();

    const templates = result.map((t) => ({
      id: t.id,
      title: t.name,
      categoryId: t.categoryId,
      category: t.category,
      imageUrl: t.imageUrl,
      createdAt: t.createdAt,
      overlayConfig: t.overlayConfig ?? undefined,
    }));

    return NextResponse.json(templates);
  } catch {
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

// ── POST — naya template create ───────────────────────────────
export async function POST(request: Request) {
  const { error, user } = await requireAdminApi();
  if (error) return error;

  try {
    const body = await request.json();
    const { name, categoryId, base64, overlayConfig } = body;

    if (!name || !categoryId || !base64) {
      return NextResponse.json(
        { error: "name, categoryId, base64 required" },
        { status: 400 }
      );
    }

    const template = await createTemplate({
      name,
      categoryId,
      base64,
      overlayConfig: overlayConfig as OverlayConfig,
      createdBy: user.id!,
    });

    return NextResponse.json({ success: true, template });
  } catch (error) {
    return NextResponse.json(
      { error: errorMessage(error, "Failed to create template") },
      { status: 400 }
    );
  }
}

// ── PATCH — template update ───────────────────────────────────
export async function PATCH(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const body = await request.json();
    const { id, name, categoryId, base64, overlayConfig } = body;

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const template = await updateTemplate(id, {
      name,
      categoryId,
      base64,
      overlayConfig: overlayConfig as OverlayConfig | undefined,
    });

    return NextResponse.json({ success: true, template });
  } catch (error) {
    return NextResponse.json(
      { error: errorMessage(error, "Failed to update template") },
      { status: 400 }
    );
  }
}

// ── DELETE — template delete ──────────────────────────────────
export async function DELETE(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    await deleteTemplate(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}