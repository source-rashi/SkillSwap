const User = require('../models/User');
const SwapRequest = require('../models/SwapRequest');
const Feedback = require('../models/Feedback');

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalSwaps = await SwapRequest.countDocuments();
    const completedSwaps = await SwapRequest.countDocuments({ status: 'completed' });
    const pendingSwaps = await SwapRequest.countDocuments({ status: 'pending' });

    // Recent activity
    const recentUsers = await User.find({ isActive: true })
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()
      .then(users => users.filter(user => user && user.name && user.email));

    const recentSwaps = await SwapRequest.find()
      .populate('requester', 'name email')
      .populate('recipient', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()
      .then(swaps => swaps.filter(swap => 
        swap && 
        swap.requester && 
        swap.recipient && 
        swap.requester.name && 
        swap.recipient.name && 
        swap.skillOffered && 
        swap.skillRequested
      ));

    const response = {
      stats: {
        totalUsers,
        totalSwaps,
        completedSwaps,
        pendingSwaps,
        completionRate: totalSwaps > 0 ? Number((completedSwaps / totalSwaps * 100).toFixed(1)) : 0
      },
      recentUsers,
      recentSwaps
    };

    console.log('getDashboardStats Response:', JSON.stringify(response, null, 2)); // Debug
    res.json(response);
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'all') {
      query.isActive = status === 'active';
    }

    const users = await User.find(query)
      .select('name email createdAt isActive skillsOffered skillsWanted')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 })
      .lean()
      .then(users => users.filter(user => user && user.name && user.email));

    const total = await User.countDocuments(query);

    const response = {
      users,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total
    };

    console.log('getAllUsers Response:', JSON.stringify(response, null, 2)); // Debug
    res.json(response);
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    user.isActive = isActive;
    await user.save();

    const response = {
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    };

    console.log('toggleUserStatus Response:', JSON.stringify(response, null, 2)); // Debug
    res.json(response);
  } catch (error) {
    console.error('Error in toggleUserStatus:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

const getAllSwapRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const swapRequests = await SwapRequest.find(query)
      .populate('requester', 'name email')
      .populate('recipient', 'name email')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 })
      .lean()
      .then(swaps => swaps.filter(swap => 
        swap && 
        swap.requester && 
        swap.recipient && 
        swap.requester.name && 
        swap.recipient.name && 
        swap.skillOffered && 
        swap.skillRequested
      ));

    const total = await SwapRequest.countDocuments(query);

    const response = {
      swapRequests,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total
    };

    console.log('getAllSwapRequests Response:', JSON.stringify(response, null, 2)); // Debug
    res.json(response);
  } catch (error) {
    console.error('Error in getAllSwapRequests:', error);
    res.status(500).json({ error: 'Failed to fetch swap requests' });
  }
};

const exportData = async (req, res) => {
  try {
    const { type, format = 'json' } = req.query;

    let data;
    let filename;

    switch (type) {
      case 'users':
        data = await User.find({ isActive: true })
          .select('name email createdAt isActive skillsOffered skillsWanted')
          .lean()
          .then(users => users.filter(user => user && user.name && user.email));
        filename = `users_export_${Date.now()}`;
        break;
      case 'swaps':
        data = await SwapRequest.find()
          .populate('requester', 'name email')
          .populate('recipient', 'name email')
          .lean()
          .then(swaps => swaps.filter(swap => 
            swap && 
            swap.requester && 
            swap.recipient && 
            swap.requester.name && 
            swap.recipient.name
          ));
        filename = `swaps_export_${Date.now()}`;
        break;
      case 'feedback':
        data = await Feedback.find()
          .populate('reviewer reviewee', 'name email')
          .lean()
          .then(feedback => feedback.filter(fb => 
            fb && 
            fb.reviewer && 
            fb.reviewee && 
            fb.reviewer.name && 
            fb.reviewee.name
          ));
        filename = `feedback_export_${Date.now()}`;
        break;
      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }

    if (format === 'csv') {
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      res.json(data);
    }
  } catch (error) {
    console.error('Error in exportData:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
};

// Helper function to convert JSON to CSV
const convertToCSV = (data) => {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]).filter(header => 
    header !== '__v' && header !== 'password' && header !== '_id'
  );
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      let value = row[header];
      if (typeof value === 'object' && value) {
        value = JSON.stringify(value).replace(/"/g, '""');
      }
      return typeof value === 'string' ? `"${value}"` : value || '';
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  getAllSwapRequests,
  exportData
};