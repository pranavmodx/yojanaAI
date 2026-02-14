import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

import ProfilePage from './pages/ProfilePage';

import SchemesPage from './pages/SchemesPage';
import ApplicationsPage from './pages/ApplicationsPage';

// Placeholder Pages
const Home = () => (
  <div className="text-center animate-fade-in">
    <h1>Welcome to YojanaAI</h1>
    <p>Your bridge to Government Schemes</p>
    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
      <button className="btn btn-primary">Get Started</button>
      <button className="btn btn-secondary">Learn More</button>
    </div>
  </div>
);

// const Profile = () => <div className="card animate-fade-in"><h2>My Profile</h2><p>Profile form coming soon...</p></div>;
// const Schemes = () => <div className="card animate-fade-in"><h2>Build Schemes</h2><p>Scheme list coming soon...</p></div>;
// const Applications = () => <div className="card animate-fade-in"><h2>My Applications</h2><p>Application status coming soon...</p></div>;

import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="schemes" element={<SchemesPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
          </Route>
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
