import { IDocumentRepository } from "@/application/ports/IDocumentRepository";

export class DeleteDocument {
  constructor(private documentRepo: IDocumentRepository) {}

  async execute(serviceId: string, docName: string, userId: string): Promise<void> {
    await this.documentRepo.delete(serviceId, docName, userId);
  }
}
