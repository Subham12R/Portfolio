-- Portfolio Database Schema for Supabase
-- Run this SQL in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    date VARCHAR(50) NOT NULL,
    image TEXT,
    description TEXT NOT NULL,
    github VARCHAR(500),
    live_url VARCHAR(500),
    tech JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work experience table
CREATE TABLE IF NOT EXISTS work_experience (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company VARCHAR(255) NOT NULL,
    logo VARCHAR(500),
    role VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Working', 'Completed')),
    featured BOOLEAN DEFAULT false,
    start_date VARCHAR(50) NOT NULL,
    end_date VARCHAR(50),
    location VARCHAR(255) NOT NULL,
    tech JSONB DEFAULT '[]'::jsonb,
    bullets JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    issuer VARCHAR(255) NOT NULL,
    issue_date VARCHAR(50) NOT NULL,
    credential_id VARCHAR(255),
    credential_url VARCHAR(500),
    image VARCHAR(500),
    description TEXT NOT NULL,
    skills JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gears table (devices and extensions)
CREATE TABLE IF NOT EXISTS gears (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specs TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('laptop', 'desktop', 'monitor', 'keyboard', 'mouse', 'headphones', 'extension')),
    link VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- About me table (single record)
CREATE TABLE IF NOT EXISTS about_me (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    bio TEXT NOT NULL,
    email VARCHAR(255),
    location VARCHAR(255),
    social_links JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_work_experience_status ON work_experience(status);
CREATE INDEX IF NOT EXISTS idx_work_experience_featured ON work_experience(featured);
CREATE INDEX IF NOT EXISTS idx_gears_type ON gears(type);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_experience_updated_at BEFORE UPDATE ON work_experience FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON certificates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gears_updated_at BEFORE UPDATE ON gears FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_about_me_updated_at BEFORE UPDATE ON about_me FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password_hash, name, role) 
VALUES (
    'admin@portfolio.com', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
    'Admin User', 
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Insert default about me data
INSERT INTO about_me (name, title, bio, email, location, social_links)
VALUES (
    'Your Name',
    'Full Stack Developer',
    'Passionate developer with expertise in modern web technologies. I love building scalable applications and solving complex problems.',
    'your.email@example.com',
    'Your Location',
    '{"github": "https://github.com/yourusername", "linkedin": "https://linkedin.com/in/yourusername", "twitter": "https://twitter.com/yourusername"}'::jsonb
) ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE gears ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_me ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Public read access for projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read access for work_experience" ON work_experience FOR SELECT USING (true);
CREATE POLICY "Public read access for certificates" ON certificates FOR SELECT USING (true);
CREATE POLICY "Public read access for gears" ON gears FOR SELECT USING (true);
CREATE POLICY "Public read access for about_me" ON about_me FOR SELECT USING (true);

-- Create RLS policies for admin write access
CREATE POLICY "Admin full access for projects" ON projects FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);
CREATE POLICY "Admin full access for work_experience" ON work_experience FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);
CREATE POLICY "Admin full access for certificates" ON certificates FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);
CREATE POLICY "Admin full access for gears" ON gears FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);
CREATE POLICY "Admin full access for about_me" ON about_me FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);
