"use server";

import { requireUser } from "@/lib/require-user";
import { db } from "@/db";
import { cards } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function deleteCard(cardId: string) {
  const user = await requireUser();

  await db
    .delete(cards)
    .where(and(eq(cards.id, cardId), eq(cards.userId, user.id)));

  revalidatePath("/dashboard");
  revalidatePath("/my-cards");
}