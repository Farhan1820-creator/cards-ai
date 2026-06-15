// lib/actions/templates.ts
import "server-only";
import { db } from "@/db";
import { templates } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { v2 as cloudinary } from "cloudinary";
import { nanoid } from "nanoid";
import type { OverlayConfig } from "@/app/(dashboard)/templates/OverlayConfigurator";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// ── User facing — category se templates ──────────────────────
export async function getTemplatesByCategory(category: string) {
  return db
    .select()
    .from(templates)
    .where(eq(templates.category, category))
    .orderBy(templates.sortOrder, desc(templates.createdAt));
}

// ── Admin — sab templates ─────────────────────────────────────
export async function getAllTemplates() {
  return db
    .select()
    .from(templates)
    .orderBy(desc(templates.createdAt));
}

// ── Create template ───────────────────────────────────────────
export async function createTemplate(data: {
  name:           string;
  category:       string;
  base64:         string;
  overlayConfig?: OverlayConfig;
  createdBy:      string;
}) {
  const uploaded = await cloudinary.uploader.upload(data.base64, {
    folder:   `cards-ai/templates/${data.category}`,
    context:  `caption=${data.name}`,
  });

  const [template] = await db
    .insert(templates)
    .values({
      id:            nanoid(),
      name:          data.name,
      category:      data.category,
      imageUrl:      uploaded.secure_url,
      thumbnailUrl:  uploaded.secure_url,
      overlayConfig: data.overlayConfig ?? null,
      sortOrder:     0,
      createdBy:     data.createdBy,
      isActive:      true,
    })
    .returning();

  return template;
}

// ── Update template ───────────────────────────────────────────
export async function updateTemplate(
  id: string,
  data: {
    name?:          string;
    category?:      string;
    base64?:        string;
    overlayConfig?: OverlayConfig;
  }
) {
  let imageUrl: string | undefined;

  if (data.base64) {
    const existing = await db
      .select({ imageUrl: templates.imageUrl })
      .from(templates)
      .where(eq(templates.id, id));

    if (existing[0]?.imageUrl) {
      const publicId = existing[0].imageUrl
        .split("/upload/")[1]
        ?.split(".")[0];
      if (publicId) await cloudinary.uploader.destroy(publicId);
    }

    const uploaded = await cloudinary.uploader.upload(data.base64, {
      folder:  `cards-ai/templates/${data.category ?? "general"}`,
      context: `caption=${data.name}`,
    });
    imageUrl = uploaded.secure_url;
  }

  const [updated] = await db
    .update(templates)
    .set({
      ...(data.name          && { name:          data.name          }),
      ...(data.category      && { category:      data.category      }),
      ...(imageUrl           && { imageUrl,       thumbnailUrl: imageUrl }),
      ...(data.overlayConfig !== undefined && { overlayConfig: data.overlayConfig }),
      updatedAt: new Date(),
    })
    .where(eq(templates.id, id))
    .returning();

  return updated;
}

// ── Delete template ───────────────────────────────────────────
export async function deleteTemplate(id: string) {
  const [template] = await db
    .select({ imageUrl: templates.imageUrl })
    .from(templates)
    .where(eq(templates.id, id));

  if (template?.imageUrl) {
    const publicId = template.imageUrl
      .split("/upload/")[1]
      ?.split(".")[0];
    if (publicId) await cloudinary.uploader.destroy(publicId);
  }

  await db.delete(templates).where(eq(templates.id, id));
}