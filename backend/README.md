# Portfolio Backend API

Backend API server for the Portfolio Admin System.

## Features

- User authentication and authorization
- Project management
- Work experience management
- Certificate management
- Gear management
- About me content management
- File upload to Cloudinary
- Spotify integration
- WakaTime integration

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables. Create a `.env` file in the root directory with the following:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database (Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SUPABASE_JWT_SECRET=your_jwt_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# JWT Secret
JWT_SECRET=your_jwt_secret_key
```

## Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/profile` - Get user profile
- `GET /api/auth/verify` - Verify token

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Work Experience
- `GET /api/work` - Get all work experience
- `GET /api/work/:id` - Get work experience by ID
- `POST /api/work` - Create work experience
- `PUT /api/work/:id` - Update work experience
- `DELETE /api/work/:id` - Delete work experience

### Certificates
- `GET /api/certificates` - Get all certificates
- `GET /api/certificates/:id` - Get certificate by ID
- `POST /api/certificates` - Create certificate
- `PUT /api/certificates/:id` - Update certificate
- `DELETE /api/certificates/:id` - Delete certificate

### Gears
- `GET /api/gears` - Get all gears
- `GET /api/gears/:id` - Get gear by ID
- `POST /api/gears` - Create gear
- `PUT /api/gears/:id` - Update gear
- `DELETE /api/gears/:id` - Delete gear

### About
- `GET /api/about` - Get about me
- `PUT /api/about` - Update about me

### Upload
- `POST /api/upload/cloudinary` - Upload to Cloudinary
- `POST /api/upload/cloudinary/video` - Upload video to Cloudinary
- `POST /api/upload/resume` - Upload resume
- `DELETE /api/upload/cloudinary/:publicId` - Delete from Cloudinary

### Spotify
- `GET /api/spotify/now-playing` - Get current playing track
- `GET /api/spotify/top-tracks` - Get top tracks

### WakaTime
- `GET /api/wakatime/status-bar` - Get coding status
- `GET /api/wakatime/today` - Get today's coding stats

## Security

- Helmet.js for security headers
- Rate limiting (1000 requests per 15 minutes per IP)
- CORS enabled
- JWT authentication
- Input validation

## Environment Variables

All environment variables must be set for the application to work properly.

- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment mode (development/production)
- `SUPABASE_URL`: Supabase database URL
- `SUPABASE_KEY`: Supabase API key
- `SUPABASE_JWT_SECRET`: Supabase JWT secret
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
- `JWT_SECRET`: JWT secret for token signing

## Tech Stack

- Node.js
- Express.js
- Supabase (PostgreSQL)
- Cloudinary
- JWT
- Helmet
- Express Rate Limit
- Express Validator

