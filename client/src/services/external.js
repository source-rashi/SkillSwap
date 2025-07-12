import axios from 'axios';

/**
 * External API service for third-party integrations
 */

// Avatar generation service
export const avatarService = {
  /**
   * Generate avatar URL for user
   * @param {string} name - User name
   * @param {object} options - Avatar options
   * @returns {string} Avatar URL
   */
  generateAvatar: (name, options = {}) => {
    const {
      size = 100,
      background = 'random',
      format = 'svg'
    } = options;

    // Using DiceBear API for avatar generation
    const encodedName = encodeURIComponent(name);
    return `https://api.dicebear.com/7.x/initials/${format}?seed=${encodedName}&size=${size}&backgroundColor=${background}`;
  },

  /**
   * Get multiple avatar styles for user to choose from
   * @param {string} name - User name
   * @returns {array} Array of avatar URLs
   */
  getAvatarOptions: (name) => {
    const styles = ['initials', 'avataaars', 'personas', 'miniavs'];
    return styles.map(style => ({
      style,
      url: `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(name)}&size=100`
    }));
  }
};

// Location service
export const locationService = {
  /**
   * Get location suggestions based on query
   * @param {string} query - Search query
   * @returns {Promise<array>} Location suggestions
   */
  getSuggestions: async (query) => {
    try {
      // Using OpenStreetMap Nominatim API (free alternative to Google Places)
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: query,
          format: 'json',
          limit: 5,
          countrycodes: 'us,ca,gb,au', // Limit to specific countries
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'SkillSwap-Platform'
        }
      });

      return response.data.map(item => ({
        name: item.display_name,
        city: item.address?.city || item.address?.town || item.address?.village,
        state: item.address?.state,
        country: item.address?.country,
        coordinates: [parseFloat(item.lon), parseFloat(item.lat)]
      }));
    } catch (error) {
      console.error('Location service error:', error);
      // Return fallback suggestions
      return [
        { name: 'New York, NY, USA', city: 'New York', state: 'NY', country: 'USA' },
        { name: 'Los Angeles, CA, USA', city: 'Los Angeles', state: 'CA', country: 'USA' },
        { name: 'Chicago, IL, USA', city: 'Chicago', state: 'IL', country: 'USA' }
      ];
    }
  },

  /**
   * Get user's current location
   * @returns {Promise<object>} Current location
   */
  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Reverse geocoding to get address
            const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
              params: {
                lat: latitude,
                lon: longitude,
                format: 'json',
                addressdetails: 1
              },
              headers: {
                'User-Agent': 'SkillSwap-Platform'
              }
            });

            const address = response.data.address;
            resolve({
              coordinates: [longitude, latitude],
              city: address?.city || address?.town || address?.village,
              state: address?.state,
              country: address?.country,
              name: response.data.display_name
            });
          } catch (error) {
            reject(error);
          }
        },
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }
};

// Skill suggestion service
export const skillService = {
  /**
   * Get popular skills list
   * @returns {array} Popular skills
   */
  getPopularSkills: () => {
    return [
      // Programming & Technology
      'JavaScript', 'Python', 'React', 'Node.js', 'HTML/CSS', 'Java', 'C++', 'SQL',
      'Machine Learning', 'Data Science', 'Web Development', 'Mobile Development',
      'UI/UX Design', 'Graphic Design', 'Digital Marketing', 'SEO',
      
      // Creative Skills
      'Photography', 'Video Editing', 'Writing', 'Content Creation', 'Illustration',
      'Music Production', 'Drawing', 'Painting', 'Crafting', 'Animation',
      
      // Business & Professional
      'Project Management', 'Leadership', 'Public Speaking', 'Sales', 'Marketing',
      'Accounting', 'Finance', 'Consulting', 'Negotiation', 'Strategy',
      
      // Languages
      'Spanish', 'French', 'German', 'Mandarin', 'Japanese', 'Italian', 'Portuguese',
      'Arabic', 'Russian', 'Korean',
      
      // Lifestyle & Personal
      'Cooking', 'Fitness Training', 'Yoga', 'Meditation', 'Gardening', 'Home Repair',
      'Car Maintenance', 'Fashion', 'Interior Design', 'Travel Planning',
      
      // Academic & Educational
      'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Literature',
      'Psychology', 'Economics', 'Philosophy', 'Research Methods'
    ];
  },

  /**
   * Get skill suggestions based on query
   * @param {string} query - Search query
   * @returns {array} Filtered skills
   */
  getSuggestions: (query) => {
    const skills = skillService.getPopularSkills();
    if (!query) return skills.slice(0, 10);
    
    const lowercaseQuery = query.toLowerCase();
    return skills
      .filter(skill => skill.toLowerCase().includes(lowercaseQuery))
      .slice(0, 10);
  },

  /**
   * Get skill categories
   * @returns {object} Categorized skills
   */
  getSkillCategories: () => {
    return {
      'Technology': [
        'JavaScript', 'Python', 'React', 'Node.js', 'HTML/CSS', 'Java', 'C++', 'SQL',
        'Machine Learning', 'Data Science', 'Web Development', 'Mobile Development'
      ],
      'Design': [
        'UI/UX Design', 'Graphic Design', 'Photography', 'Video Editing', 'Illustration',
        'Animation', 'Interior Design', 'Fashion'
      ],
      'Business': [
        'Digital Marketing', 'SEO', 'Project Management', 'Leadership', 'Public Speaking',
        'Sales', 'Marketing', 'Accounting', 'Finance', 'Consulting'
      ],
      'Creative': [
        'Writing', 'Content Creation', 'Music Production', 'Drawing', 'Painting',
        'Crafting', 'Photography', 'Video Editing'
      ],
      'Languages': [
        'Spanish', 'French', 'German', 'Mandarin', 'Japanese', 'Italian',
        'Portuguese', 'Arabic', 'Russian', 'Korean'
      ],
      'Lifestyle': [
        'Cooking', 'Fitness Training', 'Yoga', 'Meditation', 'Gardening',
        'Home Repair', 'Car Maintenance', 'Travel Planning'
      ],
      'Academic': [
        'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History',
        'Literature', 'Psychology', 'Economics', 'Philosophy'
      ]
    };
  }
};

// Analytics service (for future implementation)
export const analyticsService = {
  /**
   * Track user event
   * @param {string} event - Event name
   * @param {object} properties - Event properties
   */
  track: (event, properties = {}) => {
    // Implement analytics tracking (Google Analytics, Mixpanel, etc.)
    if (import.meta.env.DEV) {
      console.log('Analytics Event:', event, properties);
    }
    
    // Example: Google Analytics 4
    if (window.gtag) {
      window.gtag('event', event, properties);
    }
  },

  /**
   * Track page view
   * @param {string} page - Page name
   */
  pageView: (page) => {
    analyticsService.track('page_view', { page });
  },

  /**
   * Track user signup
   * @param {string} method - Signup method
   */
  trackSignup: (method = 'email') => {
    analyticsService.track('sign_up', { method });
  },

  /**
   * Track skill swap request
   * @param {object} swapData - Swap request data
   */
  trackSwapRequest: (swapData) => {
    analyticsService.track('swap_request_sent', {
      skill_offered: swapData.skillOffered,
      skill_requested: swapData.skillRequested
    });
  }
};

export default {
  avatarService,
  locationService,
  skillService,
  analyticsService
};
