import { readFile, readdir } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { KeelsonError } from "./types.ts";
import type { ComposedFile, LayersFile, Mode, Stack } from "./types.ts";

export const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

export const STACK_LABELS: Record<Stack, string> = {
  "nextjs-nestjs": "Next.js + NestJS + Drizzle + PostgreSQL",
  "nextjs-dotnet": "Next.js + .NET + EF Core/Dapper + PostgreSQL",
};

const SKILL_PREFIX = ".agents/skills/";
const CURSOR_SKILL_PREFIX = ".cursor/skills/";

export function applyTokens(
  relativePath: string,
  contents: string,
  tokens: { stackLabel: string; mode: Mode },
): string {
  if (relativePath !== "AGENTS.md") return contents;
  return contents
    .replaceAll("{{STACK_LABEL}}", tokens.stackLabel)
    .replaceAll("{{MODE}}", tokens.mode);
}

export function layersFor(stack: Stack, mode: Mode, config: LayersFile): string[] {
  const stackLayers = config.stacks[stack];
  const modeLayers = config.modes[mode];
  return [...stackLayers, ...modeLayers];
}

export async function loadLayers(root = packageRoot): Promise<LayersFile> {
  const raw = await readFile(join(root, "layers.json"), "utf8");
  const parsed: unknown = JSON.parse(raw);
  if (!isLayersFile(parsed)) {
    throw new KeelsonError("layers.json is missing stack or mode entries.");
  }
  return parsed;
}

export async function compose(options: {
  stack: Stack;
  mode: Mode;
  root?: string;
}): Promise<{ files: ComposedFile[]; layers: string[] }> {
  const root = options.root ?? packageRoot;
  const config = await loadLayers(root);
  const layers = layersFor(options.stack, options.mode, config);
  const merged = new Map<string, { contents: string; layer: string }>();

  for (const layer of layers) {
    assertSafeLayer(layer);
    const layerDir = join(root, "templates", ...layer.split("/"));
    const paths = await walk(layerDir, layer);
    for (const absolute of paths) {
      const relativePath = toPosix(relative(layerDir, absolute));
      assertSafeRelative(relativePath);
      if (relativePath.startsWith(CURSOR_SKILL_PREFIX)) {
        throw new KeelsonError(
          `Layer ${layer} must not include ${relativePath}. Keelson mirrors .agents/skills into .cursor/skills.`,
        );
      }
      const contents = await readFile(absolute, "utf8");
      const existing = merged.get(relativePath);
      if (existing && existing.contents !== contents) {
        throw new KeelsonError(
          `Template conflict for ${relativePath} between ${existing.layer} and ${layer}.`,
        );
      }
      merged.set(relativePath, { contents, layer });
    }
  }

  const tokens = { stackLabel: STACK_LABELS[options.stack], mode: options.mode };
  const files: ComposedFile[] = [];
  for (const [relativePath, entry] of merged) {
    files.push({
      relativePath,
      contents: applyTokens(relativePath, entry.contents, tokens),
    });
  }
  files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  const mirrored = files.flatMap((file) => {
    if (!file.relativePath.startsWith(SKILL_PREFIX)) return [];
    return [
      {
        relativePath: CURSOR_SKILL_PREFIX + file.relativePath.slice(SKILL_PREFIX.length),
        contents: file.contents,
      },
    ];
  });

  return { files: [...files, ...mirrored], layers };
}

export function describeLayers(config: LayersFile): string {
  const lines: string[] = [];
  for (const [stack, layers] of Object.entries(config.stacks)) {
    lines.push(stack);
    for (const layer of layers) lines.push(`  ${layer}`);
    for (const [mode, modeLayers] of Object.entries(config.modes)) {
      lines.push(`  + ${mode}: ${modeLayers.join(", ")}`);
    }
    lines.push("");
  }
  return lines.join("\n").trimEnd();
}

async function walk(dir: string, layer: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (isEnoent(error)) throw new KeelsonError(`Missing template layer: ${layer}`);
    throw error;
  }

  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full, layer)));
    else if (entry.isFile()) files.push(full);
  }
  return files.sort((a, b) => a.localeCompare(b));
}

function assertSafeLayer(layer: string): void {
  if (layer.length === 0 || layer.split("/").some((part) => part === "" || part === "." || part === "..")) {
    throw new KeelsonError(`Unsafe layer id: ${layer}`);
  }
}

function assertSafeRelative(relativePath: string): void {
  if (
    relativePath.length === 0 ||
    relativePath.split("/").some((part) => part === "" || part === "." || part === "..")
  ) {
    throw new KeelsonError(`Unsafe template path: ${relativePath}`);
  }
}

function toPosix(value: string): string {
  return value.split("\\").join("/");
}

function isLayersFile(value: unknown): value is LayersFile {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return hasStringArray(record.stacks, ["nextjs-nestjs", "nextjs-dotnet"]) &&
    hasStringArray(record.modes, ["new", "existing", "migration"]);
}

function hasStringArray(value: unknown, keys: string[]): boolean {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return keys.every((key) => {
    const entry = record[key];
    return Array.isArray(entry) && entry.every((item) => typeof item === "string");
  });
}

function isEnoent(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
