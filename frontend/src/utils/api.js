import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Adjust if backend runs on different port

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const endpoints = {
    users: '/users',
    schemes: '/schemes',
    apply: '/apply',
    recommend: (userId) => `/schemes/recommend/${userId}`,
    upload: (appId) => `/apply/${appId}/upload`,
};

export default api;
