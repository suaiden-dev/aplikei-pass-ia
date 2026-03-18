export interface IStorageService {
  uploadFile(bucket: string, path: string, file: File): Promise<{ path: string; error: string | null }>;
  getPublicUrl(bucket: string, path: string): string;
  createSignedUrl(bucket: string, path: string, expiresIn: number): Promise<string | null>;
}
