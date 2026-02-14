import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Phone, Mail, Lock, ArrowRight } from 'lucide-react';

const SignupPage = () => {
    const { signup } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [mode, setMode] = useState('phone'); // 'phone' or 'email'
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signup(
                mode === 'phone' ? phone : null,
                mode === 'email' ? email : null,
                password
            );
            // Always go to onboarding after signup
            navigate('/onboarding');
        } catch (err) {
            setError(err.response?.data?.detail || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '440px', margin: '0 auto' }}>
            <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
                <h2 className="text-center" style={{ marginBottom: 'var(--spacing-xs)' }}>
                    {t('createAccount')}
                </h2>
                <p className="text-center" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    {t('signupSubtitle')}
                </p>

                {/* Toggle phone / email */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--spacing-lg)' }}>
                    <button
                        type="button"
                        className={`btn ${mode === 'phone' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ flex: 1 }}
                        onClick={() => setMode('phone')}
                    >
                        <Phone size={16} /> {t('phone')}
                    </button>
                    <button
                        type="button"
                        className={`btn ${mode === 'email' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ flex: 1 }}
                        onClick={() => setMode('email')}
                    >
                        <Mail size={16} /> {t('email')}
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    {mode === 'phone' ? (
                        <div>
                            <label style={{ fontWeight: 600, marginBottom: '4px', display: 'block' }}>{t('phone')}</label>
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                <span style={{ padding: '8px 12px', background: 'var(--background)', borderRight: '1px solid var(--border)', fontWeight: 600 }}>+91</span>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="9876543210"
                                    required
                                    style={{ flex: 1, padding: '10px 12px', border: 'none', outline: 'none', fontSize: 'var(--font-size-base)' }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label style={{ fontWeight: 600, marginBottom: '4px', display: 'block' }}>{t('email')}</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: 'var(--font-size-base)' }}
                            />
                        </div>
                    )}

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
                                minLength={6}
                                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: 'var(--font-size-base)' }}
                            />
                        </div>
                    </div>

                    {error && (
                        <p style={{ color: 'var(--error)', fontSize: '0.875rem', margin: 0 }}>{error}</p>
                    )}

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '12px', fontSize: 'var(--font-size-lg)' }}>
                        {loading ? '...' : <>{t('signup')} <ArrowRight size={18} /></>}
                    </button>
                </form>

                <p className="text-center" style={{ marginTop: 'var(--spacing-lg)', fontSize: '0.875rem' }}>
                    {t('alreadyHaveAccount')}{' '}
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('login')}</Link>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;
