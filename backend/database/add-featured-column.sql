-- Add featured column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Update existing projects to be featured
UPDATE projects SET featured = true WHERE featured IS NULL OR featured = false;

-- Add featured column to work_experience table (if not exists)
ALTER TABLE work_experience ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Update existing work experience to be featured
UPDATE work_experience SET featured = true WHERE featured IS NULL OR featured = false;
