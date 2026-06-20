import "server-only";
import { db } from "@/db";
import { categories, templates } from "@/db/schema";
import { v2 as cloudinary } from "cloudinary";
import { nanoid } from "nanoid";
import type { OverlayConfig } from "@/app/(dashboard)/templates/OverlayConfigurator";
import { eq, desc, and } from "drizzle-orm";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// ── GET (user) ───────────────────────────────────────────────
export async function getUserTemplates(categoryId?: string) {
  const rows = await db
    .select({
      id:            templates.id,
      name:          templates.name,
      message:       templates.message,
      imageUrl:      templates.imageUrl,
      overlayConfig: templates.overlayConfig,
      createdAt:     templates.createdAt,
      categoryId:    templates.categoryId,
      categoryName:  categories.name,
    })
    .from(templates)
    .leftJoin(categories, eq(templates.categoryId, categories.id))
    .where(
      categoryId
        ? and(eq(templates.isActive, true), eq(templates.categoryId, categoryId))
        : eq(templates.isActive, true)
    )
    .orderBy(desc(templates.createdAt));

  return rows.map((r) => ({
    id:            r.id,
    name:          r.name,
    message:       r.message,
    imageUrl:      r.imageUrl,
    overlayConfig: r.overlayConfig,
    createdAt:     r.createdAt,
    categoryId:    r.categoryId,
    category:      r.categoryName ?? "Uncategorized",
  }));
}

// ── GET (admin) ──────────────────────────────────────────────
export async function getAdminTemplates() {
  const rows = await db
    .select({
      id:            templates.id,
      name:          templates.name,
      message:       templates.message,
      imageUrl:      templates.imageUrl,
      overlayConfig: templates.overlayConfig,
      createdAt:     templates.createdAt,
      categoryId:    templates.categoryId,
      categoryName:  categories.name,
    })
    .from(templates)
    .leftJoin(categories, eq(templates.categoryId, categories.id))
    .orderBy(desc(templates.createdAt));

  return rows.map((r) => ({
    id:            r.id,
    name:          r.name,
    message:       r.message,
    imageUrl:      r.imageUrl,
    overlayConfig: r.overlayConfig,
    createdAt:     r.createdAt,
    categoryId:    r.categoryId,
    category:      r.categoryName ?? "Uncategorized",
  }));
}

// ── CREATE ───────────────────────────────────────────────────

// ── CREATE ───────────────────────────────────────────────────
export async function createTemplate(data: {
  name: string;
  message?: string;
  categoryId: string;
  base64: string;
  overlayConfig?: OverlayConfig;
  createdBy: string;
}) {
  const [category] = await db
    .select({ slug: categories.slug, name: categories.name })
    .from(categories)
    .where(eq(categories.id, data.categoryId));

  const uploaded = await cloudinary.uploader.upload(data.base64, {
    folder: `cards-ai/templates/${category?.slug ?? "uncategorized"}`,
    context: `caption=${data.name}`,
  });

  const [template] = await db
    .insert(templates)
    .values({
      id: nanoid(),
      name: data.name,
      message: data.message,
      categoryId: data.categoryId,
      imageUrl: uploaded.secure_url,
      cloudinaryPublicId: uploaded.public_id,
      overlayConfig: data.overlayConfig ?? null,
      isActive: true,
      createdBy: data.createdBy,
    })
    .returning();

  return { ...template, category: category?.name ?? "Uncategorized" };
}


// ── UPDATE ───────────────────────────────────────────────────
// ── UPDATE ───────────────────────────────────────────────────
export async function updateTemplate(
  id: string,
  data: {
    name?: string;
    message?: string;
    categoryId?: string;
    base64?: string;
    overlayConfig?: OverlayConfig;
    isActive?: boolean;
  }
){
  let imageUrl: string | undefined;
  let cloudinaryPublicId: string | undefined;

  const existing = await db
    .select({
      publicId:   templates.cloudinaryPublicId,
      categoryId: templates.categoryId,
    })
    .from(templates)
    .where(eq(templates.id, id));

  const effectiveCategoryId = data.categoryId ?? existing[0]?.categoryId;

  if (data.base64) {
    const oldPublicId = existing[0]?.publicId;
    if (oldPublicId) {
      await cloudinary.uploader.destroy(oldPublicId);
    }

    const [category] = await db
      .select({ slug: categories.slug })
      .from(categories)
      .where(eq(categories.id, effectiveCategoryId!));

    const uploaded = await cloudinary.uploader.upload(data.base64, {
      folder: `cards-ai/templates/${category?.slug ?? "uncategorized"}`,
      context: `caption=${data.name ?? "template"}`,
    });

    imageUrl = uploaded.secure_url;
    cloudinaryPublicId = uploaded.public_id;
  }

  const [updated] = await db
    .update(templates)
    .set({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.message !== undefined && { message: data.message }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(imageUrl && { imageUrl }),
      ...(cloudinaryPublicId && { cloudinaryPublicId }),
      ...(data.overlayConfig !== undefined && {
        overlayConfig: data.overlayConfig,
      }),
      ...(data.isActive !== undefined && {
        isActive: data.isActive,
      }),
      updatedAt: new Date(),
    })
    .where(eq(templates.id, id))
    .returning();

  const [resolvedCategory] = await db
    .select({ name: categories.name })
    .from(categories)
    .where(eq(categories.id, updated.categoryId));

  return { ...updated, category: resolvedCategory?.name ?? "Uncategorized" };
}


// ── DELETE ───────────────────────────────────────────────────
export async function deleteTemplate(id: string) {
  const [template] = await db
    .select({
      publicId: templates.cloudinaryPublicId,
    })
    .from(templates)
    .where(eq(templates.id, id));

  if (template?.publicId) {
    await cloudinary.uploader.destroy(template.publicId);
  }

  await db.delete(templates).where(eq(templates.id, id));
}