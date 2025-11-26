import React from "react";
import type { JournalEntry } from "../../types";

interface JournalPanelProps {
  entries: JournalEntry[];
  onClose?: () => void;
}

export const JournalPanel: React.FC<JournalPanelProps> = ({
  entries,
  onClose,
}) => {
  const handleClose = () => {
    if (onClose) onClose();
  };

  if (!entries || entries.length === 0) {
    return (
      <section className="world-panel world-panel-journal">
        <header
          className="world-panel-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <div className="world-panel-kicker">Journal</div>
            <div className="world-panel-title">Dream Log</div>
          </div>

          <button
            type="button"
            className="world-panel-modal-close"
            onClick={handleClose}
            aria-label="Close journal"
          >
            ×
          </button>
        </header>

        <div className="world-panel-body">
          <p className="world-panel-empty">Your dream log is still blank.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="world-panel world-panel-journal">
      {/* HEADER */}
      <header
        className="world-panel-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <div className="world-panel-kicker">Journal</div>
          <div className="world-panel-title">Dream Log</div>
        </div>

        <button
          type="button"
          className="world-panel-modal-close"
          onClick={handleClose}
          aria-label="Close journal"
        >
          ×
        </button>
      </header>

      {/* BODY */}
      <div className="world-panel-body">
        <div className="journal-list">
          {entries.map((entry) => (
            <article key={entry.id} className="journal-entry">
              <div className="journal-entry-header">
                <span className={`journal-entry-type tag-${entry.type}`}>
                  {entry.type === "dreamself_created" && "Dreamself"}
                  {entry.type === "item_found" && "Relic"}
                  {entry.type === "biome_visited" && "Biome"}
                </span>
                <span className="journal-entry-date">
                  {entry.timestampDisplay}
                </span>
              </div>

              <div className="journal-entry-divider" />

              <h4 className="journal-entry-title">{entry.title}</h4>
              {entry.body && (
                <p className="journal-entry-body">{entry.body}</p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
