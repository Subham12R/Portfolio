const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { validateAboutMe } = require('../middleware/validation');

const router = express.Router();

// Get about me (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { data: aboutMe, error } = await supabase
      .from('about_me')
      .select('*')
      .single();

    if (error) {
      console.error('About me fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch about me data' });
    }

    if (!aboutMe) {
      return res.status(404).json({ error: 'About me data not found' });
    }

    res.json({ aboutMe });
  } catch (error) {
    console.error('About me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update about me (admin only)
router.put('/', authenticateToken, requireAdmin, validateAboutMe, async (req, res) => {
  try {
    const aboutData = {
      name: req.body.name,
      title: req.body.title,
      bio: req.body.bio,
      email: req.body.email || null,
      location: req.body.location || null,
      social_links: req.body.socialLinks || {}
    };

    // Check if about me record exists
    const { data: existingAbout } = await supabase
      .from('about_me')
      .select('id')
      .single();

    let result;
    if (existingAbout) {
      // Update existing record
      result = await supabase
        .from('about_me')
        .update(aboutData)
        .eq('id', existingAbout.id)
        .select('*')
        .single();
    } else {
      // Create new record
      result = await supabase
        .from('about_me')
        .insert(aboutData)
        .select('*')
        .single();
    }

    if (result.error) {
      console.error('About me update error:', result.error);
      return res.status(500).json({ error: 'Failed to update about me data' });
    }

    res.json({
      message: 'About me data updated successfully',
      aboutMe: result.data
    });
  } catch (error) {
    console.error('About me update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get social links only (public)
router.get('/social', optionalAuth, async (req, res) => {
  try {
    const { data: aboutMe, error } = await supabase
      .from('about_me')
      .select('social_links')
      .single();

    if (error) {
      console.error('Social links fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch social links' });
    }

    if (!aboutMe) {
      return res.status(404).json({ error: 'Social links not found' });
    }

    res.json({ socialLinks: aboutMe.social_links });
  } catch (error) {
    console.error('Social links error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update social links only (admin only)
router.put('/social', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { socialLinks } = req.body;

    if (!socialLinks || typeof socialLinks !== 'object') {
      return res.status(400).json({ error: 'Invalid social links data' });
    }

    // Check if about me record exists
    const { data: existingAbout } = await supabase
      .from('about_me')
      .select('id')
      .single();

    let result;
    if (existingAbout) {
      // Update existing record
      result = await supabase
        .from('about_me')
        .update({ social_links: socialLinks })
        .eq('id', existingAbout.id)
        .select('social_links')
        .single();
    } else {
      // Create new record with default values
      const defaultAbout = {
        name: 'Your Name',
        title: 'Full Stack Developer',
        bio: 'Passionate developer with expertise in modern web technologies.',
        social_links: socialLinks
      };
      
      result = await supabase
        .from('about_me')
        .insert(defaultAbout)
        .select('social_links')
        .single();
    }

    if (result.error) {
      console.error('Social links update error:', result.error);
      return res.status(500).json({ error: 'Failed to update social links' });
    }

    res.json({
      message: 'Social links updated successfully',
      socialLinks: result.data.social_links
    });
  } catch (error) {
    console.error('Social links update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset about me to default (admin only)
router.post('/reset', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const defaultAbout = {
      name: 'Your Name',
      title: 'Full Stack Developer',
      bio: 'Passionate developer with expertise in modern web technologies. I love building scalable applications and solving complex problems.',
      email: 'your.email@example.com',
      location: 'Your Location',
      social_links: {
        github: 'https://github.com/yourusername',
        linkedin: 'https://linkedin.com/in/yourusername',
        twitter: 'https://twitter.com/yourusername'
      }
    };

    // Check if about me record exists
    const { data: existingAbout } = await supabase
      .from('about_me')
      .select('id')
      .single();

    let result;
    if (existingAbout) {
      // Update existing record
      result = await supabase
        .from('about_me')
        .update(defaultAbout)
        .eq('id', existingAbout.id)
        .select('*')
        .single();
    } else {
      // Create new record
      result = await supabase
        .from('about_me')
        .insert(defaultAbout)
        .select('*')
        .single();
    }

    if (result.error) {
      console.error('About me reset error:', result.error);
      return res.status(500).json({ error: 'Failed to reset about me data' });
    }

    res.json({
      message: 'About me data reset to default successfully',
      aboutMe: result.data
    });
  } catch (error) {
    console.error('About me reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
