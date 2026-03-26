export interface IFlowStep {
  id: string;
  label: string;
  description: string;
  isAutomated?: boolean;
}

export interface IProductFlow {
  getSteps(): IFlowStep[];
  getNextStatus(currentStatus: string): string;
  getPreviousStatus(currentStatus: string): string;
  canTransitionTo(from: string, to: string): boolean;
}
