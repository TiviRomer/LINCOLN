import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import Dashboard from './pages/Dashboard/Dashboard';
import DashboardTest from './pages/Dashboard/DashboardTest';
import Servers from './pages/Servers/Servers';
import Threats from './pages/Threats/Threats';
import Incidents from './pages/Incidents/Incidents';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import Users from './pages/Users/Users';
import Profile from './pages/Profile/Profile';
import Help from './pages/Help/Help';
import Sessions from './pages/Sessions/Sessions';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/test" element={<DashboardTest />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/servers" 
            element={
              <ProtectedRoute>
                <Servers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/threats" 
            element={
              <ProtectedRoute>
                <Threats />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/incidents" 
            element={
              <ProtectedRoute>
                <Incidents />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/help" 
            element={
              <ProtectedRoute>
                <Help />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/sessions" 
            element={
              <ProtectedRoute>
                <Sessions />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;

