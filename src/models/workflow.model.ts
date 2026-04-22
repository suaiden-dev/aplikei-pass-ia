import type { WorkflowStep } from './process.model';

export interface WorkflowCycle {
  type: 'motion' | 'rfe';
  id: string;
  started_at: string;
  current_step: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'denied';
  steps: WorkflowStep[];
}

export interface MotionWorkflowData {
  recover?: 'not_started' | 'in_progress' | 'completed';
  workflow_status?: 'not_started' | 'in_progress' | 'completed' | 'denied';
  history?: WorkflowCycle[];
  active_cycle_index?: number;
}

export interface RFEWorkflowData {
  recover?: 'not_started' | 'rfeInit' | 'in_progress' | 'completed';
  workflow_status?: 'not_started' | 'rfeInit' | 'in_progress' | 'completed' | 'denied';
  history?: WorkflowCycle[];
  active_cycle_index?: number;
  uscis_rfe_result?: string;
}

export interface WorkflowTemplateStep {
  title: string;
  description?: string;
}

export const MOTION_STEPS_TEMPLATE: WorkflowTemplateStep[] = [
  { title: 'Aquisição do Motion', description: 'Compra do Motion junto ao USCIS' },
  { title: 'Preparação da Resposta', description: 'Preparação dos documentos para resposta RFE' },
  { title: 'Revisão Jurídica', description: 'Revisão final da resposta' },
  { title: 'Envio ao USCIS', description: 'Submissão da resposta' },
];

export const RFE_STEPS_TEMPLATE: WorkflowTemplateStep[] = [
  { title: 'Análise do RFE', description: 'Análise do motivo do RFE' },
  { title: 'Coleta de Documentos', description: 'Coleta dos documentos solicitados' },
  { title: 'Preparação da Resposta', description: 'Preparação da resposta formal' },
  { title: 'Revisão', description: 'Revisão final' },
  { title: 'Envio', description: 'Envio ao USCIS' },
];
