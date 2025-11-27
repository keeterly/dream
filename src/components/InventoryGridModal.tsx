// src/components/InventoryGridModal.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { InventoryItem } from "../types";
import { getSpriteForItemName } from "../spriteMap";

const GRID_COLUMNS = 6;
const GRID_ROWS = 5;
const GRID_CAPACITY = GRID_COLUMNS * GRID_ROWS;

type SortMode = "newest" | "oldest" | "rarity" | "name";

interface InventoryGridModalProps {
  items: InventoryItem[];
  isOpen: boolean;
  onClose: () => void;
  /** When true, render inside an existing panel shell (WorldStep) */
  embedded?: boolean;
}


// Simple rarity weight for sorting
const rarityOrder: Record<string, number> = {
  mythic: 3,
  legendary: 2,
  rare: 1,
  common: 0,
};

export const InventoryGridModal: React.FC<InventoryGridModalProps> = ({
  items,
  isOpen,
  onClose,
  embedded = false,
}) => {

  const baseUrl = import.meta.env.BASE_URL || "/";

  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  // Local grid order: one cell per slot (null = empty)
  const [grid, setGrid] = useState<(InventoryItem | null)[]>(
    () => Array(GRID_CAPACITY).fill(null)
  );

  const prevSortModeRef = useRef<SortMode>("newest");

  // Sorted list (for filling new items and re-sorting)
  const sortedItems = useMemo(() => {
    const copy = [...items];

    switch (sortMode) {
      case "oldest":
        copy.sort((a, b) => {
          const ta = a.acquiredAt ? Date.parse(a.acquiredAt) : 0;
          const tb = b.acquiredAt ? Date.parse(b.acquiredAt) : 0;
          return ta - tb;
        });
        break;
      case "rarity":
        copy.sort((a, b) => {
          const ra = rarityOrder[a.rarity] ?? 0;
          const rb = rarityOrder[b.rarity] ?? 0;
          if (ra !== rb) return rb - ra;
          // tie-break by newest
          const ta = a.acquiredAt ? Date.parse(a.acquiredAt) : 0;
          const tb = b.acquiredAt ? Date.parse(b.acquiredAt) : 0;
          return tb - ta;
        });
        break;
      case "name":
        copy.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
      default:
        copy.sort((a, b) => {
          const ta = a.acquiredAt ? Date.parse(a.acquiredAt) : 0;
          const tb = b.acquiredAt ? Date.parse(b.acquiredAt) : 0;
          return tb - ta;
        });
        break;
    }

    return copy;
  }, [items, sortMode]);

  /**
   * Sync the local grid whenever items or sortMode change.
   *
   * - If sortMode changed: fully re-pack items according to the sort.
   * - If only items changed: keep existing items in their current cells,
   *   and place *new* items into the next available empty slots
   *   in the current sort order.
   */
  useEffect(() => {
    setGrid((prevGrid) => {
      const byId = new Map(items.map((it) => [it.id, it]));
      const nextGrid: (InventoryItem | null)[] = Array(GRID_CAPACITY).fill(
        null
      );

      const prevSortMode = prevSortModeRef.current;
      const sortModeChanged = prevSortMode !== sortMode;

      if (sortModeChanged) {
        // FULL RE-SORT: lay items down from top-left using sorted order
        sortedItems.forEach((item, idx) => {
          if (idx < GRID_CAPACITY) {
            nextGrid[idx] = item;
          }
        });
      } else {
        // INCREMENTAL UPDATE: preserve placements for items that still exist
        prevGrid.forEach((cellItem, idx) => {
          if (!cellItem) return;
          const updated = byId.get(cellItem.id);
          if (updated) {
            nextGrid[idx] = updated; // keep same slot
            byId.delete(cellItem.id);
          }
        });

        // Place *new* items (present in items but not in prev grid)
        sortedItems.forEach((item) => {
          if (!byId.has(item.id)) return; // already placed above
          const emptyIndex = nextGrid.findIndex((cell) => cell === null);
          if (emptyIndex !== -1) {
            nextGrid[emptyIndex] = item;
            byId.delete(item.id);
          }
        });
      }

      prevSortModeRef.current = sortMode;
      return nextGrid;
    });
  }, [items, sortMode, sortedItems]);

  const handleDragStart = (index: number) => {
    if (!grid[index]) return;
    setDragIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      return;
    }

    setGrid((prev) => {
      const next = [...prev];
      const source = next[dragIndex];
      const target = next[index];
      next[index] = source;
      next[dragIndex] = target;
      return next;
    });

    setDragIndex(null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleSortClick = (mode: SortMode) => {
    setSortMode(mode);
  };

      if (!isOpen) return null;

  const content = (
    <>
      {/* Header */}
      <div className="world-panel-header">
        <div className="world-panel-header-left">
          <span className="world-panel-header-title">Inventory</span>

          <div className="inventory-sort-row">
            <span className="inventory-sort-label">Sort</span>

            <button
              className={
                "inventory-sort-pill" +
                (sortMode === "newest" ? " inventory-sort-pill--active" : "")
              }
              onClick={() => handleSortClick("newest")}
            >
              Newest
            </button>

            <button
              className={
                "inventory-sort-pill" +
                (sortMode === "oldest" ? " inventory-sort-pill--active" : "")
              }
              onClick={() => handleSortClick("oldest")}
            >
              Oldest
            </button>

            <button
              className={
                "inventory-sort-pill" +
                (sortMode === "rarity" ? " inventory-sort-pill--active" : "")
              }
              onClick={() => handleSortClick("rarity")}
            >
              Rarity
            </button>

            <button
              className={
                "inventory-sort-pill" +
                (sortMode === "name" ? " inventory-sort-pill--active" : "")
              }
              onClick={() => handleSortClick("name")}
            >
              Name
            </button>
          </div>
        </div>

        {/* Only show this X when NOT embedded in the HUD modal */}
        {!embedded && (
          <button
            type="button"
            className="inventory-close-btn"
            onClick={onClose}
            aria-label="Close inventory"
          >
            ×
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="inventory-grid-shell">
        <div className="inventory-grid inventory-grid--dotted">
          {/* KEEP your existing grid-mapping code here, e.g.:

          {grid.map((item, index) => {
            ...
          })}

          */}
        </div>
      </div>
    </>
  );


  // Embedded: inside WorldStep's world-panel-modal shell
  if (embedded) {
    return <div className="world-panel world-panel-inventory">{content}</div>;
  }

  // Standalone modal (currently not used, but kept for flexibility)
  return (
    <div className="inventory-modal-backdrop" onClick={onClose}>
      <div
        className="inventory-modal inventory-modal--minimal"
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </div>
    </div>
  );
};
