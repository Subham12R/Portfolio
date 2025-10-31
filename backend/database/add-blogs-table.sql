-- Add blogs table for storing embedded blog posts
-- This migration creates a table to store blog posts with embedded codes (Twitter, YouTube, etc.)

-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    embedded_code TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for ordering blogs
CREATE INDEX IF NOT EXISTS idx_blogs_order_index ON blogs(order_index);
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON blogs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for public read access
CREATE POLICY "Public read access for blogs" ON blogs FOR SELECT USING (true);

-- Create RLS policy for admin write access
CREATE POLICY "Admin full access for blogs" ON blogs FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

