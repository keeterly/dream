import React from "react";
import type { JournalEntry } from "../../types";

interface JournalPanelProps {
  entries: JournalEntry[];
}

export const JournalPanel: React.FC<JournalPanelProps> = ({ entries }) => {
  if (!entries.length) {
    return (
      <div className="world-panel world-panel-journal">
        <h3 className="world-panel-title">Journal</h3>
        <p className="world-panel-empty">
          Your journal is quiet. Walk further and let the world write itself.
        </p>
      </div>
    );
  }

  return (
    <div className="world-panel world-panel-journal">
      <h3 className="world-panel-title">Journal</h3>
      <div className="journal-list">
        {entries.map((entry) => (
          <article key={entry.id} className="journal-entry">
            <div className="journal-entry-header">
              <span className={`journal-entry-type tag-${entry.type}`}>
                {entry.type === "dreamself_created" && "Dreamself"}
                {entry.type === "item_found" && "Relic"}
                {entry.type === "biome_visited" && "Biome"}
              </span>
              <time className="journal-entry-time">
                {new Date(entry.timestampIso).toLocaleString()}
              </time>
            </div>
            <h4 className="journal-entry-title">{entry.title}</h4>
            {entry.body && (
              <p className="journal-entry-body">{entry.body}</p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};
