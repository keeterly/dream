import React from "react";
import type { JournalEntry } from "../../types";

export interface JournalPanelProps {
  entries: JournalEntry[];
  onClose?: () => void;
}

export const JournalPanel: React.FC<JournalPanelProps> = ({
  entries,
  onClose,
}) => {
  return (
    <section className="world-panel world-panel-journal">
      <header className="world-panel-header">
        <div className="world-panel-header-main">
          <div className="world-panel-kicker">Journal</div>
          <h2 className="world-panel-title">Dream Log</h2>
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
      </header>

      <div className="world-panel-body">
        {entries.length === 0 ? (
          <p className="journal-empty">
            Your journal is quiet for now. Relics and events you encounter will
            be recorded here.
          </p>
        ) : (
          <div className="journal-list">
            {entries.map((entry) => (
              <article key={entry.id} className="journal-entry">
                <header className="journal-entry-header">
                  <div className="journal-entry-pill-row">
                    <span className="journal-entry-pill">
                      {entry.type.toUpperCase()}
                    </span>
                    <time className="journal-entry-timestamp">
                      {entry.timestampIso}
                    </time>
                  </div>
                  <h3 className="journal-entry-title">{entry.title}</h3>
                </header>
                <p className="journal-entry-body">{entry.body}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
