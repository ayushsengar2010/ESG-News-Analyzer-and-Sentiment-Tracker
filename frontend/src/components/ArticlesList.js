import React, { useState, useEffect, useCallback } from 'react';
import './ArticlesList.css';
import api from '../services/api';

function ArticlesList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    sentiment: '',
    category: ''
  });

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter.sentiment) params.sentiment = filter.sentiment;
      if (filter.category) params.category = filter.category;
      
      const response = await api.getArticles(params);
      setArticles(response.articles);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleFilterChange = (type, value) => {
    setFilter(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this article?')) {
      return;
    }

    try {
      await api.deleteArticle(id);
      setArticles(prev => prev.filter(article => article._id !== id));
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return '#48bb78';
      case 'negative': return '#f56565';
      default: return '#ed8936';
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Environmental': '🌱',
      'Social': '👥',
      'Governance': '⚖️',
      'Multiple': '📊',
      'Other': '📄'
    };
    return icons[category] || '📄';
  };

  if (loading) {
    return (
      <div className="articles-container">
        <div className="loading-spinner">
          <div className="spinner-large"></div>
          <p>Loading articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="articles-container">
        <div className="error-state">
          <p>⚠️ {error}</p>
          <button onClick={fetchArticles} className="retry-btn">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="articles-container">
      <div className="articles-header">
        <h2>📋 Analysis History</h2>
        <p className="articles-count">{articles.length} articles analyzed</p>
      </div>

      <div className="filters-bar">
        <div className="filter-group">
          <label>Sentiment:</label>
          <select 
            value={filter.sentiment} 
            onChange={(e) => handleFilterChange('sentiment', e.target.value)}
          >
            <option value="">All</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Category:</label>
          <select 
            value={filter.category} 
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All</option>
            <option value="Environmental">Environmental</option>
            <option value="Social">Social</option>
            <option value="Governance">Governance</option>
            <option value="Multiple">Multiple</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {(filter.sentiment || filter.category) && (
          <button 
            onClick={() => setFilter({ sentiment: '', category: '' })}
            className="clear-filters-btn"
          >
            Clear Filters
          </button>
        )}
      </div>

      {articles.length === 0 ? (
        <div className="empty-state">
          <h3>📋 No Articles Found</h3>
          <p>
            {filter.sentiment || filter.category 
              ? 'Try adjusting your filters' 
              : 'Start by analyzing your first article'}
          </p>
        </div>
      ) : (
        <div className="articles-grid">
          {articles.map((article) => (
            <div key={article._id} className="article-card">
              <div className="article-header">
                <h3>{article.title}</h3>
                <button 
                  onClick={() => handleDelete(article._id)}
                  className="delete-btn"
                  title="Delete article"
                >
                  🗑️
                </button>
              </div>

              <div className="article-meta">
                <span className="article-date">📅 {formatDate(article.analyzedAt)}</span>
              </div>

              <div className="article-badges">
                <span 
                  className="sentiment-badge-small"
                  style={{ backgroundColor: getSentimentColor(article.sentiment) }}
                >
                  {article.sentiment}
                </span>
                <span className="category-badge-small">
                  {getCategoryIcon(article.category)} {article.category}
                </span>
              </div>

              {article.summary && (
                <p className="article-summary">{article.summary}</p>
              )}

              <div className="article-scores">
                <div className="mini-score">
                  <span className="mini-label">E:</span>
                  <span className="mini-value">{(article.esgScores.environmental * 100).toFixed(0)}%</span>
                </div>
                <div className="mini-score">
                  <span className="mini-label">S:</span>
                  <span className="mini-value">{(article.esgScores.social * 100).toFixed(0)}%</span>
                </div>
                <div className="mini-score">
                  <span className="mini-label">G:</span>
                  <span className="mini-value">{(article.esgScores.governance * 100).toFixed(0)}%</span>
                </div>
              </div>

              {article.keywords && article.keywords.length > 0 && (
                <div className="article-keywords">
                  {article.keywords.slice(0, 4).map((keyword, index) => (
                    <span key={index} className="keyword-mini">
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ArticlesList;
