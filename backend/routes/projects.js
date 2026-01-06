const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { validateProject, validateId } = require('../middleware/validation');

const router = express.Router();

// Get all projects (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Projects fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }

    // Transform data to match frontend expectations
    const transformedProjects = projects.map(project => ({
      ...project,
      liveUrl: project.live_url
    }));

    console.log('Projects with status:', transformedProjects.map(p => ({ name: p.name, status: p.status })));

    res.json({ projects: transformedProjects });
  } catch (error) {
    console.error('Projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single project (public)
router.get('/:id', optionalAuth, validateId, async (req, res) => {
  try {
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Transform data to match frontend expectations
    const transformedProject = {
      ...project,
      liveUrl: project.live_url
    };

    res.json({ project: transformedProject });
  } catch (error) {
    console.error('Project fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create project (admin only)
router.post('/', authenticateToken, requireAdmin, validateProject, async (req, res) => {
  try {
    // Helper function to normalize URLs
    const normalizeUrl = (url) => {
      if (!url || url.trim() === '') return null;
      const trimmedUrl = url.trim();
      if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
        return trimmedUrl;
      }
      return `https://${trimmedUrl}`;
    };

    const projectData = {
      name: req.body.name,
      category: req.body.category,
      date: req.body.date,
      image: req.body.image || null,
      video_url: req.body.video_url || req.body.videoUrl || null,
      thumbnail: req.body.thumbnail || null,
      description: req.body.description,
      github: normalizeUrl(req.body.github),
      live_url: normalizeUrl(req.body.liveUrl),
      tech: req.body.tech || [],
      features: req.body.features || [],
      status: req.body.status || 'Completed'
    };

    const { data: project, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select('*')
      .single();

    if (error) {
      console.error('Project creation error:', error);
      return res.status(500).json({ error: 'Failed to create project' });
    }

    // Transform data to match frontend expectations
    const transformedProject = {
      ...project,
      liveUrl: project.live_url
    };

    res.status(201).json({
      message: 'Project created successfully',
      project: transformedProject
    });
  } catch (error) {
    console.error('Project creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update project (admin only)
router.put('/:id', authenticateToken, requireAdmin, validateId, validateProject, async (req, res) => {
  try {
    // Helper function to normalize URLs
    const normalizeUrl = (url) => {
      if (!url || url.trim() === '') return null;
      const trimmedUrl = url.trim();
      if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
        return trimmedUrl;
      }
      return `https://${trimmedUrl}`;
    };

    const projectData = {
      name: req.body.name,
      category: req.body.category,
      date: req.body.date,
      image: req.body.image || req.body.thumbnail || null,
      video_url: req.body.video_url || req.body.videoUrl || null,
      description: req.body.description,
      github: normalizeUrl(req.body.github),
      live_url: normalizeUrl(req.body.liveUrl),
      tech: req.body.tech || [],
      features: req.body.features || [],
      status: req.body.status || 'Completed'
    };

    const { data: project, error } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', req.params.id)
      .select('*')
      .single();

    if (error) {
      console.error('Project update error:', error);
      return res.status(500).json({ error: 'Failed to update project' });
    }

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Transform data to match frontend expectations
    const transformedProject = {
      ...project,
      liveUrl: project.live_url
    };

    res.json({
      message: 'Project updated successfully',
      project: transformedProject
    });
  } catch (error) {
    console.error('Project update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete project (admin only)
router.delete('/:id', authenticateToken, requireAdmin, validateId, async (req, res) => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('Project deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete project' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Project deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk operations (admin only)
router.post('/bulk', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { action, projects } = req.body;

    if (!action || !projects || !Array.isArray(projects)) {
      return res.status(400).json({ error: 'Invalid bulk request' });
    }

    let result;
    switch (action) {
      case 'create':
        result = await supabase
          .from('projects')
          .insert(projects)
          .select('*');
        break;
      case 'update':
        // Update multiple projects
        const updatePromises = projects.map(project => 
          supabase
            .from('projects')
            .update(project)
            .eq('id', project.id)
        );
        result = await Promise.all(updatePromises);
        break;
      case 'delete':
        const ids = projects.map(p => p.id);
        result = await supabase
          .from('projects')
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
      count: projects.length
    });
  } catch (error) {
    console.error('Bulk operation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
