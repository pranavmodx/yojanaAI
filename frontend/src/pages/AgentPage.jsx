import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { speak } from '../utils/voice';
import api from '../utils/api';
import { Bot, CheckCircle, XCircle, FileText, Loader2, Send, AlertCircle } from 'lucide-react';

const AgentPage = () => {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const lang = language === 'hi' ? 'hi-IN' : 'en-US';

    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [applyingTo, setApplyingTo] = useState(null); // scheme_id being applied to
    const [appliedSchemes, setAppliedSchemes] = useState(new Set());
    const [error, setError] = useState('');

    const runAgent = async () => {
        setLoading(true);
        setError('');
        setResults(null);

        try {
            const res = await api.post('/agent/run');
            setResults(res.data);

            // Track already applied
            const alreadyApplied = new Set();
            res.data.results.forEach(r => {
                if (r.already_applied) alreadyApplied.add(r.scheme_id);
            });
            setAppliedSchemes(alreadyApplied);

        } catch (err) {
            setError(err.response?.data?.detail || 'Agent failed');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (schemeId, schemeName) => {
        setApplyingTo(schemeId);
        try {
            await api.post(`/agent/apply/${schemeId}`);
            setAppliedSchemes(prev => new Set([...prev, schemeId]));
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to apply');
        } finally {
            setApplyingTo(null);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '720px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto var(--spacing-md)',
                    boxShadow: '0 6px 20px rgba(46, 125, 50, 0.3)',
                }}>
                    <Bot size={40} color="white" />
                </div>
                <h2>{t('agent_title')}</h2>
                <p>{t('agent_subtitle')}</p>
            </div>

            {/* Run Button */}
            {!results && !loading && (
                <div style={{ textAlign: 'center' }}>
                    <button onClick={runAgent} className="btn btn-primary" style={{ padding: '14px 40px', fontSize: 'var(--font-size-lg)' }}>
                        <Bot size={20} /> {t('agent_run')}
                    </button>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                    <Loader2 size={40} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
                    <p style={{ marginTop: 'var(--spacing-md)', fontWeight: 600 }}>{t('agent_analyzing')}</p>
                    <p style={{ fontSize: '0.85rem' }}>{t('agent_checking')}</p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-lg)', borderColor: 'var(--error)' }}>
                    <AlertCircle size={32} color="var(--error)" />
                    <p style={{ color: 'var(--error)', fontWeight: 600, marginTop: '8px' }}>{error}</p>
                    <button onClick={runAgent} className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }}>
                        {t('agent_retry')}
                    </button>
                </div>
            )}

            {/* Results */}
            {results && (
                <div>
                    {/* Summary */}
                    <div className="card" style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-lg)', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                            <div>
                                <p style={{ fontSize: '2rem', fontWeight: 800, color: 'white', margin: 0 }}>{results.total_schemes}</p>
                                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', margin: 0 }}>{t('agent_total')}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '2rem', fontWeight: 800, color: 'white', margin: 0 }}>{results.eligible_count}</p>
                                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', margin: 0 }}>{t('agent_eligible')}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '2rem', fontWeight: 800, color: 'white', margin: 0 }}>{results.already_applied_count + appliedSchemes.size - results.already_applied_count}</p>
                                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', margin: 0 }}>{t('agent_applied')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Scheme Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        {results.results.map((r) => {
                            const isApplied = appliedSchemes.has(r.scheme_id);
                            return (
                                <div key={r.scheme_id} className="card" style={{ padding: 'var(--spacing-lg)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-sm)' }}>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{r.scheme_name}</h3>
                                            <p style={{ fontSize: '0.85rem', margin: '4px 0' }}>{r.description}</p>
                                        </div>
                                        {r.eligible ? (
                                            <CheckCircle size={24} color="var(--success)" style={{ flexShrink: 0 }} />
                                        ) : (
                                            <XCircle size={24} color="var(--error)" style={{ flexShrink: 0 }} />
                                        )}
                                    </div>

                                    {/* Reason */}
                                    <div style={{
                                        background: r.eligible ? 'rgba(76, 175, 80, 0.08)' : 'rgba(211, 47, 47, 0.08)',
                                        borderRadius: 'var(--radius-sm)',
                                        padding: '8px 12px',
                                        fontSize: '0.85rem',
                                        marginBottom: 'var(--spacing-sm)',
                                        borderLeft: `3px solid ${r.eligible ? 'var(--success)' : 'var(--error)'}`,
                                    }}>
                                        {r.reason}
                                    </div>

                                    {/* Benefits */}
                                    <p style={{ fontSize: '0.85rem', marginBottom: 'var(--spacing-sm)' }}>
                                        <strong>{t('agent_benefits')}:</strong> {r.benefits}
                                    </p>

                                    {/* Documents */}
                                    {r.documents_needed.length > 0 && (
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                                            <FileText size={14} style={{ verticalAlign: 'middle' }} /> {t('agent_docs')}: {r.documents_needed.join(', ')}
                                        </div>
                                    )}

                                    {/* Apply Button */}
                                    {r.eligible && (
                                        <button
                                            onClick={() => handleApply(r.scheme_id, r.scheme_name)}
                                            disabled={isApplied || applyingTo === r.scheme_id}
                                            className={`btn ${isApplied ? 'btn-secondary' : 'btn-primary'}`}
                                            style={{ width: '100%', marginTop: '4px' }}
                                        >
                                            {isApplied ? (
                                                <><CheckCircle size={16} /> {t('agent_applied_btn')}</>
                                            ) : applyingTo === r.scheme_id ? (
                                                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                            ) : (
                                                <><Send size={16} /> {t('agent_apply_btn')}</>
                                            )}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Run Again */}
                    <div style={{ textAlign: 'center', marginTop: 'var(--spacing-xl)' }}>
                        <button onClick={runAgent} className="btn btn-secondary">
                            <Bot size={18} /> {t('agent_run_again')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentPage;
