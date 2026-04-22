import { useCallback } from 'react';
import type { UserService } from '../../models';

export interface UseServiceStateOptions {
  userId: string;
  slug: string;
}

export interface UseServiceStateResult {
  service: UserService | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useServiceState() {
  const createServiceState = useCallback((
    _options: UseServiceStateOptions,
    _fetchFn: () => Promise<UserService | null>
  ): UseServiceStateResult => {
    return {
      service: null,
      isLoading: false,
      error: null,
      refetch: async () => {},
    };
  }, []);

  return { createServiceState };
}
