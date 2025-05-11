# RADS Online

A full-stack e-commerce platform for sellers to manage their products and brands.

## Features

- User authentication (Login/Register)
- Role-based access control (Admin/Seller)
- Product management
- Brand management
- Request approval system
- Responsive design

## Tech Stack

- Frontend: React, Material-UI, Vite
- Backend: Node.js, Express
- Database: MongoDB
- Authentication: JWT

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Git

## Setup Instructions

1. Clone the repository:
```bash
git clone <your-repo-url>
cd newrads
```

2. Install dependencies:
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

3. Environment Setup:
   - Copy `.env.example` to `.env` in both root and frontend directories
   - Update the environment variables with your values

4. Start the development servers:
```bash
# Start backend server (from root directory)
npm run dev

# Start frontend server (from frontend directory)
cd frontend
npm run dev
```

## Deployment

### Backend Deployment

1. Create a MongoDB Atlas account and set up a cluster
2. Update the MONGODB_URI in your production environment
3. Deploy to your preferred hosting service (e.g., Heroku, Railway)

### Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Configure environment variables:
   - VITE_API_URL: Your backend API URL
   - VITE_APP_NAME: Your app name
5. Deploy

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=RADS Online
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 