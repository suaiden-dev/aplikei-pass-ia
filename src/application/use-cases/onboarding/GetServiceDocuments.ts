import { IDocumentRepository } from "@/application/ports/IDocumentRepository";
import { UploadedDocument } from "@/pages/dashboard/onboarding/types";

export class GetServiceDocuments {
  constructor(private documentRepo: IDocumentRepository) {}

  async execute(serviceId: string, userId: string): Promise<UploadedDocument[]> {
    return this.documentRepo.findByServiceId(serviceId, userId);
  }
}
