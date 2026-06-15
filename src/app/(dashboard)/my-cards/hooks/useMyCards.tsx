import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { downloadImage } from "@/lib/download-image";

const PAGE_SIZE = 20;


export interface CardItem {
  id:            string;
  imageUrl:      string;
  cardType:      string;
  recipientName: string;
  prompt:        string;
  createdAt:     string;
  createdAtRaw:  string;   // ✅
  templateId:    string;
  nameColor:     string;
  messageColor:  string;
  photoUrl:      string;
  createdByName?:  string;
  createdByEmail?: string;
}

export interface CardFiltersState {
  search:    string;
  cardType:  string;
  user:      string;
  dateFrom:  string;
  dateTo:    string;
}

export type DeletionPhase = "idle" | "confirm" | "deleting" | "done";

export function useMyCards(initialCards: CardItem[], isAdmin = false, initialUser = "") {
  const router = useRouter();


  const [cards,           setCards]          = useState<CardItem[]>(initialCards);
  const [deletingId,      setDeletingId]     = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId]= useState<string | null>(null);
  const [page,            setPage]           = useState(1);
  const [filters, setFilters] = useState<CardFiltersState>({
    search: "", cardType: "", user: initialUser, // 👈 prop se seed karo
    dateFrom: "", dateTo: "",
  });

  const [selectMode,    setSelectMode]    = useState(false);
  const [selectedIds,   setSelectedIds]   = useState<Set<string>>(new Set());
  const [deletionPhase, setDeletionPhase] = useState<DeletionPhase>("idle");

  // ── Filtering — full list pe, pagination se pehle ──────────────────────
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      if (filters.search && !card.recipientName?.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.cardType && card.cardType?.toLowerCase() !== filters.cardType.toLowerCase()) return false;
      if (filters.user && card.createdByEmail !== filters.user) return false;
      if (filters.dateFrom && card.createdAtRaw < filters.dateFrom) return false;
      if (filters.dateTo && card.createdAtRaw > filters.dateTo) return false;
      return true;
    });
  }, [cards, filters]);

  const totalPages = Math.ceil(filteredCards.length / PAGE_SIZE);
  const paginated  = filteredCards.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // filter change hone pe page reset karo
  const handleFiltersChange = useCallback((f: CardFiltersState) => {
    setFilters(f);
    setPage(1);
  }, []);

  // userOptions — admin k liye
  const userOptions = useMemo(() => {
    const map = new Map<string, string>();
    cards.forEach((c) => {
      if (c.createdByEmail) map.set(c.createdByEmail, c.createdByName || c.createdByEmail);
    });
    return Array.from(map.entries()).map(([email, name]) => ({ email, name }));
  }, [cards]);

  const getEndpoint = useCallback(
    (id: string) => isAdmin ? `/api/admin/cards/${id}` : `/api/user/cards/${id}`,
    [isAdmin]
  );

  const enterSelectMode = useCallback(() => setSelectMode(true), []);

  const exitSelectMode = useCallback(() => {
    setSelectMode(false);
    setSelectedIds(new Set());
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(filteredCards.map((c) => c.id)));
  }, [filteredCards]);

  const isAllSelected = filteredCards.length > 0 && selectedIds.size === filteredCards.length;

  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id);
    setConfirmDeleteId(null);
    setDeletionPhase("deleting");
    try {
      const res  = await fetch(getEndpoint(id), { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error();
      setCards((prev) => prev.filter((c) => c.id !== id));
      setDeletionPhase("done");
      setTimeout(() => { setDeletionPhase("idle"); toast.success("Card deleted"); }, 1200);
    } catch {
      setDeletionPhase("idle");
      toast.error("Failed to delete card");
    } finally {
      setDeletingId(null);
    }
  }, [getEndpoint]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setDeletionPhase("deleting");
    const ids = Array.from(selectedIds);
    try {
      await Promise.all(ids.map((id) => fetch(getEndpoint(id), { method: "DELETE" }).then((r) => r.json())));
      setCards((prev) => prev.filter((c) => !ids.includes(c.id)));
      setDeletionPhase("done");
      setTimeout(() => { setDeletionPhase("idle"); exitSelectMode(); }, 1200);
    } catch {
      setDeletionPhase("idle");
      toast.error("Some cards could not be deleted");
    }
  }, [selectedIds, exitSelectMode, getEndpoint]);

  const handleDownload = useCallback(async (card: CardItem) => {
    const filename = `${card.recipientName || "card"}-${card.cardType}.png`;
    try {
      await downloadImage(card.imageUrl, filename);
      toast.success("Downloaded!");
    } catch {
      toast.error("Download failed. Please try again.");
    }
  }, []);

  const handleEdit = useCallback((card: CardItem) => {
    router.push(`/generate?cardId=${card.id}`);
  }, [router]);

  const handleCardUpdate = useCallback((updated: Partial<CardItem> & { id: string }) => {
    setCards((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
  }, []);

  return {
    cards: paginated,           // filtered + paginated
    deletingId,
    confirmDeleteId,
    setConfirmDeleteId,
    page, setPage,
    totalPages,
    filters,
    handleFiltersChange,
    userOptions,
    handleDelete,
    handleDownload,
    handleEdit,
    handleCardUpdate,
    selectMode, selectedIds,
    enterSelectMode, exitSelectMode,
    toggleSelect, selectAll, isAllSelected,
    deletionPhase, setDeletionPhase,
    handleBulkDelete,
  };
}