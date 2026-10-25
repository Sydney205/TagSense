import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const temporaryDirectory = await mkdtemp(join(tmpdir(), "tagsense-tests-"));
const testBundle = join(temporaryDirectory, "intellisense.test.cjs");

try {
  await build({
    entryPoints: ["tests/intellisense.test.ts"],
    bundle: true,
    platform: "node",
    format: "cjs",
    outfile: testBundle,
  });
  const result = spawnSync(process.execPath, ["--test", testBundle], { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exitCode = result.status ?? 1;
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
