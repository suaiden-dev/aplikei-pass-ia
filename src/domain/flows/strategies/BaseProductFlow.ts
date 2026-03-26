import { IProductFlow, IFlowStep } from "../interfaces/IProductFlow";

export abstract class BaseProductFlow implements IProductFlow {
  protected abstract steps: IFlowStep[];

  getSteps(): IFlowStep[] {
    return this.steps;
  }

  getNextStatus(currentStatus: string): string {
    const index = this.steps.findIndex(s => s.id === currentStatus);
    if (index === -1 || index === this.steps.length - 1) return currentStatus;
    return this.steps[index + 1].id;
  }

  getPreviousStatus(currentStatus: string): string {
    const index = this.steps.findIndex(s => s.id === currentStatus);
    if (index <= 0) return currentStatus;
    return this.steps[index - 1].id;
  }

  canTransitionTo(from: string, to: string): boolean {
    const fromIndex = this.steps.findIndex(s => s.id === from);
    const toIndex = this.steps.findIndex(s => s.id === to);
    
    if (fromIndex === -1 || toIndex === -1) return false;
    
    // Default logic: can only move forward one step or stay same
    return toIndex >= fromIndex;
  }
}
