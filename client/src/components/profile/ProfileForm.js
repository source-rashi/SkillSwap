import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ImageUpload from '../common/ImageUpload';
import { Plus, X, MapPin, Clock, Eye, EyeOff, User } from 'lucide-react';

const ProfileForm = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [skillsOffered, setSkillsOffered] = useState([]);
  const [skillsWanted, setSkillsWanted] = useState([]);
  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [newSkillWanted, setNewSkillWanted] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm();

  const watchLocation = watch('location');

  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('location', user.location || '');
      setValue('availability', user.availability || 'flexible');
      setValue('isPublic', user.isPublic !== false);
      setSkillsOffered(user.skillsOffered || []);
      setSkillsWanted(user.skillsWanted || []);
      setProfileImage(user.profileImage || '');
    }
  }, [user, setValue]);

  useEffect(() => {
    if (watchLocation && watchLocation.length > 2) {
      fetchLocationSuggestions(watchLocation);
    }
  }, [watchLocation]);

  const fetchLocationSuggestions = async (query) => {
    try {
      const response = await api.get('/users/locations', { params: { query } });
      setLocationSuggestions(response);
    } catch (error) {
      setLocationSuggestions([]);
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        toast.error('Please upload a valid image (JPEG, PNG, or GIF)');
        return;
      }
      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const addSkill = (type) => {
    const skill = type === 'offered' ? newSkillOffered : newSkillWanted;
    if (!skill.trim()) return;

    if (type === 'offered') {
      if (!skillsOffered.includes(skill)) {
        setSkillsOffered([...skillsOffered, skill]);
      }
      setNewSkillOffered('');
    } else {
      if (!skillsWanted.includes(skill)) {
        setSkillsWanted([...skillsWanted, skill]);
      }
      setNewSkillWanted('');
    }
  };

  const removeSkill = (type, skill) => {
    if (type === 'offered') {
      setSkillsOffered(skillsOffered.filter(s => s !== skill));
    } else {
      setSkillsWanted(skillsWanted.filter(s => s !== skill));
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const updateData = {
        name: data.name,
        location: data.location,
        availability: data.availability,
        isPublic: data.isPublic,
        skillsOffered,
        skillsWanted,
        profileImage
      };

      console.log('Submitting profile update with data:', updateData);
      console.log('Profile image URL:', profileImage);

      const response = await api.put('/users/profile', updateData);
      updateUser(response.user);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.error || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (imageUrl) => {
    console.log('Image uploaded, URL:', imageUrl);
    setProfileImage(imageUrl);
    
    // Also save the profileImage to the database immediately
    saveProfileImageToDatabase(imageUrl);
  };

  const saveProfileImageToDatabase = async (imageUrl) => {
    try {
      console.log('Saving profile image to database:', imageUrl);
      const response = await api.put('/users/profile', { profileImage: imageUrl });
      console.log('Profile image saved to database, response:', response);
      updateUser(response.user);
      toast.success('Profile picture updated!');
    } catch (error) {
      console.error('Failed to save profile image:', error);
      toast.error('Failed to save profile picture');
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mb-4">
          <User className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Edit Profile</h2>
        <p className="text-gray-600">Update your information and skills</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Profile Image */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
          <ImageUpload
            currentImage={profileImage}
            onImageUpload={handleImageUpload}
            className="mx-auto"
          />
        </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            {...register('name', {
              required: 'Name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' }
            })}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              {...register('location')}
              type="text"
              placeholder="Enter your city, state"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {locationSuggestions.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto">
                {locationSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setValue('location', suggestion.name)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                  >
                    {suggestion.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Availability */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Availability
        </label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            {...register('availability')}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="flexible">Flexible</option>
            <option value="weekdays">Weekdays</option>
            <option value="weekends">Weekends</option>
            <option value="evenings">Evenings</option>
          </select>
        </div>
      </div>

      {/* Skills Offered */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Skills I Can Offer
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {skillsOffered.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill('offered', skill)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkillOffered}
            onChange={(e) => setNewSkillOffered(e.target.value)}
            placeholder="Add a skill you can teach"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('offered'))}
          />
          <button
            type="button"
            onClick={() => addSkill('offered')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Skills Wanted */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Skills I Want to Learn
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {skillsWanted.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill('wanted', skill)}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkillWanted}
            onChange={(e) => setNewSkillWanted(e.target.value)}
            placeholder="Add a skill you want to learn"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('wanted'))}
          />
          <button
            type="button"
            onClick={() => addSkill('wanted')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="flex items-center">
        <input
          {...register('isPublic')}
          type="checkbox"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-700">
          Make my profile public (others can find and contact me)
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
          Update Profile
        </button>
      </div>
    </form>
    </div>
  );
};

export default ProfileForm;