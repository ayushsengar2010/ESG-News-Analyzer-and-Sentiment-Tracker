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

  getTrends: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/articles/trends`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch trends'
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
  },

  getNewsApiStatus: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/news/status`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to check news API status'
      );
    }
  },

  getSampleCompanies: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/news/companies`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch companies'
      );
    }
  },

  fetchCompanyNews: async (companyName, params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/news/company/${encodeURIComponent(companyName)}`, { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch company news'
      );
    }
  },

  fetchESGNews: async (topic = null, params = {}) => {
    try {
      const queryParams = { ...params };
      if (topic) queryParams.topic = topic;
      const response = await axios.get(`${API_BASE_URL}/news/esg`, { params: queryParams });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch ESG news'
      );
    }
  },

  fetchHeadlines: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/news/headlines`, { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch headlines'
      );
    }
  },

  searchNews: async (query, params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/news/search`, { 
        params: { q: query, ...params } 
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to search news'
      );
    }
  },

  fetchAndAnalyzeNews: async (options = {}) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/news/fetch-and-analyze`, options);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch and analyze news'
      );
    }
  }
};

export default api;
