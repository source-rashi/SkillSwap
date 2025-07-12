/**
 * Application constants and configuration
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
};

// Authentication
export const AUTH_CONFIG = {
  TOKEN_KEY: 'skillswap_token',
  REFRESH_TOKEN_KEY: 'skillswap_refresh_token',
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes before expiry
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000 // 24 hours
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 100,
  MOBILE_PAGE_SIZE: 6
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// Skill Categories
export const SKILL_CATEGORIES = {
  TECHNOLOGY: 'Technology',
  DESIGN: 'Design',
  BUSINESS: 'Business',
  CREATIVE: 'Creative',
  LANGUAGES: 'Languages',
  LIFESTYLE: 'Lifestyle',
  ACADEMIC: 'Academic',
  OTHER: 'Other'
};

// User Availability Options
export const AVAILABILITY_OPTIONS = [
  { value: 'flexible', label: 'Flexible', color: 'green' },
  { value: 'weekdays', label: 'Weekdays', color: 'blue' },
  { value: 'weekends', label: 'Weekends', color: 'purple' },
  { value: 'evenings', label: 'Evenings', color: 'orange' }
];

// Swap Request Status
export const SWAP_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COMPLETED: 'completed'
};

// Swap Status Colors
export const SWAP_STATUS_COLORS = {
  [SWAP_STATUS.PENDING]: 'yellow',
  [SWAP_STATUS.ACCEPTED]: 'green',
  [SWAP_STATUS.REJECTED]: 'red',
  [SWAP_STATUS.COMPLETED]: 'blue'
};

// Toast Configuration
export const TOAST_CONFIG = {
  DURATION: 5000, // 5 seconds
  POSITION: 'top-right',
  MAX_TOASTS: 5
};

// Validation Rules
export const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: false
  },
  SKILL: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50
  },
  MESSAGE: {
    MAX_LENGTH: 500
  },
  LOCATION: {
    MAX_LENGTH: 100
  }
};

// Search Configuration
export const SEARCH_CONFIG = {
  DEBOUNCE_DELAY: 300, // 300ms
  MIN_QUERY_LENGTH: 2,
  MAX_SUGGESTIONS: 10
};

// Theme Colors
export const THEME_COLORS = {
  PRIMARY: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },
  SUCCESS: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },
  WARNING: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  },
  ERROR: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  }
};

// Responsive Breakpoints
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px'
};

// Animation Durations
export const ANIMATION = {
  FAST: '150ms',
  NORMAL: '300ms',
  SLOW: '500ms'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'skillswap_auth_token',
  USER_PREFERENCES: 'skillswap_user_preferences',
  SEARCH_HISTORY: 'skillswap_search_history',
  THEME: 'skillswap_theme'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in!',
  LOGOUT: 'Successfully logged out!',
  REGISTER: 'Account created successfully!',
  PROFILE_UPDATE: 'Profile updated successfully!',
  SWAP_REQUEST_SENT: 'Swap request sent successfully!',
  SWAP_REQUEST_ACCEPTED: 'Swap request accepted!',
  SWAP_REQUEST_REJECTED: 'Swap request rejected.',
  SWAP_COMPLETED: 'Swap marked as completed!',
  FEEDBACK_SUBMITTED: 'Feedback submitted successfully!'
};

// Feature Flags
export const FEATURES = {
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_PUSH_NOTIFICATIONS: import.meta.env.VITE_ENABLE_PUSH_NOTIFICATIONS === 'true',
  ENABLE_REAL_TIME: import.meta.env.VITE_ENABLE_REAL_TIME === 'true',
  ENABLE_FILE_UPLOAD: import.meta.env.VITE_ENABLE_FILE_UPLOAD === 'true',
  ENABLE_GEOLOCATION: import.meta.env.VITE_ENABLE_GEOLOCATION === 'true'
};

// External Service URLs
export const EXTERNAL_SERVICES = {
  AVATAR_API: 'https://api.dicebear.com/7.x',
  GEOCODING_API: 'https://nominatim.openstreetmap.org',
  ANALYTICS_API: import.meta.env.VITE_ANALYTICS_API,
  SUPPORT_EMAIL: 'support@skillswap.com',
  PRIVACY_POLICY: '/privacy',
  TERMS_OF_SERVICE: '/terms'
};

// Social Media Links
export const SOCIAL_LINKS = {
  TWITTER: 'https://twitter.com/skillswap',
  FACEBOOK: 'https://facebook.com/skillswap',
  LINKEDIN: 'https://linkedin.com/company/skillswap',
  GITHUB: 'https://github.com/skillswap'
};

// SEO Configuration
export const SEO_CONFIG = {
  DEFAULT_TITLE: 'SkillSwap - Learn. Teach. Exchange Skills.',
  DEFAULT_DESCRIPTION: 'Connect with like-minded individuals to exchange knowledge and skills. Turn your expertise into learning opportunities.',
  DEFAULT_KEYWORDS: 'skill exchange, learning, teaching, skills, education, community',
  SITE_NAME: 'SkillSwap',
  SITE_URL: import.meta.env.VITE_SITE_URL || 'https://skillswap.com',
  DEFAULT_IMAGE: '/og-image.png'
};

export default {
  API_CONFIG,
  AUTH_CONFIG,
  PAGINATION,
  FILE_UPLOAD,
  SKILL_CATEGORIES,
  AVAILABILITY_OPTIONS,
  SWAP_STATUS,
  SWAP_STATUS_COLORS,
  TOAST_CONFIG,
  VALIDATION_RULES,
  SEARCH_CONFIG,
  THEME_COLORS,
  BREAKPOINTS,
  ANIMATION,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FEATURES,
  EXTERNAL_SERVICES,
  SOCIAL_LINKS,
  SEO_CONFIG
};
