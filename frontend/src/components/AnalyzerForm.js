import React, { useState } from 'react';
import './AnalyzerForm.css';

function AnalyzerForm({ onAnalyze, isLoading }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    url: ''
  });

  const [errors, setErrors] = useState({});

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
      title: 'Major Tech Company Announces Carbon Neutral Initiative',
      content: 'In a significant move towards environmental sustainability, TechCorp announced today its ambitious plan to achieve carbon neutrality by 2030. The company will invest $5 billion in renewable energy projects and sustainable infrastructure. CEO Jane Smith stated, "We recognize our responsibility to the planet and future generations. This initiative will reduce our carbon footprint by 75% within the next five years." The announcement was well-received by environmental groups, though some critics argue more immediate action is needed. The company also pledged to make its supply chain more sustainable and increase transparency in environmental reporting.',
      url: 'https://example.com/tech-carbon-neutral'
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
          Load Sample Article
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
                'Analyze Article'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AnalyzerForm;
