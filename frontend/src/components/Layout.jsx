import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Home, User, FileText, CheckCircle, Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Layout = () => {
    const { toggleLanguage, language, t } = useLanguage();
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{
                background: 'var(--surface)',
                borderBottom: '1px solid var(--border)',
                padding: 'var(--spacing-md) 0',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to="/" style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: '800', fontSize: 'var(--font-size-xl)' }}>
                        YojanaAI
                    </Link>

                    <nav style={{ display: 'flex', gap: 'var(--spacing-lg)', alignItems: 'center' }}>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--text-main)' }}>
                            <Home size={20} /> {t('welcome').split(' ')[0]}
                        </Link>
                        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--text-main)' }}>
                            <User size={20} /> {t('profile')}
                        </Link>
                        <Link to="/schemes" style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--text-main)' }}>
                            <CheckCircle size={20} /> {t('schemes')}
                        </Link>
                        <Link to="/applications" style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--text-main)' }}>
                            <FileText size={20} /> {t('applications')}
                        </Link>
                        <button onClick={toggleLanguage} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Languages size={16} /> {language === 'en' ? 'हिन्दी' : 'English'}
                        </button>
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
