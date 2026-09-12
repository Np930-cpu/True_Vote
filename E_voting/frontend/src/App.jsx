import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { ToastProvider } from './context/ToastProvider';
import { useAuth } from './context/useAuth';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Elections from './pages/Elections';
import Vote from './pages/Vote';
import Results from './pages/Results';
import Blockchain from './pages/Blockchain';
import Profile from './pages/Profile';

import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import ManageElections from './pages/admin/ManageElections';
import ManageCandidates from './pages/admin/ManageCandidates';
import AdminBlockchain from './pages/admin/AdminBlockchain';

function VoterRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/admin/login" />;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/elections" element={<VoterRoute><Elections /></VoterRoute>} />
        <Route path="/vote" element={<VoterRoute><Vote /></VoterRoute>} />
        <Route path="/results/:id" element={<VoterRoute><Results /></VoterRoute>} />
        <Route path="/results" element={<VoterRoute><Results /></VoterRoute>} />
        <Route path="/blockchain" element={<VoterRoute><Blockchain /></VoterRoute>} />
        <Route path="/profile" element={<VoterRoute><Profile /></VoterRoute>} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="/admin/elections" element={<AdminRoute><ManageElections /></AdminRoute>} />
        <Route path="/admin/candidates" element={<AdminRoute><ManageCandidates /></AdminRoute>} />
        <Route path="/admin/blockchain" element={<AdminRoute><AdminBlockchain /></AdminRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
