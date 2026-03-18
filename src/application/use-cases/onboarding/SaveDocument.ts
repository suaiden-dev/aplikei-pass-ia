import { IDocumentRepository } from "@/application/ports/IDocumentRepository";
import { UploadedDocument } from "@/pages/dashboard/onboarding/types";

export class SaveDocument {
  constructor(private documentRepo: IDocumentRepository) {}

  async execute(userId: string, serviceId: string, doc: UploadedDocument): Promise<void> {
    await this.documentRepo.save(userId, serviceId, doc);
  }
}
