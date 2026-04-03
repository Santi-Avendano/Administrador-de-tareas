# Weekly Task Manager

Aplicación móvil para gestión de tareas semanales. Permite planificar la semana día a día, completar tareas y navegar entre semanas, con sincronización en tiempo real a través de Supabase.

---

## Stack tecnológico

| Capa | Tecnología | Rol |
|------|-----------|-----|
| Mobile | React Native + Expo | UI y runtime multiplataforma |
| UI | React Native Paper (MD3) | Sistema de diseño |
| Navegación | React Navigation v7 | Routing y navegación |
| Estado del servidor | TanStack Query v5 | Caché, sincronización y mutaciones |
| Estado de UI | Zustand v5 | Estado local efímero |
| Estado de autenticación | React Context | Sesión de usuario |
| Backend | Supabase | Auth, PostgreSQL, Realtime |
| Fechas | date-fns v4 | Manipulación de fechas |

---

## Arquitectura

La aplicación sigue una **arquitectura por capas con organización por features**, inspirada en Clean Architecture. El objetivo central es que las capas internas no dependan de las externas: el dominio no sabe que existe Supabase, y los features no saben cómo se persisten los datos.

```
┌─────────────────────────────────────────────────┐
│               Presentation Layer                 │
│    Screens · Components · Navigation · Themes    │  
├─────────────────────────────────────────────────┤
│               Application Layer                  │
│     Hooks · Stores (Zustand) · Query Keys        │
├─────────────────────────────────────────────────┤
│                 Domain Layer                     │
│      Entities · Interfaces · Validations         │
├─────────────────────────────────────────────────┤
│              Infrastructure Layer                │
│   Supabase Repositories · Client · Mappers       │
└─────────────────────────────────────────────────┘
```

### Regla de dependencias

```
Presentation → Application → Domain ← Infrastructure
```

- La infraestructura implementa las interfaces del dominio.
- Los features (application) dependen de abstracciones, no de Supabase.
- Cambiar de Supabase a Firebase solo requiere tocar la capa de infraestructura.

---

## Estructura de directorios

```
src/
├── app/                         # Punto de entrada de la aplicación
│   ├── App.tsx                  # Composición de providers
│   ├── providers/               # QueryProvider, AuthProvider
│   └── navigation/              # RootNavigator, AuthNavigator, MainNavigator
│
├── domain/                      # ← Capa de Dominio (sin dependencias externas)
│   ├── entities/
│   │   └── task.ts              # Tipos Task, TaskInsert, TaskUpdate, DayOfWeek
│   ├── repositories/
│   │   └── ITaskRepository.ts   # Contrato del repositorio (interfaz)
│   └── validation/
│       └── taskValidation.ts    # Reglas de validación puras
│
├── infrastructure/              # ← Capa de Infraestructura
│   └── supabase/
│       ├── client.ts            # Singleton del cliente Supabase
│       ├── mappers/
│       │   └── taskMapper.ts    # TaskRow ↔ Task (snake_case ↔ camelCase)
│       └── repositories/
│           └── SupabaseTaskRepository.ts  # Implementa ITaskRepository
│
├── features/                    # ← Capas de Aplicación + Presentación
│   ├── tasks/
│   │   ├── constants/
│   │   │   └── queryKeys.ts     # Claves de React Query centralizadas
│   │   ├── hooks/
│   │   │   ├── useTasks.ts          # Queries + suscripción realtime
│   │   │   ├── useTaskMutations.ts  # Mutations con optimistic updates
│   │   │   └── useWeekNavigation.ts # Navegación entre semanas
│   │   ├── store/
│   │   │   └── tasksStore.ts    # Estado UI: semana, día, modal
│   │   ├── components/
│   │   │   ├── WeekHeader.tsx
│   │   │   ├── DaySelector.tsx
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskItem.tsx
│   │   │   └── TaskFormModal.tsx
│   │   └── screens/
│   │       └── WeekViewScreen.tsx
│   │
│   ├── auth/
│   │   ├── hooks/
│   │   │   └── useAuth.ts       # signIn, signUp, signOut
│   │   └── screens/
│   │       ├── LoginScreen.tsx
│   │       └── RegisterScreen.tsx
│   │
│   └── settings/
│       └── screens/
│           └── SettingsScreen.tsx
│
└── shared/                      # Utilidades transversales
    └── utils/
        └── dates.ts             # Helpers de fecha (funciones puras)
```

---

## Principios SOLID aplicados

### S — Single Responsibility

