# SIH-2025 - Civic Complaint Management System

A full-stack web application for managing civic complaints with geolocation, department routing, and escalation features.

## Project Overview

This application allows citizens to submit civic complaints with images and geolocation data. Complaints are automatically routed to the appropriate department and can be tracked through various status updates. The system includes user, admin, and department head roles with different permissions and dashboards.

## Tech Stack

### Frontend
- React.js with Material UI
- Geolocation API for location tracking
- Responsive design for mobile and desktop use

### Backend
- Node.js with Express
- Supabase for database and authentication
- RESTful API architecture
- File uploads with Multer

## Database Structure

### Users Table
- `id` (UUID, PK): Unique identifier for each user
- `name` (Text): User's name
- `phone` (Text): Used for login (hardcoded for prototype)
- `role` (Text): Defines user type: user, admin, or head
- `department` (Text): Only for admins/heads; indicates which department they belong to
- `created_at` (Timestamp): Account creation time

### Complaints Table
- `id` (UUID, PK): Unique complaint identifier
- `user_id` (UUID, FK): References users.id, linking the complaint to its submitter
- `type` (Text): Complaint category (e.g., Broken Road, Garbage)
- `description` (Text): Detailed description of the issue
- `image_url` (Text): Optional image associated with the complaint
- `location_lat` (Float): Latitude of the issue
- `location_lng` (Float): Longitude of the issue
- `status` (Text): Tracks progress: Submitted, In Progress, Resolved
- `department` (Text): Department assigned to handle this complaint
- `escalated` (Boolean): Marks if the complaint was escalated to the department head
- `created_at` (Timestamp): Submission time
- `updated_at` (Timestamp): Last updated time

### Departments Table
- `id` (UUID, PK): Unique department identifier
- `name` (Text): Department name (e.g., Roads, Garbage)
- `head_id` (UUID, FK): References users.id, assigning a department head

## Project Structure

### Backend

```
backend/
├── config/
│   ├── supabase.js     # Supabase client configuration
│   └── upload.js       # Multer configuration for file uploads
├── controllers/
│   ├── authController.js      # Authentication logic
│   ├── complaintController.js # Complaint management logic
│   └── departmentController.js # Department management logic
├── models/
│   ├── complaintModel.js  # Complaint data access
│   ├── departmentModel.js # Department data access
│   └── userModel.js       # User data access
├── routes/
│   ├── authRoutes.js      # Authentication endpoints
│   ├── complaintRoutes.js # Complaint endpoints
│   └── departmentRoutes.js # Department endpoints
├── services/
│   ├── escalationService.js # Complaint escalation logic
│   └── seedService.js      # Initial data seeding
├── uploads/              # Uploaded images storage
└── server.js             # Main application entry point
```

### Frontend

```
frontend/
├── public/
└── src/
    ├── assets/           # Static assets
    ├── components/       # Reusable UI components
    ├── pages/            # Page components
    │   ├── AdminDashboard.jsx
    │   ├── ComplaintDetail.jsx
    │   ├── Login.jsx
    │   └── UserDashboard.jsx
    ├── services/
    │   └── api.js        # API service for backend communication
    ├── App.jsx           # Main application component
    └── main.jsx          # Application entry point
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update Supabase configuration in `config/supabase.js` with your project URL and anon key.

4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Default Users

For testing purposes, the following users are seeded:

- Regular Users:
  - Phone: 1234567890, Password: user123
  - Phone: 9876543210, Password: user456

- Department Admins:
  - Phone: admin1, Password: admin123 (Roads Department)
  - Phone: admin2, Password: admin456 (Sanitation Department)

- Department Heads:
  - Phone: head1, Password: head123 (Roads Department)
  - Phone: head2, Password: head456 (Sanitation Department)

## Features

- User authentication and role-based access
- Complaint submission with image upload and geolocation
- Automatic department routing based on complaint type
- Status tracking and updates
- Admin dashboard with filtering and statistics
- Automatic escalation of pending complaints after 7 days
- Mobile-responsive design