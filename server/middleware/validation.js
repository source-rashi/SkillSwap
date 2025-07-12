const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  next();
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
    
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters'),
    
  body('skillsOffered')
    .isArray({ min: 1 })
    .withMessage('At least one skill must be offered')
    .custom((skills) => {
      if (skills.some(skill => typeof skill !== 'string' || skill.trim().length === 0)) {
        throw new Error('All skills must be non-empty strings');
      }
      if (skills.some(skill => skill.length > 50)) {
        throw new Error('Skill names cannot exceed 50 characters');
      }
      return true;
    }),
    
  body('skillsWanted')
    .isArray({ min: 1 })
    .withMessage('At least one skill must be wanted')
    .custom((skills) => {
      if (skills.some(skill => typeof skill !== 'string' || skill.trim().length === 0)) {
        throw new Error('All skills must be non-empty strings');
      }
      if (skills.some(skill => skill.length > 50)) {
        throw new Error('Skill names cannot exceed 50 characters');
      }
      return true;
    }),
    
  body('availability')
    .isArray({ min: 1 })
    .withMessage('At least one availability option must be selected')
    .custom((availability) => {
      const validOptions = [
        'Weekday Mornings',
        'Weekday Afternoons',
        'Weekday Evenings',
        'Weekend Mornings',
        'Weekend Afternoons',
        'Weekend Evenings'
      ];
      
      if (availability.some(option => !validOptions.includes(option))) {
        throw new Error('Invalid availability option');
      }
      return true;
    }),
    
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean value'),
    
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
    
  handleValidationErrors
];

const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
    
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters'),
    
  body('skillsOffered')
    .optional()
    .isArray()
    .withMessage('Skills offered must be an array'),
    
  body('skillsWanted')
    .optional()
    .isArray()
    .withMessage('Skills wanted must be an array'),
    
  body('availability')
    .optional()
    .isArray()
    .withMessage('Availability must be an array'),
    
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean value'),
    
  handleValidationErrors
];

// Swap request validation rules
const validateSwapRequest = [
  body('target')
    .isMongoId()
    .withMessage('Target user ID must be a valid MongoDB ObjectId'),
    
  body('skillRequested')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Requested skill must be between 1 and 100 characters'),
    
  body('skillOffered')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Offered skill must be between 1 and 100 characters'),
    
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message cannot exceed 500 characters'),
    
  body('scheduledDate')
    .optional()
    .isISO8601()
    .withMessage('Scheduled date must be a valid date')
    .custom((date) => {
      if (new Date(date) <= new Date()) {
        throw new Error('Scheduled date must be in the future');
      }
      return true;
    }),
    
  body('duration')
    .optional()
    .isFloat({ min: 0.5, max: 8 })
    .withMessage('Duration must be between 0.5 and 8 hours'),
    
  body('meetingType')
    .optional()
    .isIn(['in-person', 'online', 'hybrid'])
    .withMessage('Meeting type must be in-person, online, or hybrid'),
    
  handleValidationErrors
];

const validateSwapUpdate = [
  body('status')
    .optional()
    .isIn(['pending', 'accepted', 'rejected', 'completed', 'cancelled'])
    .withMessage('Invalid status value'),
    
  body('scheduledDate')
    .optional()
    .isISO8601()
    .withMessage('Scheduled date must be a valid date'),
    
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
    
  handleValidationErrors
];

// Feedback validation rules
const validateFeedback = [
  body('swapRequest')
    .isMongoId()
    .withMessage('Swap request ID must be a valid MongoDB ObjectId'),
    
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
    
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
    
  body('skillRating.teaching')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Teaching rating must be between 1 and 5'),
    
  body('skillRating.communication')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Communication rating must be between 1 and 5'),
    
  body('skillRating.punctuality')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Punctuality rating must be between 1 and 5'),
    
  body('skillRating.helpfulness')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Helpfulness rating must be between 1 and 5'),
    
  body('wouldRecommend')
    .optional()
    .isBoolean()
    .withMessage('Would recommend must be a boolean value'),
    
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
    
  handleValidationErrors
];

// Parameter validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
    
  handleValidationErrors
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  handleValidationErrors
];

const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
    
  query('skill')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Skill filter must be between 1 and 50 characters'),
    
  query('location')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Location filter must be between 1 and 100 characters'),
    
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateSwapRequest,
  validateSwapUpdate,
  validateFeedback,
  validateObjectId,
  validatePagination,
  validateSearch,
  handleValidationErrors
};