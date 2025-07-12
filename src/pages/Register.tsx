import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import SkillInput from '../components/Skills/SkillInput';
import { validateEmail, validatePassword, validateRequired, validateSkills } from '../utils/validation';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
    skillsOffered: [] as string[],
    skillsWanted: [] as string[],
    availability: [] as string[],
    isPublic: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

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
  };

  const handleAvailabilityChange = (availability: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(availability)
        ? prev.availability.filter(a => a !== availability)
        : [...prev.availability, availability]
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    const nameError = validateRequired(formData.name, 'Name');
    if (nameError) newErrors.name = nameError;

    // Email validation
    const emailError = validateRequired(formData.email, 'Email');
    if (emailError) {
      newErrors.email = emailError;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Skills validation
    const skillsOfferedError = validateSkills(formData.skillsOffered);
    if (skillsOfferedError) newErrors.skillsOffered = skillsOfferedError;

    const skillsWantedError = validateSkills(formData.skillsWanted);
    if (skillsWantedError) newErrors.skillsWanted = skillsWantedError;

    // Availability validation
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
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/dashboard');
    } catch (error: any) {
      setErrors({ 
        general: error.response?.data?.message || 'Registration failed. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Users className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Join SkillSwap</h2>
          <p className="mt-2 text-sm text-gray-600">
            Start swapping skills with others today
          </p>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Create a password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Confirm your password"
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

          <Button
            type="submit"
            className="w-full"
            loading={loading}
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Register;