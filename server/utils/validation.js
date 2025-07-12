const Joi = require('joi');

/**
 * Common validation schemas
 */
const schemas = {
  // MongoDB ObjectId validation
  objectId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).message('Invalid ID format'),
  
  // Email validation
  email: Joi.string().email().lowercase().trim(),
  
  // Password validation
  password: Joi.string().min(6).max(128),
  
  // Name validation
  name: Joi.string().min(2).max(100).trim(),
  
  // Skill validation
  skill: Joi.string().min(1).max(50).trim(),
  
  // Location validation
  location: Joi.string().max(100).trim(),
  
  // Message validation
  message: Joi.string().max(500).trim(),
  
  // Rating validation
  rating: Joi.number().integer().min(1).max(5),
  
  // Availability validation
  availability: Joi.string().valid('weekdays', 'weekends', 'evenings', 'flexible'),
  
  // Status validation
  swapStatus: Joi.string().valid('pending', 'accepted', 'rejected', 'completed'),
  
  // Pagination validation
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
};

/**
 * User registration validation schema
 */
const registerSchema = Joi.object({
  name: schemas.name.required(),
  email: schemas.email.required(),
  password: schemas.password.required()
});

/**
 * User login validation schema
 */
const loginSchema = Joi.object({
  email: schemas.email.required(),
  password: Joi.string().required()
});

/**
 * Profile update validation schema
 */
const profileUpdateSchema = Joi.object({
  name: schemas.name,
  location: schemas.location.allow(''),
  skillsOffered: Joi.array().items(schemas.skill).max(20),
  skillsWanted: Joi.array().items(schemas.skill).max(20),
  availability: schemas.availability,
  isPublic: Joi.boolean()
});

/**
 * Swap request validation schema
 */
const swapRequestSchema = Joi.object({
  recipient: schemas.objectId.required(),
  skillOffered: schemas.skill.required(),
  skillRequested: schemas.skill.required(),
  message: schemas.message.allow(''),
  scheduledDate: Joi.date().min('now').allow(null)
});

/**
 * Swap update validation schema
 */
const swapUpdateSchema = Joi.object({
  status: schemas.swapStatus.required(),
  rejectionReason: Joi.when('status', {
    is: 'rejected',
    then: Joi.string().max(200).required(),
    otherwise: Joi.string().max(200).optional()
  })
});

/**
 * Feedback validation schema
 */
const feedbackSchema = Joi.object({
  swapRequestId: schemas.objectId.required(),
  rating: schemas.rating.required(),
  comment: schemas.message.allow(''),
  isPublic: Joi.boolean().default(true)
});

/**
 * Query parameters validation schema
 */
const querySchema = Joi.object({
  page: schemas.page,
  limit: schemas.limit,
  search: Joi.string().max(100).trim().allow(''),
  skill: Joi.string().max(50).trim().allow(''),
  location: Joi.string().max(100).trim().allow(''),
  availability: schemas.availability.allow(''),
  status: schemas.swapStatus.allow(''),
  type: Joi.string().valid('all', 'sent', 'received').allow('')
});

/**
 * Admin user status update schema
 */
const userStatusSchema = Joi.object({
  isActive: Joi.boolean().required()
});

/**
 * Validate data against schema
 * @param {object} data - Data to validate
 * @param {object} schema - Joi schema
 * @returns {object} Validation result
 */
const validateData = (data, schema) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return { isValid: false, errors, data: null };
  }

  return { isValid: true, errors: null, data: value };
};

/**
 * Sanitize user input
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid ObjectId
 */
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with score and feedback
 */
const validatePasswordStrength = (password) => {
  const result = {
    score: 0,
    feedback: [],
    isValid: false
  };

  if (password.length < 6) {
    result.feedback.push('Password must be at least 6 characters long');
    return result;
  }

  if (password.length >= 8) result.score += 1;
  if (/[a-z]/.test(password)) result.score += 1;
  if (/[A-Z]/.test(password)) result.score += 1;
  if (/\d/.test(password)) result.score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) result.score += 1;

  if (result.score < 2) {
    result.feedback.push('Password should include uppercase, lowercase, numbers, and special characters');
  }

  result.isValid = result.score >= 2;
  return result;
};

module.exports = {
  schemas,
  registerSchema,
  loginSchema,
  profileUpdateSchema,
  swapRequestSchema,
  swapUpdateSchema,
  feedbackSchema,
  querySchema,
  userStatusSchema,
  validateData,
  sanitizeInput,
  isValidEmail,
  isValidObjectId,
  validatePasswordStrength
};
