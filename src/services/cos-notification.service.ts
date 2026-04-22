import { notificationService } from "./notification.service";

type CosAdminEvent =
  | "i20_uploaded"
  | "sevis_receipt_uploaded"
  | "cover_letter_completed"
  | "i539_generated"
  | "rfe_letter_uploaded"
  | "rfe_description_submitted"
  | "motion_reason_submitted"
  | "motion_denial_letter_uploaded"
  | "motion_supporting_docs_uploaded";

type CosAdminNotificationParams = {
  event: CosAdminEvent;
  processId: string;
  userId?: string | null;
  clientName?: string | null;
  clientEmail?: string | null;
};

function getClientLabel(clientName?: string | null, clientEmail?: string | null): string {
  return clientName?.trim() || clientEmail?.trim() || "Cliente";
}

function getCosAdminMessage(
  event: CosAdminEvent,
  clientLabel: string,
  processId: string,
): { title: string; body: string } {
  switch (event) {
    case "i20_uploaded":
      return {
        title: "COS: novo I-20 recebido",
        body: `${clientLabel} enviou o documento I-20 para analise no processo ${processId}.`,
      };
    case "sevis_receipt_uploaded":
      return {
        title: "COS: comprovante SEVIS recebido",
        body: `${clientLabel} anexou o comprovante da taxa SEVIS para conferencia no processo ${processId}.`,
      };
    case "cover_letter_completed":
      return {
        title: "COS: cover letter respondida",
        body: `${clientLabel} concluiu o questionario da cover letter no processo ${processId}.`,
      };
    case "i539_generated":
      return {
        title: "COS: formulario I-539 gerado",
        body: `${clientLabel} concluiu o preenchimento e gerou o PDF do I-539 no processo ${processId}.`,
      };
    case "rfe_letter_uploaded":
      return {
        title: "COS: carta de RFE recebida",
        body: `${clientLabel} submeteu a carta de RFE no processo ${processId}.`,
      };
    case "rfe_description_submitted":
      return {
        title: "COS: descricao de RFE enviada",
        body: `${clientLabel} descreveu os requisitos da RFE no processo ${processId}.`,
      };
    case "motion_reason_submitted":
      return {
        title: "COS: justificativa de motion enviada",
        body: `${clientLabel} enviou a justificativa para o motion no processo ${processId}.`,
      };
    case "motion_denial_letter_uploaded":
      return {
        title: "COS: carta de negativa recebida",
        body: `${clientLabel} submeteu a carta de negativa para iniciar o motion no processo ${processId}.`,
      };
    case "motion_supporting_docs_uploaded":
      return {
        title: "COS: documentos de apoio enviados",
        body: `${clientLabel} anexou documentos de apoio para o motion no processo ${processId}.`,
      };
  }
}

export const cosNotificationService = {
  async notifyAdmin(params: CosAdminNotificationParams): Promise<void> {
    const clientLabel = getClientLabel(params.clientName, params.clientEmail);
    const { title, body } = getCosAdminMessage(params.event, clientLabel, params.processId);

    await notificationService.notifyAdmin({
      title,
      body,
      serviceId: params.processId,
      userId: params.userId ?? undefined,
      link: `/admin/processes/${params.processId}`,
    });
  },
};
