import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { spawn } from "node:child_process";

const root = resolve(dirname(new URL(import.meta.url).pathname), "..");
const mode = process.argv.includes("--remote") ? "remote" : "local";
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const output = resolve(root, "backup-output", `notescloud-backup-${stamp}`);
const excluded = new Set([".git", "node_modules", ".wrangler", "backup-output"]);

async function copyTree(source, target) {
  await mkdir(target, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const from = join(source, entry.name);
    const to = join(target, entry.name);
    if (entry.isDirectory()) await copyTree(from, to);
    else if (entry.isFile()) await cp(from, to);
  }
}

function run(command, args) {
  return new Promise((resolveRun) => {
    const child = spawn(command, args, { cwd: root, stdio: "inherit", shell: process.platform === "win32" });
    child.on("error", () => resolveRun(false));
    child.on("exit", (code) => resolveRun(code === 0));
  });
}

await copyTree(root, join(output, "source"));
await mkdir(join(output, "data"), { recursive: true });
const dump = join(output, "data", `${mode}-d1.sql`);
const exported = await run(process.platform === "win32" ? "npx.cmd" : "npx", ["wrangler", "d1", "export", "notes-db", `--${mode}`, `--output=${dump}`]);
if (!exported) {
  await writeFile(join(output, "data", "EXPORT_NOT_CREATED.txt"), `D1 ${mode} export failed or was unavailable.\nRun: npx wrangler d1 export notes-db --${mode} --output=data/${mode}-d1.sql\n`);
}
const manifest = {
  format: 1,
  created_at: new Date().toISOString(),
  mode,
  source: "NotesCloud workspace copy excluding .git, node_modules, .wrangler, and backup-output",
  d1_export: exported ? relative(output, dump) : null,
  restore: [
    "Copy source/ to a new machine.",
    "Run npm install.",
    "Set a real database_id in wrangler.toml or a private deployment override.",
    `Apply data/${mode}-d1.sql with Wrangler if the export exists.`,
  ],
};
await writeFile(join(output, "MANIFEST.json"), JSON.stringify(manifest, null, 2));
const restore = [
  "# NotesCloud backup restore",
  "",
  `Created: ${manifest.created_at}`,
  `Mode: ${mode}`,
  "",
  "1. Copy the **source** directory to a new machine.",
  "2. Install Node.js (LTS), then run `npm install`.",
  "3. Configure Cloudflare Wrangler and set a new/private D1 database ID.",
  "4. Apply the SQL export when present:",
  "",
  "```bash",
  `npx wrangler d1 execute notes-db --${mode} --file=./data/${mode}-d1.sql`,
  "```",
  "",
  "This backup intentionally excludes credentials, `.wrangler` cache files, and `node_modules`; those are machine-specific and must not be copied into a public repository.",
  "",
].join("\\n");
await writeFile(join(output, "RESTORE.md"), restore);
console.log(`Backup created at: ${output}`);
