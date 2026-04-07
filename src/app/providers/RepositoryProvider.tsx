import React, { createContext, useContext } from 'react';
import type { ITaskRepository } from '../../domain/repositories/ITaskRepository';
import type { IRoutineRepository } from '../../domain/repositories/IRoutineRepository';
import type { IAuthService } from '../../domain/services/IAuthService';
import { SupabaseTaskRepository } from '../../infrastructure/supabase/repositories/SupabaseTaskRepository';
import { SupabaseRoutineRepository } from '../../infrastructure/supabase/repositories/SupabaseRoutineRepository';
import { SupabaseAuthService } from '../../infrastructure/supabase/services/SupabaseAuthService';
import { supabase } from '../../infrastructure/supabase/client';

interface Services {
  taskRepository: ITaskRepository;
  routineRepository: IRoutineRepository;
  authService: IAuthService;
}

// Instancias únicas: el cliente Supabase ya es un singleton.
const services: Services = {
  taskRepository: new SupabaseTaskRepository(supabase),
  routineRepository: new SupabaseRoutineRepository(supabase),
  authService: new SupabaseAuthService(supabase),
};

const ServiceContext = createContext<Services>(services);

export function useRepository(): ITaskRepository {
  return useContext(ServiceContext).taskRepository;
}

export function useRoutineRepository(): IRoutineRepository {
  return useContext(ServiceContext).routineRepository;
}

export function useAuthService(): IAuthService {
  return useContext(ServiceContext).authService;
}

interface RepositoryProviderProps {
  children: React.ReactNode;
}

export function RepositoryProvider({ children }: RepositoryProviderProps) {
  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
}
