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

function getCosAdminMessage(
  event: CosAdminEvent,
  clientLabel: string,
  processId: string,
): { title: string; body: string } {
  switch (event) {
    case "i20_uploaded":
      return {
        title: "COS: new I-20 received",
        body: `${clientLabel} uploaded the I-20 document for review in process ${processId}.`,
      };
    case "sevis_receipt_uploaded":
      return {
        title: "COS: SEVIS receipt received",
        body: `${clientLabel} uploaded the SEVIS fee receipt for verification in process ${processId}.`,
      };
    case "cover_letter_completed":
      return {
        title: "COS: cover letter completed",
        body: `${clientLabel} completed the cover letter questionnaire in process ${processId}.`,
      };
    case "i539_generated":
      return {
        title: "COS: I-539 form generated",
        body: `${clientLabel} completed and generated the I-539 PDF in process ${processId}.`,
      };
    case "rfe_letter_uploaded":
      return {
        title: "COS: RFE letter received",
        body: `${clientLabel} submitted the RFE letter in process ${processId}.`,
      };
    case "rfe_description_submitted":
      return {
        title: "COS: RFE description submitted",
        body: `${clientLabel} submitted the RFE requirements description in process ${processId}.`,
      };
    case "motion_reason_submitted":
      return {
        title: "COS: motion reason submitted",
        body: `${clientLabel} submitted the motion reason in process ${processId}.`,
      };
    case "motion_denial_letter_uploaded":
      return {
        title: "COS: denial letter received",
        body: `${clientLabel} submitted the denial letter to start motion in process ${processId}.`,
      };
    case "motion_supporting_docs_uploaded":
      return {
        title: "COS: supporting docs uploaded",
        body: `${clientLabel} uploaded supporting motion documents in process ${processId}.`,
      };
    case "uscis_result_reported":
      return {
        title: "COS: USCIS result reported",
        body: `${clientLabel} reported a new USCIS result in process ${processId}.`,
      };
    case "motion_started":
      return {
        title: "COS: Motion workflow started",
        body: `Motion workflow started for client ${clientLabel} in process ${processId}.`,
      };
    case "rfe_started":
      return {
        title: "COS: RFE workflow started",
        body: `RFE workflow started for client ${clientLabel} in process ${processId}.`,
      };
    case "motion_result_reported":
      return {
        title: "COS: Motion result reported",
        body: `${clientLabel} reported the Motion result in process ${processId}.`,
      };
    case "rfe_result_reported":
      return {
        title: "COS: RFE result reported",
        body: `${clientLabel} reported the RFE result in process ${processId}.`,
      };
  }
}

export const cosNotificationService = {
  async notifyAdmin(params: CosAdminNotificationParams): Promise<void> {
    const clientLabel = getClientLabel(params.clientName, params.clientEmail);
    const { title, body } = getCosAdminMessage(params.event, clientLabel, params.processId);

    await notifyAdmin({
      title,
      body,
      serviceId: params.processId,
      userId: params.userId ?? undefined,
      link: `/master/processes/${params.processId}`,
    });
  },
};
