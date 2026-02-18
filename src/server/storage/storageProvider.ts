import { Readable } from 'stream';

export interface StorageProvider {
  /**
   * Saves a file to the storage system.
   * @param file - The file content as a Buffer or Readable stream.
   * @param storageKey - A unique key for the file (e.g., "booking/123/uuid").
   */
  save(file: Buffer | ReadableStream | Readable, storageKey: string): Promise<void>;

  /**
   * Retrieves a stream for a file from storage.
   * @param storageKey - The unique key of the file.
   */
  getStream(storageKey: string): Promise<Readable>;

  /**
   * Deletes a file from storage.
   * @param storageKey - The unique key of the file.
   */
  delete(storageKey: string): Promise<void>;
}
