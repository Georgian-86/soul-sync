-- Migration: Add profile_picture column to users table
-- This script adds the profile_picture column to store base64 encoded images

-- For PostgreSQL/Supabase (will fail silently if column exists):
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='users' AND column_name='profile_picture'
  ) THEN
    ALTER TABLE users ADD COLUMN profile_picture TEXT;
  END IF;
END $$;

-- For MySQL/MariaDB (uncomment if using MySQL):
-- ALTER TABLE users ADD COLUMN profile_picture TEXT;
