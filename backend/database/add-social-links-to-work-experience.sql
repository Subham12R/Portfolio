-- Migration: Add social links to work_experience table
-- Run this SQL in your Supabase SQL editor if you already have the work_experience table

-- Add social links columns to work_experience table
ALTER TABLE work_experience 
ADD COLUMN IF NOT EXISTS website VARCHAR(500),
ADD COLUMN IF NOT EXISTS twitter VARCHAR(500),
ADD COLUMN IF NOT EXISTS linkedin VARCHAR(500),
ADD COLUMN IF NOT EXISTS github VARCHAR(500);

-- Update existing records with empty social links if needed
UPDATE work_experience 
SET website = '', twitter = '', linkedin = '', github = ''
WHERE website IS NULL OR twitter IS NULL OR linkedin IS NULL OR github IS NULL;
