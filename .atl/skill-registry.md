# Skill Registry — weekly-task-manager

Generated: 2026-04-09

## User Skills

| Skill | Trigger | Source |
|-------|---------|--------|
| skill-creator | Creating new AI skills | ~/.claude/skills/skill-creator |
| branch-pr | PR creation workflow | ~/.claude/skills/branch-pr |
| issue-creation | Issue creation workflow | ~/.claude/skills/issue-creation |
| go-testing | Go tests, Bubbletea TUI testing | ~/.claude/skills/go-testing |
| judgment-day | Adversarial review protocol | ~/.claude/skills/judgment-day |

## Project Conventions

| File | Scope | Description |
|------|-------|-------------|
| CLAUDE.md | Project root | Architecture, commands, key conventions (day-of-week, dates, state management) |
| .agents/skills/supabase-postgres-best-practices/ | SQL/Schema | Postgres optimization: indexes, RLS, connection pooling, query performance |
| .agents/skills/vercel-react-native-skills/ | React Native | 35+ RN performance rules: rendering, lists, animation, navigation, state |

## Compact Rules

### supabase-postgres-best-practices
- Reference when writing SQL queries, designing schemas, or working with RLS
- Prioritize: query performance > connection management > security/RLS > schema design
- Read individual rule files from `references/` on demand (e.g., `query-missing-indexes.md`)

### vercel-react-native-skills
- Reference when writing React Native components, lists, animations, or navigation
- Critical: never use && with falsy values, wrap strings in Text, avoid inline objects in renderItem
- High: use native navigators, optimize list performance with stable refs, animate transform/opacity
- Medium: minimize state variables, derive values, use React Compiler patterns

### CLAUDE.md conventions
- Day of week: 0=Monday, 6=Sunday (European, date-fns)
- week_start_date: TEXT ISO 8601 (YYYY-MM-DD)
- scheduled_time: TEXT HH:mm or NULL
- State: Auth=Context, UI=Zustand, Server=TanStack Query v5, Realtime=Supabase subscriptions
- UI library: React Native Paper (MD3) — no raw StyleSheet unless Paper has no equivalent
- Drag-and-drop: react-native-draggable-flatlist via long press
