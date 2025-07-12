import React from 'react';
import ProfileForm from '../components/profile/ProfileForm';

const Profile = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Profile Settings
        </h1>
        <ProfileForm />
      </div>
    </div>
  );
};

export default Profile;
