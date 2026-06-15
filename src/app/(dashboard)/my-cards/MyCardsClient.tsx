"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditCardModal, type EditableCard } from "./EditCardModel";
import { BulkDeleteOverlay } from "./BulkDeleteOverlay";
import { useMyCards, type CardItem } from "./hooks/useMyCards";
import { CardGrid } from "./CardGrid";
import { CardFilters } from "./CardFilters";


interface MyCardsClientProps {
  cards: CardItem[];
  isAdmin?: boolean;
  currentUserEmail?: string;
  initialUser?: string;
}

export function MyCardsClient({ cards: initialCards, isAdmin = false, currentUserEmail = "", initialUser = "" }: MyCardsClientProps) {
  const {
    cards,
    deletingId,
    confirmDeleteId,
    setConfirmDeleteId,
    page, setPage, totalPages,
    handleDelete, handleDownload, handleEdit, handleCardUpdate,
    selectMode, selectedIds,
    enterSelectMode, exitSelectMode,
    toggleSelect, selectAll, isAllSelected,
    deletionPhase,
    handleBulkDelete,
    filters,              // 👈 hook se lo
    handleFiltersChange,  // 👈 hook se lo
    userOptions,          // 👈 hook se lo
  } = useMyCards(initialCards, isAdmin, initialUser); // 👈 initialUser pass karo
  
 

  const [editingCard, setEditingCard] = useState<EditableCard | null>(null);
  const [editOpen,    setEditOpen]    = useState(false);
  const [bulkConfirm, setBulkConfirm] = useState(false);



  function handleEnterSelectMode(id: string) {
    enterSelectMode();
    toggleSelect(id);
  }

  function handleContextMenu(e: React.MouseEvent, id: string) {
    if (!selectMode) {
      e.preventDefault();
      enterSelectMode();
      toggleSelect(id);
    }
  }




  return (
    <>
        <CardFilters
      filters={filters}
        onChange={handleFiltersChange} 
        isAdmin={isAdmin}
      userOptions={userOptions}
    />

      {/* ── Grid ── */}
      <CardGrid
        cards={cards} 
        selectMode={selectMode}
        selectedIds={selectedIds}
        deletingId={deletingId}
        isAdmin={isAdmin}
        isAllSelected={isAllSelected}
        onSelect={toggleSelect}
        onExitSelectMode={exitSelectMode}
        onSelectAll={selectAll}
        onContextMenu={handleContextMenu}
        onEdit={(card) => { handleEdit(card); }}
        onDownload={handleDownload}
        onDelete={setConfirmDeleteId}
        onEnterSelectMode={handleEnterSelectMode}
        currentUserEmail={currentUserEmail}  
      />

      {/* ── Pagination ── */}
      {totalPages > 1 && !selectMode && (
        <div className="flex items-center justify-center gap-3 pt-6">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* ── Floating bulk action bar ── */}
      {selectMode && selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white">
          <div className="flex items-center gap-3 bg-white border border-border rounded-2xl shadow-xl px-5 py-3">
            <span className="text-sm font-medium text-foreground">
              {selectedIds.size} {selectedIds.size === 1 ? "card" : "cards"} selected
            </span>
            <div className="w-px h-4 bg-border" />
            <button
              onClick={() => setBulkConfirm(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      )}

      {/* ── Bulk delete confirm ── */}
      <AlertDialog open={bulkConfirm} onOpenChange={setBulkConfirm} >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedIds.size} {selectedIds.size === 1 ? "card" : "cards"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. All selected cards will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => { setBulkConfirm(false); handleBulkDelete(); }}
            >
              Delete {selectedIds.size} {selectedIds.size === 1 ? "card" : "cards"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Single delete confirm ── */}
      <AlertDialog open={!!confirmDeleteId} onOpenChange={(v) => { if (!v) setConfirmDeleteId(null); }}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this card?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
            >
              {deletingId ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Bulk delete overlay ── */}
      <BulkDeleteOverlay
        phase={deletionPhase}
        count={selectedIds.size > 0 ? selectedIds.size : 1}
      />

      {/* ── Edit Modal ── */}
      <EditCardModal
        card={editingCard}
        open={editOpen}
        onClose={() => { setEditOpen(false); setEditingCard(null); }}
        onSaved={(updated) => { handleCardUpdate(updated); setEditOpen(false); }}
      />
    </>
  );
}