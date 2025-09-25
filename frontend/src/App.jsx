import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Import pages
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import SubmitComplaint from './pages/SubmitComplaint'
import ComplaintDetail from './pages/ComplaintDetail'
import UIShowcase from './pages/UIShowcase'

// Import components
import ResponsiveTester from './components/ResponsiveTester'
import Favicon from './components/common/Favicon'

// Import auth context
import { AuthProvider, useAuth } from './context/AuthContext'

// Routes component that uses the auth context
function AppRoutes() {
  const { isAuthenticated, userRole, isLoading } = useAuth()

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid rgba(255, 255, 255, 0.1)', 
            borderRadius: '50%', 
            borderTopColor: '#3498db', 
            animation: 'spin 1s ease-in-out infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Protected route component
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!isAuthenticated) {
      return <Navigate to="/" replace />
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
      // Redirect based on user role
      if (userRole === 'user') {
        return <Navigate to="/user-dashboard" replace />
      } else if (userRole === 'admin' || userRole === 'head') {
        return <Navigate to="/admin-dashboard" replace />
      } else {
        // Default fallback if role is not recognized
        return <Navigate to="/" replace />
      }
    }

    return children
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      
      <Route path="/signup" element={<Signup />} />
      
      <Route path="/login" element={isAuthenticated ? 
        (userRole === 'user' ? 
          <Navigate to="/user-dashboard" replace /> : 
          (userRole === 'admin' || userRole === 'head' ? 
            <Navigate to="/admin-dashboard" replace /> : 
            <Login />)) : 
        <Login />} 
      />
        
      {/* User routes */}
      <Route 
        path="/user-dashboard" 
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/submit-complaint" 
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <SubmitComplaint />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/complaint/:id" 
        element={
          <ProtectedRoute allowedRoles={['user', 'admin', 'head']}>
            <ComplaintDetail />
          </ProtectedRoute>
        } 
      />
      
      {/* Admin routes */}
      <Route 
        path="/admin-dashboard" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'head']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
        
      {/* UI Showcase route */}
      <Route path="/ui-showcase" element={<UIShowcase />} />
      
      {/* Responsive testing routes - add /responsive-test to any route */}
      <Route path="/:path/responsive-test" element={<ResponsiveTester />} />
      <Route path="/responsive-test" element={<ResponsiveTester />} />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// Main App component that wraps everything with the AuthProvider
function App() {
  return (
    <Router>
      <Favicon />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}

export default App
