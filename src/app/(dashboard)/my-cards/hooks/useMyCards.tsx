import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { downloadImage } from "@/lib/download-image";
import { generateCardFilename } from "@/lib/filename";


const PAGE_SIZE = 10;
const REQUEST_TIMEOUT = 15000;

export interface CardItem {
  id:            string;
  imageUrl:      string;
  categoryName:      string;
  recipientName: string;
  prompt:        string;
  createdAt:     string;
  createdAtRaw:  string;
  templateId:    string;
  nameColor:     string;
  messageColor:  string;
  photoUrl:      string;
  createdByName?:  string;
  createdByEmail?: string;
}

export interface CardFiltersState {
  search:    string;
  categoryName:  string;
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
    search: "", categoryName: "", user: initialUser,
    dateFrom: "", dateTo: "",
  });

  const [selectMode,    setSelectMode]    = useState(false);
  const [selectedIds,   setSelectedIds]   = useState<Set<string>>(new Set());
  const [deletionPhase, setDeletionPhase] = useState<DeletionPhase>("idle");

  const filteredCards = useMemo(() => {
    const searchLower = filters.search.toLowerCase();
    return cards.filter((card) => {
      if (filters.search &&
        !card.recipientName?.toLowerCase().includes(searchLower) &&
        !card.categoryName?.toLowerCase().includes(searchLower)
      ) return false;
      if (filters.categoryName && card.categoryName?.toLowerCase() !== filters.categoryName.toLowerCase()) return false;
      if (filters.user && card.createdByEmail !== filters.user) return false;
      if (filters.dateFrom && card.createdAtRaw < filters.dateFrom) return false;
      if (filters.dateTo && card.createdAtRaw > filters.dateTo) return false;
      return true;
    });
  }, [cards, filters]);

  const totalPages = Math.ceil(filteredCards.length / PAGE_SIZE);
  const paginated  = filteredCards.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFiltersChange = useCallback((f: CardFiltersState) => {
    setFilters(f);
    setPage(1);
  }, []);

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
      if (next.has(id)) next.delete(id);
      else next.add(id);
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const res = await fetch(getEndpoint(id), { method: "DELETE", signal: controller.signal });
      if (!res.ok) throw new Error("delete_failed");
      const data = await res.json();
      if (!data.success) throw new Error("delete_failed");

      setCards((prev) => prev.filter((c) => c.id !== id));
      setDeletionPhase("done");
      setTimeout(() => { setDeletionPhase("idle"); toast.success("Card deleted"); }, 1200);
    } catch (err) {
      setDeletionPhase("idle");
      if (err instanceof Error && err.name === "AbortError") {
        toast.error("Delete timed out — check your connection");
      } else {
        toast.error("Failed to delete card");
      }
    } finally {
      clearTimeout(timeoutId);
      setDeletingId(null);
    }
  }, [getEndpoint]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setDeletionPhase("deleting");
    const ids = Array.from(selectedIds);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const results = await Promise.allSettled(
        ids.map((id) =>
          fetch(getEndpoint(id), { method: "DELETE", signal: controller.signal }).then((r) => {
            if (!r.ok) throw new Error("delete_failed");
            return r.json();
          })
        )
      );

      const succeededIds = ids.filter((_, i) => {
        const r = results[i];
        return r.status === "fulfilled" && r.value?.success;
      });
      const failedCount = ids.length - succeededIds.length;

      if (succeededIds.length > 0) {
        setCards((prev) => prev.filter((c) => !succeededIds.includes(c.id)));
      }
      if (failedCount > 0) {
        toast.error(`${failedCount} card(s) could not be deleted`);
      }

      setDeletionPhase("done");
      setTimeout(() => { setDeletionPhase("idle"); exitSelectMode(); }, 1200);
    } catch {
      setDeletionPhase("idle");
      toast.error("Bulk delete failed — check your connection");
    } finally {
      clearTimeout(timeoutId);
    }
  }, [selectedIds, exitSelectMode, getEndpoint]);

const handleDownload = useCallback(async (card: CardItem) => {
  // ✅ Option B — generateCardFilename use karo
  const filename = generateCardFilename(card.categoryName || "card", card.recipientName);
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
    cards: paginated,
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