const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { validateCertificate, validateCertificateUpdate, validateId } = require('../middleware/validation');

const router = express.Router();

// Helper function to convert snake_case to camelCase
const toCamelCase = (str) => {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
};

// Helper function to convert object keys from snake_case to camelCase
const convertKeysToCamelCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToCamelCase(item));
  }
  
  const result = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = toCamelCase(key);
      result[camelKey] = convertKeysToCamelCase(obj[key]);
    }
  }
  return result;
};

// Get all certificates (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { data: certificates, error } = await supabase
      .from('certificates')
      .select('*')
      .order('issue_date', { ascending: false });

    if (error) {
      console.error('Certificates fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch certificates' });
    }

    const convertedCertificates = convertKeysToCamelCase(certificates);
    res.json({ certificates: convertedCertificates });
  } catch (error) {
    console.error('Certificates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single certificate (public)
router.get('/:id', optionalAuth, validateId, async (req, res) => {
  try {
    const { data: certificate, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const convertedCertificate = convertKeysToCamelCase(certificate);
    res.json({ certificate: convertedCertificate });
  } catch (error) {
    console.error('Certificate fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create certificate (admin only)
router.post('/', authenticateToken, requireAdmin, validateCertificate, async (req, res) => {
  try {
    const certificateData = {
      name: req.body.name,
      issuer: req.body.issuer,
      issue_date: req.body.issueDate,
      credential_id: req.body.credentialId || null,
      credential_url: req.body.credentialUrl || null,
      image: req.body.image || null,
      description: req.body.description,
      skills: req.body.skills || []
    };

    const { data: certificate, error } = await supabase
      .from('certificates')
      .insert(certificateData)
      .select('*')
      .single();

    if (error) {
      console.error('Certificate creation error:', error);
      return res.status(500).json({ error: 'Failed to create certificate' });
    }

    const convertedCertificate = convertKeysToCamelCase(certificate);
    res.status(201).json({
      message: 'Certificate created successfully',
      certificate: convertedCertificate
    });
  } catch (error) {
    console.error('Certificate creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update certificate (admin only)
router.put('/:id', authenticateToken, requireAdmin, validateId, validateCertificateUpdate, async (req, res) => {
  try {
    const certificateData = {
      name: req.body.name,
      issuer: req.body.issuer,
      issue_date: req.body.issueDate,
      credential_id: req.body.credentialId || null,
      credential_url: req.body.credentialUrl || null,
      image: req.body.image || null,
      description: req.body.description,
      skills: req.body.skills || []
    };

    const { data: certificate, error } = await supabase
      .from('certificates')
      .update(certificateData)
      .eq('id', req.params.id)
      .select('*')
      .single();

    if (error) {
      console.error('Certificate update error:', error);
      return res.status(500).json({ error: 'Failed to update certificate' });
    }

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const convertedCertificate = convertKeysToCamelCase(certificate);
    res.json({
      message: 'Certificate updated successfully',
      certificate: convertedCertificate
    });
  } catch (error) {
    console.error('Certificate update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete certificate (admin only)
router.delete('/:id', authenticateToken, requireAdmin, validateId, async (req, res) => {
  try {
    const { error } = await supabase
      .from('certificates')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('Certificate deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete certificate' });
    }

    res.json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    console.error('Certificate deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get certificates by issuer (public)
router.get('/issuer/:issuer', optionalAuth, async (req, res) => {
  try {
    const { data: certificates, error } = await supabase
      .from('certificates')
      .select('*')
      .ilike('issuer', `%${req.params.issuer}%`)
      .order('issue_date', { ascending: false });

    if (error) {
      console.error('Certificates by issuer fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch certificates' });
    }

    res.json({ certificates });
  } catch (error) {
    console.error('Certificates by issuer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search certificates (public)
router.get('/search/:query', optionalAuth, async (req, res) => {
  try {
    const query = req.params.query;
    const { data: certificates, error } = await supabase
      .from('certificates')
      .select('*')
      .or(`name.ilike.%${query}%,issuer.ilike.%${query}%,description.ilike.%${query}%`)
      .order('issue_date', { ascending: false });

    if (error) {
      console.error('Certificate search error:', error);
      return res.status(500).json({ error: 'Failed to search certificates' });
    }

    res.json({ certificates });
  } catch (error) {
    console.error('Certificate search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk operations (admin only)
router.post('/bulk', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { action, certificates } = req.body;

    if (!action || !certificates || !Array.isArray(certificates)) {
      return res.status(400).json({ error: 'Invalid bulk request' });
    }

    let result;
    switch (action) {
      case 'create':
        result = await supabase
          .from('certificates')
          .insert(certificates)
          .select('*');
        break;
      case 'update':
        const updatePromises = certificates.map(cert => 
          supabase
            .from('certificates')
            .update(cert)
            .eq('id', cert.id)
        );
        result = await Promise.all(updatePromises);
        break;
      case 'delete':
        const ids = certificates.map(c => c.id);
        result = await supabase
          .from('certificates')
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
      count: certificates.length
    });
  } catch (error) {
    console.error('Bulk operation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
