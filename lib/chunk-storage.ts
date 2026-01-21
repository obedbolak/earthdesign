// lib/chunk-storage.ts
// In-memory storage for video chunks across API routes

export interface ChunkMap {
  [chunkIndex: number]: Uint8Array;
}

export interface ChunkStorageMap {
  [sessionId: string]: ChunkMap;
}

export const chunkStorage: ChunkStorageMap = {};
