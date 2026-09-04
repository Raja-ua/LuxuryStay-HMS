import axios from 'axios';

const api = axios.create({
  baseURL: 'https://luxurystay-hms-backend.vercel.app/api', // Pointing to our Express backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
