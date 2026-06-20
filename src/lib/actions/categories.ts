"use server";

import { db } from "@/db";
import { categories, templates } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCategoriesForUser() {
  return db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(categories.name);
}

export async function getCategoriesWithCount() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      templateCount: sql<number>`count(${templates.id})`.mapWith(Number),
    })
    .from(categories)
    .leftJoin(templates, eq(templates.categoryId, categories.id))
    .groupBy(categories.id, categories.name)
    .orderBy(categories.name);
}


function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createCategory(name: string) {
  const baseSlug = generateSlug(name);

  const [existing] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, baseSlug));

  const slug = existing ? `${baseSlug}-${crypto.randomUUID().slice(0, 4)}` : baseSlug;

  const [created] = await db
    .insert(categories)
    .values({ id: crypto.randomUUID(), name, slug })
    .returning();

  revalidatePath("/dashboard/templates");
  return created;
}

export async function updateCategory(id: string, name: string) {
  const [updated] = await db
    .update(categories)
    .set({ name })
    .where(eq(categories.id, id))
    .returning();
  revalidatePath("/dashboard/templates");
  return updated;
}

export async function deleteCategory(id: string) {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(templates)
    .where(eq(templates.categoryId, id));

  if (count > 0) {
    return { success: false, error: "CATEGORY_HAS_TEMPLATES" as const };
  }

  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/dashboard/templates");
  return { success: true as const };
}