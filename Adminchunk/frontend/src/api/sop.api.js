import api from './axios.js';

export const uploadSop = async (formData) => {
  try {
    const response = await api.post('/sop/upload', formData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSopList = async () => {
  try {
    const response = await api.get('/sop/list');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateSop = async (id, payload) => {
  try {
    const response = await api.patch(`/sop/${id}`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteSop = async (id) => {
  try {
    const response = await api.delete(`/sop/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
