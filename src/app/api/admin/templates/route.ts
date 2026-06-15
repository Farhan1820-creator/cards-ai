// src/app/api/admin/templates/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getAllTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "@/lib/actions/templates";
import type { OverlayConfig } from "@/app/(dashboard)/templates/OverlayConfigurator";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) return null;
  return session;
}

// ── GET — sab templates ───────────────────────────────────────
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const result = await getAllTemplates();
    return NextResponse.json({ templates: result });
  } catch {
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

// ── POST — naya template create ───────────────────────────────
export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, category, base64, overlayConfig } = body;

    if (!name || !category || !base64) {
      return NextResponse.json(
        { error: "name, category, base64 required" },
        { status: 400 }
      );
    }

    const template = await createTemplate({
      name,
      category,
      base64,
      overlayConfig: overlayConfig as OverlayConfig,
      createdBy: session.user.id!,
    });

    return NextResponse.json({ success: true, template });
  } catch {
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}

// ── PATCH — template update ───────────────────────────────────
export async function PATCH(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, name, category, base64, overlayConfig } = body;

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const template = await updateTemplate(id, {
      name,
      category,
      base64,
      overlayConfig: overlayConfig as OverlayConfig | undefined,
    });

    return NextResponse.json({ success: true, template });
  } catch {
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}

// ── DELETE — template delete ──────────────────────────────────
export async function DELETE(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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