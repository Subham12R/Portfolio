const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { validateGear, validateId } = require('../middleware/validation');

const router = express.Router();

// Get all gears (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { data: gears, error } = await supabase
      .from('gears')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Gears fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch gears' });
    }

    // Group gears by type
    const groupedGears = {
      devices: gears.filter(gear => gear.type !== 'extension'),
      extensions: gears.filter(gear => gear.type === 'extension')
    };

    res.json({ gears: groupedGears });
  } catch (error) {
    console.error('Gears error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get gears by type (public)
router.get('/type/:type', optionalAuth, async (req, res) => {
  try {
    const { type } = req.params;
    const validTypes = ['laptop', 'desktop', 'monitor', 'keyboard', 'mouse', 'headphones', 'extension'];
    
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid gear type' });
    }

    const { data: gears, error } = await supabase
      .from('gears')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Gears by type fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch gears' });
    }

    res.json({ gears });
  } catch (error) {
    console.error('Gears by type error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single gear (public)
router.get('/:id', optionalAuth, validateId, async (req, res) => {
  try {
    const { data: gear, error } = await supabase
      .from('gears')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !gear) {
      return res.status(404).json({ error: 'Gear not found' });
    }

    res.json({ gear });
  } catch (error) {
    console.error('Gear fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create gear (admin only)
router.post('/', authenticateToken, requireAdmin, validateGear, async (req, res) => {
  try {
    const gearData = {
      name: req.body.name,
      specs: req.body.specs || null,
      type: req.body.type,
      link: req.body.link || null
    };

    const { data: gear, error } = await supabase
      .from('gears')
      .insert(gearData)
      .select('*')
      .single();

    if (error) {
      console.error('Gear creation error:', error);
      return res.status(500).json({ error: 'Failed to create gear' });
    }

    res.status(201).json({
      message: 'Gear created successfully',
      gear
    });
  } catch (error) {
    console.error('Gear creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update gear (admin only)
router.put('/:id', authenticateToken, requireAdmin, validateId, validateGear, async (req, res) => {
  try {
    const gearData = {
      name: req.body.name,
      specs: req.body.specs || null,
      type: req.body.type,
      link: req.body.link || null
    };

    const { data: gear, error } = await supabase
      .from('gears')
      .update(gearData)
      .eq('id', req.params.id)
      .select('*')
      .single();

    if (error) {
      console.error('Gear update error:', error);
      return res.status(500).json({ error: 'Failed to update gear' });
    }

    if (!gear) {
      return res.status(404).json({ error: 'Gear not found' });
    }

    res.json({
      message: 'Gear updated successfully',
      gear
    });
  } catch (error) {
    console.error('Gear update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete gear (admin only)
router.delete('/:id', authenticateToken, requireAdmin, validateId, async (req, res) => {
  try {
    const { error } = await supabase
      .from('gears')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('Gear deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete gear' });
    }

    res.json({ message: 'Gear deleted successfully' });
  } catch (error) {
    console.error('Gear deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get devices only (public)
router.get('/devices/list', optionalAuth, async (req, res) => {
  try {
    const { data: devices, error } = await supabase
      .from('gears')
      .select('*')
      .neq('type', 'extension')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Devices fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch devices' });
    }

    res.json({ devices });
  } catch (error) {
    console.error('Devices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get extensions only (public)
router.get('/extensions/list', optionalAuth, async (req, res) => {
  try {
    const { data: extensions, error } = await supabase
      .from('gears')
      .select('*')
      .eq('type', 'extension')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Extensions fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch extensions' });
    }

    res.json({ extensions });
  } catch (error) {
    console.error('Extensions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk operations (admin only)
router.post('/bulk', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { action, gears } = req.body;

    if (!action || !gears || !Array.isArray(gears)) {
      return res.status(400).json({ error: 'Invalid bulk request' });
    }

    let result;
    switch (action) {
      case 'create':
        result = await supabase
          .from('gears')
          .insert(gears)
          .select('*');
        break;
      case 'update':
        const updatePromises = gears.map(gear => 
          supabase
            .from('gears')
            .update(gear)
            .eq('id', gear.id)
        );
        result = await Promise.all(updatePromises);
        break;
      case 'delete':
        const ids = gears.map(g => g.id);
        result = await supabase
          .from('gears')
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
      count: gears.length
    });
  } catch (error) {
    console.error('Bulk operation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
