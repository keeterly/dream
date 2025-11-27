// src/components/panels/JournalPanel.tsx
import React from "react";
import type { JournalEntry } from "../../types";

interface JournalPanelProps {
  entries: JournalEntry[];
}

export const JournalPanel: React.FC<JournalPanelProps> = ({ entries }) => {
   const Header: React.FC = () => (
    <div className="world-panel-header">
      <div className="world-panel-header-left">
        <span className="world-panel-header-eyebrow">Journal</span>
        <span className="world-panel-header-title">Entries</span>
      </div>
    </div>
  );


  if (!entries.length) {
    return (
      <div className="world-panel world-panel-journal">
        <Header />
        <p className="world-panel-empty">
          Your journal is quiet. Walk further and let the world write itself.
        </p>
      </div>
    );
  }

    return (
    <div className="world-panel world-panel-journal">
      <Header />
      <div className="world-panel-body">
        <div className="world-panel-journal-entries">
          <div className="journal-list">
            {entries.map((entry, index) => (

          <article key={entry.id} className="journal-entry">
            <div className="journal-entry-header">
              <span className={`journal-entry-type tag-${entry.type}`}>
                {entry.type === "dreamself_created" && "Dreamself"}
                {entry.type === "item_found" && "Relic"}
                {entry.type === "biome_visited" && "Biome"}
              </span>
              <div className="journal-entry-meta">
                <time className="journal-entry-time">
                  {new Date(entry.timestampIso).toLocaleString()}
                </time>
                {index === 0 && (
                  <span className="journal-entry-badge">NEW</span>
                )}
              </div>
            </div>

            <div className="journal-entry-divider" />

            <h4 className="journal-entry-title">{entry.title}</h4>
            {entry.body && (
              <p className="journal-entry-body">{entry.body}              
              
              </p>
            )}
          </article>
        ))}
          </div>
        </div>
      </div>
    </div>
  );
};

