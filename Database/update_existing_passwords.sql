-- Migration: Update existing records to ensure all have passwords
-- Run this in Supabase SQL Editor

-- First, ensure password columns exist (if not already added)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS password VARCHAR(255);
ALTER TABLE admins ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Update any users without passwords (demo user and others)
UPDATE users 
SET password = 'demo123' 
WHERE password IS NULL OR password = '';

-- Specifically update demo user if exists
UPDATE users 
SET password = 'demo123' 
WHERE email = 'demo@demo.com';

-- Update any doctors without passwords
UPDATE doctors 
SET password = 'doctor123' 
WHERE password IS NULL OR password = '';

-- Update specific doctors if they exist
UPDATE doctors 
SET password = 'doctor123' 
WHERE email = 'dr.smith@mindtracker.com';

UPDATE doctors 
SET password = 'doctor123' 
WHERE email = 'dr.johnson@mindtracker.com';

-- Update any admins without passwords
UPDATE admins 
SET password = 'admin123' 
WHERE password IS NULL OR password = '';

-- Update specific admin if exists
UPDATE admins 
SET password = 'admin123' 
WHERE email = 'admin@mindtracker.com';

-- Verify the updates
SELECT 'Users updated' as table_name, COUNT(*) as records_with_password 
FROM users WHERE password IS NOT NULL AND password != ''
UNION ALL
SELECT 'Doctors updated', COUNT(*) 
FROM doctors WHERE password IS NOT NULL AND password != ''
UNION ALL
SELECT 'Admins updated', COUNT(*) 
FROM admins WHERE password IS NOT NULL AND password != '';

