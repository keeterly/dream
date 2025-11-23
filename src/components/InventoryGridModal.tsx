import React, { useEffect, useState } from "react";
import type { InventoryItem } from "../types";

interface InventoryGridModalProps {
  items: InventoryItem[];
  isOpen: boolean;
  onClose: () => void;
}

type GridItem = {
  item: InventoryItem;
  width: number;
  height: number;
};

export const InventoryGridModal: React.FC<InventoryGridModalProps> = ({
  items,
  isOpen,
  onClose,
}) => {
  const [gridItems, setGridItems] = useState<GridItem[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Map items to a size (1x1 or 2x2)
  function getItemSize(item: InventoryItem): { width: number; height: number } {
    // You can customize this however you want:
    // e.g. mythic/rare = big, common = small
    if (item.rarity === "mythic" || item.rarity === "rare") {
      return { width: 2, height: 2 };
    }
    return { width: 1, height: 1 };
  }

  // Rebuild layout when items change or modal opens
  useEffect(() => {
    if (!isOpen) return;
    const next: GridItem[] = items.map((item) => {
      const { width, height } = getItemSize(item);
      return { item, width, height };
    });
    setGridItems(next);
    setDraggedId(null);
  }, [items, isOpen]);

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDropOn = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;

    setGridItems((prev) => {
      const current = [...prev];
      const fromIdx = current.findIndex((g) => g.item.id === draggedId);
      const toIdx = current.findIndex((g) => g.item.id === targetId);
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
          Drag and drop to rearrange. Larger relics occupy more space.
        </p>

        <div className="inventory-grid">
          {gridItems.length === 0 && (
            <div className="inventory-grid-empty">
              No relics yet. Walk further into the Dream.
            </div>
          )}

          {gridItems.map(({ item, width, height }) => (
            <div
              key={item.id}
              className={
                "inventory-grid-item " +
                `inventory-grid-item--${item.rarity ?? "common"} ` +
                (draggedId === item.id ? "inventory-grid-item--dragging" : "")
              }
              style={{
                gridColumn: `span ${width}`,
                gridRow: `span ${height}`,
              }}
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDropOn(item.id)}
            >
              <div className="inventory-grid-item-inner">
                <div className="inventory-grid-item-icon" />

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
                    <span className={`inventory-tooltip-rarity rarity-${item.rarity}`}>
                      {item.rarity}
                    </span>
                  </div>
                  <div className="inventory-tooltip-body">
                    {item.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="inventory-modal-footer">
          <span className="inventory-modal-count">
            {items.length} relic{items.length === 1 ? "" : "s"} carried
          </span>
        </div>
      </div>
    </div>
  );
};
