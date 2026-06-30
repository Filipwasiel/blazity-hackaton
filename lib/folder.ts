import { BrandKit, FORMAT_KEYS, HistoryItem, Tone } from "./types";
import { FORMAT_FILE_NAMES, renderBrandMd, renderIdeaMd, renderOutputMd } from "./markdown";

export function isFSAPISupported(): boolean {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

export async function pickFolder(): Promise<FileSystemDirectoryHandle> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).showDirectoryPicker({ mode: "readwrite" }) as Promise<FileSystemDirectoryHandle>;
}

async function writeText(
  dir: FileSystemDirectoryHandle,
  name: string,
  text: string,
): Promise<void> {
  const fh = await dir.getFileHandle(name, { create: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = await (fh as any).createWritable();
  await w.write(text);
  await w.close();
}

async function subDir(
  parent: FileSystemDirectoryHandle,
  name: string,
): Promise<FileSystemDirectoryHandle> {
  return parent.getDirectoryHandle(name, { create: true });
}

function toSlug(idea: string): string {
  return idea
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 50);
}

export async function saveBrandKitToFolder(
  root: FileSystemDirectoryHandle,
  tone: Tone,
  kit: BrandKit,
): Promise<void> {
  const brandDir = await subDir(root, "brand");
  const config = { tone, ...kit, savedAt: new Date().toISOString() };
  await writeText(brandDir, "config.json", JSON.stringify(config, null, 2));
  await writeText(brandDir, "brand.md", renderBrandMd(tone, kit));
}

export async function saveProjectToFolder(
  root: FileSystemDirectoryHandle,
  item: HistoryItem,
): Promise<void> {
  const projectsDir = await subDir(root, "projects");
  const date = new Date(item.createdAt).toISOString().slice(0, 10);
  const folderName = `${date}_${toSlug(item.idea)}`;

  const projectDir = await subDir(projectsDir, folderName);
  await writeText(projectDir, "project.json", JSON.stringify(item, null, 2));
  await writeText(projectDir, "idea.md", renderIdeaMd(item));

  const outputsDir = await subDir(projectDir, "outputs");
  for (const key of FORMAT_KEYS) {
    await writeText(outputsDir, FORMAT_FILE_NAMES[key], renderOutputMd(key, item.formats[key]));
  }

  await updateIndex(root, item, folderName);
}

async function updateIndex(
  root: FileSystemDirectoryHandle,
  item: HistoryItem,
  folderName: string,
): Promise<void> {
  let entries: Array<{ id: string; slug: string; idea: string; createdAt: number }> = [];
  try {
    const fh = await root.getFileHandle("index.json");
    const file = await fh.getFile();
    const parsed = JSON.parse(await file.text()) as { projects?: typeof entries };
    if (Array.isArray(parsed.projects)) entries = parsed.projects;
  } catch {
    // index.json doesn't exist yet — start fresh
  }

  const entry = { id: item.id, slug: folderName, idea: item.idea, createdAt: item.createdAt };
  const updated = [entry, ...entries.filter((e) => e.id !== item.id)];
  await writeText(
    root,
    "index.json",
    JSON.stringify({ projects: updated, updatedAt: new Date().toISOString() }, null, 2),
  );
}
