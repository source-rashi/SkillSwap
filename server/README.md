# Skill Swap Platform - Backend API

A comprehensive RESTful API for the Skill Swap platform built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication & Authorization** - JWT-based auth with secure password hashing
- **User Management** - Complete CRUD operations for user profiles
- **Skill Matching** - Advanced search and filtering by skills and location
- **Swap Requests** - Create, manage, and track skill swap requests
- **Real-time Notifications** - Socket.IO integration for instant updates
- **Feedback System** - Rating and review system for completed swaps
- **Data Validation** - Comprehensive input validation and sanitization
- **Error Handling** - Centralized error handling with detailed responses
- **Security** - CORS, rate limiting, and data protection

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd skill-swap-platform/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/skillswap
   JWT_SECRET=your_super_secret_jwt_key_here
   CLIENT_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/updatedetails` | Update user details | Yes |
| PUT | `/api/auth/updatepassword` | Update password | Yes |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | Get all public users | No |
| GET | `/api/users/:id` | Get single user | No |
| PUT | `/api/users/:id` | Update user profile | Yes (own profile) |
| DELETE | `/api/users/:id` | Deactivate account | Yes (own profile) |
| GET | `/api/users/search/skills` | Search users by skill | No |
| GET | `/api/users/:id/stats` | Get user statistics | Yes (own profile) |
| GET | `/api/users/:id/feedback` | Get user feedback | No |

### Swap Request Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/swaps` | Get user's swap requests | Yes |
| POST | `/api/swaps` | Create swap request | Yes |
| GET | `/api/swaps/:id` | Get single swap request | Yes |
| PUT | `/api/swaps/:id` | Update swap request | Yes |
| DELETE | `/api/swaps/:id` | Delete swap request | Yes |
| GET | `/api/swaps/pending` | Get pending requests | Yes |
| GET | `/api/swaps/stats` | Get swap statistics | Yes |

### Feedback Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/feedback` | Create feedback | Yes |
| GET | `/api/feedback/user/:userId` | Get user feedback | No |
| GET | `/api/feedback/user/:userId/stats` | Get feedback stats | No |
| GET | `/api/feedback/:id` | Get single feedback | No |
| PUT | `/api/feedback/:id` | Update feedback | Yes (reviewer only) |
| DELETE | `/api/feedback/:id` | Delete feedback | Yes (reviewer only) |

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/skillswap |
| `JWT_SECRET` | JWT signing secret | Required |
| `CLIENT_URL` | Frontend URL for CORS | http://localhost:3000 |

### Database Models

#### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  location: String,
  skillsOffered: [String],
  skillsWanted: [String],
  availability: [String],
  isPublic: Boolean,
  rating: { average: Number, count: Number },
  totalSwaps: Number,
  isActive: Boolean
}
```

#### SwapRequest Model
```javascript
{
  requester: ObjectId (User),
  target: ObjectId (User),
  skillRequested: String,
  skillOffered: String,
  message: String,
  status: String (pending/accepted/rejected/completed/cancelled),
  scheduledDate: Date,
  duration: Number,
  meetingType: String,
  location: String
}
```

#### Feedback Model
```javascript
{
  swapRequest: ObjectId (SwapRequest),
  reviewer: ObjectId (User),
  reviewee: ObjectId (User),
  rating: Number (1-5),
  comment: String,
  skillRating: {
    teaching: Number,
    communication: Number,
    punctuality: Number,
    helpfulness: Number
  },
  wouldRecommend: Boolean,
  tags: [String]
}
```

## 🧪 Testing

### Sample API Calls

1. **Register a new user**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "John Doe",
       "email": "john@example.com",
       "password": "password123",
       "skillsOffered": ["JavaScript", "React"],
       "skillsWanted": ["Python", "Design"],
       "availability": ["Weekday Evenings"]
     }'
   ```

2. **Login**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "john@example.com",
       "password": "password123"
     }'
   ```

3. **Search users by skill**
   ```bash
   curl "http://localhost:5000/api/users/search/skills?skill=JavaScript"
   ```

### Test Credentials (after seeding)

- **Email**: sarah@example.com
- **Password**: password123

All seeded users use the same password: `password123`

## 🔒 Security Features

- **Password Hashing** - bcryptjs with salt rounds
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - express-validator for all inputs
- **Rate Limiting** - Protection against brute force attacks
- **CORS Configuration** - Controlled cross-origin requests
- **Error Handling** - No sensitive data in error responses

## 🚀 Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Use strong JWT secret
3. Configure MongoDB Atlas or production database
4. Set up proper CORS origins
5. Enable HTTPS
6. Configure rate limiting
7. Set up monitoring and logging

### Docker Support (Optional)

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📊 Real-time Features

The API includes Socket.IO integration for real-time features:

- **Instant Notifications** - New swap requests
- **Status Updates** - Swap request status changes
- **User Presence** - Online/offline status

### Socket Events

- `join-user-room` - Join user's notification room
- `new-swap-request` - New swap request received
- `swap-status-updated` - Swap status changed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the error responses for debugging

---

**Happy Coding! 🚀**