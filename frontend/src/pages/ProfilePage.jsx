import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Mic, Save } from 'lucide-react';
import { startListening, speak } from '../utils/voice';
import api, { endpoints } from '../utils/api';

const ProfilePage = () => {
    const { t, language } = useLanguage();
    const [isListening, setIsListening] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: '',
        income: '',
        occupation: '',
        state: '',
        caste: 'General',
        disability: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleVoiceInput = (field) => {
        setIsListening(true);
        // Simple prompt
        speak(`Please say your ${field}`, language === 'hi' ? 'hi-IN' : 'en-US');

        startListening((text) => {
            setIsListening(false);
            setFormData(prev => ({ ...prev, [field]: text }));
            speak(`Saved ${text}`, language === 'hi' ? 'hi-IN' : 'en-US');
        }, language === 'hi' ? 'hi-IN' : 'en-US');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Basic integer conversion for numeric fields
            const payload = {
                ...formData,
                age: parseInt(formData.age) || 0,
                income: parseInt(formData.income) || 0
            };
            const response = await api.post(endpoints.users, payload);
            alert('Profile Saved! ID: ' + response.data.id);
            localStorage.setItem('userId', response.data.id);
        } catch (error) {
            console.error("Error saving profile", error);
            alert('Failed to save profile');
        }
    };

    return (
        <div className="card animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 className="text-center">{t('profile')}</h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>

                {/* Name Field */}
                <div>
                    <label>{t('name')}</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                        />
                        <button type="button" className="btn btn-secondary" onClick={() => handleVoiceInput('name')}>
                            <Mic size={18} />
                        </button>
                    </div>
                </div>

                {/* Age & Gender Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                    <div>
                        <label>{t('age')}</label>
                        <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                        />
                    </div>
                    <div>
                        <label>{t('gender')}</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                        >
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                {/* Income */}
                <div>
                    <label>{t('income')}</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="number"
                            name="income"
                            value={formData.income}
                            onChange={handleChange}
                            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                        />
                        <button type="button" className="btn btn-secondary" onClick={() => handleVoiceInput('income')}>
                            <Mic size={18} />
                        </button>
                    </div>
                </div>

                {/* Occupation */}
                <div>
                    <label>{t('occupation')}</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            name="occupation"
                            value={formData.occupation}
                            onChange={handleChange}
                            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                        />
                        <button type="button" className="btn btn-secondary" onClick={() => handleVoiceInput('occupation')}>
                            <Mic size={18} />
                        </button>
                    </div>
                </div>

                {/* Submit */}
                <button type="submit" className="btn btn-primary mt-4">
                    <Save size={20} /> {t('submit')}
                </button>

                {isListening && <p className="text-center" style={{ color: 'var(--accent)' }}>{t('listening')}</p>}
            </form>
        </div>
    );
};

export default ProfilePage;
