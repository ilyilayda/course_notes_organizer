import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  department: string | null;
  target_courses: string[] | null;
  daily_study_goal: number;
  weekly_study_goal: number;
  preferred_study_mode: string;
  theme_preference: string;
  created_at: string;
  updated_at: string;
};

export type CourseNote = {
  id: string;
  user_id: string;
  title: string;
  course_name: string;
  topic: string | null;
  note_type: string;
  original_text: string | null;
  file_name: string | null;
  tags: string[] | null;
  short_summary: string | null;
  detailed_summary: string | null;
  beginner_summary: string | null;
  key_concepts: string[] | null;
  created_at: string;
  updated_at: string;
};

export type Flashcard = {
  id: string;
  note_id: string;
  user_id: string;
  question: string;
  answer: string;
  difficulty: string;
  tag: string | null;
  status: string;
  created_at: string;
};

export type QuizQuestion = {
  id: string;
  note_id: string;
  user_id: string;
  question: string;
  type: string;
  options: string[];
  correct_answer: string;
  explanation: string | null;
  difficulty: string;
  tag: string | null;
  created_at: string;
};

export type StudySession = {
  id: string;
  user_id: string;
  note_id: string | null;
  mode: string | null;
  duration: number;
  flashcards_studied: number;
  quiz_score: number;
  weak_topics: string[] | null;
  created_at: string;
};
