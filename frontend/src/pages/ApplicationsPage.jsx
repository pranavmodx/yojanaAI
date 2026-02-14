import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Upload } from 'lucide-react';
import api, { endpoints } from '../utils/api';

// Mock list since we didn't strictly implement "get my applications" API yet
// In a real app we'd fetch GET /applications?user_id=...
// For this MVP, I'll assume the user might have one or I'll just show a "Enter Application ID to track" input or similar if I can't easily list them.
// Actually, let's fix the backend to allowing listing applications. 
// For now, I'll create a UI that assumes we can upload to an Application ID if we know it (which was alerted).
// Or better, let's just make a simple mock list UI for demonstration if backend support is missing, 
// BUT wait, I should quickly add a 'get applications' endpoint to backend if possible.
// Given constraints, I will make a simple "Track Application" input + Upload form.

const ApplicationsPage = () => {
    const { t } = useLanguage();
    const [appId, setAppId] = useState('');
    const [file, setFile] = useState(null);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!appId || !file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post(endpoints.upload(appId), formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Document Uploaded Successfully!');
        } catch (error) {
            console.error("Upload failed", error);
            alert('Upload failed. Check Application ID.');
        }
    };

    return (
        <div className="card animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 className="text-center">{t('applications')}</h2>
            <p className="text-center">Upload documents for your application.</p>

            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                <div>
                    <label>Application ID</label>
                    <input
                        type="number"
                        value={appId}
                        onChange={e => setAppId(e.target.value)}
                        placeholder="Enter Application ID"
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                    />
                </div>

                <div style={{ border: '2px dashed var(--border)', padding: '20px', textAlign: 'center', borderRadius: '8px' }}>
                    <Upload size={40} color="var(--text-secondary)" />
                    <br />
                    <input
                        type="file"
                        onChange={e => setFile(e.target.files[0])}
                        style={{ marginTop: '10px' }}
                    />
                </div>

                <button type="submit" className="btn btn-primary" disabled={!file || !appId}>
                    Upload Document
                </button>
            </form>
        </div>
    );
};

export default ApplicationsPage;
