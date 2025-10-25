const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addProjectStatus() {
  try {
    console.log('Adding status column to projects table...');
    
    // First, let's check if the status column already exists
    const { data: projects, error: fetchError } = await supabase
      .from('projects')
      .select('id, status')
      .limit(1);
    
    if (fetchError) {
      console.error('Error checking projects table:', fetchError);
      return;
    }
    
    // Check if status column exists by looking at the first project
    if (projects && projects.length > 0 && projects[0].hasOwnProperty('status')) {
      console.log('✅ Status column already exists in projects table');
      return;
    }
    
    console.log('⚠️  Status column does not exist. Please run the following SQL in your Supabase SQL editor:');
    console.log('');
    console.log('-- Add status column to projects table');
    console.log('ALTER TABLE projects ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT \'Completed\' CHECK (status IN (\'Working\', \'Completed\'));');
    console.log('');
    console.log('-- Update existing projects to have \'Completed\' status');
    console.log('UPDATE projects SET status = \'Completed\' WHERE status IS NULL;');
    console.log('');
    console.log('-- Create index for better performance on status queries');
    console.log('CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);');
    console.log('');
    console.log('After running the SQL, restart your backend server.');
    
  } catch (error) {
    console.error('Error adding project status:', error);
  }
}

// Run the migration
addProjectStatus();