Cada módulo tiene **una sola razón para cambiar**:

| Módulo | Responsabilidad única |
|--------|----------------------|
| `useTasks` | Leer y sincronizar tareas del servidor |
| `useTaskMutations` | Ejecutar mutaciones con optimistic updates |
| `useWeekNavigation` | Calcular y navegar entre semanas |
| `tasksStore` | Estado efímero de UI (semana activa, día, modal) |
| `taskMapper.ts` | Convertir entre modelo de DB y modelo de dominio |
| `taskValidation.ts` | Validar datos de una tarea |
| `queryKeys.ts` | Centralizar las claves de caché de React Query |

> Anti-patrón a evitar: un hook que fetcha, muta, valida y gestiona el modal al mismo tiempo.

### O — Open/Closed

La interfaz `ITaskRepository` está **abierta para extensión, cerrada para modificación**:

```typescript
// domain/repositories/ITaskRepository.ts
export interface ITaskRepository {
  getByWeek(weekStartDate: string): Promise<Task[]>;
  create(task: TaskInsert): Promise<Task>;
  update(id: string, data: TaskUpdate): Promise<Task>;
  delete(id: string): Promise<void>;
  subscribeToWeek(
    weekStartDate: string,
    onUpdate: () => void
  ): () => void;  // retorna unsubscribe
}
```

Para agregar soporte a SQLite local (modo offline), se crea `SqliteTaskRepository` sin tocar el repositorio de Supabase ni los hooks.

### L — Liskov Substitution

Los hooks reciben el repositorio como dependencia. Un `MockTaskRepository` en tests se comporta igual que `SupabaseTaskRepository` sin romper nada:

```typescript
// En tests
const repository = new MockTaskRepository(seedData);
renderHook(() => useTasks('2025-03-31', repository));
```

### I — Interface Segregation

Si en el futuro un componente solo necesita leer tareas (no escribir), puede depender de una interfaz más pequeña:

```typescript
export interface ITaskReader {
  getByWeek(weekStartDate: string): Promise<Task[]>;
}

export interface ITaskWriter {
  create(task: TaskInsert): Promise<Task>;
  update(id: string, data: TaskUpdate): Promise<Task>;
  delete(id: string): Promise<void>;
}

// ITaskRepository extiende ambas
export interface ITaskRepository extends ITaskReader, ITaskWriter {
  subscribeToWeek(weekStartDate: string, onUpdate: () => void): () => void;
}
```

### D — Dependency Inversion

Los features dependen de la **abstracción** (`ITaskRepository`), no de la implementación (`SupabaseTaskRepository`). La inyección ocurre a través de un hook de composición en el `app/`:

```typescript
// app/providers/RepositoryProvider.tsx
const repository = new SupabaseTaskRepository(supabase);
<RepositoryContext.Provider value={repository}>

// features/tasks/hooks/useTasks.ts
const repository = useRepository(); // abstracción, no Supabase
```

---

## Gestión de estado

La aplicación separa el estado en tres categorías con herramientas distintas:

```
┌─────────────────────────────────────────────────────┐
│  Estado del Servidor (TanStack Query)                │
│  · Tareas de la semana activa                        │
│  · Caché: 1 min stale, 10 min gc                    │
│  · Optimistic updates con rollback automático        │
├─────────────────────────────────────────────────────┤
│  Estado de UI (Zustand)                              │
│  · Semana y día seleccionados                        │
│  · Visibilidad del modal                             │
│  · ID de tarea en edición                            │
├─────────────────────────────────────────────────────┤
│  Estado de Autenticación (React Context)             │
│  · Session y User de Supabase                        │
│  · Loading inicial de auth                           │
└─────────────────────────────────────────────────────┘
```

### Claves de React Query

Todas las claves se definen en un solo lugar para evitar strings duplicados:

```typescript
// features/tasks/constants/queryKeys.ts
export const taskKeys = {
  all: ['tasks'] as const,
  byWeek: (weekStartDate: string) => ['tasks', weekStartDate] as const,
};
```

---

## Flujo de datos

### Lectura de tareas

```
WeekViewScreen
  └── useTasksStore (weekStartDate, selectedDay)
        └── useTasks(weekStartDate)
              └── ITaskRepository.getByWeek()
                    └── SupabaseTaskRepository → Supabase DB
                          ↓ taskMapper.toDomain()
                    ← Task[]
              ↑ React Query cache
        └── useTasksForDay(weekStartDate, day) ← selector del cache
```

### Mutación con optimistic update

