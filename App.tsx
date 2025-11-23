import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import PostExplorer from './components/PostExplorer';
import CompetitorComparison from './components/CompetitorComparison';
import AIInsights from './components/AIInsights';
import Login from './components/Login';
import ConnectAccounts from './components/ConnectAccounts';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="h-screen w-screen bg-slate-900 flex items-center justify-center text-slate-400">Loading...</div>;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/posts" element={
        <ProtectedRoute>
          <PostExplorer />
        </ProtectedRoute>
      } />
      
      <Route path="/competitors" element={
        <ProtectedRoute>
          <CompetitorComparison />
        </ProtectedRoute>
      } />
      
      <Route path="/ai-insights" element={
        <ProtectedRoute>
          <AIInsights />
        </ProtectedRoute>
      } />

      <Route path="/connect" element={
        <ProtectedRoute>
          <ConnectAccounts />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
