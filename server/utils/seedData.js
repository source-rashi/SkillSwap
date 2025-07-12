const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const SwapRequest = require('../models/SwapRequest');
const Feedback = require('../models/Feedback');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  const users = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      password: await bcrypt.hash('password123', 12),
      location: 'New York, NY',
      skillsOffered: ['JavaScript', 'React', 'Node.js'],
      skillsWanted: ['Python', 'Machine Learning'],
      availability: 'evenings',
      isPublic: true,
      isAdmin: true
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: await bcrypt.hash('password123', 12),
      location: 'San Francisco, CA',
      skillsOffered: ['Python', 'Data Science', 'Machine Learning'],
      skillsWanted: ['JavaScript', 'Web Development'],
      availability: 'weekends',
      isPublic: true
    },
    {
      name: 'Mike Johnson',
      email: 'mike@example.com',
      password: await bcrypt.hash('password123', 12),
      location: 'Chicago, IL',
      skillsOffered: ['Graphic Design', 'Photoshop', 'Illustrator'],
      skillsWanted: ['UI/UX Design', 'Figma'],
      availability: 'flexible',
      isPublic: true
    },
    {
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      password: await bcrypt.hash('password123', 12),
      location: 'Austin, TX',
      skillsOffered: ['Digital Marketing', 'SEO', 'Content Writing'],
      skillsWanted: ['Social Media Marketing', 'Analytics'],
      availability: 'weekdays',
      isPublic: true
    },
    {
      name: 'David Brown',
      email: 'david@example.com',
      password: await bcrypt.hash('password123', 12),
      location: 'Seattle, WA',
      skillsOffered: ['Photography', 'Video Editing', 'Adobe Premiere'],
      skillsWanted: ['Drone Photography', 'Color Grading'],
      availability: 'weekends',
      isPublic: true
    }
  ];

  await User.deleteMany({});
  const createdUsers = await User.insertMany(users);
  console.log(`${createdUsers.length} users created`);
  return createdUsers;
};

const seedSwapRequests = async (users) => {
  const swapRequests = [
    {
      requester: users[0]._id,
      recipient: users[1]._id,
      skillOffered: 'JavaScript',
      skillRequested: 'Python',
      message: 'Hi! I\'d love to learn Python from you. I can teach you JavaScript in return.',
      status: 'pending'
    },
    {
      requester: users[1]._id,
      recipient: users[2]._id,
      skillOffered: 'Data Science',
      skillRequested: 'Graphic Design',
      message: 'Would love to learn design skills!',
      status: 'accepted'
    },
    {
      requester: users[2]._id,
      recipient: users[3]._id,
      skillOffered: 'Photoshop',
      skillRequested: 'Content Writing',
      message: 'I can help with your design needs if you can help with content.',
      status: 'completed',
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    }
  ];

  await SwapRequest.deleteMany({});
  const createdRequests = await SwapRequest.insertMany(swapRequests);
  console.log(`${createdRequests.length} swap requests created`);
  return createdRequests;
};

const seedFeedback = async (users, swapRequests) => {
  const completedSwap = swapRequests.find(req => req.status === 'completed');
  
  if (completedSwap) {
    const feedback = [
      {
        swapRequest: completedSwap._id,
        reviewer: completedSwap.requester,
        reviewee: completedSwap.recipient,
        rating: 5,
        comment: 'Excellent teacher! Very patient and knowledgeable.'
      },
      {
        swapRequest: completedSwap._id,
        reviewer: completedSwap.recipient,
        reviewee: completedSwap.requester,
        rating: 4,
        comment: 'Great skills and easy to work with.'
      }
    ];

    await Feedback.deleteMany({});
    const createdFeedback = await Feedback.insertMany(feedback);
    console.log(`${createdFeedback.length} feedback entries created`);

    // Update user ratings
    const user3Feedback = await Feedback.find({ reviewee: users[3]._id });
    const avgRating = user3Feedback.reduce((sum, f) => sum + f.rating, 0) / user3Feedback.length;
    await User.findByIdAndUpdate(users[3]._id, {
      'rating.average': avgRating,
      'rating.count': user3Feedback.length
    });
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('Seeding database...');
    const users = await seedUsers();
    const swapRequests = await seedSwapRequests(users);
    await seedFeedback(users, swapRequests);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
