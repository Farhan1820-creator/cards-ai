// /src/app/api/admin/cards/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { deleteCard } from "@/lib/actions/cards";

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin)
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

  const { id: cardId } = await context.params;
  const result = await deleteCard(cardId);

  if (!result)
    return NextResponse.json({ success: false, error: "Card not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}