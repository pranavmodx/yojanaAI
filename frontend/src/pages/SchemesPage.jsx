import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import api, { endpoints } from '../utils/api';
import { Shield, FileText, CheckCircle, Loader, Bot, Upload, X } from 'lucide-react';

// Mock documents that DigiLocker would return
const MOCK_DIGILOCKER_DOCS = [
    { id: 'aadhaar', name: 'Aadhaar Card', issuer: 'UIDAI' },
    { id: 'pan', name: 'PAN Card', issuer: 'Income Tax Dept.' },
    { id: 'income_cert', name: 'Income Certificate', issuer: 'Revenue Dept.' },
    { id: 'caste_cert', name: 'Caste Certificate', issuer: 'Revenue Dept.' },
    { id: 'residence', name: 'Residence Proof', issuer: 'Local Authority' },
];

// AI Agent submission steps
const AI_STEPS = [
    { key: 'digilocker_filling', icon: '📝', delay: 1500 },
    { key: 'digilocker_attaching', icon: '📎', delay: 1200 },
    { key: 'digilocker_portal', icon: '🏛️', delay: 2000 },
];

const SchemesPage = () => {
    const { t, language } = useLanguage();
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aiResults, setAiResults] = useState({});
    const [analyzingIds, setAnalyzingIds] = useState(new Set());

    // Manual upload modal
    const [uploadingId, setUploadingId] = useState(null);
    const [file, setFile] = useState(null);

    // DigiLocker flow state
    const [digiFlow, setDigiFlow] = useState(null); // { schemeId, step, docs, verifiedDocs, aiStep, refNumber }
    // steps: 'docs' | 'connecting' | 'connected' | 'verifying' | 'verified' | 'submitting' | 'done'

    useEffect(() => {
        fetchSchemes();
    }, []);

    const fetchSchemes = async () => {
        try {
            const userId = localStorage.getItem('userId');
            let response;
            if (userId) {
                try {
                    response = await api.get(endpoints.recommend(userId));
                } catch (e) {
                    console.warn("Recommendation failed, fetching all", e);
                    response = await api.get(endpoints.schemes);
                }
            } else {
                response = await api.get(endpoints.schemes);
            }
            setSchemes(response.data);
        } catch (error) {
            console.error("Failed to fetch schemes", error);
        } finally {
            setLoading(false);
        }
    };

    // AI Eligibility Check
    const checkEligibility = async (schemeId) => {
        setAnalyzingIds(prev => new Set([...prev, schemeId]));
        try {
            const res = await api.post('/agent/run');
            const result = res.data.results.find(r => r.scheme_id === schemeId);
            if (result) {
                setAiResults(prev => ({
                    ...prev,
                    [schemeId]: { eligible: result.eligible, reason: result.reason }
                }));
            }
        } catch (error) {
            console.error("AI Check failed", error);
        } finally {
            setAnalyzingIds(prev => {
                const next = new Set(prev);
                next.delete(schemeId);
                return next;
            });
        }
    };

    // ========== DigiLocker Flow ==========
    const startDigiLockerFlow = (schemeId) => {
        const scheme = schemes.find(s => s.id === schemeId);
        const requiredDocs = scheme?.documents_required
            ? (typeof scheme.documents_required === 'string'
                ? scheme.documents_required.split(',').map(d => d.trim())
                : scheme.documents_required)
            : ['Aadhaar Card', 'Income Certificate', 'Caste Certificate'];

        setDigiFlow({
            schemeId,
            schemeName: scheme?.name || '',
            step: 'docs',
            requiredDocs,
            connectedDocs: [],
            verifiedDocs: [],
            aiStep: -1,
            refNumber: null,
        });
    };

    const connectDigiLocker = async () => {
        setDigiFlow(prev => ({ ...prev, step: 'connecting' }));

        // Mock OAuth delay
        await new Promise(r => setTimeout(r, 2000));
        setDigiFlow(prev => ({ ...prev, step: 'connected' }));

        // Mock fetching documents
        await new Promise(r => setTimeout(r, 1500));
        setDigiFlow(prev => ({
            ...prev,
            step: 'verifying',
            connectedDocs: MOCK_DIGILOCKER_DOCS.slice(0, prev.requiredDocs.length),
        }));

        // Verify each doc one by one
        const docsToVerify = MOCK_DIGILOCKER_DOCS.slice(0, digiFlow.requiredDocs.length);
        for (let i = 0; i < docsToVerify.length; i++) {
            await new Promise(r => setTimeout(r, 1000));
            setDigiFlow(prev => ({
                ...prev,
                verifiedDocs: [...prev.verifiedDocs, docsToVerify[i].id],
            }));
        }

        setDigiFlow(prev => ({ ...prev, step: 'verified' }));
    };

    const submitWithAI = async () => {
        setDigiFlow(prev => ({ ...prev, step: 'submitting', aiStep: 0 }));

        // Animate through AI steps
        for (let i = 0; i < AI_STEPS.length; i++) {
            setDigiFlow(prev => ({ ...prev, aiStep: i }));
            await new Promise(r => setTimeout(r, AI_STEPS[i].delay));
        }

        // Actually call the backend
        try {
            await api.post(`/agent/apply/${digiFlow.schemeId}`);
        } catch (e) {
            console.warn("Backend apply call failed (mocked):", e);
        }

        const refNumber = `YOJ-2026-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
        setDigiFlow(prev => ({ ...prev, step: 'done', refNumber }));
    };

    // Manual Apply
    const startManualApply = (schemeId) => {
        setUploadingId(schemeId);
        setFile(null);
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId');
        if (!userId) { alert(t('loginFirst')); return; }

        try {
            const applyRes = await api.post(endpoints.apply, { user_id: userId, scheme_id: uploadingId });
            const appId = applyRes.data.id;
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                await api.post(endpoints.upload(appId), formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            alert(t('appSuccess'));
            setUploadingId(null);
        } catch (error) {
            console.error("Manual apply failed", error);
            alert(t('appFailed'));
        }
    };

    // ========== Render ==========
    return (
        <div className="animate-fade-in">
            <h2 className="text-center" style={{ marginBottom: 'var(--spacing-lg)' }}>{t('schemes')}</h2>

            {loading ? (
                <p className="text-center">{t('loading')}</p>
            ) : schemes.length === 0 ? (
                <p className="text-center">{t('noSchemes')}</p>
            ) : (
                <div style={{ display: 'grid', gap: 'var(--spacing-md)', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                    {schemes.map(scheme => (
                        <div key={scheme.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ marginBottom: '4px' }}>{scheme.name}</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{scheme.ministry}</p>
                            <p style={{ flex: 1 }}>{scheme.description}</p>
                            <p style={{ fontSize: '0.9rem', marginBottom: 'var(--spacing-md)' }}>
                                <strong>{t('benefits')}:</strong> {scheme.benefits}
                            </p>

                            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                                <button
                                    onClick={() => startManualApply(scheme.id)}
                                    className="btn btn-secondary"
                                    style={{ flex: 1, fontSize: '0.85rem' }}
                                >
                                    {t('applyManually')}
                                </button>
                                <button
                                    onClick={() => checkEligibility(scheme.id)}
                                    className="btn btn-primary"
                                    style={{ flex: 1, fontSize: '0.85rem' }}
                                    disabled={analyzingIds.has(scheme.id)}
                                >
                                    {analyzingIds.has(scheme.id) ? t('checking') : t('checkEligibility')}
                                </button>
                            </div>

                            {/* AI Result */}
                            {aiResults[scheme.id] && (
                                <div style={{
                                    marginTop: '12px', padding: '12px', borderRadius: '8px',
                                    background: aiResults[scheme.id].eligible ? 'rgba(76, 175, 80, 0.08)' : 'rgba(211, 47, 47, 0.08)',
                                    border: `1px solid ${aiResults[scheme.id].eligible ? 'var(--success)' : 'var(--error)'}`,
                                }}>
                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>
                                        {aiResults[scheme.id].eligible ? `✅ ${t('eligible')}` : `❌ ${t('notEligible')}`}
                                    </p>
                                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {aiResults[scheme.id].reason}
                                    </p>
                                    {aiResults[scheme.id].eligible && (
                                        <button
                                            onClick={() => startDigiLockerFlow(scheme.id)}
                                            className="btn btn-primary"
                                            style={{ width: '100%', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                        >
                                            <Bot size={16} /> {t('applyWithAI')}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* ========== Manual Upload Modal ========== */}
            {uploadingId && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="card animate-fade-in" style={{ width: '90%', maxWidth: '500px', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0 }}>{t('applyManually')}</h3>
                            <button onClick={() => setUploadingId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>{t('uploadDocDesc')}</p>
                        <form onSubmit={handleManualSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>{t('uploadDoc')}</label>
                                <input type="file" onChange={e => setFile(e.target.files[0])} required style={{ width: '100%' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setUploadingId(null)} className="btn btn-secondary">{t('cancel')}</button>
                                <button type="submit" className="btn btn-primary">{t('submitApplication')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========== DigiLocker Flow Modal ========== */}
            {digiFlow && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="card animate-fade-in" style={{
                        width: '90%', maxWidth: '540px', padding: '28px',
                        maxHeight: '85vh', overflowY: 'auto',
                    }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #1a73e8, #4285f4)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Shield size={20} color="white" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{t('digilocker_title')}</h3>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{digiFlow.schemeName}</p>
                                </div>
                            </div>
                            {digiFlow.step !== 'submitting' && (
                                <button onClick={() => setDigiFlow(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                            )}
                        </div>

                        {/* Step: Required Documents */}
                        {digiFlow.step === 'docs' && (
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '12px' }}>{t('digilocker_docs_required')}:</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                                    {digiFlow.requiredDocs.map((doc, i) => (
                                        <div key={i} style={{
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                            padding: '10px 14px', borderRadius: '8px',
                                            background: 'var(--background)', border: '1px solid var(--border)',
                                        }}>
                                            <FileText size={18} color="var(--primary)" />
                                            <span style={{ fontSize: '0.9rem' }}>{doc}</span>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={connectDigiLocker} className="btn btn-primary" style={{
                                    width: '100%', padding: '12px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', gap: '8px', fontSize: '1rem',
                                    background: 'linear-gradient(135deg, #1a73e8, #4285f4)',
                                }}>
                                    <Shield size={18} /> {t('digilocker_connect')}
                                </button>
                            </div>
                        )}

                        {/* Step: Connecting */}
                        {digiFlow.step === 'connecting' && (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{
                                    width: '60px', height: '60px', borderRadius: '50%',
                                    border: '3px solid var(--border)', borderTopColor: '#1a73e8',
                                    animation: 'spin 1s linear infinite',
                                    margin: '0 auto 16px',
                                }} />
                                <p style={{ fontWeight: 600 }}>{t('digilocker_connecting')}</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    Redirecting to DigiLocker OAuth...
                                </p>
                            </div>
                        )}

                        {/* Step: Connected, fetching docs */}
                        {digiFlow.step === 'connected' && (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <CheckCircle size={48} color="var(--success)" style={{ marginBottom: '12px' }} />
                                <p style={{ fontWeight: 600, color: 'var(--success)' }}>{t('digilocker_connected')}</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('digilocker_fetching')}</p>
                            </div>
                        )}

                        {/* Step: Verifying documents */}
                        {digiFlow.step === 'verifying' && (
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '12px' }}>{t('digilocker_verifying')}</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {digiFlow.connectedDocs.map((doc) => {
                                        const isVerified = digiFlow.verifiedDocs.includes(doc.id);
                                        return (
                                            <div key={doc.id} style={{
                                                display: 'flex', alignItems: 'center', gap: '10px',
                                                padding: '10px 14px', borderRadius: '8px',
                                                background: isVerified ? 'rgba(76, 175, 80, 0.08)' : 'var(--background)',
                                                border: `1px solid ${isVerified ? 'var(--success)' : 'var(--border)'}`,
                                                transition: 'all 0.3s ease',
                                            }}>
                                                {isVerified
                                                    ? <CheckCircle size={18} color="var(--success)" />
                                                    : <Loader size={18} color="var(--text-secondary)" style={{ animation: 'spin 1s linear infinite' }} />
                                                }
                                                <div style={{ flex: 1 }}>
                                                    <span style={{ fontSize: '0.9rem', fontWeight: isVerified ? 600 : 400 }}>{doc.name}</span>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>{doc.issuer}</span>
                                                </div>
                                                {isVerified && <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>✓ {t('digilocker_verified')}</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Step: All verified */}
                        {digiFlow.step === 'verified' && (
                            <div>
                                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                                    <div style={{
                                        width: '56px', height: '56px', borderRadius: '50%',
                                        background: 'rgba(76, 175, 80, 0.12)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px',
                                    }}>
                                        <CheckCircle size={32} color="var(--success)" />
                                    </div>
                                    <p style={{ fontWeight: 600, color: 'var(--success)', fontSize: '1.05rem' }}>{t('digilocker_all_verified')}</p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                                    {digiFlow.connectedDocs.map(doc => (
                                        <div key={doc.id} style={{
                                            display: 'flex', alignItems: 'center', gap: '8px',
                                            padding: '8px 12px', borderRadius: '6px',
                                            background: 'rgba(76, 175, 80, 0.06)',
                                        }}>
                                            <CheckCircle size={16} color="var(--success)" />
                                            <span style={{ fontSize: '0.85rem' }}>{doc.name}</span>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={submitWithAI} className="btn btn-primary" style={{
                                    width: '100%', padding: '12px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', gap: '8px', fontSize: '1rem',
                                }}>
                                    <Bot size={18} /> {t('digilocker_submitting').replace('...', '')}
                                </button>
                            </div>
                        )}

                        {/* Step: AI Submitting */}
                        {digiFlow.step === 'submitting' && (
                            <div style={{ padding: '10px 0' }}>
                                <p style={{ fontWeight: 600, marginBottom: '16px', textAlign: 'center' }}>
                                    <Bot size={20} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                    {t('digilocker_submitting')}
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {AI_STEPS.map((step, i) => {
                                        const isActive = digiFlow.aiStep === i;
                                        const isDone = digiFlow.aiStep > i;
                                        return (
                                            <div key={step.key} style={{
                                                display: 'flex', alignItems: 'center', gap: '12px',
                                                padding: '12px 14px', borderRadius: '8px',
                                                background: isDone ? 'rgba(76, 175, 80, 0.08)' : isActive ? 'rgba(25, 118, 210, 0.08)' : 'var(--background)',
                                                border: `1px solid ${isDone ? 'var(--success)' : isActive ? 'var(--primary)' : 'var(--border)'}`,
                                                transition: 'all 0.3s ease',
                                            }}>
                                                <span style={{ fontSize: '1.2rem' }}>{step.icon}</span>
                                                <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: isActive ? 600 : 400 }}>{t(step.key)}</span>
                                                {isDone && <CheckCircle size={16} color="var(--success)" />}
                                                {isActive && <Loader size={16} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Step: Done! */}
                        {digiFlow.step === 'done' && (
                            <div style={{ textAlign: 'center', padding: '10px 0' }}>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--success), #66bb6a)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 12px',
                                    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                                }}>
                                    <CheckCircle size={32} color="white" />
                                </div>
                                <h3 style={{ color: 'var(--success)', marginBottom: '8px' }}>{t('digilocker_success')}</h3>
                                <div style={{
                                    padding: '12px 16px', borderRadius: '8px',
                                    background: 'var(--background)', border: '1px solid var(--border)',
                                    marginBottom: '16px',
                                }}>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{t('digilocker_ref')}</p>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 700, margin: '4px 0 0', color: 'var(--primary)', letterSpacing: '1px' }}>
                                        {digiFlow.refNumber}
                                    </p>
                                </div>
                                <button onClick={() => setDigiFlow(null)} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                                    {t('digilocker_done')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SchemesPage;
