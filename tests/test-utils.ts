import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

export async function makeTempRepo(files: Record<string, string>): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "cfr-"));
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(dir, rel);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, content, "utf8");
  }
  return dir;
}

export async function removeTempRepo(dir: string): Promise<void> {
  await fs.rm(dir, { recursive: true, force: true });
}
