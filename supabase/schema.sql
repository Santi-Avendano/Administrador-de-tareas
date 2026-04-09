-- Weekly Task Manager Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- ============================================================

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    week_starts_on SMALLINT DEFAULT 1 CHECK (week_starts_on BETWEEN 0 AND 6),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TASKS TABLE
-- ============================================================

CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    week_start_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    position SMALLINT DEFAULT 0,
    scheduled_time TEXT DEFAULT NULL CHECK (scheduled_time IS NULL OR scheduled_time ~ '^([01]\d|2[0-3]):[0-5]\d$'),
    reminder_enabled BOOLEAN DEFAULT FALSE,
    reminder_minutes_before SMALLINT DEFAULT 15 CHECK (reminder_minutes_before BETWEEN 1 AND 1440),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_user_week ON public.tasks(user_id, week_start_date);
CREATE INDEX idx_tasks_week_day ON public.tasks(week_start_date, day_of_week);

-- RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
    ON public.tasks FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own tasks"
    ON public.tasks FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own tasks"
    ON public.tasks FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own tasks"
    ON public.tasks FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at on any row modification
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_set_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Auto-calculate position on INSERT (next position for same user/week/day)
CREATE OR REPLACE FUNCTION public.set_task_position()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.position = 0 THEN
        SELECT COALESCE(MAX(position), -1) + 1
        INTO NEW.position
        FROM public.tasks
        WHERE user_id = NEW.user_id
          AND week_start_date = NEW.week_start_date
          AND day_of_week = NEW.day_of_week;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_set_position
    BEFORE INSERT ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.set_task_position();

-- ============================================================
-- ROUTINES TABLE
-- ============================================================

CREATE TABLE public.routines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_routines_user ON public.routines(user_id);

ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own routines"
    ON public.routines FOR SELECT TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own routines"
    ON public.routines FOR INSERT TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own routines"
    ON public.routines FOR UPDATE TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own routines"
    ON public.routines FOR DELETE TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE TRIGGER routines_set_updated_at
    BEFORE UPDATE ON public.routines
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- ROUTINE_ITEMS TABLE
-- ============================================================

CREATE TABLE public.routine_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    scheduled_time TEXT DEFAULT NULL CHECK (scheduled_time IS NULL OR scheduled_time ~ '^([01]\d|2[0-3]):[0-5]\d$'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_routine_items_routine ON public.routine_items(routine_id);

ALTER TABLE public.routine_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_items FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own routine items"
    ON public.routine_items FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.routines
        WHERE routines.id = routine_items.routine_id
        AND routines.user_id = (select auth.uid())
    ));

CREATE POLICY "Users can insert own routine items"
    ON public.routine_items FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.routines
        WHERE routines.id = routine_items.routine_id
        AND routines.user_id = (select auth.uid())
    ));

CREATE POLICY "Users can delete own routine items"
    ON public.routine_items FOR DELETE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.routines
        WHERE routines.id = routine_items.routine_id
        AND routines.user_id = (select auth.uid())
    ));

-- ============================================================
-- TASKS TABLE — routine_id column
-- ============================================================

ALTER TABLE public.tasks
ADD COLUMN routine_id UUID DEFAULT NULL REFERENCES public.routines(id) ON DELETE SET NULL;

CREATE INDEX idx_tasks_routine ON public.tasks(routine_id);

-- ============================================================
-- REALTIME
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.routines;
