import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { Plus, X, MapPin, Clock, Eye, EyeOff } from 'lucide-react';

const ProfileForm = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [skillsOffered, setSkillsOffered] = useState([]);
  const [skillsWanted, setSkillsWanted] = useState([]);
  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [newSkillWanted, setNewSkillWanted] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profilePicture || '');

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
      setPreviewUrl(user.profilePicture || '');
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
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('location', data.location);
      formData.append('availability', data.availability);
      formData.append('isPublic', data.isPublic);
      formData.append('skillsOffered', JSON.stringify(skillsOffered));
      formData.append('skillsWanted', JSON.stringify(skillsWanted));
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      const response = await api.put('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      updateUser(response.user);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.error || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Profile Picture */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Picture
        </label>
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400">No Image</span>
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleProfilePictureChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <p className="mt-1 text-sm text-gray-500">
              JPEG, PNG, or GIF (Max 5MB)
            </p>
          </div>
        </div>
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
  );
};

export default ProfileForm;