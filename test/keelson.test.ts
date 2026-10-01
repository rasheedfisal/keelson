import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { applyTokens, compose, layersFor, loadLayers } from "../src/compose.ts";
import { hashContent, readManifest } from "../src/manifest.ts";
import { KeelsonError } from "../src/types.ts";
import type { Mode, Stack } from "../src/types.ts";
import { applyInstall, install } from "../src/write.ts";

const stacks = ["nextjs-nestjs", "nextjs-dotnet"] as const satisfies readonly Stack[];
const modes = ["new", "existing", "migration"] as const satisfies readonly Mode[];

const stackLayers: Record<Stack, string[]> = {
  "nextjs-nestjs": ["core", "stacks/nextjs", "stacks/nestjs", "data/postgres", "data/drizzle"],
  "nextjs-dotnet": ["core", "stacks/nextjs", "stacks/dotnet", "data/postgres", "data/efcore-dapper"],
};

function skillNames(files: { relativePath: string; contents: string }[]): string[] {
  return files
    .filter((file) => file.relativePath.startsWith(".agents/skills/") && file.relativePath.endsWith("/SKILL.md"))
    .map((file) => {
      const name = file.relativePath.split("/")[2];
      assert.equal(file.contents.match(/^name: (.+)$/m)?.[1], name);
      return name ?? "";
    })
    .sort();
}

test("layers.json selects the stack layers plus one mode for all six pairs", async () => {
  const config = await loadLayers();
  for (const stack of stacks) {
    for (const mode of modes) {
      assert.deepEqual(layersFor(stack, mode, config), [...stackLayers[stack], `modes/${mode}`]);
    }
  }
});

test("tokens are replaced only in the root AGENTS.md", () => {
  assert.equal(
    applyTokens("AGENTS.md", "Hello {{STACK_LABEL}} / {{MODE}}", { stackLabel: "S", mode: "migration" }),
    "Hello S / migration",
  );
  assert.equal(
    applyTokens("apps/web/AGENTS.md", "{{STACK_LABEL}} {{MODE}}", { stackLabel: "S", mode: "new" }),
    "{{STACK_LABEL}} {{MODE}}",
  );
});

test("compose installs the skills and docs for every stack and mode", async () => {
  for (const stack of stacks) {
    for (const mode of modes) {
      const { files } = await compose({ stack, mode });
      const skills = skillNames(files);

      for (const name of ["scope", "architecture", "debug", "verify", "review", "document", "nextjs", "postgres"]) {
        assert.ok(skills.includes(name), `${stack} ${mode} missing ${name}`);
      }

      const agents = files.find((file) => file.relativePath === "AGENTS.md");
      assert.ok(agents);
      assert.match(agents.contents, /Keelson mode: (new|existing|migration)\./);
      assert.equal(agents.contents.includes("{{STACK_LABEL}}"), false);
      assert.equal(agents.contents.includes("{{MODE}}"), false);
      assert.equal(agents.contents.includes(stack === "nextjs-nestjs" ? "Drizzle" : "EF Core/Dapper"), true);

      for (const file of files) {
        if (file.relativePath === "AGENTS.md") continue;
        assert.equal(file.contents.includes("{{STACK_LABEL}}"), false, file.relativePath);
        assert.equal(file.contents.includes("{{MODE}}"), false, file.relativePath);
      }

      for (const file of files) {
        if (!file.relativePath.startsWith(".agents/skills/")) continue;
        const mirror = `.cursor/skills/${file.relativePath.slice(".agents/skills/".length)}`;
        const copied = files.find((item) => item.relativePath === mirror);
        assert.ok(copied, mirror);
        assert.equal(copied.contents, file.contents);
      }

      assert.equal(files.some((file) => file.relativePath.startsWith(".cursor/skills/") && file.relativePath.includes("/.agents/")), false);
    }
  }
});

test("NestJS and .NET compositions do not overlap", async () => {
  const nest = skillNames((await compose({ stack: "nextjs-nestjs", mode: "new" })).files);
  const dotnet = skillNames((await compose({ stack: "nextjs-dotnet", mode: "existing" })).files);

  assert.deepEqual(
    nest.filter((name) => ["nestjs-modular", "drizzle", "develop", "dotnet-modular", "ef-core", "dapper", "audit", "migration"].includes(name)).sort(),
    ["develop", "drizzle", "nestjs-modular"],
  );
  assert.deepEqual(
    dotnet.filter((name) => ["nestjs-modular", "drizzle", "develop", "dotnet-modular", "ef-core", "dapper", "audit", "migration"].includes(name)).sort(),
    ["audit", "dapper", "dotnet-modular", "ef-core"],
  );

  const nestApi = (await compose({ stack: "nextjs-nestjs", mode: "new" })).files.find((file) => file.relativePath === "apps/api/AGENTS.md");
  const dotnetApi = (await compose({ stack: "nextjs-dotnet", mode: "existing" })).files.find((file) => file.relativePath === "apps/api/AGENTS.md");
  assert.match(nestApi?.contents ?? "", /drizzle/);
  assert.match(dotnetApi?.contents ?? "", /dapper/);
});

test("migration mode adds the phase files and migration skills only", async () => {
  const { files } = await compose({ stack: "nextjs-nestjs", mode: "migration" });
  const skills = skillNames(files);
  for (const name of ["migration", "migration-inventory", "migration-mapping", "data-migration", "migration-parity", "migration-cutover"]) {
    assert.ok(skills.includes(name), name);
  }
  assert.equal(skills.includes("develop"), false);
  assert.equal(skills.includes("audit"), false);
  for (const phase of ["01-inventory", "02-behavior", "03-mapping", "04-data-plan", "05-incremental-build", "06-parity", "07-cutover"]) {
    assert.ok(files.some((file) => file.relativePath === `docs/migration/${phase}.md`), phase);
  }
  const quiet = await compose({ stack: "nextjs-dotnet", mode: "new" });
  assert.equal(quiet.files.some((file) => file.relativePath.startsWith("docs/migration/")), false);
});