```
TaskItem.onToggle()
  └── useToggleTaskCompletion()
        └── useMutation(useTaskMutations)
              onMutate: update cache optimistically
              mutationFn: ITaskRepository.update()
              onError: rollback cache to previous state
              onSettled: invalidate queryKeys.byWeek()
```

### Sincronización en tiempo real

```
useTasks()
  └── useEffect → ITaskRepository.subscribeToWeek()
        └── Supabase Realtime (canal "tasks:{weekStartDate}")
              ↓ cualquier INSERT/UPDATE/DELETE
        queryClient.invalidateQueries(taskKeys.byWeek())
              ↓ refetch automático
        Task[] actualizado en cache
```

---

## Base de datos (Supabase)

### Tablas

**`profiles`** — Perfil del usuario (auto-creado en signup por trigger)

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | Vinculado a `auth.users.id` |
| `display_name` | text | Nombre visible (opcional) |
| `week_starts_on` | int | 0=Lunes, 6=Domingo |
| `created_at` | timestamptz | — |

**`tasks`** — Tareas semanales

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | Generado automáticamente |
| `user_id` | uuid FK | Referencia a `profiles.id` |
| `title` | text | Obligatorio |
| `description` | text | Opcional |
| `day_of_week` | int | 0=Lunes … 6=Domingo |
| `week_start_date` | text | ISO 8601: `YYYY-MM-DD` |
| `is_completed` | bool | Estado de completado |
| `completed_at` | timestamptz | Nulo si no completada |
| `position` | int | Orden visual dentro del día |
| `created_at` | timestamptz | — |
| `updated_at` | timestamptz | — |

### Seguridad

- **Row Level Security (RLS)** activo en ambas tablas.
- Cada usuario solo puede leer y escribir sus propios registros.
- La verificación ocurre en la base de datos, no en el cliente.

### Convenciones de fecha

- `week_start_date` es siempre **lunes** en formato `YYYY-MM-DD`.
- `day_of_week` sigue la convención europea: `0 = lunes`, `6 = domingo`.
- Usar siempre las funciones de `src/shared/utils/dates.ts` para derivar estas fechas. **Nunca usar `Date.getDay()` directamente** (retorna 0=domingo, convención distinta).

---

## Mappers

La conversión entre el modelo de base de datos (`TaskRow`, snake_case) y el modelo de dominio (`Task`, camelCase) ocurre exclusivamente en `infrastructure/supabase/mappers/taskMapper.ts`:

```typescript
// TaskRow (DB) → Task (dominio)
export const taskMapper = {
  toDomain(row: TaskRow): Task { ... },
  toInsert(task: TaskInsert, userId: string): TaskInsertRow { ... },
  toUpdate(data: TaskUpdate): Partial<TaskRow> { ... },
};
```

Ningún otro módulo hace esta conversión manualmente.

---

## Configuración del entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
EXPO_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

El prefijo `EXPO_PUBLIC_` es obligatorio para que Expo exponga las variables al bundle del cliente.

---

## Comandos disponibles

```bash
npm start          # Servidor de desarrollo (elegís plataforma interactivamente)
npm run android    # Emulador Android
npm run ios        # Simulador iOS
npm run web        # Versión web
```

---

## Decisiones de diseño y tradeoffs

### ¿Por qué Zustand para UI state y React Query para server state?

Mezclar ambos en un solo store (Redux-style) lleva a estado duplicado y lógica de caché manual. La separación es explícita: Zustand no sabe nada del servidor, React Query no sabe nada del día seleccionado. Cada herramienta resuelve exactamente lo que hace bien.

### ¿Por qué el repositorio retorna `Promise<Task>` y no `Promise<TaskRow>`?

Los features no deben saber qué base de datos se usa. Si el repositorio retornara `TaskRow`, el feature tendría que conocer la estructura de Supabase. El mapper vive en infraestructura y el dominio permanece limpio.

### ¿Por qué Realtime invalida queries en lugar de actualizar el cache directamente?

Actualizar el cache manualmente (`setQueryData`) con datos de Realtime crea race conditions: si una mutación optimista está en vuelo, el evento de realtime puede pisar el estado provisional. Invalidar y refetchar garantiza consistencia con el servidor.

### ¿Por qué `week_start_date` es `TEXT` y no `DATE` en Postgres?

Supabase serializa las columnas `DATE` como strings ISO de todos modos al llegar al cliente JS. Usar `TEXT` elimina una conversión implícita y hace la intención explícita: siempre es `YYYY-MM-DD`.
