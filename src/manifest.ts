import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { KeelsonError, isMode, isStack } from "./types.ts";
import type { Manifest } from "./types.ts";

export const MANIFEST_FILE = ".keelson.json";

export function hashContent(contents: string): string {
  return createHash("sha256").update(contents, "utf8").digest("hex");
}

export function manifestPath(dir: string): string {
  return join(dir, MANIFEST_FILE);
}

export async function readManifest(dir: string): Promise<Manifest | null> {
  let raw: string;
  try {
    raw = await readFile(manifestPath(dir), "utf8");
  } catch (error) {
    if (isEnoent(error)) return null;
    throw error;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new KeelsonError(`${MANIFEST_FILE} is not valid JSON.`);
  }

  if (!isManifest(parsed)) {
    throw new KeelsonError(`${MANIFEST_FILE} does not match the keelson manifest format.`);
  }
  return parsed;
}

export async function writeManifest(dir: string, manifest: Manifest): Promise<void> {
  const files = Object.fromEntries(
    Object.entries(manifest.files).sort(([a], [b]) => a.localeCompare(b)),
  );
  const body = `${JSON.stringify({ ...manifest, files }, null, 2)}\n`;
  await writeFile(manifestPath(dir), body, "utf8");
}

function isManifest(value: unknown): value is Manifest {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  if (record.version !== 1) return false;
  if (typeof record.toolVersion !== "string") return false;
  if (typeof record.stack !== "string" || !isStack(record.stack)) return false;
  if (typeof record.mode !== "string" || !isMode(record.mode)) return false;
  if (!Array.isArray(record.layers) || record.layers.some((layer) => typeof layer !== "string")) {
    return false;
  }
  if (typeof record.installedAt !== "string") return false;
  if (typeof record.files !== "object" || record.files === null || Array.isArray(record.files)) {
    return false;
  }
  return Object.values(record.files).every((hash) => typeof hash === "string");
}

function isEnoent(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