test("init keeps a modified file unless --force is set", async () => {
  const dir = await mkdtemp(join(tmpdir(), "keelson-"));
  try {
    await install({
      dir,
      command: "init",
      stack: "nextjs-nestjs",
      mode: "migration",
      yes: true,
      force: false,
      toolVersion: "0.1.0",
    });

    const agentsPath = join(dir, "AGENTS.md");
    const agentSkill = await readFile(join(dir, ".agents", "skills", "scope", "SKILL.md"), "utf8");
    const cursorSkill = await readFile(join(dir, ".cursor", "skills", "scope", "SKILL.md"), "utf8");
    assert.equal(cursorSkill, agentSkill);

    const original = await readFile(agentsPath, "utf8");
    const before = await readManifest(dir);
    assert.equal(before?.files["AGENTS.md"], hashContent(original));
    assert.equal(before?.files[".agents/skills/scope/SKILL.md"], before?.files[".cursor/skills/scope/SKILL.md"]);

    await writeFile(agentsPath, `${original}\nuser edit\n`, "utf8");
    const kept = await install({
      dir,
      command: "init",
      stack: "nextjs-nestjs",
      mode: "migration",
      yes: true,
      force: false,
      toolVersion: "0.1.0",
    });
    assert.ok(kept.kept.includes("AGENTS.md"));
    assert.match(await readFile(agentsPath, "utf8"), /user edit/);
    assert.equal((await readManifest(dir))?.files["AGENTS.md"], hashContent(original));

    await install({
      dir,
      command: "init",
      stack: "nextjs-nestjs",
      mode: "migration",
      yes: true,
      force: true,
      toolVersion: "0.1.0",
    });
    const replaced = await readFile(agentsPath, "utf8");
    assert.equal(replaced.includes("user edit"), false);
    assert.match(replaced, /Next\.js \+ NestJS \+ Drizzle \+ PostgreSQL/);
    assert.equal((await readManifest(dir))?.files["AGENTS.md"], hashContent(replaced));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("update refreshes an owned file and does not prompt over a local edit", async () => {
  const dir = await mkdtemp(join(tmpdir(), "keelson-"));
  try {
    await applyInstall({
      dir,
      command: "init",
      stack: "nextjs-nestjs",
      mode: "new",
      layers: ["core"],
      toolVersion: "0.1.0",
      yes: true,
      files: [{ relativePath: "AGENTS.md", contents: "version-one\n" }],
    });

    const refreshed = await applyInstall({
      dir,
      command: "update",
      stack: "nextjs-nestjs",
      mode: "new",
      layers: ["core"],
      toolVersion: "0.2.0",
      files: [{ relativePath: "AGENTS.md", contents: "version-two\n" }],
    });
    assert.deepEqual(refreshed.written, ["AGENTS.md"]);
    assert.equal(await readFile(join(dir, "AGENTS.md"), "utf8"), "version-two\n");

    await writeFile(join(dir, "AGENTS.md"), "local edit\n", "utf8");
    let prompted = false;
    const kept = await applyInstall({
      dir,
      command: "update",
      stack: "nextjs-nestjs",
      mode: "new",
      layers: ["core"],
      toolVersion: "0.2.0",
      files: [
        { relativePath: "AGENTS.md", contents: "version-three\n" },
        { relativePath: "NOTES.md", contents: "note\n" },
      ],
      resolveConflicts: async () => {
        prompted = true;
        return "overwrite";
      },
    });
    assert.equal(prompted, false);
    assert.deepEqual(kept.kept, ["AGENTS.md"]);
    assert.deepEqual(kept.written, ["NOTES.md"]);
    assert.equal(await readFile(join(dir, "AGENTS.md"), "utf8"), "local edit\n");
    assert.equal((await readManifest(dir))?.toolVersion, "0.2.0");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("update refuses a directory that has not been initialized", async () => {
  const dir = await mkdtemp(join(tmpdir(), "keelson-empty-"));
  try {
    await assert.rejects(
      () => install({ dir, command: "update", toolVersion: "0.1.0" }),
      (error: unknown) => error instanceof KeelsonError && /keelson init first/.test(error.message),
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("cancelling a conflict writes nothing", async () => {
  const dir = await mkdtemp(join(tmpdir(), "keelson-"));
  try {
    await applyInstall({
      dir,
      command: "init",
      stack: "nextjs-dotnet",
      mode: "existing",
      layers: ["core"],
      toolVersion: "0.1.0",
      yes: true,
      files: [{ relativePath: "AGENTS.md", contents: "owned\n" }],
    });
    await writeFile(join(dir, "AGENTS.md"), "edited\n", "utf8");
    const installedAt = (await readManifest(dir))?.installedAt;

    const report = await applyInstall({
      dir,
      command: "init",
      stack: "nextjs-dotnet",
      mode: "existing",
      layers: ["core"],
      toolVersion: "0.1.0",
      files: [
        { relativePath: "AGENTS.md", contents: "replacement\n" },
        { relativePath: "NOTES.md", contents: "should not appear\n" },
      ],
      resolveConflicts: async () => "cancel",
    });

    assert.equal(report.cancelled, true);
    assert.equal(await readFile(join(dir, "AGENTS.md"), "utf8"), "edited\n");
    await assert.rejects(readFile(join(dir, "NOTES.md"), "utf8"));
    assert.equal((await readManifest(dir))?.installedAt, installedAt);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
