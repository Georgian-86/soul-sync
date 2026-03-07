-- Supabase Database Schema for Mind Tracker

-- Users table (Patients)
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  age INTEGER,
  phone_number VARCHAR(20),
  gender VARCHAR(50),
  role VARCHAR(20) DEFAULT 'patient',
  is_active BOOLEAN DEFAULT true,
  questionnaire_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Doctors table  
CREATE TABLE doctors (
  doctor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  specialty VARCHAR(100),
  bio TEXT,
  profile_image TEXT,
  education TEXT,
  experience_years INTEGER,
  success_stories TEXT,
  rating DECIMAL(3,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Admins table
CREATE TABLE admins (
  admin_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  is_super_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Mood logs table (updated to support multiple moods per hour)
CREATE TABLE mood_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  log_hour INTEGER NOT NULL CHECK (log_hour >= 0 AND log_hour < 24),
  mood_type VARCHAR(50) NOT NULL,
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 5),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Journal entries table
CREATE TABLE journal_entries (
  entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  title VARCHAR(255),
  content TEXT,
  mood VARCHAR(50),
  theme VARCHAR(50) DEFAULT 'default',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Art creations table
CREATE TABLE art_creations (
  art_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  art_type VARCHAR(50) NOT NULL,
  art_data TEXT,
  thumbnail TEXT,
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Music preferences table
CREATE TABLE music_preferences (
  preference_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  music_track VARCHAR(255) NOT NULL,
  listened_at TIMESTAMP DEFAULT NOW()
);

-- Questionnaire responses table
CREATE TABLE questionnaire_responses (
  response_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  responses JSONB NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW()
);

-- Appointments table
CREATE TABLE appointments (
  appointment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(doctor_id) ON DELETE CASCADE,
  appointment_date TIMESTAMP NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Doctor posts table
CREATE TABLE doctor_posts (
  post_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(doctor_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50),
  tags TEXT[],
  image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Post likes table
CREATE TABLE post_likes (
  like_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES doctor_posts(post_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- User settings table
CREATE TABLE user_settings (
  setting_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  theme VARCHAR(50) DEFAULT 'default',
  sound_enabled BOOLEAN DEFAULT true,
  voice_enabled BOOLEAN DEFAULT true,
  color_scheme VARCHAR(20) DEFAULT 'light',
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Games table
CREATE TABLE games (
  game_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  thumbnail TEXT,
  is_active BOOLEAN DEFAULT true
);

-- User game sessions table
CREATE TABLE user_game_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  played_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_mood_logs_user_date ON mood_logs(user_id, log_date);
CREATE INDEX idx_journal_entries_user ON journal_entries(user_id);
CREATE INDEX idx_appointments_user ON appointments(user_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_doctor_posts_published ON doctor_posts(is_published, created_at);
CREATE INDEX idx_post_likes_post ON post_likes(post_id);

-- Insert sample admin
INSERT INTO admins (email, name, is_super_admin) VALUES 
  ('admin@mindtracker.com', 'Admin User', true);

-- Insert sample doctor
INSERT INTO doctors (email, name, specialty, bio, experience_years, rating) VALUES 
  ('dr.smith@mindtracker.com', 'Dr. Sarah Smith', 'Clinical Psychology', 'Compassionate therapist with 10+ years of experience helping individuals overcome anxiety and depression.', 10, 4.9),
  ('dr.johnson@mindtracker.com', 'Dr. Michael Johnson', 'Cognitive Behavioral Therapy', 'Specializing in CBT techniques for stress management and emotional regulation.', 7, 4.8);

-- Insert sample games
INSERT INTO games (game_name, description, category) VALUES 
  ('Bubble Pop', 'Pop bubbles to relieve stress', 'relaxation'),
  ('Breathing Exercise', 'Guided breathing for calmness', 'meditation'),
  ('Memory Match', 'Improve focus and relax', 'cognitive');
