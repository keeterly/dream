// src/components/InventoryGridModal.tsx
import React, { useMemo, useState } from "react";
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
}

interface GridCell {
  item: InventoryItem | null;
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
}) => {
  const baseUrl = import.meta.env.BASE_URL || "/";

  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  // ----- SORTING -------------------------------------------------------------

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
          // tie-break by newest first
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

  // ----- MANUAL GRID ORDER (for drag & drop) --------------------------------

  const [manualGridOrder, setManualGridOrder] = useState<InventoryItem[]>([]);

  // 1) When sort mode changes, we *re-seed* the grid from sortedItems.
  // 2) When new items arrive, they’re appended in the current sort order.
  React.useEffect(() => {
    setManualGridOrder((prev) => {
      const existingIds = new Set(prev.map((it) => it.id));

      const next: InventoryItem[] = [];
      // Fill grid according to current sort mode, but keep only items that exist.
      sortedItems.forEach((it) => {
        if (existingIds.has(it.id) || !prev.length) {
          next.push(it);
        }
      });

      // If this is the first time (or after big changes), just mirror sortedItems
      if (!prev.length) {
        return sortedItems.slice(0, GRID_CAPACITY);
      }

      // Append any newly acquired items not yet in the grid (still respecting sort)
      const currentIds = new Set(next.map((it) => it.id));
      sortedItems.forEach((it) => {
        if (!currentIds.has(it.id)) next.push(it);
      });

      return next.slice(0, GRID_CAPACITY);
    });
  }, [sortedItems]);

  // Build fixed 6×5 grid from local order
  const gridCells: GridCell[] = useMemo(() => {
    const cells: GridCell[] = Array.from({ length: GRID_CAPACITY }, () => ({
      item: null,
    }));

    manualGridOrder.forEach((item, idx) => {
      if (idx < GRID_CAPACITY) {
        cells[idx].item = item;
      }
    });

    return cells;
  }, [manualGridOrder]);

  // ----- DRAG & DROP --------------------------------------------------------

  const handleDragStart = (index: number) => {
    if (!gridCells[index].item) return;
    setDragIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      return;
    }

    const sourceItem = gridCells[dragIndex].item;
    const targetItem = gridCells[index].item;

    if (!sourceItem && !targetItem) {
      setDragIndex(null);
      return;
    }

    setManualGridOrder((prev) => {
      // Build an array representing the current grid by index → item
      const byIndex: (InventoryItem | null)[] = Array.from(
        { length: GRID_CAPACITY },
        (_, i) => gridCells[i]?.item ?? null
      );

      byIndex[index] = sourceItem ?? null;
      byIndex[dragIndex] = targetItem ?? null;

      const nextOrder: InventoryItem[] = [];
      byIndex.forEach((maybeItem) => {
        if (maybeItem && !nextOrder.find((it) => it.id === maybeItem.id)) {
          nextOrder.push(maybeItem);
        }
      });

      // If there are any remaining items not on the board (shouldn’t happen often),
      // append them in current sorted order.
      const nextIds = new Set(nextOrder.map((it) => it.id));
      sortedItems.forEach((it) => {
        if (!nextIds.has(it.id)) nextOrder.push(it);
      });

      return nextOrder.slice(0, GRID_CAPACITY);
    });

    setDragIndex(null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // ----- RENDER -------------------------------------------------------------

  if (!isOpen) return null;

  const sortPill = (mode: SortMode, label: string) => (
    <button
      key={mode}
      type="button"
      className={
        "inventory-sort-pill" +
        (sortMode === mode ? " inventory-sort-pill--active" : "")
      }
      onClick={() => setSortMode(mode)}
    >
      {label}
    </button>
  );

  return (
    <div className="inventory-modal-backdrop">
      <div className="inventory-modal inventory-modal--minimal">
        <div className="inventory-modal-header">
          <div className="inventory-modal-title-block">
            <div className="inventory-modal-kicker">Inventory</div>
            <div className="inventory-modal-title">Bound Relics</div>
          </div>

          <div className="inventory-modal-controls">
            <div className="inventory-sort-row">
              <span className="inventory-sort-label">Sort</span>
              {sortPill("newest", "Newest")}
              {sortPill("oldest", "Oldest")}
              {sortPill("rarity", "Rarity")}
              {sortPill("name", "Name")}
            </div>

            <div className="inventory-modal-count">
              {manualGridOrder.length}/{GRID_CAPACITY}
            </div>

            <button
              type="button"
              className="inventory-close-btn"
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </div>

        <div className="inventory-grid-shell">
          <div className="inventory-grid inventory-grid--dotted">
            {gridCells.map((cell, index) => {
              const item = cell.item;
              const isDragging = dragIndex === index && !!item;

              let iconSrc: string | null = null;
              if (item) {
                const spriteFile = getSpriteForItemName(item.name);
                if (spriteFile) {
                  iconSrc = `${baseUrl}items/foundItems/${spriteFile}`;
                }
              }

              return (
                <div
                  key={index}
                  className="inventory-grid-cell"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                >
                  {item && iconSrc && (
                    <div
                      className={
                        "inventory-grid-item-icon-only" +
                        (isDragging
                          ? " inventory-grid-item-icon-only--dragging"
                          : "")
                      }
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onMouseEnter={() => setHoveredItemId(item.id)}
                      onMouseLeave={() => setHoveredItemId(null)}
                    >
                      <img
                        src={iconSrc}
                        alt={item.name}
                        className="inventory-grid-icon-img"
                      />

                      {hoveredItemId === item.id && (
                        <div className="inventory-tooltip">
                          <div className="inventory-tooltip-name">
                            <span>{item.name}</span>
                            <span
                              className={
                                "inventory-tooltip-rarity rarity-" +
                                item.rarity
                              }
                            >
                              {item.rarity}
                            </span>
                          </div>
                          <div className="inventory-tooltip-body">
                            {item.description}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="inventory-modal-footer">
          <span>{manualGridOrder.length} / 30 slots used</span>
        </div>
      </div>
    </div>
  );
};
