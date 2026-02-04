const axios = require('axios');

class NewsService {
  constructor() {
    this.newsApiKey = process.env.NEWS_API_KEY;
    this.newsApiBaseUrl = 'https://newsapi.org/v2';
    
    this.sampleCompanies = [
      { name: 'Tesla', ticker: 'TSLA', keywords: ['Tesla', 'Elon Musk', 'electric vehicles'] },
      { name: 'Apple', ticker: 'AAPL', keywords: ['Apple Inc', 'Tim Cook', 'Apple sustainability'] },
      { name: 'Microsoft', ticker: 'MSFT', keywords: ['Microsoft', 'Satya Nadella', 'Microsoft carbon'] },
      { name: 'Amazon', ticker: 'AMZN', keywords: ['Amazon', 'AWS', 'Amazon climate'] },
      { name: 'Google', ticker: 'GOOGL', keywords: ['Google', 'Alphabet', 'Google sustainability'] },
      { name: 'BP', ticker: 'BP', keywords: ['BP', 'British Petroleum', 'BP energy transition'] },
      { name: 'Unilever', ticker: 'UL', keywords: ['Unilever', 'sustainable living', 'Unilever ESG'] },
      { name: 'Patagonia', ticker: 'PATA', keywords: ['Patagonia', 'outdoor clothing', 'Patagonia environment'] },
      { name: 'Nike', ticker: 'NKE', keywords: ['Nike', 'Nike sustainability', 'Nike labor'] },
      { name: 'Nestlé', ticker: 'NSRGY', keywords: ['Nestlé', 'Nestle', 'Nestlé water'] },
      { name: 'Walmart', ticker: 'WMT', keywords: ['Walmart', 'Walmart sustainability', 'Walmart supply chain'] }
    ];

    this.esgTerms = [
      'ESG', 'sustainability', 'climate change', 'carbon emissions',
      'renewable energy', 'diversity inclusion', 'corporate governance',
      'environmental impact', 'social responsibility', 'green energy',
      'net zero', 'carbon neutral', 'human rights', 'labor practices'
    ];
  }

  getSampleCompanies() {
    return this.sampleCompanies.map(company => ({
      name: company.name,
      ticker: company.ticker
    }));
  }

  async fetchCompanyNews(companyName, options = {}) {
    const { pageSize = 10, page = 1 } = options;
    
    if (!this.newsApiKey) {
      throw new Error('NEWS_API_KEY is not configured. Please add it to your .env file.');
    }

    const company = this.sampleCompanies.find(
      c => c.name.toLowerCase() === companyName.toLowerCase() ||
           c.ticker.toLowerCase() === companyName.toLowerCase()
    );

    const searchQuery = company 
      ? `(${company.keywords.join(' OR ')}) AND (ESG OR sustainability OR climate OR governance OR environmental)`
      : `${companyName} AND (ESG OR sustainability OR climate OR governance)`;

    try {
      const response = await axios.get(`${this.newsApiBaseUrl}/everything`, {
        params: {
          q: searchQuery,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: Math.min(pageSize, 100),
          page,
          apiKey: this.newsApiKey
        },
        timeout: 10000
      });

      if (response.data.status !== 'ok') {
        throw new Error(response.data.message || 'Failed to fetch news');
      }

      return {
        articles: response.data.articles.map(article => this.formatArticle(article, companyName)),
        totalResults: response.data.totalResults,
        page,
        pageSize
      };

    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Invalid NEWS_API_KEY. Please check your API key.');
      }
      if (error.response?.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      }
      throw new Error(`Failed to fetch news: ${error.message}`);
    }
  }

  async fetchESGNews(options = {}) {
    const { pageSize = 10, page = 1, topic = null } = options;

    if (!this.newsApiKey) {
      throw new Error('NEWS_API_KEY is not configured. Please add it to your .env file.');
    }

    let searchQuery = 'ESG OR "environmental social governance"';
    
    if (topic) {
      const topicQueries = {
        environmental: 'climate change OR carbon emissions OR renewable energy OR sustainability',
        social: 'diversity inclusion OR labor rights OR human rights OR social responsibility',
        governance: 'corporate governance OR board diversity OR executive compensation OR transparency'
      };
      searchQuery = topicQueries[topic.toLowerCase()] || searchQuery;
    }

    try {
      const response = await axios.get(`${this.newsApiBaseUrl}/everything`, {
        params: {
          q: searchQuery,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: Math.min(pageSize, 100),
          page,
          apiKey: this.newsApiKey
        },
        timeout: 10000
      });

      if (response.data.status !== 'ok') {
        throw new Error(response.data.message || 'Failed to fetch news');
      }

      return {
        articles: response.data.articles.map(article => this.formatArticle(article)),
        totalResults: response.data.totalResults,
        page,
        pageSize
      };

    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Invalid NEWS_API_KEY. Please check your API key.');
      }
      if (error.response?.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      }
      throw new Error(`Failed to fetch news: ${error.message}`);
    }
  }

  async fetchTopHeadlines(options = {}) {
    const { country = 'us', category = 'business', pageSize = 10 } = options;

    if (!this.newsApiKey) {
      throw new Error('NEWS_API_KEY is not configured. Please add it to your .env file.');
    }

    try {
      const response = await axios.get(`${this.newsApiBaseUrl}/top-headlines`, {
        params: {
          country,
          category,
          pageSize: Math.min(pageSize, 100),
          apiKey: this.newsApiKey
        },
        timeout: 10000
      });

      if (response.data.status !== 'ok') {
        throw new Error(response.data.message || 'Failed to fetch headlines');
      }

      const esgArticles = response.data.articles.filter(article => 
        this.isESGRelevant(article.title + ' ' + (article.description || ''))
      );

      return {
        articles: esgArticles.map(article => this.formatArticle(article)),
        totalResults: esgArticles.length
      };

    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Invalid NEWS_API_KEY. Please check your API key.');
      }
      throw new Error(`Failed to fetch headlines: ${error.message}`);
    }
  }

  isESGRelevant(text) {
    const lowerText = text.toLowerCase();
    return this.esgTerms.some(term => lowerText.includes(term.toLowerCase()));
  }

  formatArticle(article, company = null) {
    return {
      title: article.title || 'Untitled',
      content: article.content || article.description || '',
      description: article.description || '',
      url: article.url || '',
      source: article.source?.name || 'Unknown',
      author: article.author || 'Unknown',
      publishedAt: article.publishedAt || new Date().toISOString(),
      imageUrl: article.urlToImage || null,
      company: company || null
    };
  }

  async searchNews(query, options = {}) {
    const { pageSize = 10, page = 1, from = null, to = null } = options;

    if (!this.newsApiKey) {
      throw new Error('NEWS_API_KEY is not configured. Please add it to your .env file.');
    }

    try {
      const params = {
        q: query,
        language: 'en',
        sortBy: 'relevancy',
        pageSize: Math.min(pageSize, 100),
        page,
        apiKey: this.newsApiKey
      };

      if (from) params.from = from;
      if (to) params.to = to;

      const response = await axios.get(`${this.newsApiBaseUrl}/everything`, params);

      if (response.data.status !== 'ok') {
        throw new Error(response.data.message || 'Failed to search news');
      }

      return {
        articles: response.data.articles.map(article => this.formatArticle(article)),
        totalResults: response.data.totalResults,
        page,
        pageSize
      };

    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Invalid NEWS_API_KEY. Please check your API key.');
      }
      throw new Error(`Failed to search news: ${error.message}`);
    }
  }
}

module.exports = new NewsService();
