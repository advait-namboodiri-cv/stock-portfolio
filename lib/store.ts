import { promises as fs } from "fs";
import path from "path";
import type { ActivityEntry, Proposal } from "./types";

// File-backed store: proposals are written by the agent (via Claude Code),
// read and updated by the app when the user approves or rejects.

const DATA_DIR = path.join(process.cwd(), "data");
const PROPOSALS = path.join(DATA_DIR, "proposals.json");
const ACTIVITY = path.join(DATA_DIR, "activity.json");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, value: unknown): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(file, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export async function getProposals(): Promise<Proposal[]> {
  return readJson<Proposal[]>(PROPOSALS, []);
}

export async function saveProposals(proposals: Proposal[]): Promise<void> {
  await writeJson(PROPOSALS, proposals);
}

export async function updateProposal(
  id: string,
  patch: Partial<Proposal>,
): Promise<Proposal | undefined> {
  const proposals = await getProposals();
  const idx = proposals.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  proposals[idx] = { ...proposals[idx], ...patch };
  await saveProposals(proposals);
  return proposals[idx];
}

export async function getActivity(): Promise<ActivityEntry[]> {
  return readJson<ActivityEntry[]>(ACTIVITY, []);
}

export async function appendActivity(entry: Omit<ActivityEntry, "id" | "at">): Promise<void> {
  const log = await getActivity();
  log.unshift({
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: new Date().toISOString(),
    ...entry,
  });
  await writeJson(ACTIVITY, log);
}
