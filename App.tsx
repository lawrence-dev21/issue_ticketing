
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import OfficerDashboardPage from './pages/officer/OfficerDashboardPage';
import MainLayout from './components/layout/MainLayout';
import { useAuth } from './hooks/useAuth';
import { UserRole } from './types';
import NotFoundPage from './pages/NotFoundPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles: UserRole[] }> = ({ children, roles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ministry-blue"></div></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/login" replace />; // Or a dedicated unauthorized page
  }
  
  return <>{children}</>;
};


const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute roles={[UserRole.ADMIN]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      <Route 
        path="/officer" 
        element={
          <ProtectedRoute roles={[UserRole.OFFICER]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<OfficerDashboardPage />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
