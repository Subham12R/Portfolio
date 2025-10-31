const express = require('express');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { validateId } = require('../middleware/validation');

const router = express.Router();

// Get all blogs (public) - ordered by order_index, then created_at
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('*')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Blogs fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch blogs' });
    }

    res.json({ blogs: blogs || [] });
  } catch (error) {
    console.error('Blogs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single blog (public)
router.get('/:id', optionalAuth, validateId, async (req, res) => {
  try {
    const { data: blog, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({ blog });
  } catch (error) {
    console.error('Blog fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create blog (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, embedded_code, description, order_index } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!embedded_code || !embedded_code.trim()) {
      return res.status(400).json({ error: 'Embedded code is required' });
    }

    // Sanitize embedded code: remove script tags (they won't execute via dangerouslySetInnerHTML anyway)
    let sanitizedCode = embedded_code.trim()
    // Remove script tags using regex (for both opening and closing tags)
    sanitizedCode = sanitizedCode.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim()

    const blogData = {
      title: title.trim(),
      embedded_code: sanitizedCode,
      description: description ? description.trim() : null,
      order_index: order_index !== undefined ? parseInt(order_index) : 0
    };

    // Use supabaseAdmin to bypass RLS for admin operations
    const { data: blog, error } = await supabaseAdmin
      .from('blogs')
      .insert(blogData)
      .select('*')
      .single();

    if (error) {
      console.error('Blog creation error:', error);
      return res.status(500).json({ error: 'Failed to create blog' });
    }

    res.status(201).json({
      message: 'Blog created successfully',
      blog
    });
  } catch (error) {
    console.error('Blog creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update blog (admin only)
router.put('/:id', authenticateToken, requireAdmin, validateId, async (req, res) => {
  try {
    const { title, embedded_code, description, order_index } = req.body;

    // Build update object with only provided fields
    const blogData = {};
    
    if (title !== undefined) {
      if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Title cannot be empty' });
      }
      blogData.title = title.trim();
    }

    if (embedded_code !== undefined) {
      if (!embedded_code || !embedded_code.trim()) {
        return res.status(400).json({ error: 'Embedded code cannot be empty' });
      }
      // Sanitize embedded code: remove script tags
      let sanitizedCode = embedded_code.trim()
      sanitizedCode = sanitizedCode.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim()
      blogData.embedded_code = sanitizedCode;
    }

    if (description !== undefined) {
      blogData.description = description ? description.trim() : null;
    }

    if (order_index !== undefined) {
      blogData.order_index = parseInt(order_index);
    }

    // Use supabaseAdmin to bypass RLS for admin operations
    const { data: blog, error } = await supabaseAdmin
      .from('blogs')
      .update(blogData)
      .eq('id', req.params.id)
      .select('*')
      .single();

    if (error) {
      console.error('Blog update error:', error);
      return res.status(500).json({ error: 'Failed to update blog' });
    }

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({
      message: 'Blog updated successfully',
      blog
    });
  } catch (error) {
    console.error('Blog update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete blog (admin only)
router.delete('/:id', authenticateToken, requireAdmin, validateId, async (req, res) => {
  try {
    // Use supabaseAdmin to bypass RLS for admin operations
    const { error } = await supabaseAdmin
      .from('blogs')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('Blog deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete blog' });
    }

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Blog deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

