# Portfolio Backend API

A robust Express.js backend API for managing portfolio data with Supabase integration, authentication, and comprehensive CRUD operations.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Database Integration**: Supabase PostgreSQL with Row Level Security (RLS)
- **CRUD Operations**: Complete API for all portfolio data types
- **Security**: Helmet, CORS, rate limiting, input validation
- **Error Handling**: Comprehensive error handling and logging
- **Data Validation**: Express-validator for request validation
- **Bulk Operations**: Support for bulk create, update, delete operations

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account and project
- Git

## 🛠️ Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Fill in your environment variables in `.env`:
   ```env
   # Supabase Configuration
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # CORS Configuration
   FRONTEND_URL=http://localhost:5173
   ```

4. **Database Setup**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL from `database/schema.sql`
   - This will create all necessary tables, indexes, and policies

## 🚀 Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Projects Endpoints

#### Get All Projects (Public)
```http
GET /api/projects
```

#### Get Single Project (Public)
```http
GET /api/projects/:id
```

#### Create Project (Admin Only)
```http
POST /api/projects
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "E-Commerce Platform",
  "category": "Full Stack",
  "date": "January 2025",
  "description": "A comprehensive e-commerce platform...",
  "github": "https://github.com/username/project",
  "liveUrl": "https://project-demo.vercel.app",
  "tech": ["React", "Node.js", "MongoDB"],
  "features": ["User Authentication", "Payment Integration"]
}
```

#### Update Project (Admin Only)
```http
PUT /api/projects/:id
Authorization: Bearer <admin_token>
Content-Type: application/json
```

#### Delete Project (Admin Only)
```http
DELETE /api/projects/:id
Authorization: Bearer <admin_token>
```

### Work Experience Endpoints

#### Get All Work Experience (Public)
```http
GET /api/work
```

#### Get Featured Work Experience (Public)
```http
GET /api/work/featured/list
```

#### Create Work Experience (Admin Only)
```http
POST /api/work
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "company": "Tech Corp",
  "role": "Senior Developer",
  "start": "January 2023",
  "end": "Present",
  "location": "Remote",
  "status": "Working",
  "tech": ["React", "TypeScript", "AWS"],
  "bullets": ["Led team of 5 developers", "Improved performance by 40%"]
}
```

### Certificates Endpoints

#### Get All Certificates (Public)
```http
GET /api/certificates
```

#### Search Certificates (Public)
```http
GET /api/certificates/search/:query
```

#### Create Certificate (Admin Only)
```http
POST /api/certificates
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "AWS Certified Solutions Architect",
  "issuer": "Amazon Web Services",
  "issueDate": "January 2025",
  "description": "Earned by demonstrating expertise...",
  "skills": ["Cloud Architecture", "AWS Services"]
}
```

### Gears Endpoints

#### Get All Gears (Public)
```http
GET /api/gears
```

#### Get Devices Only (Public)
```http
GET /api/gears/devices/list
```

#### Get Extensions Only (Public)
```http
GET /api/gears/extensions/list
```

#### Create Gear (Admin Only)
```http
POST /api/gears
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "MacBook Pro",
  "type": "laptop",
  "specs": "M2 Pro, 16GB RAM, 512GB SSD",
  "link": "https://apple.com"
}
```

### About Me Endpoints

#### Get About Me (Public)
```http
GET /api/about
```

#### Update About Me (Admin Only)
```http
PUT /api/about
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "John Doe",
  "title": "Full Stack Developer",
  "bio": "Passionate developer with expertise...",
  "email": "john@example.com",
  "location": "San Francisco, CA",
  "socialLinks": {
    "github": "https://github.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe"
  }
}
```

## 🔒 Authentication

### Default Admin Account
After running the database schema, you'll have a default admin account:
- **Email**: `admin@portfolio.com`
- **Password**: `admin123`

### JWT Token
All protected endpoints require a JWT token in the Authorization header:
```http
Authorization: Bearer <your_jwt_token>
```

## 🛡️ Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for your frontend domain
- **Helmet**: Security headers
- **Input Validation**: All inputs are validated
- **SQL Injection Protection**: Using Supabase's built-in protection
- **Row Level Security**: Database-level access control

## 📊 Database Schema

The database includes the following tables:
- `users` - User authentication and profiles
- `projects` - Portfolio projects
- `work_experience` - Professional experience
- `certificates` - Certifications and credentials
- `gears` - Devices and tools
- `about_me` - Personal information

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `JWT_EXPIRES_IN` | JWT token expiration time | No |
| `PORT` | Server port | No (default: 5000) |
| `NODE_ENV` | Environment (development/production) | No |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |

## 🚀 Deployment

### Using PM2
```bash
npm install -g pm2
pm2 start server.js --name portfolio-api
pm2 save
pm2 startup
```

### Using Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📈 Monitoring

The API includes health check endpoint:
```http
GET /health
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the error logs

## 🔄 API Versioning

Current API version: `v1`
All endpoints are prefixed with `/api/`

## 📋 TODO

- [ ] Add API documentation with Swagger
- [ ] Implement file upload for images
- [ ] Add email notifications
- [ ] Implement caching with Redis
- [ ] Add comprehensive logging
- [ ] Set up monitoring and alerts
