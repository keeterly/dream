// server/src/fileStore.ts
import fs from "fs";
import path from "path";
import type { SaveDatabase, SaveSlotRecord } from "./model";

const DATA_DIR = path.join(__dirname, "..", "data");
const DB_PATH = path.join(DATA_DIR, "saves.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadDatabase(): SaveDatabase {
  ensureDataDir();
  if (!fs.existsSync(DB_PATH)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    return raw ? (JSON.parse(raw) as SaveDatabase) : {};
  } catch (err) {
    console.error("Failed to read saves.json", err);
    return {};
  }
}

export function saveDatabase(db: SaveDatabase) {
  ensureDataDir();
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write saves.json", err);
  }
}

export function upsertSlot(
  db: SaveDatabase,
  key: string,
  slot: SaveSlotRecord
): SaveDatabase {
  return {
    ...db,
    [key]: slot,
  };
}
