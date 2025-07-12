import React, { useState } from 'react';
import { Camera, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/UI/Card';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import SkillInput from '../components/Skills/SkillInput';
import { validateEmail, validateRequired } from '../utils/validation';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    location: user?.location || '',
    skillsOffered: user?.skillsOffered || [],
    skillsWanted: user?.skillsWanted || [],
    availability: user?.availability || [],
    isPublic: user?.isPublic || true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const availabilityOptions = [
    'Weekday Mornings', 'Weekday Afternoons', 'Weekday Evenings',
    'Weekend Mornings', 'Weekend Afternoons', 'Weekend Evenings'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear saved status when user makes changes
    if (saved) {
      setSaved(false);
    }
  };

  const handleAvailabilityChange = (availability: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(availability)
        ? prev.availability.filter(a => a !== availability)
        : [...prev.availability, availability]
    }));
    
    if (saved) {
      setSaved(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const nameError = validateRequired(formData.name, 'Name');
    if (nameError) newErrors.name = nameError;

    const emailError = validateRequired(formData.email, 'Email');
    if (emailError) {
      newErrors.email = emailError;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.skillsOffered.length === 0) {
      newErrors.skillsOffered = 'At least one skill offered is required';
    }

    if (formData.skillsWanted.length === 0) {
      newErrors.skillsWanted = 'At least one skill wanted is required';
    }

    if (formData.availability.length === 0) {
      newErrors.availability = 'Please select at least one availability option';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await updateProfile(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000); // Clear saved status after 3 seconds
    } catch (error: any) {
      setErrors({ 
        general: error.response?.data?.message || 'Failed to update profile. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-1 text-gray-600">
            Manage your profile information and skill preferences
          </p>
        </div>

        <Card>
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {saved && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">Profile updated successfully!</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo */}
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-2xl">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
                <p className="text-sm text-gray-500 mt-1">
                  JPG, GIF or PNG. 1MB max.
                </p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="Enter your full name"
                required
              />

              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="Enter your email"
                required
              />
            </div>

            <Input
              label="Location (Optional)"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, State or Country"
              helperText="This helps others find local skill swaps"
            />

            {/* Skills */}
            <SkillInput
              skills={formData.skillsOffered}
              onSkillsChange={(skills) => setFormData(prev => ({ ...prev, skillsOffered: skills }))}
              label="Skills You Can Offer"
              placeholder="e.g., Photoshop, Guitar, Cooking..."
              variant="offered"
            />
            {errors.skillsOffered && (
              <p className="text-sm text-red-600 mt-1">{errors.skillsOffered}</p>
            )}

            <SkillInput
              skills={formData.skillsWanted}
              onSkillsChange={(skills) => setFormData(prev => ({ ...prev, skillsWanted: skills }))}
              label="Skills You Want to Learn"
              placeholder="e.g., Web Design, Spanish, Photography..."
              variant="wanted"
            />
            {errors.skillsWanted && (
              <p className="text-sm text-red-600 mt-1">{errors.skillsWanted}</p>
            )}

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                When are you available?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availabilityOptions.map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.availability.includes(option)}
                      onChange={() => handleAvailabilityChange(option)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              {errors.availability && (
                <p className="text-sm text-red-600 mt-1">{errors.availability}</p>
              )}
            </div>

            {/* Privacy Settings */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h3>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-700">
                  Make my profile public (others can find and contact me)
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                When your profile is public, other users can find you through skill searches and send you swap requests.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                loading={loading}
                className="min-w-[120px]"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Profile;