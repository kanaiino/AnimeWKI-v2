import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PageLoader from '../PageLoader/PageLoader';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader isActive={false} />;
  return user ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;