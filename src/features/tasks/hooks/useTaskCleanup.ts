import { useEffect, useRef } from 'react';
import { useRepository } from '../../../app/providers/RepositoryProvider';
import { getMinPastWeekStart } from '../../../shared/utils/dates';

export function useTaskCleanup() {
  const repository = useRepository();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const cutoff = getMinPastWeekStart();
    repository.deleteTasksBefore(cutoff).catch(() => {
      // Silencioso — no afecta la UX si la limpieza falla
    });
  }, [repository]);
}
