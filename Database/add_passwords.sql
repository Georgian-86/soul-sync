-- Migration: Add password columns to all role tables
-- Run this in Supabase SQL Editor

-- Add password to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Add password to doctors table
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Add password to admins table
ALTER TABLE admins ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Update existing admin with password
UPDATE admins SET password = 'admin123' WHERE email = 'admin@mindtracker.com';

-- Update existing doctors with password
UPDATE doctors SET password = 'doctor123' WHERE email = 'dr.smith@mindtracker.com';
UPDATE doctors SET password = 'doctor123' WHERE email = 'dr.johnson@mindtracker.com';

-- Insert a demo patient if not exists
INSERT INTO users (email, name, age, gender, password) 
VALUES ('demo@demo.com', 'Demo User', 25, 'prefer not to say', 'demo123')
ON CONFLICT (email) DO UPDATE SET password = 'demo123';
