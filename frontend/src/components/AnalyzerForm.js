import React, { useState, useEffect } from 'react';
import './AnalyzerForm.css';

function AnalyzerForm({ onAnalyze, isLoading, prefillData }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    url: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (prefillData) {
      setFormData({
        title: prefillData.title || '',
        content: prefillData.content || '',
        url: prefillData.url || ''
      });
      setErrors({});
    }
  }, [prefillData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 50) {
      newErrors.content = 'Content must be at least 50 characters for accurate analysis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onAnalyze(formData);
    }
  };

  const handleClear = () => {
    setFormData({
      title: '',
      content: '',
      url: ''
    });
    setErrors({});
  };

  const loadSampleArticle = () => {
    setFormData({
      title: 'Tesla Announces Major Sustainability Initiative for 2024',
      content: 'Tesla Inc. announced today its ambitious plan to achieve carbon neutrality across all manufacturing facilities by the end of 2024. The electric vehicle maker will invest $3.5 billion in renewable energy infrastructure including solar panels and battery storage systems at its Gigafactories worldwide. CEO Elon Musk stated that the company is committed to leading the automotive industry in environmental responsibility. The initiative includes partnerships with local communities for workforce diversity programs and enhanced worker safety protocols. Industry analysts praised the move as a significant step forward for corporate sustainability, though some environmental groups called for faster action on supply chain emissions.',
      url: 'https://example.com/tesla-sustainability-2024'
    });
    setErrors({});
  };

  return (
    <div className="analyzer-form-container">
      <div className="form-card">
        <h2>Analyze ESG News Article</h2>
        <p className="form-description">
          Enter a news article to analyze its ESG sentiment and categorization
        </p>

        <button 
          type="button" 
          onClick={loadSampleArticle}
          className="sample-btn"
          disabled={isLoading}
        >
          📝 Load Sample Article
        </button>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Article Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter article title..."
              className={errors.title ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="url">Article URL (optional)</label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://example.com/article"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Article Content *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Paste the article content here..."
              rows="10"
              className={errors.content ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.content && <span className="error-message">{errors.content}</span>}
            <span className="char-count">
              {formData.content.length} characters
            </span>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleClear}
              className="btn-secondary"
              disabled={isLoading}
            >
              Clear
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Analyzing...
                </>
              ) : (
                '🔍 Analyze Article'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AnalyzerForm;
