export const STACKS = ["nextjs-nestjs", "nextjs-dotnet"] as const;
export const MODES = ["new", "existing", "migration"] as const;

export type Stack = (typeof STACKS)[number];
export type Mode = (typeof MODES)[number];
export type CommandName = "init" | "update";
export type ConflictChoice = "skip" | "overwrite" | "cancel";

export interface ComposedFile {
  relativePath: string;
  contents: string;
}

export interface LayersFile {
  stacks: Record<Stack, string[]>;
  modes: Record<Mode, string[]>;
}

export interface Manifest {
  version: 1;
  toolVersion: string;
  stack: Stack;
  mode: Mode;
  layers: string[];
  installedAt: string;
  files: Record<string, string>;
}

export class KeelsonError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KeelsonError";
  }
}

export function isStack(value: string): value is Stack {
  return (STACKS as readonly string[]).includes(value);
}

export function isMode(value: string): value is Mode {
  return (MODES as readonly string[]).includes(value);
}
