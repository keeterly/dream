import React, { useEffect, useState } from "react";
import type { InventoryItem } from "../types";

interface InventoryGridModalProps {
  items: InventoryItem[];
  isOpen: boolean;
  onClose: () => void;
}

type GridItem = InventoryItem | null;

const GRID_COLUMNS = 6;
const GRID_ROWS = 5;
const GRID_CAPACITY = GRID_COLUMNS * GRID_ROWS;

// Explicit mapping item → correct SVG
const ICON_MAP: Record<string, string> = {
  glass_relic: "glass_relic.svg",
  split_crystal: "split_crystal.svg",
  faceted_diamond: "faceted_diamond.svg",
  rough_cut_stone: "rough_cut_stone.svg",
  short_chunky_crystal: "short_chunky_crystal.svg",
  low_gem_prison: "low_gem_prison.svg",
};

function getSpriteForItem(item: InventoryItem): string {
  const rawKey = (item.id || item.name).toLowerCase().replace(/\s+/g, "_");

  for (const key of Object.keys(ICON_MAP)) {
    if (rawKey.includes(key)) return ICON_MAP[key];
  }

  // Fallback: just pick something sane
  return ICON_MAP.split_crystal ?? Object.values(ICON_MAP)[0];
}

export const InventoryGridModal: React.FC<InventoryGridModalProps> = ({
  items,
  isOpen,
  onClose,
}) => {
  const [slots, setSlots] = useState<GridItem[]>(Array(GRID_CAPACITY).fill(null));
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const baseUrl = import.meta.env.BASE_URL || "/";
  const clampedItems = items.slice(0, GRID_CAPACITY);
  const isFull = items.length >= GRID_CAPACITY;

  // Fill slots sequentially with current items whenever inventory changes / modal opens
  useEffect(() => {
    if (!isOpen) return;

    const nextSlots: GridItem[] = Array(GRID_CAPACITY).fill(null);
    clampedItems.forEach((item, index) => {
      nextSlots[index] = item;
    });
    setSlots(nextSlots);
    setDraggedIndex(null);
  }, [clampedItems, isOpen]);

  const handleDragStart = (index: number) => {
    if (!slots[index]) return;
    setDraggedIndex(index);
  };

  const handleDropOn = (index: number) => {
    if (draggedIndex == null || draggedIndex === index) return;

    setSlots((prev) => {
      const next = [...prev];
      const fromItem = next[draggedIndex];
      const toItem = next[index];
      next[index] = fromItem;
      next[draggedIndex] = toItem;
      return next;
    });

    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (!isOpen) return null;

  return (
    <div className="inventory-modal-backdrop" onClick={onClose}>
      <div
        className="inventory-modal inventory-modal--minimal"
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
          Drag and drop to rearrange. Each relic occupies one slot. Capacity 30.
        </p>

        <div className="inventory-grid inventory-grid--dotted">
          {slots.map((item, index) => (
            <div
              key={index}
              className="inventory-grid-cell"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDropOn(index)}
            >
              {item && (
                <div
                  className={
                    "inventory-grid-item-icon-only" +
                    (draggedIndex === index
                      ? " inventory-grid-item-icon-only--dragging"
                      : "")
                  }
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnd={handleDragEnd}
                >
                  <img
                    src={`${baseUrl}items/foundItems/${getSpriteForItem(item)}`}
                    alt={item.name}
                    className="inventory-grid-icon-img"
                    loading="lazy"
                  />

                  {/* Tooltip: full info lives here */}
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
              )}
            </div>
          ))}
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
