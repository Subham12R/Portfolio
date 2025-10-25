const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { validateWorkExperience, validateId } = require('../middleware/validation');

const router = express.Router();

// Get all work experience (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { data: workExperience, error } = await supabase
      .from('work_experience')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Work experience fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch work experience' });
    }

    // Transform data to match frontend expectations
    const transformedExperience = workExperience.map(exp => ({
      ...exp,
      start: exp.start_date,
      end: exp.end_date
    }));

    res.json({ workExperience: transformedExperience });
  } catch (error) {
    console.error('Work experience error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single work experience (public)
router.get('/:id', optionalAuth, validateId, async (req, res) => {
  try {
    const { data: experience, error } = await supabase
      .from('work_experience')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !experience) {
      return res.status(404).json({ error: 'Work experience not found' });
    }

    // Transform data to match frontend expectations
    const transformedExperience = {
      ...experience,
      start: experience.start_date,
      end: experience.end_date
    };

    res.json({ experience: transformedExperience });
  } catch (error) {
    console.error('Work experience fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create work experience (admin only)
router.post('/', authenticateToken, requireAdmin, validateWorkExperience, async (req, res) => {
  try {
    const experienceData = {
      company: req.body.company,
      logo: req.body.logo || null,
      role: req.body.role,
      status: req.body.status,
      featured: req.body.featured || false,
      start_date: req.body.start || req.body.start_date,
      end_date: req.body.end || req.body.end_date || null,
      location: req.body.location,
      tech: req.body.tech || [],
      bullets: req.body.bullets || []
    };

    const { data: experience, error } = await supabase
      .from('work_experience')
      .insert(experienceData)
      .select('*')
      .single();

    if (error) {
      console.error('Work experience creation error:', error);
      return res.status(500).json({ error: 'Failed to create work experience' });
    }

    // Transform data to match frontend expectations
    const transformedExperience = {
      ...experience,
      start: experience.start_date,
      end: experience.end_date
    };

    res.status(201).json({
      message: 'Work experience created successfully',
      experience: transformedExperience
    });
  } catch (error) {
    console.error('Work experience creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update work experience (admin only)
router.put('/:id', authenticateToken, requireAdmin, validateId, validateWorkExperience, async (req, res) => {
  try {
    const experienceData = {
      company: req.body.company,
      logo: req.body.logo || null,
      role: req.body.role,
      status: req.body.status,
      featured: req.body.featured || false,
      start_date: req.body.start || req.body.start_date,
      end_date: req.body.end || req.body.end_date || null,
      location: req.body.location,
      tech: req.body.tech || [],
      bullets: req.body.bullets || []
    };

    const { data: experience, error } = await supabase
      .from('work_experience')
      .update(experienceData)
      .eq('id', req.params.id)
      .select('*')
      .single();

    if (error) {
      console.error('Work experience update error:', error);
      return res.status(500).json({ error: 'Failed to update work experience' });
    }

    if (!experience) {
      return res.status(404).json({ error: 'Work experience not found' });
    }

    // Transform data to match frontend expectations
    const transformedExperience = {
      ...experience,
      start: experience.start_date,
      end: experience.end_date
    };

    res.json({
      message: 'Work experience updated successfully',
      experience: transformedExperience
    });
  } catch (error) {
    console.error('Work experience update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete work experience (admin only)
router.delete('/:id', authenticateToken, requireAdmin, validateId, async (req, res) => {
  try {
    const { error } = await supabase
      .from('work_experience')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('Work experience deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete work experience' });
    }

    res.json({ message: 'Work experience deleted successfully' });
  } catch (error) {
    console.error('Work experience deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get featured work experience (public)
router.get('/featured/list', optionalAuth, async (req, res) => {
  try {
    const { data: featured, error } = await supabase
      .from('work_experience')
      .select('*')
      .eq('featured', true)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Featured work experience fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch featured work experience' });
    }

    // Transform data to match frontend expectations
    const transformedFeatured = featured.map(exp => ({
      ...exp,
      start: exp.start_date,
      end: exp.end_date
    }));

    res.json({ workExperience: transformedFeatured });
  } catch (error) {
    console.error('Featured work experience error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk operations (admin only)
router.post('/bulk', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { action, workExperience } = req.body;

    if (!action || !workExperience || !Array.isArray(workExperience)) {
      return res.status(400).json({ error: 'Invalid bulk request' });
    }

    let result;
    switch (action) {
      case 'create':
        result = await supabase
          .from('work_experience')
          .insert(workExperience)
          .select('*');
        break;
      case 'update':
        const updatePromises = workExperience.map(exp => 
          supabase
            .from('work_experience')
            .update(exp)
            .eq('id', exp.id)
        );
        result = await Promise.all(updatePromises);
        break;
      case 'delete':
        const ids = workExperience.map(e => e.id);
        result = await supabase
          .from('work_experience')
          .delete()
          .in('id', ids);
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    if (result.error) {
      console.error('Bulk operation error:', result.error);
      return res.status(500).json({ error: 'Bulk operation failed' });
    }

    res.json({
      message: `Bulk ${action} completed successfully`,
      count: workExperience.length
    });
  } catch (error) {
    console.error('Bulk operation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
