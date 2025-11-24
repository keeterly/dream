import React, { useEffect, useState } from "react";
import type { InventoryItem } from "../types";

interface InventoryGridModalProps {
  items: InventoryItem[];
  isOpen: boolean;
  onClose: () => void;
}

type GridItem = InventoryItem;

const GRID_CAPACITY = 30;

// Same sprite set as the world lane
const FOUND_ITEM_SVGS = [
  "split_crystal.svg",
  "faceted_diamond.svg",
  "rough_cut_stone.svg",
  "short_chunky_crystal.svg",
  "low_gem_prison.svg",
  "glass_relic.svg",
];

// Deterministically map id/name → one of the sprites
function getSpriteForName(nameOrId: string): string {
  let hash = 0;
  for (let i = 0; i < nameOrId.length; i += 1) {
    hash = (hash * 31 + nameOrId.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % FOUND_ITEM_SVGS.length;
  return FOUND_ITEM_SVGS[index];
}

export const InventoryGridModal: React.FC<InventoryGridModalProps> = ({
  items,
  isOpen,
  onClose,
}) => {
  const [gridItems, setGridItems] = useState<GridItem[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const baseUrl = import.meta.env.BASE_URL || "/";
  const isFull = items.length >= GRID_CAPACITY;

  // Rebuild layout when items change or modal opens
  useEffect(() => {
    if (!isOpen) return;
    setGridItems(items); // all items are 1x1 now
    setDraggedId(null);
  }, [items, isOpen]);

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDropOn = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;

    setGridItems((prev) => {
      const current = [...prev];
      const fromIdx = current.findIndex((g) => g.id === draggedId);
      const toIdx = current.findIndex((g) => g.id === targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;

      const tmp = current[fromIdx];
      current[fromIdx] = current[toIdx];
      current[toIdx] = tmp;
      return current;
    });

    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="inventory-modal-backdrop" onClick={onClose}>
      <div
        className="inventory-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Inventory"
      >
        <div className="inventory-modal-header">
          <div className="inventory-modal-title-block">
            <span className="inventory-modal-kicker">Relics</span>
            <h2 className="inventory-modal-title">Grid Inventory</h2>
          </div>
          <button
            type="button"
            className="inventory-modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <p className="inventory-modal-subtitle">
          Drag and drop to rearrange. Each relic occupies one slot. Capacity{" "}
          {GRID_CAPACITY}.
        </p>

        <div className="inventory-grid">
          {gridItems.length === 0 && (
            <div className="inventory-grid-empty">
              No relics yet. Walk further into the Dream.
            </div>
          )}

          {gridItems.map((item) => {
            const sprite = getSpriteForName(item.id ?? item.name);
            const iconSrc = `${baseUrl}items/foundItems/${sprite}`;

            return (
              <div
                key={item.id}
                className={
                  "inventory-grid-item " +
                  `inventory-grid-item--${item.rarity ?? "common"} ` +
                  (draggedId === item.id ? "inventory-grid-item--dragging" : "")
                }
                style={{
                  gridColumn: "span 1",
                  gridRow: "span 1",
                }}
                draggable
                onDragStart={() => handleDragStart(item.id)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDropOn(item.id)}
              >
                <div className="inventory-grid-item-inner">
                  <div className="inventory-grid-item-icon">
                    <img
                      src={iconSrc}
                      alt={item.name}
                      className="inventory-grid-item-icon-img"
                    />
                  </div>

                  <div className="inventory-grid-item-label">
                    <span className="inventory-grid-item-name">
                      {item.name}
                    </span>
                    <span className="inventory-grid-item-rarity">
                      {item.rarity}
                    </span>
                  </div>

                  {/* Tooltip */}
                  <div className="inventory-tooltip">
                    <div className="inventory-tooltip-name">
                      {item.name}
                      <span
                        className={`inventory-tooltip-rarity rarity-${item.rarity}`}
                      >
                        {item.rarity}
                      </span>
                    </div>
                    <div className="inventory-tooltip-body">
                      {item.description}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="inventory-modal-footer">
          <span className="inventory-modal-count">
            {items.length} / {GRID_CAPACITY} slots used
            {isFull ? " — Inventory full" : ""}
          </span>
        </div>
      </div>
    </div>
  );
};
