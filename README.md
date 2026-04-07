# Weekly Task Manager

Aplicacion movil para gestion de tareas semanales. Permite planificar la semana dia a dia, asignar horarios a las tareas, reordenarlas arrastrando, configurar recordatorios con notificaciones push, automatizar tareas recurrentes con rutinas, y navegar entre semanas, con sincronizacion en tiempo real a traves de Supabase.

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
| Notificaciones | expo-notifications | Notificaciones push locales |
| Drag & Drop | react-native-draggable-flatlist | Reordenamiento por arrastre |
| Time Picker | react-native-paper-dates | Selector de hora (clock face) |
| Crypto | expo-crypto | Generación de UUIDs en runtime |

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
│  Supabase Repos · Notifications · Client · Maps  │
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
│   ├── App.tsx                  # Composición de providers + notification handler
│   ├── providers/               # QueryProvider, AuthProvider, RepositoryProvider, ThemeProvider
│   └── navigation/              # RootNavigator, AuthNavigator, MainNavigator
│
├── domain/                      # ← Capa de Dominio (sin dependencias externas)
│   ├── entities/
│   │   ├── task.ts              # Tipos Task, TaskInsert, TaskUpdate, DayOfWeek
│   │   └── routine.ts           # Tipos Routine, RoutineItem, RoutineWithItems
│   ├── repositories/
│   │   ├── ITaskRepository.ts   # Contrato del repositorio de tareas
│   │   └── IRoutineRepository.ts # Contrato del repositorio de rutinas
│   ├── services/
│   │   ├── IAuthService.ts      # Contrato del servicio de autenticación
│   │   └── INotificationService.ts # Contrato del servicio de notificaciones
│   └── validation/
│       ├── taskValidation.ts    # Reglas de validación de tareas
│       └── routineValidation.ts # Reglas de validación de rutinas
│
├── infrastructure/              # ← Capa de Infraestructura
│   ├── supabase/
│   │   ├── client.ts            # Singleton del cliente Supabase
│   │   ├── mappers/
│   │   │   ├── taskMapper.ts    # TaskRow ↔ Task (snake_case ↔ camelCase)
│   │   │   └── routineMapper.ts # RoutineRow ↔ Routine
│   │   ├── repositories/
│   │   │   ├── SupabaseTaskRepository.ts    # Implementa ITaskRepository
│   │   │   └── SupabaseRoutineRepository.ts # Implementa IRoutineRepository
│   │   └── services/
│   │       └── SupabaseAuthService.ts       # Implementa IAuthService
│   └── notifications/
│       └── ExpoNotificationService.ts       # Implementa INotificationService
│
├── features/                    # ← Capas de Aplicación + Presentación
│   ├── tasks/
│   │   ├── constants/
│   │   │   └── queryKeys.ts     # Claves de React Query centralizadas
│   │   ├── hooks/
│   │   │   ├── useTasks.ts          # Queries + suscripción realtime
│   │   │   ├── useTaskMutations.ts  # Mutations con optimistic updates + notification sync
│   │   │   ├── useTaskNotifications.ts # Scheduling y cancelación de recordatorios
│   │   │   └── useWeekNavigation.ts # Navegación entre semanas
│   │   ├── store/
│   │   │   └── tasksStore.ts    # Estado UI: semana, día, modal
│   │   ├── components/
│   │   │   ├── WeekHeader.tsx
│   │   │   ├── DaySelector.tsx
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskItem.tsx     # Incluye bell icon para toggle de recordatorio
│   │   │   └── TaskFormModal.tsx # Incluye controles de recordatorio
│   │   └── screens/
│   │       └── WeekViewScreen.tsx
│   │
│   ├── routines/
│   │   ├── constants/
│   │   │   └── queryKeys.ts
│   │   ├── hooks/
│   │   │   ├── useRoutines.ts
│   │   │   └── useRoutineMutations.ts
│   │   ├── store/
│   │   │   └── routinesStore.ts
│   │   ├── components/
│   │   │   ├── RoutineList.tsx
│   │   │   ├── RoutineCard.tsx
│   │   │   ├── RoutineItemRow.tsx
│   │   │   └── RoutineFormModal.tsx
│   │   └── screens/
│   │       └── RoutinesScreen.tsx
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
| `useTaskMutations` | Ejecutar mutaciones con optimistic updates y sincronizar notificaciones |
| `useTaskNotifications` | Decidir si programar o cancelar una notificación para una tarea |
| `useWeekNavigation` | Calcular y navegar entre semanas |
| `tasksStore` | Estado efimero de UI (semana activa, dia, modal) |
| `taskMapper.ts` | Convertir entre modelo de DB y modelo de dominio |
| `taskValidation.ts` | Validar datos de una tarea y formatear hora |
| `ExpoNotificationService` | Programar y cancelar notificaciones locales via expo-notifications |
| `useRoutines` | Leer rutinas del servidor |
| `useRoutineMutations` | Crear, editar, eliminar rutinas y generar tareas |

