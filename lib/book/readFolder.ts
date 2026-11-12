import type { SourceFile } from "@/lib/book/types";

export interface PickedFile {
  path: string;
  file: File;
}

const SKIPPED = /(^|\/)(node_modules|\.git)(\/|$)/;
const MARKDOWN = /\.(md|markdown)$/i;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

export function folderNameOf(list: FileList): string {
  const first = list[0]?.webkitRelativePath ?? "";
  return first.includes("/") ? first.split("/")[0] : "";
}

export function fromFileList(list: FileList): PickedFile[] {
  return Array.from(list).map((file) => {
    const segments = (file.webkitRelativePath || file.name).split("/");
    return { path: segments.length > 1 ? segments.slice(1).join("/") : segments[0], file };
  });
}

function readEntries(reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
  return new Promise((resolve, reject) => reader.readEntries(resolve, reject));
}

function entryFile(entry: FileSystemFileEntry): Promise<File> {
  return new Promise((resolve, reject) => entry.file(resolve, reject));
}

async function walk(entry: FileSystemEntry, prefix: string, out: PickedFile[]): Promise<void> {
  const path = prefix ? `${prefix}/${entry.name}` : entry.name;
  if (SKIPPED.test(path)) {
    return;
  }
  if (entry.isFile) {
    if (MARKDOWN.test(entry.name)) {
      out.push({ path, file: await entryFile(entry as FileSystemFileEntry) });
    }
    return;
  }
  const reader = (entry as FileSystemDirectoryEntry).createReader();
  for (;;) {
    const batch = await readEntries(reader);
    if (batch.length === 0) {
      break;
    }
    for (const child of batch) {
      await walk(child, path, out);
    }
  }
}

// Reads a dropped folder. The entries must be collected before the first await.
export async function fromDataTransfer(transfer: DataTransfer): Promise<{ files: PickedFile[]; folderName: string }> {
  const entries = Array.from(transfer.items)
    .map((item) => item.webkitGetAsEntry())
    .filter((entry): entry is FileSystemEntry => entry !== null);

  const single = entries.length === 1 && entries[0].isDirectory ? entries[0] : undefined;
  const files: PickedFile[] = [];
  if (single) {
    const reader = (single as FileSystemDirectoryEntry).createReader();
    for (;;) {
      const batch = await readEntries(reader);
      if (batch.length === 0) {
        break;
      }
      for (const child of batch) {
        await walk(child, "", files);
      }
    }
  } else {
    for (const entry of entries) {
      await walk(entry, "", files);
    }
  }
  return { files, folderName: single?.name ?? "" };
}

export async function readSources(picked: PickedFile[]): Promise<{ sources: SourceFile[]; skipped: number }> {
  const candidates = picked.filter((item) => MARKDOWN.test(item.path) && !SKIPPED.test(item.path));
  let skipped = 0;
  const sources: SourceFile[] = [];

  for (let start = 0; start < candidates.length; start += 40) {
    const batch = candidates.slice(start, start + 40);
    const texts = await Promise.all(
      batch.map(async (item) => (item.file.size > MAX_FILE_BYTES ? undefined : item.file.text())),
    );
    batch.forEach((item, index) => {
      const content = texts[index];
      if (content === undefined) {
        skipped += 1;
      } else {
        sources.push({ path: item.path, content });
      }
    });
  }
  return { sources, skipped };
}
