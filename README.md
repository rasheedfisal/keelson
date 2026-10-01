# Keelson

Keelson installs an engineering spine into a repository: `AGENTS.md`, docs, and skills for a Next.js modular monolith on PostgreSQL.

You create the Next.js, NestJS, or .NET application yourself. Keelson writes the files an agent reads so the stack, the module boundaries, and the database rules stay consistent from one change to the next.

## What it installs

`init` asks for a stack and a mode, then copies the matching templates into the target directory.

| Stack | What you get |
| --- | --- |
| `nextjs-nestjs` | Next.js, NestJS, PostgreSQL, Drizzle |
| `nextjs-dotnet` | Next.js, .NET, PostgreSQL, EF Core and Dapper |

| Mode | What you get |
| --- | --- |
| `new` | Scope, architecture, then build |
| `existing` | Audit the repository before changing it |
| `migration` | Inventory, behavior, mapping, data plan, parity, and cutover |

NestJS and .NET are never installed together. Drizzle and EF Core/Dapper are never installed together.

Each skill owns one job and names the skill that owns the next one. Pages stay with Next.js. Schema files stay with the ORM skill. Query plans stay with PostgreSQL. A legacy data load stays with the data-migration skill.

Skills are written to `.agents/skills/` and mirrored to `.cursor/skills/`. A `.keelson.json` manifest records the stack, the mode, and a hash of every file Keelson owns.

## Requirements

- Node.js 22.18 or newer
- A target directory. An empty folder is enough. The application code can arrive later.

## Use it from this repository

```powershell
cd E:\personal\ai-hepler
npm install
npm run build
node .\dist\cli.js init --dir E:\path\to\your-app
```

`init` prompts for the stack, the mode, and the target directory. To skip the prompts:

```powershell
node .\dist\cli.js init --stack nextjs-nestjs --mode new --dir E:\path\to\your-app --yes
```

Open the target directory in Cursor. The agent reads the installed `AGENTS.md` and the skills.

To put `keelson` on your PATH from this checkout:

```powershell
npm run build
npm link
keelson init --dir E:\path\to\your-app
```

## Commands

```text
keelson init [--stack nextjs-nestjs|nextjs-dotnet] [--mode new|existing|migration] [--dir <path>] [--yes] [--force]
keelson update [--dir <path>] [--yes] [--force]
keelson layers
```

- `init` writes the spine for the chosen stack and mode.
- `update` refreshes files that still match the manifest. It reads the stack and mode from `.keelson.json`.
- `layers` prints which layers each stack and mode include.

## Local edits

Keelson leaves a file alone when you have edited it.

- With no flag, `init` asks whether to keep your edits, overwrite them, or cancel. Cancelling writes nothing.
- `--yes` keeps your edits and lists them.
- `--force` overwrites them with the current templates.
- `update` keeps your edits unless you pass `--force`.

A later `update` still treats a skipped file as yours, so a template change does not replace it on the next refresh.
