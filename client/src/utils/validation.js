/**
 * Client-side validation utilities
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result
 */
export const validatePassword = (password) => {
  const result = {
    isValid: false,
    score: 0,
    feedback: []
  };

  if (!password) {
    result.feedback.push('Password is required');
    return result;
  }

  if (password.length < 6) {
    result.feedback.push('Password must be at least 6 characters long');
    return result;
  }

  // Check password strength criteria
  const criteria = [
    { test: password.length >= 8, message: 'At least 8 characters' },
    { test: /[a-z]/.test(password), message: 'At least one lowercase letter' },
    { test: /[A-Z]/.test(password), message: 'At least one uppercase letter' },
    { test: /\d/.test(password), message: 'At least one number' },
    { test: /[!@#$%^&*(),.?":{}|<>]/.test(password), message: 'At least one special character' }
  ];

  criteria.forEach(criterion => {
    if (criterion.test) {
      result.score += 1;
    } else {
      result.feedback.push(criterion.message);
    }
  });

  result.isValid = result.score >= 3; // Require at least 3 criteria
  return result;
};

/**
 * Validate name format
 * @param {string} name - Name to validate
 * @returns {object} Validation result
 */
export const validateName = (name) => {
  const result = { isValid: false, message: '' };

  if (!name || !name.trim()) {
    result.message = 'Name is required';
    return result;
  }

  if (name.trim().length < 2) {
    result.message = 'Name must be at least 2 characters long';
    return result;
  }

  if (name.trim().length > 100) {
    result.message = 'Name must be less than 100 characters';
    return result;
  }

  if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
    result.message = 'Name can only contain letters, spaces, hyphens, and apostrophes';
    return result;
  }

  result.isValid = true;
  return result;
};

/**
 * Validate skill format
 * @param {string} skill - Skill to validate
 * @returns {object} Validation result
 */
export const validateSkill = (skill) => {
  const result = { isValid: false, message: '' };

  if (!skill || !skill.trim()) {
    result.message = 'Skill is required';
    return result;
  }

  if (skill.trim().length < 1) {
    result.message = 'Skill cannot be empty';
    return result;
  }

  if (skill.trim().length > 50) {
    result.message = 'Skill must be less than 50 characters';
    return result;
  }

  result.isValid = true;
  return result;
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone number
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

/**
 * Sanitize HTML input
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeHtml = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {array} allowedTypes - Allowed MIME types
 * @returns {object} Validation result
 */
export const validateFileType = (file, allowedTypes = []) => {
  const result = { isValid: false, message: '' };

  if (!file) {
    result.message = 'No file selected';
    return result;
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    result.message = `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
    return result;
  }

  result.isValid = true;
  return result;
};

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSize - Maximum size in bytes
 * @returns {object} Validation result
 */
export const validateFileSize = (file, maxSize = 5 * 1024 * 1024) => { // 5MB default
  const result = { isValid: false, message: '' };

  if (!file) {
    result.message = 'No file selected';
    return result;
  }

  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    result.message = `File size too large. Maximum size: ${maxSizeMB}MB`;
    return result;
  }

  result.isValid = true;
  return result;
};

/**
 * Validate form data
 * @param {object} data - Form data to validate
 * @param {object} rules - Validation rules
 * @returns {object} Validation result
 */
export const validateForm = (data, rules) => {
  const errors = {};
  let isValid = true;

  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = data[field];

    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors[field] = `${field} is required`;
      isValid = false;
      return;
    }

    if (value && rule.minLength && value.length < rule.minLength) {
      errors[field] = `${field} must be at least ${rule.minLength} characters`;
      isValid = false;
      return;
    }

    if (value && rule.maxLength && value.length > rule.maxLength) {
      errors[field] = `${field} must be less than ${rule.maxLength} characters`;
      isValid = false;
      return;
    }

    if (value && rule.pattern && !rule.pattern.test(value)) {
      errors[field] = rule.message || `${field} format is invalid`;
      isValid = false;
      return;
    }

    if (value && rule.custom) {
      const customResult = rule.custom(value);
      if (!customResult.isValid) {
        errors[field] = customResult.message;
        isValid = false;
      }
    }
  });

  return { isValid, errors };
};

/**
 * Real-time validation hook helper
 * @param {string} value - Value to validate
 * @param {object} rules - Validation rules
 * @returns {object} Validation state
 */
export const useFieldValidation = (value, rules) => {
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    const result = validateForm({ field: value }, { field: rules });
    setError(result.errors.field || '');
    setIsValid(result.isValid);
  }, [value, rules]);

  return { error, isValid };
};

export default {
  isValidEmail,
  validatePassword,
  validateName,
  validateSkill,
  isValidUrl,
  isValidPhone,
  sanitizeHtml,
  validateFileType,
  validateFileSize,
  validateForm,
  useFieldValidation
};
