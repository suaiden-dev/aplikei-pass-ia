export const packageService = {
  async mergeAndUploadPackage(processId: string, userId: string) {
    const content = `Pacote final Aplikei\nProcesso: ${processId}\nUsuário: ${userId}`;
    return URL.createObjectURL(new Blob([content], { type: "application/pdf" }));
  },
};
