import { UploadedDocument } from "@/pages/dashboard/onboarding/types";

export interface IDocumentRepository {
  countByProcessId(processId: string): Promise<number>;
  findByServiceId(serviceId: string, userId: string): Promise<UploadedDocument[]>;
  save(userId: string, serviceId: string, doc: UploadedDocument): Promise<void>;
  delete(serviceId: string, docName: string, userId: string): Promise<void>;
}
