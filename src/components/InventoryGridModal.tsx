// src/components/InventoryGridModal.tsx
import React from "react";
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

// Hash helper – same pool/order as WorldLane. We feed it the **type key**.
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

const rarityOrder: Record<string, number> = {
  mythic: 3,
  legendary: 2,
  rare: 1,
  common: 0,
};

function makeSorter(mode: SortMode) {
  return (a: InventoryItem, b: InventoryItem) => {
    const ta = a.acquiredAt ? Date.parse(a.acquiredAt) : 0;
    const tb = b.acquiredAt ? Date.parse(b.acquiredAt) : 0;

    switch (mode) {
      case "oldest":
        return ta - tb;
      case "newest":
        return tb - ta;
      case "rarity": {
        const ra = rarityOrder[a.rarity] ?? 0;
        const rb = rarityOrder[b.rarity] ?? 0;
        if (ra !== rb) return rb - ra;
        // tie-break by newest
        return tb - ta;
      }
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  };
}

export const InventoryGridModal: React.FC<InventoryGridModalProps> = ({
  items,
  isOpen,
  onClose,
}) => {
  const baseUrl = import.meta.env.BASE_URL || "/";

  const [sortMode, setSortMode] = React.useState<SortMode>("newest");
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);

  // Explicit 6×5 grid with nulls for empty slots
  const [gridSlots, setGridSlots] = React.useState<(InventoryItem | null)[]>(
    () => Array(GRID_CAPACITY).fill(null)
  );

  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  // Keep existing placements; drop any removed items; place new items
  // into next available slot, ordered by current sort mode.
  React.useEffect(() => {
    setGridSlots((prev) => {
      const next: (InventoryItem | null)[] = Array(GRID_CAPACITY).fill(null);
      const idToItem = new Map(items.map((it) => [it.id, it]));

      const placedIds = new Set<string>();

      // 1) Preserve existing placements where possible
      prev.forEach((slotItem, idx) => {
        if (!slotItem) return;
        const updated = idToItem.get(slotItem.id);
        if (updated) {
          next[idx] = updated;
          placedIds.add(updated.id);
        }
      });

      // 2) Any items not yet placed → fill into the first empty slots
      const remaining = items
        .filter((it) => !placedIds.has(it.id))
        .sort(makeSorter(sortMode));

      let writeIndex = 0;
      remaining.forEach((item) => {
        while (writeIndex < GRID_CAPACITY && next[writeIndex] !== null) {
          writeIndex += 1;
        }
        if (writeIndex < GRID_CAPACITY) {
          next[writeIndex] = item;
          placedIds.add(item.id);
        }
      });

      return next;
    });
  }, [items, sortMode]);

  const handleDragStart = (index: number) => {
    const item = gridSlots[index];
    if (!item) return;
    setDragIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      return;
    }

    setGridSlots((prev) => {
      const next = [...prev];
      const source = next[dragIndex];
      const target = next[index];
      next[index] = source ?? null;
      next[dragIndex] = target ?? null;
      return next;
    });

    setDragIndex(null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleSortClick = (mode: SortMode) => {
    setSortMode(mode);
    // Full re-pack from sorted list; manual layout is intentionally reset.
    const sorted = [...items].sort(makeSorter(mode));
    setGridSlots(() => {
      const slots: (InventoryItem | null)[] = Array(GRID_CAPACITY).fill(null);
      sorted.slice(0, GRID_CAPACITY).forEach((item, idx) => {
        slots[idx] = item;
      });
      return slots;
    });
  };

  if (!isOpen) return null;

  const usedCount = items.length;
  const slotsLabel = `${usedCount} / ${GRID_CAPACITY} slots used`;

  const sortPills: { id: SortMode; label: string }[] = [
    { id: "newest", label: "Newest" },
    { id: "oldest", label: "Oldest" },
    { id: "rarity", label: "Rarity" },
    { id: "name", label: "Name" },
  ];

  return (
    <div className="inventory-modal-backdrop">
      <div className="inventory-modal inventory-modal--minimal">
        <div className="inventory-modal-header">
          <div className="inventory-modal-title-block">
            <div className="inventory-modal-kicker">Inventory</div>
            {/* “Bound Relics” removed per request */}
          </div>

          <div className="inventory-modal-controls">
            <button
              type="button"
              className="inventory-close-btn"
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </div>

        {/* Sort pills row */}
        <div className="inventory-sort-row">
          <span className="inventory-sort-label">Sort</span>
          {sortPills.map((pill) => (
            <button
              key={pill.id}
              type="button"
              className={
                "inventory-sort-pill" +
                (sortMode === pill.id ? " inventory-sort-pill--active" : "")
              }
              onClick={() => handleSortClick(pill.id)}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Grid shell */}
        <div className="inventory-grid-shell">
          <div className="inventory-grid inventory-grid--dotted">
            {gridSlots.map((item, index) => {
              const isDragging = dragIndex === index && !!item;

              let iconSrc: string | null = null;
              if (item) {
                // Use type key from id prefix to pick correct SVG
                const typeKey = item.id.split("_")[0] || item.id;
                iconSrc = `${baseUrl}items/foundItems/${getSpriteForName(
                  typeKey
                )}`;
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
                      onMouseEnter={() => setHoveredId(item.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <img
                        src={iconSrc}
                        alt={item.name}
                        className="inventory-grid-icon-img"
                      />

                      {hoveredId === item.id && (
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
          <span className="inventory-modal-count">{slotsLabel}</span>
        </div>
      </div>
    </div>
  );
};
