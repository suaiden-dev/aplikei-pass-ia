export const storageService = {
  async uploadProfilePhoto(_userId: string, file: File): Promise<string> {
    return URL.createObjectURL(file);
  },
};
