import { notifyAdmin } from "@features/notifications/services/notify";

type CosAdminEvent =
  | "i20_uploaded"
  | "sevis_receipt_uploaded"
  | "cover_letter_completed"
  | "i539_generated"
  | "rfe_letter_uploaded"
  | "rfe_description_submitted"
  | "motion_reason_submitted"
  | "motion_denial_letter_uploaded"
  | "motion_supporting_docs_uploaded"
  | "uscis_result_reported"
  | "motion_started"
  | "rfe_started"
  | "motion_result_reported"
  | "rfe_result_reported";

type CosAdminNotificationParams = {
  event: CosAdminEvent;
  processId: string;
  userId?: string | null;
  clientName?: string | null;
  clientEmail?: string | null;
  metadata?: Record<string, unknown>;
};

function getClientLabel(clientName?: string | null, clientEmail?: string | null): string {
  return clientName?.trim() || clientEmail?.trim() || "Client";
}

export const cosNotificationService = {
  async notifyAdmin(params: CosAdminNotificationParams): Promise<void> {
    await notifyAdmin({
      serviceId: params.processId,
      userId: params.userId ?? undefined,
      link: `/master/processes/${params.processId}`,
      category: "cos",
      action: params.event,
      metadata: {
        client_name: getClientLabel(params.clientName, params.clientEmail),
        ...(params.metadata ?? {}),
      },
    });
  },
};
