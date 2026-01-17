const { body, param, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Validation errors:', errors.array());
    console.error('Request body:', req.body);
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Project validation rules
const validateProject = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('date').trim().notEmpty().withMessage('Date is required'),
  body('status').optional().isIn(['Working', 'Completed']).withMessage('Status must be Working or Completed'),
  body('github').optional().custom((value) => {
    if (!value || value.trim() === '') return true;
    return /^https?:\/\/.+/.test(value);
  }).withMessage('GitHub URL must be valid'),
  body('liveUrl').optional().custom((value) => {
    if (!value || value.trim() === '') return true;
    // Allow URLs with or without protocol, but if no protocol, assume https
    const urlPattern = /^(https?:\/\/)?[^\s/$.?#].[^\s]*$/i;
    return urlPattern.test(value);
  }).withMessage('Live URL must be valid'),
  body('image').optional().custom((value) => {
    if (!value || value.trim() === '') return true;
    return /^https?:\/\/.+/.test(value);
  }).withMessage('Image URL must be valid'),
  body('tech').optional().isArray().withMessage('Tech must be an array'),
  body('features').optional().isArray().withMessage('Features must be an array'),
  handleValidationErrors
];

// Work experience validation rules
const validateWorkExperience = [
  body('company').trim().notEmpty().withMessage('Company is required'),
  body('role').trim().notEmpty().withMessage('Role is required'),
  body('start').optional().trim(),
  body('start_date').optional().trim(),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('status').isIn(['active', 'inactive', 'completed']).withMessage('Status must be active, inactive, or completed'),
  body('tech').optional().isArray().withMessage('Tech must be an array'),
  body('bullets').optional().isArray().withMessage('Bullets must be an array'),
  // Custom validation to ensure at least one start date field is provided
  body().custom((value) => {
    if (!value.start && !value.start_date) {
      throw new Error('Start date is required (use either start or start_date field)');
    }
    return true;
  }),
  handleValidationErrors
];

// Certificate validation rules (for creation)
const validateCertificate = [
  body('name').trim().notEmpty().withMessage('Certificate name is required'),
  body('issuer').trim().notEmpty().withMessage('Issuer is required'),
  body('issueDate').trim().notEmpty().withMessage('Issue date is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('credentialUrl').optional().custom((value) => {
    if (!value || value.trim() === '') return true;
    return /^https?:\/\/.+/.test(value);
  }).withMessage('Credential URL must be valid'),
  body('image').optional().custom((value) => {
    if (!value || value.trim() === '') return true;
    return /^https?:\/\/.+/.test(value);
  }).withMessage('Image URL must be valid'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  handleValidationErrors
];

// Certificate update validation rules (fields are optional for updates)
const validateCertificateUpdate = [
  body('name').optional().trim().notEmpty().withMessage('Certificate name cannot be empty'),
  body('issuer').optional().trim().notEmpty().withMessage('Issuer cannot be empty'),
  body('issueDate').optional().trim().notEmpty().withMessage('Issue date cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('credentialUrl').optional().custom((value) => {
    if (!value || value.trim() === '') return true;
    return /^https?:\/\/.+/.test(value);
  }).withMessage('Credential URL must be valid'),
  body('image').optional().custom((value) => {
    if (!value || value.trim() === '') return true;
    return /^https?:\/\/.+/.test(value);
  }).withMessage('Image URL must be valid'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  handleValidationErrors
];

// Gear validation rules
const validateGear = [
  body('name').trim().notEmpty().withMessage('Gear name is required'),
  body('type').isIn(['laptop', 'desktop', 'monitor', 'keyboard', 'mouse', 'headphones', 'extension']).withMessage('Invalid gear type'),
  body('specs').optional().trim(),
  body('link').optional().custom((value) => {
    if (!value || value.trim() === '') return true;
    return /^https?:\/\/.+/.test(value);
  }).withMessage('Link must be valid URL'),
  handleValidationErrors
];

// About me validation rules
const validateAboutMe = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('bio').trim().notEmpty().withMessage('Bio is required'),
  body('email').optional().isEmail().withMessage('Email must be valid'),
  body('location').optional().trim(),
  body('socialLinks').optional().isObject().withMessage('Social links must be an object'),
  handleValidationErrors
];

// ID parameter validation
const validateId = [
  param('id').isUUID().withMessage('Invalid ID format'),
  handleValidationErrors
];

// Auth validation rules
const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

const validateRegister = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  handleValidationErrors
];

module.exports = {
  validateProject,
  validateWorkExperience,
  validateCertificate,
  validateCertificateUpdate,
  validateGear,
  validateAboutMe,
  validateId,
  validateLogin,
  validateRegister,
  handleValidationErrors
};
