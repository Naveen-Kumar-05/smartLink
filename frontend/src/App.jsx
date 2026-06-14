import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PublicStatsPage from './pages/PublicStatsPage';
import ExpiredPage from './pages/ExpiredPage';
import NotFoundPage from './pages/NotFoundPage';
import SettingsPage from './pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="flex min-h-screen flex-col text-foreground transition-colors duration-300" style={{ background: '#06060f' }}>
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/stats/:shortCode" element={<PublicStatsPage />} />
                  <Route path="/expired" element={<ExpiredPage />} />
                  <Route path="/not-found" element={<NotFoundPage />} />

                  {/* Auth routes (unauthenticated only) */}
                  <Route
                    path="/login"
                    element={
                      <PublicOnlyRoute>
                        <LoginPage />
                      </PublicOnlyRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <PublicOnlyRoute>
                        <RegisterPage />
                      </PublicOnlyRoute>
                    }
                  />

                  {/* Protected routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/analytics/:shortCode"
                    element={
                      <ProtectedRoute>
                        <AnalyticsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/not-found" replace />} />
                </Routes>
              </main>
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
