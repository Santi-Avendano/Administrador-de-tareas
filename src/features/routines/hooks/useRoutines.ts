import { useQuery } from '@tanstack/react-query';
import { useRoutineRepository } from '../../../app/providers/RepositoryProvider';
import { routineKeys } from '../constants/queryKeys';

export function useRoutines() {
  const repository = useRoutineRepository();

  return useQuery({
    queryKey: routineKeys.all,
    queryFn: () => repository.getAll(),
  });
}

export function useRoutineById(id: string) {
  const repository = useRoutineRepository();

  return useQuery({
    queryKey: routineKeys.byId(id),
    queryFn: () => repository.getById(id),
    enabled: !!id,
  });
}
