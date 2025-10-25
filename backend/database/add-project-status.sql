-- Add status column to projects table
-- This migration adds a status field to track if a project is "Working" or "Completed"

-- Add status column with default value 'Completed'
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Completed' CHECK (status IN ('Working', 'Completed'));

-- Update existing projects to have 'Completed' status (if they don't have one)
UPDATE projects SET status = 'Completed' WHERE status IS NULL;

-- Create index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
