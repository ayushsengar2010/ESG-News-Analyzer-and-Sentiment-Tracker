import React from 'react';
import './ResultsDisplay.css';

function ResultsDisplay({ result, onNewAnalysis }) {
  const getSentimentColor = (sentiment) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return '#48bb78';
      case 'negative':
        return '#f56565';
      default:
        return '#ed8936';
    }
  };

  const getSentimentEmoji = (sentiment) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return '😊';
      case 'negative':
        return '😞';
      default:
        return '😐';
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

  const formatScore = (score) => {
    return (score * 100).toFixed(1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="results-container">
      <div className="results-card">
        <div className="results-header">
          <h2>Analysis Results</h2>
          <button onClick={onNewAnalysis} className="new-analysis-btn">
            + New Analysis
          </button>
        </div>

        <div className="article-info">
          <h3>{result.title}</h3>
          <p className="analyzed-time">
            Analyzed on {formatDate(result.analyzedAt)}
          </p>
        </div>

        <div className="results-grid">
          <div className="result-section sentiment-section">
            <h4>Sentiment Analysis</h4>
            <div 
              className="sentiment-badge"
              style={{ 
                backgroundColor: getSentimentColor(result.sentiment),
                color: 'white'
              }}
            >
              <span className="sentiment-emoji">{getSentimentEmoji(result.sentiment)}</span>
              <span className="sentiment-label">{result.sentiment.toUpperCase()}</span>
            </div>
            
            <div className="sentiment-score">
              <div className="score-label">Sentiment Score</div>
              <div className="score-value">{result.sentimentScore.toFixed(2)}</div>
              <div className="score-range">(-1.0 to +1.0)</div>
            </div>

            <div className="score-bar">
              <div 
                className="score-fill"
                style={{
                  width: `${((result.sentimentScore + 1) / 2) * 100}%`,
                  backgroundColor: getSentimentColor(result.sentiment)
                }}
              ></div>
            </div>
          </div>

          <div className="result-section category-section">
            <h4>ESG Classification</h4>
            <div 
              className="category-badge"
              style={{ 
                backgroundColor: getCategoryColor(result.category),
                color: 'white'
              }}
            >
              {result.category}
            </div>

            <div className="esg-scores">
              <div className="esg-score-item">
                <div className="esg-label">
                  <span className="esg-icon">🌱</span>
                  Environmental
                </div>
                <div className="esg-bar">
                  <div 
                    className="esg-fill environmental"
                    style={{ width: `${formatScore(result.esgScores.environmental)}%` }}
                  ></div>
                </div>
                <div className="esg-value">{formatScore(result.esgScores.environmental)}%</div>
              </div>

              <div className="esg-score-item">
                <div className="esg-label">
                  <span className="esg-icon">👥</span>
                  Social
                </div>
                <div className="esg-bar">
                  <div 
                    className="esg-fill social"
                    style={{ width: `${formatScore(result.esgScores.social)}%` }}
                  ></div>
                </div>
                <div className="esg-value">{formatScore(result.esgScores.social)}%</div>
              </div>

              <div className="esg-score-item">
                <div className="esg-label">
                  <span className="esg-icon">⚖️</span>
                  Governance
                </div>
                <div className="esg-bar">
                  <div 
                    className="esg-fill governance"
                    style={{ width: `${formatScore(result.esgScores.governance)}%` }}
                  ></div>
                </div>
                <div className="esg-value">{formatScore(result.esgScores.governance)}%</div>
              </div>
            </div>
          </div>
        </div>

        {result.summary && (
          <div className="result-section summary-section">
            <h4>Summary</h4>
            <p>{result.summary}</p>
          </div>
        )}

        {result.keywords && result.keywords.length > 0 && (
          <div className="result-section keywords-section">
            <h4>Key Topics</h4>
            <div className="keywords-list">
              {result.keywords.map((keyword, index) => (
                <span key={index} className="keyword-tag">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultsDisplay;
