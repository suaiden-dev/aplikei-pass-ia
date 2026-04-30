import { notificationService } from "./notification.service";

export type COSNotificationEvent =
  | "motion_denial_letter_uploaded"
  | "motion_supporting_docs_uploaded"
  | "motion_reason_submitted"
  | "rfe_letter_uploaded"
  | "rfe_description_submitted"
  | "uscis_result_reported"   // NOVO
  | "motion_started"          // NOVO
  | "rfe_started"             // NOVO
  | "motion_result_reported"  // NOVO
  | "rfe_result_reported";     // NOVO

export interface COSNotificationParams {
  event: COSNotificationEvent;
  processId: string;
  userId: string;
  metadata?: Record<string, unknown>;
}

export const cosNotificationService = {
  async notifyAdmin(params: COSNotificationParams): Promise<void> {
    const titles: Record<COSNotificationEvent, string> = {
      motion_denial_letter_uploaded: "Carta de negativa enviada",
      motion_supporting_docs_uploaded: "Docs de apoio Motion enviados",
      motion_reason_submitted: "Cliente descreveu caso Motion",
      rfe_letter_uploaded: "Carta RFE enviada",
      rfe_description_submitted: "Cliente descreveu caso RFE",
      uscis_result_reported: "Cliente informou resultado USCIS",
      motion_started: "Workflow Motion iniciado",
      rfe_started: "Workflow RFE iniciado",
      motion_result_reported: "Cliente informou resultado Motion",
      rfe_result_reported: "Cliente informou resultado RFE",
    };

    await notificationService.notifyAdmin({
      title: titles[params.event] ?? params.event,
      serviceId: params.processId,
      userId: params.userId,
      link: `/admin/cases?id=${params.processId}`,
    });
  },
};
