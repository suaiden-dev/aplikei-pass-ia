import { StatusEngine } from '@/application/use-cases/services/StatusEngine';
import { getUserProcessRepository } from './processFactory';

let instance: StatusEngine | null = null;

export function getStatusEngine(): StatusEngine {
  if (!instance) {
    instance = new StatusEngine(getUserProcessRepository());
  }
  return instance;
}
