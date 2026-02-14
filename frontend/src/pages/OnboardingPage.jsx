import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { speak, startListening } from '../utils/voice';
import api from '../utils/api';
import { Mic, MicOff, ArrowRight, ArrowLeft, CheckCircle, Volume2 } from 'lucide-react';

const STEPS = [
    { key: 'name', type: 'text', required: true },
    { key: 'age', type: 'number', required: true },
    { key: 'gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
    { key: 'state', type: 'text', required: true },
    { key: 'district', type: 'text', required: false },
    { key: 'address', type: 'text', required: false },
    { key: 'pincode', type: 'text', required: false },
    { key: 'occupation', type: 'text', required: true },
    { key: 'income', type: 'number', required: true },
    { key: 'caste', type: 'select', options: ['General', 'OBC', 'SC', 'ST'], required: false },
    { key: 'education', type: 'select', options: ['None', 'Primary', 'Secondary', 'Graduate', 'Post-Graduate'], required: false },
    { key: 'ration_card_type', type: 'select', options: ['None', 'APL', 'BPL', 'AAY'], required: false },
];

const OnboardingPage = () => {
    const { refreshUser, user } = useAuth();
    const { t, language } = useLanguage();
    const navigate = useNavigate();

    const [step, setStep] = useState(0);
    const [values, setValues] = useState({});
    const [isListening, setIsListening] = useState(false);
    const [saving, setSaving] = useState(false);
    const [recognition, setRecognition] = useState(null);

    const current = STEPS[step];
    const progress = ((step) / STEPS.length) * 100;
    const lang = language === 'hi' ? 'hi-IN' : 'en-US';

    // Speak the prompt for the current step
    useEffect(() => {
        const timer = setTimeout(() => {
            const prompt = t(`onboarding_${current.key}`);
            speak(prompt, lang);
        }, 400);
        return () => clearTimeout(timer);
    }, [step]);

    const handleVoice = () => {
        if (isListening && recognition) {
            recognition.stop();
            setIsListening(false);
            setRecognition(null);
            return;
        }

        setIsListening(true);
        const rec = startListening((text) => {
            setIsListening(false);
            setRecognition(null);

            // For number fields, try to parse
            if (current.type === 'number') {
                const num = parseInt(text.replace(/[^\d]/g, ''));
                if (!isNaN(num)) {
                    setValues(prev => ({ ...prev, [current.key]: num }));
                    speak(`${num}`, lang);
                    return;
                }
            }
            setValues(prev => ({ ...prev, [current.key]: text }));
            speak(text, lang);
        }, lang);

        setRecognition(rec);
    };

    const handleNext = () => {
        if (current.required && !values[current.key]) return;
        if (step < STEPS.length - 1) {
            setStep(step + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            // Convert numeric fields
            const payload = { ...values };
            if (payload.age) payload.age = parseInt(payload.age);
            if (payload.income) payload.income = parseInt(payload.income);
            if (payload.ration_card_type === 'None') payload.ration_card_type = null;
            if (payload.education === 'None') payload.education = null;

            await api.patch('/users/me/profile', payload);
            await refreshUser();
            speak(t('onboarding_complete'), lang);
            setTimeout(() => navigate('/schemes'), 1500);
        } catch (err) {
            console.error('Profile save failed', err);
            alert('Failed to save profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleNext();
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '560px', margin: '0 auto' }}>
            {/* Progress Bar */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {t('step')} {step + 1} / {STEPS.length}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                        {Math.round(progress)}%
                    </span>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: 'linear-gradient(90deg, var(--primary), var(--primary-light))',
                        borderRadius: '3px',
                        transition: 'width 0.4s ease',
                    }} />
                </div>
            </div>

            {/* Card */}
            <div className="card" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                {/* AI Avatar / Icon */}
                <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto var(--spacing-md)',
                    boxShadow: '0 4px 15px rgba(46, 125, 50, 0.3)',
                }}>
                    <Volume2 size={28} color="white" />
                </div>

                {/* Prompt Text */}
                <h3 style={{ marginBottom: 'var(--spacing-lg)', lineHeight: 1.5 }}>
                    {t(`onboarding_${current.key}`)}
                </h3>

                {/* Input Area */}
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    {current.type === 'select' ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                            {current.options.map(opt => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setValues(prev => ({ ...prev, [current.key]: opt }))}
                                    className="btn"
                                    style={{
                                        background: values[current.key] === opt ? 'var(--primary)' : 'var(--background)',
                                        color: values[current.key] === opt ? 'white' : 'var(--text-main)',
                                        border: `2px solid ${values[current.key] === opt ? 'var(--primary)' : 'var(--border)'}`,
                                        padding: '8px 20px',
                                        borderRadius: 'var(--radius-full)',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                                type={current.type}
                                value={values[current.key] || ''}
                                onChange={e => setValues(prev => ({ ...prev, [current.key]: e.target.value }))}
                                onKeyDown={handleKeyDown}
                                placeholder={t(`placeholder_${current.key}`)}
                                autoFocus
                                style={{
                                    flex: 1, padding: '12px 16px', borderRadius: 'var(--radius-md)',
                                    border: '2px solid var(--border)', fontSize: 'var(--font-size-lg)',
                                    textAlign: 'center', outline: 'none',
                                    transition: 'border-color 0.2s',
                                }}
                                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                            />
                            <button
                                type="button"
                                onClick={handleVoice}
                                className="btn"
                                style={{
                                    width: '48px', height: '48px', borderRadius: '50%', padding: 0,
                                    background: isListening ? 'var(--error)' : 'var(--primary)',
                                    color: 'white',
                                    animation: isListening ? 'pulse 1.5s infinite' : 'none',
                                }}
                            >
                                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                            </button>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    {step > 0 && (
                        <button type="button" onClick={handleBack} className="btn btn-secondary">
                            <ArrowLeft size={18} /> {t('back')}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleNext}
                        className="btn btn-primary"
                        disabled={current.required && !values[current.key]}
                        style={{ minWidth: '140px' }}
                    >
                        {step === STEPS.length - 1 ? (
                            saving ? '...' : <><CheckCircle size={18} /> {t('finish')}</>
                        ) : (
                            <>{t('next')} <ArrowRight size={18} /></>
                        )}
                    </button>
                </div>

                {/* Listening indicator */}
                {isListening && (
                    <p style={{ color: 'var(--accent)', marginTop: 'var(--spacing-md)', fontWeight: 600 }}>
                        🎤 {t('listening')}
                    </p>
                )}
            </div>

            {/* Skip optional hint */}
            {!current.required && (
                <p className="text-center" style={{ marginTop: 'var(--spacing-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {t('optional_skip')}
                </p>
            )}
        </div>
    );
};

export default OnboardingPage;
