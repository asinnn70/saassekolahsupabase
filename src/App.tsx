import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DashboardLayout } from './components/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { AttendancePage } from './pages/AttendancePage';
import { TeachersPage } from './pages/TeachersPage';
import { ClassesPage } from './pages/ClassesPage';

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && profile && !roles.includes(profile.role)) {
    return <Navigate to="/dashboard" />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />

          <Route path="/students" element={
            <ProtectedRoute roles={['school_admin', 'teacher']}>
              <StudentsPage />
            </ProtectedRoute>
          } />

          <Route path="/attendance" element={
            <ProtectedRoute roles={['teacher', 'student']}>
              <AttendancePage />
            </ProtectedRoute>
          } />

          <Route path="/teachers" element={
            <ProtectedRoute roles={['school_admin']}>
              <TeachersPage />
            </ProtectedRoute>
          } />

          <Route path="/classes" element={
            <ProtectedRoute roles={['school_admin', 'teacher']}>
              <ClassesPage />
            </ProtectedRoute>
          } />

          {/* Fallback routes */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
