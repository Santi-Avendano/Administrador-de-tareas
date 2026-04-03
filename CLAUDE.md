# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Start Expo dev server (choose platform interactively)
npm run android    # Start on Android emulator
npm run ios        # Start on iOS simulator
npm run web        # Start web version
```

No lint or test scripts are configured. TypeScript strict mode is the primary safety net.

## Environment

Create a `.env` file at the project root with:
```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

The `EXPO_PUBLIC_` prefix is required for Expo to expose vars to the client bundle.

## Architecture

**React Native + Expo** app using a feature-based folder structure under `src/`.

```
src/
├── app/           # Root component, providers, navigators
├── features/      # auth | tasks | settings — each self-contained
├── infrastructure/supabase/  # DB client + CRUD operations
└── shared/utils/  # Date helpers
```

### State management split

| Layer | Tool | Scope |
|-------|------|-------|
| Auth state | React Context (`AuthProvider`) | Session, loading |
| UI state | Zustand (`tasksStore`) | Modal visibility, selected week/day |
| Server state | TanStack Query v5 | Tasks data, cache, optimistic updates |
| Realtime | Supabase subscriptions | Live task sync per week channel |

The Zustand store (`src/features/tasks/store/tasksStore.ts`) handles only ephemeral UI state — never persisted server data. Server data lives exclusively in React Query's cache.

### Navigation

Two navigators gated by auth:
- **AuthNavigator** (native-stack): Login → Register
- **MainNavigator** (bottom-tabs): WeekView + Settings

### Supabase layer

All DB operations go through `src/infrastructure/supabase/database.ts`. The `useTasks` hook consumes it via React Query, and also sets up a realtime subscription scoped to the current week (`tasks:{weekStartDate}` channel). After a realtime event fires, the hook invalidates the query to refetch.

Mutations live in `useTaskMutations.ts` and use optimistic updates — always roll back on error.

## Key Conventions

- **Day of week**: `0 = Monday`, `6 = Sunday` (European convention, via date-fns). This differs from JavaScript's native `Date.getDay()`.
- **week_start_date**: Stored as `TEXT` in ISO 8601 format (`YYYY-MM-DD`). Always use the helpers in `src/shared/utils/dates.ts` to derive this value.
- **Types**: `Task` is the app-level type; `TaskRow` is the raw Supabase row. Conversions happen in `src/features/tasks/types.ts`.
- **React Native Paper (MD3)** is the UI library. Use its components and theming system — do not mix with raw RN `StyleSheet` unless Paper has no equivalent.
