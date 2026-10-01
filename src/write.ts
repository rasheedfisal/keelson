import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { compose, packageRoot } from "./compose.ts";
import { hashContent, readManifest, writeManifest } from "./manifest.ts";
import { KeelsonError } from "./types.ts";
import type { CommandName, ComposedFile, ConflictChoice, Mode, Stack } from "./types.ts";

export interface WriteReport {
  written: string[];
  unchanged: string[];
  kept: string[];
  cancelled: boolean;
}

export async function install(options: {
  dir: string;
  command: CommandName;
  stack?: Stack;
  mode?: Mode;
  yes?: boolean;
  force?: boolean;
  toolVersion: string;
  root?: string;
  resolveConflicts?: (conflicts: string[]) => Promise<ConflictChoice>;
}): Promise<WriteReport> {
  const previous = await readManifest(options.dir);
  if (options.command === "update" && !previous) {
    throw new KeelsonError("No .keelson.json in this directory. Run keelson init first.");
  }

  const stack = options.command === "update" ? previous?.stack : options.stack;
  const mode = options.command === "update" ? previous?.mode : options.mode;
  if (!stack || !mode) {
    throw new KeelsonError("init requires --stack and --mode.");
  }

  const composed = await compose({ stack, mode, root: options.root ?? packageRoot });
  return applyInstall({
    dir: options.dir,
    files: composed.files,
    stack,
    mode,
    layers: composed.layers,
    toolVersion: options.toolVersion,
    command: options.command,
    yes: options.yes ?? false,
    force: options.force ?? false,
    resolveConflicts: options.resolveConflicts,
  });
}

export async function applyInstall(options: {
  dir: string;
  files: ComposedFile[];
  stack: Stack;
  mode: Mode;
  layers: string[];
  toolVersion: string;
  command: CommandName;
  yes?: boolean;
  force?: boolean;
  resolveConflicts?: (conflicts: string[]) => Promise<ConflictChoice>;
}): Promise<WriteReport> {
  const previous = await readManifest(options.dir);
  if (options.command === "update" && !previous) {
    throw new KeelsonError("No .keelson.json in this directory. Run keelson init first.");
  }

  const planned = await Promise.all(
    options.files.map(async (file) => planFile(options.dir, file, previous?.files[file.relativePath])),
  );
  const conflicts = planned
    .filter((item) => item.action === "conflict")
    .map((item) => item.file.relativePath);

  let overwriteConflicts = false;
  if (conflicts.length > 0) {
    if (options.force) {
      overwriteConflicts = true;
    } else if (options.command === "update" || options.yes) {
      overwriteConflicts = false;
    } else if (!options.resolveConflicts) {
      throw new KeelsonError("Existing files differ. Re-run with --yes to keep them or --force to overwrite.");
    } else {
      const choice = await options.resolveConflicts(conflicts);
      if (choice === "cancel") {
        return { written: [], unchanged: [], kept: conflicts, cancelled: true };
      }
      overwriteConflicts = choice === "overwrite";
    }
  }

  const written: string[] = [];
  const unchanged: string[] = [];
  const kept: string[] = [];
  const files: Record<string, string> = {};

  for (const item of planned) {
    const shouldWrite = item.action === "write" || (item.action === "conflict" && overwriteConflicts);
    if (shouldWrite) {
      const absolute = targetPath(options.dir, item.file.relativePath);
      await mkdir(dirname(absolute), { recursive: true });
      await writeFile(absolute, item.file.contents, "utf8");
      files[item.file.relativePath] = item.desiredHash;
      written.push(item.file.relativePath);
      continue;
    }

    if (item.action === "unchanged") {
      files[item.file.relativePath] = item.desiredHash;
      unchanged.push(item.file.relativePath);
      continue;
    }

    const ownedHash = previous?.files[item.file.relativePath];
    if (ownedHash) files[item.file.relativePath] = ownedHash;
    kept.push(item.file.relativePath);
  }

  await mkdir(options.dir, { recursive: true });
  await writeManifest(options.dir, {
    version: 1,
    toolVersion: options.toolVersion,
    stack: options.stack,
    mode: options.mode,
    layers: options.layers,
    installedAt: new Date().toISOString(),
    files,
  });

  written.sort((a, b) => a.localeCompare(b));
  unchanged.sort((a, b) => a.localeCompare(b));
  kept.sort((a, b) => a.localeCompare(b));
  return { written, unchanged, kept, cancelled: false };
}

async function planFile(
  dir: string,
  file: ComposedFile,
  ownedHash: string | undefined,
): Promise<
  | { action: "write" | "unchanged"; file: ComposedFile; desiredHash: string }
  | { action: "conflict"; file: ComposedFile; desiredHash: string }
> {
  const desiredHash = hashContent(file.contents);
  let disk: string | null = null;
  try {
    disk = await readFile(targetPath(dir, file.relativePath), "utf8");
  } catch (error) {
    if (!isEnoent(error)) throw error;
  }

  if (disk === null) return { action: "write", file, desiredHash };
  const diskHash = hashContent(disk);
  if (diskHash === desiredHash) return { action: "unchanged", file, desiredHash };
  if (ownedHash === diskHash) return { action: "write", file, desiredHash };
  return { action: "conflict", file, desiredHash };
}

export function targetPath(dir: string, relativePath: string): string {
  const parts = relativePath.split("/");
  if (parts.some((part) => part.length === 0 || part === "." || part === "..")) {
    throw new KeelsonError(`Unsafe path: ${relativePath}`);
  }
  return join(dir, ...parts);
}

function isEnoent(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
