const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const SwapRequest = require('../models/SwapRequest');
const Feedback = require('../models/Feedback');

// Load env vars
dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap');
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

// Sample users data
const users = [
  {
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    password: 'password123',
    location: 'San Francisco, CA',
    skillsOffered: ['Photoshop', 'Illustrator', 'UI Design', 'Graphic Design'],
    skillsWanted: ['React', 'Node.js', 'Photography'],
    availability: ['Weekend Mornings', 'Weekday Evenings'],
    isPublic: true,
    rating: { average: 4.8, count: 15 },
    totalSwaps: 15
  },
  {
    name: 'Mike Chen',
    email: 'mike@example.com',
    password: 'password123',
    location: 'New York, NY',
    skillsOffered: ['Guitar', 'Music Theory', 'Recording', 'Piano'],
    skillsWanted: ['Web Design', 'Marketing', 'Spanish'],
    availability: ['Weekday Evenings', 'Weekend Afternoons'],
    isPublic: true,
    rating: { average: 4.9, count: 22 },
    totalSwaps: 22
  },
  {
    name: 'Emily Rodriguez',
    email: 'emily@example.com',
    password: 'password123',
    location: 'Austin, TX',
    skillsOffered: ['Spanish', 'Translation', 'Cooking', 'Yoga'],
    skillsWanted: ['Photography', 'Video Editing', 'Guitar'],
    availability: ['Weekend Mornings', 'Weekend Evenings'],
    isPublic: true,
    rating: { average: 4.7, count: 8 },
    totalSwaps: 8
  },
  {
    name: 'David Kim',
    email: 'david@example.com',
    password: 'password123',
    location: 'Seattle, WA',
    skillsOffered: ['React', 'Node.js', 'Python', 'Web Development'],
    skillsWanted: ['UI Design', 'Photography', 'Guitar'],
    availability: ['Weekday Afternoons', 'Weekend Mornings'],
    isPublic: true,
    rating: { average: 4.6, count: 12 },
    totalSwaps: 12
  },
  {
    name: 'Lisa Wang',
    email: 'lisa@example.com',
    password: 'password123',
    location: 'Los Angeles, CA',
    skillsOffered: ['Photography', 'Video Editing', 'Adobe Premiere'],
    skillsWanted: ['Web Development', 'Marketing', 'Business'],
    availability: ['Weekday Mornings', 'Weekend Afternoons'],
    isPublic: true,
    rating: { average: 4.9, count: 18 },
    totalSwaps: 18
  },
  {
    name: 'James Wilson',
    email: 'james@example.com',
    password: 'password123',
    location: 'Chicago, IL',
    skillsOffered: ['Marketing', 'Business Strategy', 'Public Speaking'],
    skillsWanted: ['Web Development', 'Photoshop', 'Video Editing'],
    availability: ['Weekday Evenings', 'Weekend Mornings'],
    isPublic: true,
    rating: { average: 4.5, count: 10 },
    totalSwaps: 10
  },
  {
    name: 'Anna Thompson',
    email: 'anna@example.com',
    password: 'password123',
    location: 'Denver, CO',
    skillsOffered: ['Yoga', 'Meditation', 'Fitness Training'],
    skillsWanted: ['Cooking', 'Photography', 'Spanish'],
    availability: ['Weekend Mornings', 'Weekday Mornings'],
    isPublic: true,
    rating: { average: 4.8, count: 14 },
    totalSwaps: 14
  },
  {
    name: 'Robert Garcia',
    email: 'robert@example.com',
    password: 'password123',
    location: 'Miami, FL',
    skillsOffered: ['Spanish', 'Salsa Dancing', 'Cooking'],
    skillsWanted: ['English', 'Web Development', 'Photography'],
    availability: ['Weekday Evenings', 'Weekend Evenings'],
    isPublic: true,
    rating: { average: 4.7, count: 9 },
    totalSwaps: 9
  }
];

// Hash passwords
const hashPasswords = async (users) => {
  for (let user of users) {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
  }
  return users;
};

