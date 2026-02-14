import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import api, { endpoints } from '../utils/api';

const SchemesPage = () => {
    const { t, language } = useLanguage();
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aiResults, setAiResults] = useState({}); // { schemeId: { eligible: bool, reason: str } }
    const [analyzingIds, setAnalyzingIds] = useState(new Set());
    const [uploadingId, setUploadingId] = useState(null); // schemeId for manual upload modal
    const [file, setFile] = useState(null);
    const [applicationId, setApplicationId] = useState(null); // To track created app for upload

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

    // AI Check
    const checkEligibility = async (schemeId) => {
        setAnalyzingIds(prev => new Set([...prev, schemeId]));
        try {
            // We run the full agent but filter for this scheme (optimization: backend could support single check)
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

    const applyWithAI = async (schemeId) => {
        try {
            await api.post(`/agent/apply/${schemeId}`);
            alert(language === 'hi' ? 'आवेदन सफल!' : 'Application Successful!');
            // Optionally refresh schemes or mark as applied
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to apply');
        }
    };

    // Manual Apply
    const startManualApply = (schemeId) => {
        setUploadingId(schemeId);
        setApplicationId(null);
        setFile(null);
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert('Please login first');
            return;
        }

        try {
            // 1. Create Application
            const applyRes = await api.post(endpoints.apply, { user_id: userId, scheme_id: uploadingId });
            const appId = applyRes.data.id;

            // 2. Upload Document if selected
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                await api.post(endpoints.upload(appId), formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            alert('Application submitted successfully!');
            setUploadingId(null);
        } catch (error) {
            console.error("Manual apply failed", error);
            alert('Failed to submit application.');
        }
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-center" style={{ marginBottom: 'var(--spacing-lg)' }}>{t('schemes')}</h2>

            {loading ? (
                <p className="text-center">Loading...</p>
            ) : schemes.length === 0 ? (
                <p className="text-center">No schemes found.</p>
            ) : (
                <div style={{ display: 'grid', gap: 'var(--spacing-md)', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                    {schemes.map(scheme => (
                        <div key={scheme.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ marginBottom: '4px' }}>{scheme.name}</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{scheme.ministry}</p>
                            <p style={{ flex: 1 }}>{scheme.description}</p>
                            <p style={{ fontSize: '0.9rem', marginBottom: 'var(--spacing-md)' }}><strong>Benefits:</strong> {scheme.benefits}</p>

                            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                                <button
                                    onClick={() => startManualApply(scheme.id)}
                                    className="btn btn-secondary"
                                    style={{ flex: 1, fontSize: '0.85rem' }}
                                >
                                    Apply Manually
                                </button>
                                <button
                                    onClick={() => checkEligibility(scheme.id)}
                                    className="btn btn-primary"
                                    style={{ flex: 1, fontSize: '0.85rem' }}
                                    disabled={analyzingIds.has(scheme.id)}
                                >
                                    {analyzingIds.has(scheme.id) ? 'Checking...' : 'Check Eligibility (AI)'}
                                </button>
                            </div>

                            {/* AI Result Section */}
                            {aiResults[scheme.id] && (
                                <div style={{
                                    marginTop: '12px',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    background: aiResults[scheme.id].eligible ? 'rgba(76, 175, 80, 0.1)' : 'rgba(211, 47, 47, 0.1)',
                                    border: `1px solid ${aiResults[scheme.id].eligible ? 'var(--success)' : 'var(--error)'}`,
                                    fontSize: '0.9rem'
                                }}>
                                    <p style={{ margin: 0, fontWeight: 600 }}>
                                        {aiResults[scheme.id].eligible ? '✅ Eligible' : '❌ Not Eligible'}
                                    </p>
                                    <p style={{ margin: '4px 0 0' }}>{aiResults[scheme.id].reason}</p>
                                    {aiResults[scheme.id].eligible && (
                                        <button
                                            onClick={() => applyWithAI(scheme.id)}
                                            className="btn btn-primary"
                                            style={{ width: '100%', marginTop: '8px', padding: '6px' }}
                                        >
                                            Apply with AI
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Manual Upload Modal */}
            {uploadingId && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="card animate-fade-in" style={{ width: '90%', maxWidth: '500px', padding: '24px' }}>
                        <h3>Apply Manually</h3>
                        <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>Upload required documents for verification.</p>

                        <form onSubmit={handleManualSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Upload Document</label>
                                <input
                                    type="file"
                                    onChange={e => setFile(e.target.files[0])}
                                    required
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setUploadingId(null)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary">Submit Application</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SchemesPage;
