import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Import pages
import Login from './pages/Login'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import SubmitComplaint from './pages/SubmitComplaint'
import ComplaintDetail from './pages/ComplaintDetail'
import UIShowcase from './pages/UIShowcase'

// Import components
import ResponsiveTester from './components/ResponsiveTester'

// Import auth context
import { AuthProvider, useAuth } from './context/AuthContext'

// Import Material UI theme provider
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import muiTheme from './theme/muiTheme'

// Routes component that uses the auth context
function AppRoutes() {
  const { isAuthenticated, userRole } = useAuth()

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
      {/* Public route */}
      <Route path="/" element={isAuthenticated ? 
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

// Main App component that wraps everything with the AuthProvider and ThemeProvider
function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline /> {/* Provides consistent baseline styles */}
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App
