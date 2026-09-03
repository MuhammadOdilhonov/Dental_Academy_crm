import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Visitors from './pages/Visitors';
import CashRegister from './pages/CashRegister';
import Dashboard from './pages/Dashboard';

// Helper component for Root Route redirect
const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/visitors" replace />;
  if (user.role === 'kassa') return <Navigate to="/cashier" replace />;
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes wrapped inside Layout */}
          <Route element={<ProtectedRoute allowedRoles={['director', 'admin', 'kassa']} />}>
            <Route
              path="/visitors"
              element={
                <Layout>
                  <Visitors />
                </Layout>
              }
            />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['director', 'kassa']} />}>
            <Route
              path="/cashier"
              element={
                <Layout>
                  <CashRegister />
                </Layout>
              }
            />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['director']} />}>
            <Route
              path="/dashboard"
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />
          </Route>

          {/* Root Route */}
          <Route path="/" element={<RootRedirect />} />
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
