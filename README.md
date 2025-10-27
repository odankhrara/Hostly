# Hostly - AI-Powered Property Rental Platform

A comprehensive property rental platform with AI-powered features for both travelers and property owners. Built with modern web technologies and integrated AI services for enhanced user experience.

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Agent Service │
│   (React/Vite)  │◄──►│   (Node.js)     │◄──►│   (Python)      │
│   Port: 5173    │    │   Port: 3000    │    │   Port: 8000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Static Files  │    │   MySQL DB      │    │   Groq AI API   │
│   (Images)      │    │   Port: 3306    │    │   (External)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend
- **React 18** - Modern UI library with hooks
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **Lucide React** - Icon library
- **Framer Motion** - Animation library

#### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Sequelize** - SQL ORM for database operations
- **MySQL** - Relational database
- **Express Session** - Session management
- **Multer** - File upload handling
- **Winston** - Logging framework

#### AI Service
- **Python 3.12** - Python runtime
- **FastAPI** - Modern Python web framework
- **Groq SDK** - AI model integration
- **AsyncIO** - Asynchronous programming

#### Database
- **MySQL** - Primary database
- **SQLite** - Development/testing database

## 📁 Project Structure

```
Hostly/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   ├── context/         # React context providers
│   │   ├── utils/           # Utility functions
│   │   └── style/          # Global styles
│   ├── package.json
│   └── vite.config.js
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── config/          # Configuration files
│   │   └── utils/           # Utility functions
│   ├── uploads/             # File upload directory
│   ├── logs/               # Application logs
│   └── package.json
├── agent-service/          # Python AI service
│   ├── app/
│   │   ├── services/        # AI service logic
│   │   ├── config/          # Configuration
│   │   └── utils/           # Utilities
│   ├── requirements.txt
│   └── main.py
└── README.md
```

## 🚀 Features

### For Travelers
- **Property Search & Discovery** - Advanced search with filters
- **AI-Powered Recommendations** - Personalized property suggestions
- **Travel Planning** - AI Concierge for itinerary creation
- **Favorites System** - Save and manage favorite properties
- **Booking Management** - Request, track, and manage bookings
- **Profile Management** - Comprehensive user profiles

### For Property Owners
- **Property Management** - Add, edit, and manage properties
- **Booking Requests** - Accept/reject booking requests
- **AI-Assisted Content** - Auto-generate descriptions and pricing
- **Image Upload** - Custom property photos
- **Analytics Dashboard** - Track bookings and performance

### AI Features
- **Travel Concierge** - Personalized travel itineraries
- **Property Recommendations** - Smart property matching
- **Content Generation** - AI-generated descriptions
- **Pricing Optimization** - Market-based pricing suggestions
- **Chat Assistant** - General AI assistance

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.12 or higher)
- MySQL (v8.0 or higher)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Hostly
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=hostly
OPENAI_API_KEY=your_groq_api_key_here
SESSION_SECRET=your_session_secret_here
NODE_ENV=development
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env.local` file:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Start the frontend:
```bash
npm run dev
```

### 4. Agent Service Setup
```bash
cd agent-service
pip install -r requirements.txt
```

Create `.env` file:
```env
OPENAI_API_KEY=your_groq_api_key_here
```

Start the agent service:
```bash
python -m uvicorn app.main:app --reload --port 8000
```

### 5. Database Setup
```bash
# Create database
mysql -u root -p
CREATE DATABASE hostly;
```

The application will automatically create tables on first run.

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
DB_HOST=localhost          # Database host
DB_USER=root              # Database username
DB_PASSWORD=              # Database password
DB_NAME=hostly           # Database name
OPENAI_API_KEY=          # Groq API key
SESSION_SECRET=          # Session encryption secret
NODE_ENV=development     # Environment mode
PORT=3000               # Server port
```

#### Frontend (.env.local)
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

#### Agent Service (.env)
```env
OPENAI_API_KEY=your_groq_api_key_here
```

### Database Configuration

The application uses Sequelize ORM with MySQL. Key models include:

- **Users** - User accounts and profiles
- **Properties** - Property listings
- **Bookings** - Booking requests and management
- **Favorites** - User favorite properties
- **Sessions** - User session management

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Properties
- `GET /api/properties/search` - Search properties
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create property (owner)

### Bookings
- `GET /api/bookings/me` - Get user bookings
- `POST /api/bookings` - Create booking request
- `POST /api/bookings/:id/accept` - Accept booking
- `POST /api/bookings/:id/cancel` - Cancel booking

