const User = require('../models/User');
const axios = require('axios');

const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    console.log('Received profile update request:');
    console.log('User ID:', req.user._id);
    console.log('Updates:', JSON.stringify(updates, null, 2));
    console.log('Profile Image in updates:', updates.profileImage);
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );
    
    console.log('Updated user profile image:', user.profileImage);
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      skill,
      availability,
      location,
      search
    } = req.query;

    const query = { isPublic: true, isActive: true };

    // Add filters
    if (skill) {
      query.$or = [
        { skillsOffered: { $regex: skill, $options: 'i' } },
        { skillsWanted: { $regex: skill, $options: 'i' } }
      ];
    }

    if (availability) {
      query.availability = availability;
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { skillsOffered: { $regex: search, $options: 'i' } },
        { skillsWanted: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Increment profile views if not viewing own profile
    if (req.user._id.toString() !== user._id.toString()) {
      await User.findByIdAndUpdate(user._id, { $inc: { profileViews: 1 } });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// External API integration for location autocomplete
const getLocationSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    
    // Using a free geocoding API (replace with your preferred service)
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
      {
        params: {
          access_token: process.env.MAPBOX_TOKEN,
          types: 'place,locality',
          limit: 5
        }
      }
    );

    const suggestions = response.data.features.map(feature => ({
      name: feature.place_name,
      coordinates: feature.center
    }));

    res.json(suggestions);
  } catch (error) {
    // Fallback to simple suggestions if API fails
    const fallbackSuggestions = [
      { name: 'New York, NY', coordinates: [-74.006, 40.7128] },
      { name: 'Los Angeles, CA', coordinates: [-118.2437, 34.0522] },
      { name: 'Chicago, IL', coordinates: [-87.6298, 41.8781] }
    ];
    res.json(fallbackSuggestions);
  }
};

module.exports = {
  updateProfile,
  getUsers,
  getUserById,
  getLocationSuggestions
};
