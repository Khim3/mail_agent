import fs from "fs";
import path from "path";
import { MemoryStore } from "@/types/memory";

const MEMORY_PATH = path.join(
  process.cwd(),
  "memory.json"
);

export function saveMemory(data: MemoryStore) {
  fs.writeFileSync(
    MEMORY_PATH,
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

export function loadMemory(): MemoryStore {
  if (!fs.existsSync(MEMORY_PATH)) {
    return { emails: [] };
  }

  const raw = fs.readFileSync(
    MEMORY_PATH,
    "utf-8"
  );
  console.log('memory tool is called');
  return JSON.parse(raw) as MemoryStore;
}

export function clearMemory() {
  saveMemory({ emails: [] });
}