### Favorites
- `GET /api/favorites` - Get user favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/:id` - Remove from favorites

### AI Services
- `POST /api/agent/concierge` - Generate travel plan
- `POST /api/agent/property-recommendations` - Get property recommendations
- `POST /api/agent/generate-description` - Generate property description
- `POST /api/agent/pricing-suggestions` - Get pricing suggestions

## 🤖 AI Integration

### Groq AI Service
The application uses Groq's Llama models for AI features:

- **Model**: `llama-3.1-8b-instant`
- **Features**: Travel planning, content generation, recommendations
- **Integration**: Both Node.js backend and Python agent service

### AI Features Implementation

#### Travel Concierge
```javascript
// Generates personalized travel itineraries
const travelPlan = await aiService.generateTravelPlan(booking, preferences);
```

#### Property Recommendations
```javascript
// AI-powered property matching
const recommendations = await aiService.generatePropertyRecommendations(criteria, preferences);
```

#### Content Generation
```javascript
// Auto-generate property descriptions
const description = await aiService.generatePropertyDescription(propertyData);
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('traveler', 'owner') DEFAULT 'traveler',
  phone_number VARCHAR(20),
  about_me TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  languages VARCHAR(255),
  gender ENUM('male', 'female', 'other'),
  profile_image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Properties Table
```sql
CREATE TABLE properties (
  id INT PRIMARY KEY AUTO_INCREMENT,
  owner_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  property_type VARCHAR(50) NOT NULL,
  price_per_night DECIMAL(10,2) NOT NULL,
  bedrooms INT NOT NULL,
  bathrooms INT NOT NULL,
  max_guests INT NOT NULL,
  amenities TEXT,
  main_image VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);
```

### Bookings Table
```sql
CREATE TABLE bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  traveler_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  num_guests INT NOT NULL,
  status ENUM('pending', 'accepted', 'cancelled') DEFAULT 'pending',
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id),
  FOREIGN KEY (traveler_id) REFERENCES users(id)
);
```

### Favorites Table
```sql
CREATE TABLE favorites (
  id INT PRIMARY KEY AUTO_INCREMENT,
  traveler_id INT NOT NULL,
  property_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (traveler_id) REFERENCES users(id),
  FOREIGN KEY (property_id) REFERENCES properties(id),
  UNIQUE KEY unique_favorite (traveler_id, property_id)
);
```

## 🔐 Security Features

### Authentication & Authorization
- **Session-based authentication** using express-session
- **Password hashing** with bcrypt
- **Route protection** middleware for sensitive endpoints
- **CSRF protection** built into session management

### Data Validation
- **Input validation** on all API endpoints
- **SQL injection prevention** through Sequelize ORM
- **File upload restrictions** (image types only)
- **Rate limiting** on API endpoints

### Security Headers
- **CORS configuration** for cross-origin requests
- **Helmet.js** for security headers
- **Environment variable protection**

## 🚀 Deployment

### Production Environment Variables
```env
NODE_ENV=production
DB_HOST=your_production_db_host
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_NAME=hostly_production
OPENAI_API_KEY=your_production_groq_key
SESSION_SECRET=your_production_session_secret
```

### Docker Deployment (Optional)
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Build Commands
```bash
# Frontend build
cd frontend
npm run build

# Backend start
cd backend
npm start
```

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### API Testing
Use tools like Postman or curl to test API endpoints:

```bash
# Test user registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"traveler"}'
```

## 📊 Monitoring & Logging

### Logging Configuration
- **Winston logger** for structured logging
- **Log levels**: error, warn, info, debug
- **File rotation** for log management
- **Separate log files** for different log levels

### Performance Monitoring
- **Request logging** middleware
- **Database query logging** in development
- **Error tracking** and reporting
- **Session monitoring**

## 🔧 Development

### Code Structure
- **MVC pattern** in backend
- **Component-based** frontend architecture
- **Service layer** for business logic
- **Repository pattern** for data access

### Best Practices
- **ESLint** for code quality
- **Prettier** for code formatting
- **Git hooks** for pre-commit checks
- **Environment-based configuration**

### Adding New Features
1. **Backend**: Add routes, controllers, services
2. **Frontend**: Create components, pages, services
3. **Database**: Update models and migrations
4. **AI Integration**: Extend AI service methods

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

### Code Standards
- Follow existing code style
- Add comments for complex logic
- Write meaningful commit messages
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check MySQL status
brew services list | grep mysql

# Restart MySQL
brew services restart mysql
```

#### Port Conflicts
```bash
# Check port usage
lsof -i :3000
lsof -i :5173
lsof -i :8000
```

#### AI Service Issues
- Verify Groq API key is valid
- Check API rate limits
- Ensure Python dependencies are installed

### Getting Help
- Check the logs in `backend/logs/`
- Review the console output for errors
- Verify all environment variables are set
- Ensure all services are running

## 📈 Future Enhancements

### Planned Features
- **Real-time notifications** using WebSockets
- **Payment integration** with Stripe/PayPal
- **Advanced analytics** dashboard
- **Mobile app** development
- **Multi-language support**
- **Advanced AI features** (image recognition, sentiment analysis)

### Performance Optimizations
- **Database indexing** optimization
- **Caching layer** implementation
- **CDN integration** for static assets
- **API response compression**

---

**Built with ❤️ using modern web technologies and AI integration**