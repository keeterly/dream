// src/components/InventoryGridModal.tsx
import React, { useMemo, useState } from "react";
import type { InventoryItem } from "../types";

const GRID_COLUMNS = 6;
const GRID_ROWS = 5;
const GRID_CAPACITY = GRID_COLUMNS * GRID_ROWS;

// Same sprite pool as WorldLane
const FOUND_ITEM_SVGS = [
  "split_crystal.svg",
  "faceted_diamond.svg",
  "rough_cut_stone.svg",
  "short_chunky_crystal.svg",
  "low_gem_prison.svg",
  "glass_relic.svg",
];

// 🔑 SAME hash as in WorldLane, but we’ll feed it item.name
function getSpriteForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % FOUND_ITEM_SVGS.length;
  return FOUND_ITEM_SVGS[index];
}

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

  // Sorted view of items (order only; actual grid placement is mutable via drag-drop)
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
          return (b.acquiredAt ?? "").localeCompare(a.acquiredAt ?? "");
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

  // 🔁 Lay sorted items into a fixed 6x5 grid in order
  // Drag/drop will mutate this local ordering only.
  const [manualGridOrder, setManualGridOrder] = useState<InventoryItem[]>([]);

  // Sync manual order when item list changes (e.g., new pickup)
  React.useEffect(() => {
    setManualGridOrder((prev) => {
      // Keep existing items in their current positions
      const existingIds = new Set(items.map((it) => it.id));
      const filteredPrev = prev.filter((it) => existingIds.has(it.id));

      // Append any new items (sorted) that weren't in the previous local order
      const existingPrevIds = new Set(filteredPrev.map((it) => it.id));
      const newOnes = sortedItems.filter((it) => !existingPrevIds.has(it.id));

      const combined = [...filteredPrev, ...newOnes];
      return combined.slice(0, GRID_CAPACITY);
    });
  }, [items, sortedItems]);

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
      const byId: Record<string, InventoryItem> = {};
      prev.forEach((it) => {
        byId[it.id] = it;
      });

      const nextCells = gridCells.map((cell) => cell.item);
      nextCells[index] = sourceItem ?? null;
      nextCells[dragIndex] = targetItem ?? null;

      const nextOrder: InventoryItem[] = [];
      nextCells.forEach((maybeItem) => {
        if (maybeItem && !nextOrder.find((it) => it.id === maybeItem.id)) {
          nextOrder.push(maybeItem);
        }
      });

      return nextOrder;
    });

    setDragIndex(null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  if (!isOpen) return null;

  return (
    <div className="inventory-modal-backdrop">
      <div className="inventory-modal inventory-modal--minimal">
        <div className="inventory-modal-header">
          <div className="inventory-modal-title-block">
            <div className="inventory-modal-kicker">Inventory</div>
            <div className="inventory-modal-title">Bound Relics</div>
          </div>

          <div className="inventory-modal-controls">
            <div className="inventory-sort">
              <span className="inventory-sort-label">Sort</span>
              <select
                className="inventory-sort-select"
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="rarity">Rarity</option>
                <option value="name">Name</option>
              </select>
            </div>

            <div className="inventory-capacity">
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

        {/* 6x5 grid */}
        <div className="inventory-grid-shell">
          <div className="inventory-grid inventory-grid--dotted">
            {gridCells.map((cell, index) => {
              const item = cell.item;
const isDragging = dragIndex === index && !!item;

// Use the *type key* from the instance id prefix.
// Example: "split_crystal_1719abc" => "split_crystal"
let iconSrc: string | null = null;
if (item) {
  const typeKey = item.id.split("_")[0] || item.id;
  iconSrc = `${baseUrl}items/foundItems/${getSpriteForName(typeKey)}`;
}


              return (
                <div
                  key={index}
                  className={
                    "inventory-grid-slot" +
                    (item ? " inventory-grid-slot--occupied" : "") +
                    (isDragging ? " inventory-grid-slot--dragging" : "")
                  }
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                >
                  {item && iconSrc && (
                    <div
                      className="inventory-grid-item"
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onMouseEnter={() => setHoveredItemId(item.id)}
                      onMouseLeave={() => setHoveredItemId(null)}
                    >
                      <img
                        src={iconSrc}
                        alt={item.name}
                        className="inventory-grid-item-icon"
                      />

                      {/* Tooltip */}
                      {hoveredItemId === item.id && (
                        <div className="inventory-tooltip">
                          <div className="inventory-tooltip-name">
                            {item.name}
                          </div>
                          <div className="inventory-tooltip-rarity">
                            {item.rarity}
                          </div>
                          <div className="inventory-tooltip-desc">
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
      </div>
    </div>
  );
};
