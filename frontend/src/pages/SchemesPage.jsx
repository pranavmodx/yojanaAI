import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import api, { endpoints } from '../utils/api';
import { speak } from '../utils/voice';

const SchemesPage = () => {
    const { t, language } = useLanguage();
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSchemes();
    }, []);

    const fetchSchemes = async () => {
        try {
            const userId = localStorage.getItem('userId');
            let response;
            if (userId) {
                // Try to get recommendations if user serves
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

    const handleApply = async (schemeId, schemeName) => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert(language === 'hi' ? 'कृपया पहले प्रोफाइल बनाएं' : 'Please create a profile first');
            return;
        }

        // Voice feedback
        speak(language === 'hi' ? `Applying to ${schemeName}` : `Applying to ${schemeName}`, language === 'hi' ? 'hi-IN' : 'en-US');

        try {
            await api.post(endpoints.apply, { user_id: userId, scheme_id: schemeId });
            alert('Application Started! Go to Applications to upload documents.');
        } catch (error) {
            console.error("Apply failed", error);
            alert('Failed to apply.');
        }
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-center">{t('schemes')}</h2>

            {loading ? (
                <p className="text-center">Loading...</p>
            ) : schemes.length === 0 ? (
                <p className="text-center">No schemes found.</p>
            ) : (
                <div style={{ display: 'grid', gap: 'var(--spacing-md)', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                    {schemes.map(scheme => (
                        <div key={scheme.id} className="card">
                            <h3>{scheme.name}</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{scheme.ministry}</p>
                            <p>{scheme.description}</p>
                            <p><strong>Benefits:</strong> {scheme.benefits}</p>
                            <button onClick={() => handleApply(scheme.id, scheme.name)} className="btn btn-primary" style={{ width: '100%' }}>
                                Apply Now
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SchemesPage;
