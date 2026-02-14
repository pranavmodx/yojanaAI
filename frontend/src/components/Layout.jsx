import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Home, User, FileText, CheckCircle, Languages, LogOut, LogIn } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
    const { toggleLanguage, language, t } = useLanguage();
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{
                background: 'var(--surface)',
                borderBottom: '1px solid var(--border)',
                padding: 'var(--spacing-md) 0',
                position: 'sticky',
                top: 0,
                zIndex: 100,
            }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to="/" style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: '800', fontSize: 'var(--font-size-xl)' }}>
                        YojanaAI
                    </Link>

                    <nav style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                            <Home size={18} /> {t('home')}
                        </Link>

                        {isAuthenticated && (
                            <>
                                <Link to="/schemes" style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                    <CheckCircle size={18} /> {t('schemes')}
                                </Link>
                                <Link to="/applications" style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                    <FileText size={18} /> {t('applications')}
                                </Link>
                                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                    <User size={18} /> {user?.name || t('profile')}
                                </Link>
                            </>
                        )}

                        {/* Language Toggle */}
                        <button onClick={toggleLanguage} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Languages size={14} /> {language === 'en' ? 'हिन्दी' : 'EN'}
                        </button>

                        {/* Auth Button */}
                        {isAuthenticated ? (
                            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--error)', borderColor: 'var(--error)' }}>
                                <LogOut size={14} /> {t('logout')}
                            </button>
                        ) : (
                            <Link to="/login" className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <LogIn size={14} /> {t('login')}
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            <main style={{ flex: 1, padding: 'var(--spacing-xl) 0' }}>
                <div className="container">
                    <Outlet />
                </div>
            </main>

            <footer style={{ background: 'var(--surface)', padding: 'var(--spacing-lg) 0', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
                <div className="container text-center">
                    <p>&copy; 2024 YojanaAI. Empowering Rural India.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