// Create sample swap requests
const createSwapRequests = async (users) => {
  const swapRequests = [
    {
      requester: users[0]._id, // Sarah
      target: users[1]._id,    // Mike
      skillRequested: 'Guitar',
      skillOffered: 'Photoshop',
      message: 'Hi Mike! I would love to learn guitar from you. I can teach you Photoshop in return.',
      status: 'pending'
    },
    {
      requester: users[2]._id, // Emily
      target: users[0]._id,    // Sarah
      skillRequested: 'UI Design',
      skillOffered: 'Spanish',
      message: 'Hello Sarah! I\'m interested in learning UI design. I can help you with Spanish.',
      status: 'accepted',
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    },
    {
      requester: users[3]._id, // David
      target: users[4]._id,    // Lisa
      skillRequested: 'Photography',
      skillOffered: 'React',
      message: 'Hi Lisa! I\'d like to improve my photography skills. I can teach you React.',
      status: 'completed',
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    },
    {
      requester: users[5]._id, // James
      target: users[3]._id,    // David
      skillRequested: 'Web Development',
      skillOffered: 'Marketing',
      message: 'Hey David! I need help with web development. I can share marketing strategies.',
      status: 'accepted'
    },
    {
      requester: users[1]._id, // Mike
      target: users[2]._id,    // Emily
      skillRequested: 'Spanish',
      skillOffered: 'Guitar',
      message: 'Hola Emily! I want to learn Spanish. I can teach you guitar.',
      status: 'completed',
      completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
    }
  ];

  return await SwapRequest.insertMany(swapRequests);
};

// Create sample feedback
const createFeedback = async (swapRequests) => {
  const feedback = [
    {
      swapRequest: swapRequests[2]._id, // David -> Lisa (completed)
      reviewer: swapRequests[2].requester, // David
      reviewee: swapRequests[2].target,    // Lisa
      rating: 5,
      comment: 'Lisa is an amazing photography teacher! Very patient and knowledgeable.',
      skillRating: {
        teaching: 5,
        communication: 5,
        punctuality: 4,
        helpfulness: 5
      },
      wouldRecommend: true,
      tags: ['excellent-teacher', 'patient', 'knowledgeable']
    },
    {
      swapRequest: swapRequests[2]._id, // Lisa -> David (completed)
      reviewer: swapRequests[2].target,    // Lisa
      reviewee: swapRequests[2].requester, // David
      rating: 4,
      comment: 'David explained React concepts very clearly. Great session!',
      skillRating: {
        teaching: 4,
        communication: 5,
        punctuality: 5,
        helpfulness: 4
      },
      wouldRecommend: true,
      tags: ['clear-explanations', 'punctual', 'professional']
    },
    {
      swapRequest: swapRequests[4]._id, // Mike -> Emily (completed)
      reviewer: swapRequests[4].requester, // Mike
      reviewee: swapRequests[4].target,    // Emily
      rating: 5,
      comment: 'Emily made learning Spanish fun and engaging. Highly recommend!',
      skillRating: {
        teaching: 5,
        communication: 5,
        punctuality: 5,
        helpfulness: 5
      },
      wouldRecommend: true,
      tags: ['excellent-teacher', 'friendly', 'encouraging']
    }
  ];

  return await Feedback.insertMany(feedback);
};

// Import data
const importData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await SwapRequest.deleteMany();
    await Feedback.deleteMany();

    console.log('🗑️  Data Destroyed...');

    // Hash passwords
    const hashedUsers = await hashPasswords([...users]);

    // Create users
    const createdUsers = await User.insertMany(hashedUsers);
    console.log('👥 Users imported...');

    // Create swap requests
    const createdSwapRequests = await createSwapRequests(createdUsers);
    console.log('🔄 Swap requests imported...');

    // Create feedback
    await createFeedback(createdSwapRequests);
    console.log('⭐ Feedback imported...');

    console.log('✅ Data Imported Successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Swap Requests: ${createdSwapRequests.length}`);
    console.log(`   Feedback: 3`);
    console.log('\n🔐 Test Login Credentials:');
    console.log('   Email: sarah@example.com');
    console.log('   Password: password123');
    console.log('\n   (All users have the same password: password123)');

    process.exit();
  } catch (error) {
    console.error('❌ Error importing data:', error);
    process.exit(1);
  }
};

// Destroy data
const destroyData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await SwapRequest.deleteMany();
    await Feedback.deleteMany();

    console.log('🗑️  Data Destroyed Successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Error destroying data:', error);
    process.exit(1);
  }
};

// Check command line arguments
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}