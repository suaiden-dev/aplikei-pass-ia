import { IDocumentRepository } from "@/application/ports/IDocumentRepository";
import { IStorageService } from "@/application/ports/IStorageService";
import { SupabaseDocumentRepository } from "@/infrastructure/repositories/SupabaseDocumentRepository";
import { SupabaseStorageService } from "@/infrastructure/services/SupabaseStorageService";

let documentInstance: IDocumentRepository | null = null;
let storageInstance: IStorageService | null = null;

export function getDocumentRepository(): IDocumentRepository {
  if (!documentInstance) documentInstance = new SupabaseDocumentRepository();
  return documentInstance;
}

export function getStorageService(): IStorageService {
  if (!storageInstance) storageInstance = new SupabaseStorageService();
  return storageInstance;
}