> Anti-patrón a evitar: un hook que fetcha, muta, valida y gestiona el modal al mismo tiempo.

### O — Open/Closed

Las interfaces `ITaskRepository` e `INotificationService` están **abiertas para extensión, cerradas para modificación**:

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
  ): () => void;
  reorderTasks(
    updates: { id: string; position: number }[]
  ): Promise<void>;
}
```

Para agregar soporte a SQLite local (modo offline), se crea `SqliteTaskRepository` sin tocar el repositorio de Supabase ni los hooks. Lo mismo con notificaciones: reemplazar `ExpoNotificationService` por otra implementación solo requiere cambiar la instancia en `RepositoryProvider`.

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

Los features dependen de la **abstracción** (`ITaskRepository`, `INotificationService`), no de la implementación (`SupabaseTaskRepository`, `ExpoNotificationService`). La inyección ocurre a través del `RepositoryProvider`:

```typescript
// app/providers/RepositoryProvider.tsx
const services = {
  taskRepository: new SupabaseTaskRepository(supabase),
  routineRepository: new SupabaseRoutineRepository(supabase),
  authService: new SupabaseAuthService(supabase),
  notificationService: new ExpoNotificationService(),
};

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
│  · Rutinas y sus items                               │
│  · Caché: 1 min stale, 10 min gc                    │
│  · Optimistic updates con rollback automático        │
├─────────────────────────────────────────────────────┤
│  Estado de UI (Zustand)                              │
│  · Semana y día seleccionados (tasksStore)            │
│  · Visibilidad del modal y tarea en edición          │
│  · Modal y estado de edición de rutinas              │
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

