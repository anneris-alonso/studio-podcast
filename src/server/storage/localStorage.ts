import { StorageProvider } from './storageProvider';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

export class LocalStorageProvider implements StorageProvider {
  private baseDir: string;

  constructor(baseDir: string = 'uploads') {
    // Ensure absolute path
    this.baseDir = path.isAbsolute(baseDir) ? baseDir : path.resolve(process.cwd(), baseDir);
    
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  private getSafePath(storageKey: string): string {
    // Prevent path traversal by resolving and checking if it stays within baseDir
    const fullPath = path.join(this.baseDir, storageKey);
    const relative = path.relative(this.baseDir, fullPath);
    
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error('Security: Potential path traversal detected.');
    }
    
    return fullPath;
  }

  async save(file: Buffer | ReadableStream | Readable, storageKey: string): Promise<void> {
    const fullPath = this.getSafePath(storageKey);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const writeStream = fs.createWriteStream(fullPath);

    if (file instanceof Buffer) {
      writeStream.write(file);
      writeStream.end();
      return new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
    } else if (file instanceof ReadableStream) {
      // Convert Web ReadableStream to Node Readable
      const nodeReadable = Readable.fromWeb(file as any);
      await pipeline(nodeReadable, writeStream);
    } else {
      await pipeline(file, writeStream);
    }
  }

  async getStream(storageKey: string): Promise<Readable> {
    const fullPath = this.getSafePath(storageKey);
    
    if (!fs.existsSync(fullPath)) {
      throw new Error('File not found in local storage.');
    }

    return fs.createReadStream(fullPath);
  }

  async delete(storageKey: string): Promise<void> {
    const fullPath = this.getSafePath(storageKey);
    
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }
}

// Export singleton instance initialized for default 'uploads' folder
export const localStorageProvider = new LocalStorageProvider();
