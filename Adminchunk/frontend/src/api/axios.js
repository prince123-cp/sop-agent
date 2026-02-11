import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
});

// Response interceptor for basic error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const code = error?.code;
    const requestUrl = `${error?.config?.baseURL || ''}${error?.config?.url || ''}`;
    const messageFromServer =
      error?.response?.data?.message ||
      '';

    const message = code === 'ERR_NETWORK'
      ? `Backend se connection nahi hua (${requestUrl || apiBaseUrl}). Ensure backend server chal raha ho.`
      : messageFromServer || error?.message || 'Unexpected API error';

    console.error('API Error:', { code, status, url: requestUrl, message });

    const normalizedError = new Error(message);
    normalizedError.status = status;
    normalizedError.code = code;
    normalizedError.original = error;

    return Promise.reject(normalizedError);
  }
);

export default api;
