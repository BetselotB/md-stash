import { zipSync, unzipSync, strToU8, strFromU8 } from 'fflate';
import { StashFile, Collection } from '../domain/types';
import { filesRepo } from '../db/files.repo';
import { collectionsRepo } from '../db/collections.repo';
import { extractTitle } from '../domain/titleFromContent';

export interface ExportManifest {
  version: 1;
  exportedAt: number;
  collections: Collection[];
  files: Array<Omit<StashFile, 'content'>>;
}

export const importExportService = {
  createZipBuffer(files: StashFile[], collections: Collection[]): Uint8Array {
    const collectionMap = new Map(collections.map((c) => [c.id, c.name]));
    const zipData: Record<string, Uint8Array> = {};

    const manifest: ExportManifest = {
      version: 1,
      exportedAt: Date.now(),
      collections,
      files: files.map(({ content, ...meta }) => meta),
    };
    zipData['manifest.json'] = strToU8(JSON.stringify(manifest, null, 2));

    for (const file of files) {
      const collectionName = file.collectionId ? collectionMap.get(file.collectionId) : null;
      const sanitizedFolder = collectionName
        ? collectionName.replace(/[/\\?%*:|"<>]/g, '_')
        : 'Unsorted';
      const sanitizedFilename = file.filename.replace(/[/\\?%*:|"<>]/g, '_');
      const filePath = `${sanitizedFolder}/${sanitizedFilename}`;

      zipData[filePath] = strToU8(file.content);
    }

    return zipSync(zipData);
  },

  async exportZip(files: StashFile[], collections: Collection[]): Promise<void> {
    const zipped = this.createZipBuffer(files, collections);
    const blob = new Blob([zipped as any], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `mdstash-backup-${dateStr}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  async importZipBuffer(buffer: Uint8Array): Promise<{ filesCount: number; collectionsCount: number }> {
    const unzipped = unzipSync(buffer);

    let importedFiles = 0;
    let importedCollections = 0;

    // Check for manifest.json
    if (unzipped['manifest.json']) {
      try {
        const manifestStr = strFromU8(unzipped['manifest.json']);
        const manifest: ExportManifest = JSON.parse(manifestStr);

        // Import collections preserving IDs
        for (const col of manifest.collections) {
          const existing = await collectionsRepo.getById(col.id);
          if (!existing) {
            await collectionsRepo.create(col);
            importedCollections++;
          }
        }

        // Import files
        for (const [path, u8] of Object.entries(unzipped)) {
          if (path === 'manifest.json' || path.endsWith('/')) continue;
          if (!path.match(/\.(md|markdown|txt)$/i)) continue;

          const content = strFromU8(u8);
          const parts = path.split('/');
          const filename = parts[parts.length - 1];
          const folderName = parts.length > 1 ? parts[0] : null;

          const targetCol = folderName && folderName !== 'Unsorted'
            ? manifest.collections.find((c) => c.name.replace(/[/\\?%*:|"<>]/g, '_') === folderName)
            : null;

          const matchedMeta = manifest.files.find((m) =>
            m.filename === filename && (targetCol ? m.collectionId === targetCol.id : m.collectionId === null)
          ) || manifest.files.find((m) => m.filename === filename);

          const existing = await filesRepo.findDuplicate(filename, content);
          if (!existing) {
            await filesRepo.create({
              id: matchedMeta?.id,
              title: matchedMeta ? matchedMeta.title : extractTitle(content, filename),
              filename,
              content,
              collectionId: matchedMeta?.collectionId || null,
              tags: matchedMeta?.tags || [],
              pinned: matchedMeta?.pinned || false,
              size: content.length,
            });
            importedFiles++;
          }
        }

        return { filesCount: importedFiles, collectionsCount: importedCollections };
      } catch (err) {
        console.error('Failed to parse manifest, falling back to folder import', err);
      }
    }

    // Fallback: raw folder-based zip import
    const folderToColId = new Map<string, string>();

    for (const [path, u8] of Object.entries(unzipped)) {
      if (path.endsWith('/') || !path.match(/\.(md|markdown|txt)$/i)) continue;

      const content = strFromU8(u8);
      const parts = path.split('/');
      const filename = parts.pop()!;
      const folder = parts.length > 0 ? parts[0] : null;

      let collectionId: string | null = null;
      if (folder && folder !== 'Unsorted') {
        if (!folderToColId.has(folder)) {
          const newCol = await collectionsRepo.create({
            name: folder,
            color: '#C99AB5',
            icon: 'folder',
            order: 99,
          });
          folderToColId.set(folder, newCol.id);
          importedCollections++;
        }
        collectionId = folderToColId.get(folder)!;
      }

      const existing = await filesRepo.findDuplicate(filename, content);
      if (!existing) {
        await filesRepo.create({
          title: extractTitle(content, filename),
          filename,
          content,
          collectionId,
          tags: [],
          pinned: false,
          size: content.length,
        });
        importedFiles++;
      }
    }

    return { filesCount: importedFiles, collectionsCount: importedCollections };
  },

  async importZip(file: File): Promise<{ filesCount: number; collectionsCount: number }> {
    const arrayBuffer = await file.arrayBuffer();
    return await this.importZipBuffer(new Uint8Array(arrayBuffer));
  },
};
