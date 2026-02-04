import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = {
  analyzeArticle: async (articleData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/analyze`, articleData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to analyze article'
      );
    }
  },

  getArticles: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/articles`, { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch articles'
      );
    }
  },

  getArticle: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/articles/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch article'
      );
    }
  },

  getStats: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/articles/stats`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch statistics'
      );
    }
  },

  deleteArticle: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/articles/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to delete article'
      );
    }
  }
};

export default api;
