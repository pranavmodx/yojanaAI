import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Lock, ArrowRight } from 'lucide-react';

const LoginPage = () => {
    const { login } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(identifier, password);
            navigate(result.profile_completed ? '/schemes' : '/onboarding');
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '440px', margin: '0 auto' }}>
            <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
                <h2 className="text-center" style={{ marginBottom: 'var(--spacing-xs)' }}>{t('login')}</h2>
                <p className="text-center" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    {t('loginSubtitle')}
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <div>
                        <label style={{ fontWeight: 600, marginBottom: '4px', display: 'block' }}>{t('phoneOrEmail')}</label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={e => setIdentifier(e.target.value)}
                            placeholder={t('phoneOrEmailPlaceholder')}
                            required
                            style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: 'var(--font-size-base)' }}
                        />
                    </div>

                    <div>
                        <label style={{ fontWeight: 600, marginBottom: '4px', display: 'block' }}>{t('password')}</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: 'var(--font-size-base)' }}
                            />
                        </div>
                    </div>

                    {error && <p style={{ color: 'var(--error)', fontSize: '0.875rem', margin: 0 }}>{error}</p>}

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '12px', fontSize: 'var(--font-size-lg)' }}>
                        {loading ? '...' : <>{t('login')} <ArrowRight size={18} /></>}
                    </button>
                </form>

                <p className="text-center" style={{ marginTop: 'var(--spacing-lg)', fontSize: '0.875rem' }}>
                    {t('noAccount')}{' '}
                    <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('signup')}</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
