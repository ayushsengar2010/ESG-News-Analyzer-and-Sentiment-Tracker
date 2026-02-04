import React, { useState } from 'react';
import './App.css';
import AnalyzerForm from './components/AnalyzerForm';
import ResultsDisplay from './components/ResultsDisplay';
import ArticlesList from './components/ArticlesList';
import Dashboard from './components/Dashboard';
import api from './services/api';

function App() {
  const [currentView, setCurrentView] = useState('analyze');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (articleData) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await api.analyzeArticle(articleData);
      setAnalysisResult(result.article);
      setCurrentView('results');
    } catch (err) {
      setError(err.message || 'Failed to analyze article. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewAnalysis = () => {
    setAnalysisResult(null);
    setError(null);
    setCurrentView('analyze');
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>🌍 ESG News Analyzer</h1>
          <p className="subtitle">AI-Powered Sentiment Analysis for ESG News</p>
        </div>
        
        <nav className="nav-tabs">
          <button 
            className={currentView === 'analyze' ? 'active' : ''}
            onClick={() => setCurrentView('analyze')}
          >
            Analyze
          </button>
          <button 
            className={currentView === 'dashboard' ? 'active' : ''}
            onClick={() => setCurrentView('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={currentView === 'history' ? 'active' : ''}
            onClick={() => setCurrentView('history')}
          >
            History
          </button>
        </nav>
      </header>

      <main className="main-content">
        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {currentView === 'analyze' && !analysisResult && (
          <AnalyzerForm 
            onAnalyze={handleAnalyze} 
            isLoading={isAnalyzing}
          />
        )}

        {currentView === 'results' && analysisResult && (
          <ResultsDisplay 
            result={analysisResult}
            onNewAnalysis={handleNewAnalysis}
          />
        )}

        {currentView === 'dashboard' && (
          <Dashboard />
        )}

        {currentView === 'history' && (
          <ArticlesList />
        )}
      </main>
    </div>
  );
}

export default App;
