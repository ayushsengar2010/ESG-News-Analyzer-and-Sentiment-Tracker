import React, { useState, useEffect } from 'react';
import './NewsFetcher.css';
import api from '../services/api';

function NewsFetcher({ onArticleSelect }) {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);

  const topics = [
    { value: '', label: 'All ESG Topics' },
    { value: 'environmental', label: 'Environmental' },
    { value: 'social', label: 'Social' },
    { value: 'governance', label: 'Governance' }
  ];

  useEffect(() => {
    checkApiStatus();
    fetchCompanies();
  }, []);

  const checkApiStatus = async () => {
    try {
      const status = await api.getNewsApiStatus();
      setApiStatus(status);
    } catch (err) {
      setApiStatus({ newsApiConfigured: false });
    }
  };

  const fetchCompanies = async () => {
    try {
      const result = await api.getSampleCompanies();
      setCompanies(result.companies || []);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  const handleFetchNews = async () => {
    setLoading(true);
    setError(null);
    setArticles([]);
    setAnalysisResults(null);

    try {
      let result;
      if (selectedCompany) {
        result = await api.fetchCompanyNews(selectedCompany);
      } else {
        result = await api.fetchESGNews(selectedTopic || null);
      }
      setArticles(result.articles || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchAndAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    setAnalysisResults(null);

    try {
      const result = await api.fetchAndAnalyzeNews({
        company: selectedCompany || null,
        topic: selectedTopic || null,
        limit: 5
      });
      setAnalysisResults(result);
      setArticles([]);
    } catch (err) {
      setError(err.message || 'Failed to fetch and analyze news');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSelectArticle = (article) => {
    if (onArticleSelect) {
      onArticleSelect({
        title: article.title,
        content: article.content || article.description,
        url: article.url
      });
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return '#48bb78';
      case 'negative': return '#f56565';
      default: return '#ed8936';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Environmental': '#38b2ac',
      'Social': '#9f7aea',
      'Governance': '#f6ad55',
      'Multiple': '#4299e1',
      'Other': '#a0aec0'
    };
    return colors[category] || '#a0aec0';
  };

  if (apiStatus && !apiStatus.newsApiConfigured) {
    return (
      <div className="news-fetcher-container">
        <div className="api-not-configured">
          <h3>📰 News API Not Configured</h3>
          <p>To enable automatic news fetching, add your NewsAPI key to the .env file:</p>
          <code>NEWS_API_KEY=your_api_key_here</code>
          <p className="hint">
            Get a free API key at <a href="https://newsapi.org" target="_blank" rel="noopener noreferrer">newsapi.org</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="news-fetcher-container">
      <div className="fetcher-header">
        <h2>📰 Automatic News Fetcher</h2>
        <p>Fetch and analyze ESG news from major companies</p>
      </div>

      <div className="fetcher-controls">
        <div className="control-group">
          <label>Select Company</label>
          <select 
            value={selectedCompany} 
            onChange={(e) => {
              setSelectedCompany(e.target.value);
              if (e.target.value) setSelectedTopic('');
            }}
          >
            <option value="">All Companies</option>
            {companies.map(company => (
              <option key={company.ticker} value={company.name}>
                {company.name} ({company.ticker})
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Or Select Topic</label>
          <select 
            value={selectedTopic} 
            onChange={(e) => {
              setSelectedTopic(e.target.value);
              if (e.target.value) setSelectedCompany('');
            }}
            disabled={!!selectedCompany}
          >
            {topics.map(topic => (
              <option key={topic.value} value={topic.value}>
                {topic.label}
              </option>
            ))}
          </select>
        </div>

        <div className="button-group">
          <button 
            className="fetch-btn"
            onClick={handleFetchNews}
            disabled={loading || analyzing}
          >
            {loading ? 'Fetching...' : '🔍 Fetch News'}
          </button>
          
          <button 
            className="analyze-btn"
            onClick={handleFetchAndAnalyze}
            disabled={loading || analyzing}
          >
            {analyzing ? 'Analyzing...' : '🤖 Fetch & Analyze'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {articles.length > 0 && (
        <div className="articles-list">
          <h3>📄 Fetched Articles ({articles.length})</h3>
          <p className="hint">Click an article to analyze it manually</p>
          
          {articles.map((article, index) => (
            <div 
              key={index} 
              className="article-card clickable"
              onClick={() => handleSelectArticle(article)}
            >
              <h4>{article.title}</h4>
              <p className="article-description">{article.description}</p>
              <div className="article-meta">
                <span className="source">{article.source}</span>
                <span className="date">
                  {new Date(article.publishedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {analysisResults && (
        <div className="analysis-results">
          <h3>✅ Analysis Complete</h3>
          <p className="summary">
            Analyzed {analysisResults.articles?.length || 0} of {analysisResults.totalFetched} articles
          </p>

          {analysisResults.articles?.map((article, index) => (
            <div key={index} className="analyzed-article-card">
              <div className="article-header">
                <h4>{article.title}</h4>
                {article.alreadyExists && (
                  <span className="exists-badge">Already in DB</span>
                )}
              </div>
              
              <div className="article-analysis">
                <span 
                  className="sentiment-badge"
                  style={{ backgroundColor: getSentimentColor(article.sentiment) }}
                >
                  {article.sentiment?.toUpperCase()}
                </span>
                <span 
                  className="category-badge"
                  style={{ backgroundColor: getCategoryColor(article.category) }}
                >
                  {article.category}
                </span>
                <span className="score">
                  Score: {article.sentimentScore?.toFixed(2)}
                </span>
              </div>

              <div className="article-meta">
                <span className="source">{article.source}</span>
                {article.url && (
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="article-link"
                  >
                    Read Original →
                  </a>
                )}
              </div>
            </div>
          ))}

          {analysisResults.errors?.length > 0 && (
            <div className="analysis-errors">
              <h4>⚠️ Some articles could not be analyzed:</h4>
              <ul>
                {analysisResults.errors.map((err, index) => (
                  <li key={index}>{err.title}: {err.error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NewsFetcher;
