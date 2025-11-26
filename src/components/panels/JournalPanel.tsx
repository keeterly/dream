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
  const sorted = [...entries].sort(
    (a, b) =>
      new Date(b.timestampIso).getTime() - new Date(a.timestampIso).getTime()
  );

  return (
    <div className="world-panel world-panel-journal">
      {/* Unified header (matches Inventory frame) */}
      <div className="world-panel-header">
        <div>
          <div className="world-panel-kicker">Journal</div>
          <div className="world-panel-title">Dream Log</div>
        </div>

        {onClose && (
          <button
            type="button"
            className="world-panel-modal-close"
            onClick={onClose}
            aria-label="Close journal"
          >
            ×
          </button>
        )}
      </div>

      <div className="world-panel-body">
        <div className="journal-panel">
          <div className="journal-scroll">
            {sorted.length === 0 && (
              <p className="world-panel-empty">
                Your journal is empty for now.
              </p>
            )}

            {sorted.map((entry, index) => {
              const date = new Date(entry.timestampIso);

              return (
                <article
                  key={entry.id ?? entry.timestampIso ?? index}
                  className="journal-entry"
                >
                  <header className="journal-entry-header">
                    <span className="journal-entry-tag">
                      {entry.category?.toUpperCase() ?? "ENTRY"}
                    </span>

                    <div className="journal-entry-meta">
                      <time className="journal-entry-time">
                        {date.toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}{" "}
                        {date.toLocaleTimeString(undefined, {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </time>
                      {index === 0 && (
                        <span className="journal-entry-badge">NEW</span>
                      )}
                    </div>
                  </header>

                  <h4 className="journal-entry-title">{entry.title}</h4>

                  {entry.body && (
                    <p className="journal-entry-body">{entry.body}</p>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