// features/routines/constants/queryKeys.ts
export const routineKeys = {
  all: ['routines'] as const,
  byId: (id: string) => ['routines', id] as const,
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

### Mutación con optimistic update + notificación

```
TaskItem.onToggle()
  └── useToggleTaskCompletion()
        └── useMutation(useTaskMutations)
              onMutate: update cache optimistically
              mutationFn: ITaskRepository.update()
              onSuccess: syncReminder(task) → schedule o cancel notificación
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

### Flujo de notificaciones

```
syncReminder(task)
  ├── reminderEnabled && scheduledTime && !isCompleted?
  │     ├── requestPermissions() → granted?
  │     │     └── scheduleTaskReminder()
  │     │           ├── getDayDate(weekStartDate, dayOfWeek)
  │     │           ├── setHours/setMinutes del scheduledTime
  │     │           ├── subMinutes(reminderMinutesBefore)
  │     │           ├── fecha en el pasado? → null (no programar)
  │     │           └── Notifications.scheduleNotificationAsync()
  │     │                 identifier: "task-reminder-{taskId}"
  │     └── not granted → no-op
  └── else → cancelTaskReminder(taskId)
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
| `position` | int | Orden visual dentro del dia |
| `scheduled_time` | text | Hora programada `HH:mm` o `NULL` |
| `reminder_enabled` | bool | Si el recordatorio esta activo |
| `reminder_minutes_before` | int | Minutos antes para notificar (5, 10, 15, 30, 60) |
| `routine_id` | uuid FK | Referencia a `routines.id` si fue creada por una rutina |
| `created_at` | timestamptz | — |
| `updated_at` | timestamptz | — |

**`routines`** — Rutinas recurrentes

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | Generado automáticamente |
| `user_id` | uuid FK | Referencia a `profiles.id` |
| `name` | text | Nombre de la rutina |
| `is_active` | bool | Si la rutina esta activa |
| `created_at` | timestamptz | — |
| `updated_at` | timestamptz | — |

**`routine_items`** — Items de cada rutina (plantilla de tareas)

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | Generado automáticamente |
| `routine_id` | uuid FK | Referencia a `routines.id` |
| `title` | text | Titulo de la tarea |
| `description` | text | Opcional |
| `day_of_week` | int | 0=Lunes … 6=Domingo |
| `scheduled_time` | text | Hora programada `HH:mm` o `NULL` |
| `created_at` | timestamptz | — |

### Seguridad

- **Row Level Security (RLS)** activo en todas las tablas.
- Cada usuario solo puede leer y escribir sus propios registros.
- La verificación ocurre en la base de datos, no en el cliente.

### Convenciones de fecha

- `week_start_date` es siempre **lunes** en formato `YYYY-MM-DD`.
- `day_of_week` sigue la convención europea: `0 = lunes`, `6 = domingo`.
- Usar siempre las funciones de `src/shared/utils/dates.ts` para derivar estas fechas. **Nunca usar `Date.getDay()` directamente** (retorna 0=domingo, convención distinta).

---

## Mappers

La conversión entre el modelo de base de datos (`TaskRow`, snake_case) y el modelo de dominio (`Task`, camelCase) ocurre exclusivamente en los mappers de `infrastructure/supabase/mappers/`:

```typescript
// TaskRow (DB) → Task (dominio)
export const taskMapper = {
  toDomain(row: TaskRow): Task { ... },
  toInsertRow(task: TaskInsert, userId: string): ... { ... },
  toUpdateRow(data: TaskUpdate): Partial<TaskRow> { ... },
};
```

Ningún otro módulo hace esta conversión manualmente. El mismo patrón aplica para `routineMapper`.

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
npm start          # Servidor de desarrollo (elegis plataforma interactivamente)
npm run android    # Emulador Android
npm run ios        # Simulador iOS
npm run web        # Version web
```

Para desarrollo desde **WSL2**, usar `npx expo start --tunnel` para que Expo Go en el celular pueda conectarse a traves de un tunel.

---

## Funcionalidades

### Gestion de tareas
- Crear, editar y eliminar tareas por dia de la semana
- Marcar tareas como completadas (con optimistic updates y rollback)
- Navegacion semanal (semana anterior/siguiente, ir a hoy)
- Sincronizacion en tiempo real via Supabase Realtime
- Modo oscuro con persistencia en AsyncStorage

### Hora programada y reordenamiento
- Asignar opcionalmente un horario (`HH:mm`) a cada tarea
- Las tareas con hora se posicionan cronologicamente al crearse
- Todas las tareas se pueden reordenar arrastrando (drag-and-drop via long press)
- La hora se muestra como badge en cada tarea que la tenga
- Time picker con interfaz de reloj estilo alarma (Material Design clock face)
- Lista unificada: tareas con y sin hora conviven en la misma lista

### Rutinas
- Crear rutinas con multiples tareas distribuidas por dia de la semana
- Cada item de rutina puede tener titulo, descripcion y hora programada
- Activar o desactivar rutinas sin eliminarlas
- Generar automaticamente tareas a partir de rutinas activas para un rango de semanas
- Las tareas generadas mantienen referencia a la rutina (`routine_id`)
- Eliminar tareas futuras de una rutina desactivada
- Navegacion dedicada en tab "Rutinas" del bottom tabs

### Notificaciones push (recordatorios)
- Activar recordatorio individual por tarea desde el listado (icono campana)
- Configurar cuantos minutos antes del horario programado se desea el aviso (5, 15, 30 o 60 min)
- Notificaciones locales programadas via `expo-notifications` (funcionan con la app cerrada)
- Solicitud de permisos lazy: se piden al activar el primer recordatorio
- Cancelacion automatica al completar, eliminar o desactivar el recordatorio de una tarea
- Identificador determinístico (`task-reminder-{taskId}`) para scheduling idempotente
- Controles integrados en el formulario de creacion/edicion de tareas

---

## Decisiones de diseno y tradeoffs

### ¿Por qué Zustand para UI state y React Query para server state?

Mezclar ambos en un solo store (Redux-style) lleva a estado duplicado y lógica de caché manual. La separación es explícita: Zustand no sabe nada del servidor, React Query no sabe nada del día seleccionado. Cada herramienta resuelve exactamente lo que hace bien.

### ¿Por qué el repositorio retorna `Promise<Task>` y no `Promise<TaskRow>`?

Los features no deben saber qué base de datos se usa. Si el repositorio retornara `TaskRow`, el feature tendría que conocer la estructura de Supabase. El mapper vive en infraestructura y el dominio permanece limpio.

### ¿Por qué Realtime invalida queries en lugar de actualizar el cache directamente?

Actualizar el cache manualmente (`setQueryData`) con datos de Realtime crea race conditions: si una mutación optimista está en vuelo, el evento de realtime puede pisar el estado provisional. Invalidar y refetchar garantiza consistencia con el servidor.

### ¿Por qué `week_start_date` es `TEXT` y no `DATE` en Postgres?

Supabase serializa las columnas `DATE` como strings ISO de todos modos al llegar al cliente JS. Usar `TEXT` elimina una conversión implícita y hace la intención explícita: siempre es `YYYY-MM-DD`.

### ¿Por qué notificaciones locales y no server-sent push?

Las tareas tienen horario fijo y conocido al momento de crearlas. No hay necesidad de un servidor push que despierte al dispositivo — `expo-notifications` programa la notificación localmente y el OS la dispara en el momento exacto, incluso con la app cerrada. Esto elimina la complejidad de un backend de push (FCM/APNs tokens, servidor de envío, retry logic) sin perder funcionalidad.

### ¿Por qué el identificador de notificación es determinístico?

Usar `task-reminder-{taskId}` como identifier permite: (1) cancelar sin guardar IDs en la base de datos, (2) re-programar es idempotente (reemplaza la notificación anterior automaticamente), (3) no hay notificaciones huérfanas si la app crashea entre schedule y persist.
