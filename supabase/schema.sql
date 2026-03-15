-- Database Schema for Lumina AI Notes

-- Create Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Folders table
CREATE TABLE IF NOT EXISTS public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Note',
  content TEXT, -- Markdown content
  type TEXT NOT NULL DEFAULT 'text', -- text, voice, image, pdf, url
  is_pinned BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Note_Tags join table
CREATE TABLE IF NOT EXISTS public.note_tags (
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

-- Create AI_Summaries table
CREATE TABLE IF NOT EXISTS public.ai_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE UNIQUE,
  summary_text TEXT,
  bullet_points JSONB, -- Array of strings
  key_insights JSONB,
  action_items JSONB,
  important_quotes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Shared_Notes table
CREATE TABLE IF NOT EXISTS public.shared_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL DEFAULT 'read', -- read, edit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_notes ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
-- Profiles: Users can only read/write their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Folders: Users can only read/write their own folders
CREATE POLICY "Users can manage own folders" ON public.folders USING (auth.uid() = user_id);

-- Notes: Users can manage own notes or notes shared with them
CREATE POLICY "Users can manage own notes" ON public.notes USING (auth.uid() = user_id);
CREATE POLICY "Users can view shared notes" ON public.notes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.shared_notes WHERE note_id = id AND user_id = auth.uid())
);

-- Tags: Users can manage own tags
CREATE POLICY "Users can manage own tags" ON public.tags USING (auth.uid() = user_id);

-- Note_Tags: Users can manage tags for notes they own
CREATE POLICY "Users can manage note tags" ON public.note_tags USING (
  EXISTS (SELECT 1 FROM public.notes WHERE id = note_id AND user_id = auth.uid())
);

-- AI_Summaries: Users can view summaries of notes they own or have access to
CREATE POLICY "Users can view summaries" ON public.ai_summaries FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.notes WHERE id = note_id AND user_id = auth.uid())
);

-- Full-text search index for notes
CREATE INDEX IF NOT EXISTS notes_content_search_idx ON public.notes USING GIN (to_tsvector('english', title || ' ' || COALESCE(content, '')));

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
