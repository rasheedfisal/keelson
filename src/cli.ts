#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";

import * as p from "@clack/prompts";

import { describeLayers, loadLayers, packageRoot } from "./compose.ts";
import { KeelsonError, isMode, isStack } from "./types.ts";
import type { ConflictChoice, Mode, Stack } from "./types.ts";
import { install } from "./write.ts";
import type { WriteReport } from "./write.ts";

const HELP = `keelson — install an engineering spine into a repository

Usage:
  keelson init [--stack nextjs-nestjs|nextjs-dotnet] [--mode new|existing|migration] [--dir <path>] [--yes] [--force]
  keelson update [--dir <path>] [--yes] [--force]
  keelson layers

keelson does not create the Next.js, NestJS, or .NET application.
It writes AGENTS.md, docs, and skills for the chosen stack and mode.
`;

export async function main(argv: string[]): Promise<number> {
  let values: {
    stack?: string;
    mode?: string;
    dir?: string;
    yes?: boolean;
    force?: boolean;
    help?: boolean;
  };
  let positionals: string[];
  try {
    const parsed = parseArgs({
      args: argv,
      options: {
        stack: { type: "string" },
        mode: { type: "string" },
        dir: { type: "string" },
        yes: { type: "boolean", default: false },
        force: { type: "boolean", default: false },
        help: { type: "boolean", short: "h", default: false },
      },
      allowPositionals: true,
      strict: true,
    });
    values = parsed.values;
    positionals = parsed.positionals;
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    console.error(HELP);
    return 1;
  }

  if (values.help) {
    console.log(HELP);
    return 0;
  }

  const command = positionals[0] ?? (isInteractive() && !values.yes ? "init" : "");
  if (positionals.length > 1 || !isCommand(command)) {
    console.error(HELP);
    return 1;
  }

  if (command === "layers") {
    const config = await loadLayers();
    console.log(describeLayers(config));
    return 0;
  }

  if (command === "update" && (values.stack !== undefined || values.mode !== undefined)) {
    throw new KeelsonError("update uses the stack and mode in .keelson.json. Omit --stack and --mode.");
  }

  const yes = values.yes === true;
  const force = values.force === true;
  if (isInteractive() && !yes) p.intro("keelson");

  const dir = await resolveDir(values.dir, yes);
  if (dir === "cancel") {
    p.cancel("Cancelled.");
    return 0;
  }

  let stack: Stack | undefined;
  let mode: Mode | undefined;
  if (command === "init") {
    const resolvedStack = await resolveStack(values.stack, yes);
    const resolvedMode = await resolveMode(values.mode, yes);
    if (resolvedStack === "cancel" || resolvedMode === "cancel") {
      p.cancel("Cancelled.");
      return 0;
    }
    if (!resolvedStack || !resolvedMode) {
      throw new KeelsonError(
        "init requires --stack and --mode when prompts are disabled. Pass both flags, or run keelson init in a terminal.",
      );
    }
    stack = resolvedStack;
    mode = resolvedMode;
  }

  const report = await install({
    dir,
    command,
    stack,
    mode,
    yes,
    force,
    toolVersion: await readToolVersion(),
    resolveConflicts: promptConflicts,
  });
  printReport(report);
  return 0;
}

async function resolveStack(flag: string | undefined, yes: boolean): Promise<Stack | "cancel" | undefined> {
  if (flag !== undefined) {
    if (!isStack(flag)) throw new KeelsonError(`Unknown stack "${flag}". Use nextjs-nestjs or nextjs-dotnet.`);
    return flag;
  }
  if (yes || !isInteractive()) return undefined;
  const selected = await p.select({
    message: "Stack",
    options: [
      { value: "nextjs-nestjs" as const, label: "Next.js + NestJS", hint: "PostgreSQL and Drizzle" },
      { value: "nextjs-dotnet" as const, label: "Next.js + .NET", hint: "PostgreSQL, EF Core, and Dapper" },
    ],
  });
  if (p.isCancel(selected)) return "cancel";
  return selected;
}

async function resolveMode(flag: string | undefined, yes: boolean): Promise<Mode | "cancel" | undefined> {
  if (flag !== undefined) {
    if (!isMode(flag)) throw new KeelsonError(`Unknown mode "${flag}". Use new, existing, or migration.`);
    return flag;
  }
  if (yes || !isInteractive()) return undefined;
  const selected = await p.select({
    message: "Is this a new app, an existing app, or a migration?",
    options: [
      { value: "new" as const, label: "New app", hint: "Scope, architecture, then build" },
      { value: "existing" as const, label: "Existing app", hint: "Audit the repo before changing it" },
      { value: "migration" as const, label: "Migration", hint: "Document the legacy system, then move it" },
    ],
  });
  if (p.isCancel(selected)) return "cancel";
  return selected;
}

async function resolveDir(flag: string | undefined, yes: boolean): Promise<string | "cancel"> {
  if (flag !== undefined) return resolve(flag);
  if (yes || !isInteractive()) return process.cwd();
  const selected = await p.text({
    message: "Target directory",
    defaultValue: process.cwd(),
    placeholder: process.cwd(),
  });
  if (p.isCancel(selected)) return "cancel";
  const trimmed = selected.trim();
  return resolve(trimmed.length > 0 ? trimmed : process.cwd());
}

async function promptConflicts(conflicts: string[]): Promise<ConflictChoice> {
  const preview = conflicts.slice(0, 20);
  const extra = conflicts.length - preview.length;
  p.log.message([preview.join("\n"), extra > 0 ? `… and ${extra} more` : ""].filter(Boolean).join("\n"));
  const choice = await p.select({
    message: `${conflicts.length} existing file(s) differ from keelson`,
    options: [
      { value: "skip" as const, label: "Keep the existing files" },
      { value: "overwrite" as const, label: "Overwrite them with keelson templates" },
      { value: "cancel" as const, label: "Cancel without writing" },
    ],
  });
  if (p.isCancel(choice)) return "cancel";
  return choice;
}

function printReport(report: WriteReport): void {
  if (report.cancelled) {
    p.cancel("Cancelled. No files were written.");
    return;
  }
  p.log.success(`Wrote ${report.written.length} file(s).`);
  if (report.unchanged.length > 0) p.log.info(`Unchanged ${report.unchanged.length} file(s).`);
  if (report.kept.length > 0) {
    p.log.warn(`Kept local edits in ${report.kept.length} file(s):`);
    p.log.message(report.kept.map((file) => `  ${file}`).join("\n"));
  }
  p.outro("Recorded .keelson.json");
}

async function readToolVersion(): Promise<string> {
  const raw = await readFile(joinPackageJson(), "utf8");
  const parsed = JSON.parse(raw) as { version?: unknown };
  if (typeof parsed.version !== "string") throw new KeelsonError("package.json is missing a version.");
  return parsed.version;
}

function joinPackageJson(): string {
  return join(packageRoot, "package.json");
}

function isCommand(value: string): value is "init" | "update" | "layers" {
  return value === "init" || value === "update" || value === "layers";
}

function isInteractive(): boolean {
  return process.stdin.isTTY === true && process.stdout.isTTY === true;
}

const invokedDirectly =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  main(process.argv.slice(2))
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error: unknown) => {
      if (error instanceof KeelsonError) console.error(error.message);
      else console.error(error);
      process.exitCode = 1;
    });
}
