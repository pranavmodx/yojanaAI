import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Home, User, CheckCircle, Languages, LogOut, LogIn } from 'lucide-react';
import { useLanguage, LANGUAGES } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
    const { language, setLanguage, t } = useLanguage();
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const [langOpen, setLangOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

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
                                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                    <User size={18} /> {user?.name || t('profile')}
                                </Link>
                            </>
                        )}

                        {/* Language Selector Dropdown */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setLangOpen(!langOpen)}
                                className="btn btn-secondary"
                                style={{ padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                <Languages size={14} /> {currentLang.nativeLabel}
                            </button>
                            {langOpen && (
                                <div style={{
                                    position: 'absolute', right: 0, top: '100%', marginTop: '4px',
                                    background: 'var(--surface)', border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-md)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    minWidth: '160px', zIndex: 200, overflow: 'hidden',
                                }}>
                                    {LANGUAGES.map(lang => (
                                        <button
                                            key={lang.code}
                                            onClick={() => { setLanguage(lang.code); setLangOpen(false); }}
                                            style={{
                                                display: 'block', width: '100%', textAlign: 'left',
                                                padding: '8px 14px', border: 'none', cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                background: language === lang.code ? 'var(--primary)' : 'transparent',
                                                color: language === lang.code ? 'white' : 'var(--text-main)',
                                            }}
                                        >
                                            {lang.nativeLabel} <span style={{ opacity: 0.6, marginLeft: '4px' }}>({lang.label})</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

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
                    <p>{t('footer')}</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
