import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    // Redirect to home if user doesn't have required role
    return <Navigate to="/" replace />;
  }

  // If authenticated and has required role, render children
  return children;
}

export default ProtectedRoute; 