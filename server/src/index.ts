// server/src/index.ts
import express from "express";
import cors from "cors";
import {
  loadDatabase,
  saveDatabase,
  upsertSlot,
} from "./fileStore";
import type { SavedGameState, SaveDatabase, SaveSlotRecord } from "./model";
import { makeDbKey } from "./model";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

let db: SaveDatabase = loadDatabase();

// Simple logger (optional)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// POST /api/save-game
app.post("/api/save-game", (req, res) => {
  const { slotId, playerId, state } = req.body as {
    slotId?: string;
    playerId?: string;
    state?: SavedGameState;
  };

  if (!slotId || !playerId || !state) {
    return res.status(400).json({
      ok: false,
      error: "Missing slotId, playerId, or state in body",
    });
  }

  const key = makeDbKey(playerId, slotId);
  const record: SaveSlotRecord = {
    playerId,
    slotId,
    state,
    savedAt: new Date().toISOString(),
  };

  db = upsertSlot(db, key, record);
  saveDatabase(db);

  return res.json({
    ok: true,
    slotId,
    playerId,
    savedAt: record.savedAt,
  });
});

// GET /api/load-game?slotId=slot-1&playerId=anon-xxx
app.get("/api/load-game", (req, res) => {
  const slotId = req.query.slotId as string | undefined;
  const playerId = req.query.playerId as string | undefined;

  if (!slotId || !playerId) {
    return res.status(400).json({
      ok: false,
      error: "Missing slotId or playerId query param",
    });
  }

  const key = makeDbKey(playerId, slotId);
  const record = db[key] || null;

  return res.json({
    ok: true,
    slotId,
    playerId,
    state: record ? record.state : null,
    savedAt: record ? record.savedAt : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`DREAM save server listening on http://localhost:${PORT}`);
});
