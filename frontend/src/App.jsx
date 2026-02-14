import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import ProfilePage from './pages/ProfilePage';
import SchemesPage from './pages/SchemesPage';
import AgentPage from './pages/AgentPage';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from './contexts/LanguageContext';
import { ArrowRight, Shield, Volume2, FileCheck } from 'lucide-react';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="text-center" style={{ padding: '60px' }}>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// Home Page
const HomePage = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Redirect authenticated users directly
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(user?.profile_completed ? '/agent' : '/onboarding', { replace: true });
    }
  }, [loading, isAuthenticated, user]);

  // Don't show landing page while checking auth
  if (loading) return <div className="text-center" style={{ padding: '60px' }}>Loading...</div>;

  // Only non-authenticated users see this
  return (
    <div className="animate-fade-in" style={{ textAlign: 'center', padding: 'var(--spacing-xl) 0' }}>
      {/* Hero */}
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-sm)', lineHeight: 1.3 }}>
          {t('welcome')}
        </h1>
        <p style={{ fontSize: 'var(--font-size-lg)', maxWidth: '500px', margin: '0 auto' }}>
          {t('subtitle')}
        </p>
      </div>

      <button onClick={() => navigate('/signup')} className="btn btn-primary" style={{ padding: '14px 36px', fontSize: 'var(--font-size-lg)' }}>
        {t('getStarted')} <ArrowRight size={20} />
      </button>

      {/* Features */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--spacing-lg)', marginTop: '60px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <Volume2 size={32} color="var(--primary)" style={{ marginBottom: '8px' }} />
          <h3>Voice Guided</h3>
          <p style={{ fontSize: '0.9rem' }}>Speak your details — no typing needed</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <Shield size={32} color="var(--primary)" style={{ marginBottom: '8px' }} />
          <h3>Smart Matching</h3>
          <p style={{ fontSize: '0.9rem' }}>AI finds schemes you're eligible for</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <FileCheck size={32} color="var(--primary)" style={{ marginBottom: '8px' }} />
          <h3>Easy Apply</h3>
          <p style={{ fontSize: '0.9rem' }}>Upload documents and apply in one place</p>
        </div>
      </div>
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="onboarding" element={
          <ProtectedRoute><OnboardingPage /></ProtectedRoute>
        } />
        <Route path="profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />
        <Route path="schemes" element={
          <ProtectedRoute><SchemesPage /></ProtectedRoute>
        } />
        {/* Agent route kept accessible if revisited, but nav link removed */}
        <Route path="agent" element={
          <ProtectedRoute><AgentPage /></ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <LanguageProvider>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </LanguageProvider>
  );
}

export default App;
