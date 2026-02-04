import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import './Dashboard.css';
import api from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsResponse, trendsResponse] = await Promise.all([
        api.getStats(),
        api.getTrends().catch(() => ({ trends: [] }))
      ]);
      setStats(statsResponse.stats);
      setTrends(trendsResponse.trends || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner-large"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-state">
          <p>⚠️ {error}</p>
          <button onClick={fetchData} className="retry-btn">Try Again</button>
        </div>
      </div>
    );
  }

  if (!stats || stats.totalArticles === 0) {
    return (
      <div className="dashboard-container">
        <div className="empty-state">
          <h3>📊 No Data Available</h3>
          <p>Analyze some articles to see statistics and trends</p>
        </div>
      </div>
    );
  }

  const sentimentData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        label: 'Articles',
        data: [
          stats.sentimentDistribution.positive || 0,
          stats.sentimentDistribution.neutral || 0,
          stats.sentimentDistribution.negative || 0
        ],
        backgroundColor: [
          'rgba(72, 187, 120, 0.85)',
          'rgba(237, 137, 54, 0.85)',
          'rgba(245, 101, 101, 0.85)'
        ],
        borderColor: [
          '#48bb78',
          '#ed8936',
          '#f56565'
        ],
        borderWidth: 2
      }
    ]
  };

  const categoryLabels = Object.keys(stats.categoryDistribution);
  const categoryData = {
    labels: categoryLabels,
    datasets: [
      {
        label: 'Articles by Category',
        data: categoryLabels.map(cat => stats.categoryDistribution[cat].count),
        backgroundColor: [
          'rgba(56, 178, 172, 0.85)',
          'rgba(159, 122, 234, 0.85)',
          'rgba(246, 173, 85, 0.85)',
          'rgba(66, 153, 225, 0.85)',
          'rgba(160, 174, 192, 0.85)'
        ],
        borderColor: [
          '#38b2ac',
          '#9f7aea',
          '#f6ad55',
          '#4299e1',
          '#a0aec0'
        ],
        borderWidth: 2
      }
    ]
  };

  const trendData = trends.length > 0 ? {
    labels: trends.map(t => t.date),
    datasets: [
      {
        label: 'Environmental',
        data: trends.map(t => t.Environmental?.count || 0),
        borderColor: '#38b2ac',
        backgroundColor: 'rgba(56, 178, 172, 0.2)',
        tension: 0.3
      },
      {
        label: 'Social',
        data: trends.map(t => t.Social?.count || 0),
        borderColor: '#9f7aea',
        backgroundColor: 'rgba(159, 122, 234, 0.2)',
        tension: 0.3
      },
      {
        label: 'Governance',
        data: trends.map(t => t.Governance?.count || 0),
        borderColor: '#f6ad55',
        backgroundColor: 'rgba(246, 173, 85, 0.2)',
        tension: 0.3
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          color: '#c0c0c0',
          font: { size: 12 }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#888' },
        grid: { color: 'rgba(255,255,255,0.05)' }
      },
      y: {
        ticks: { color: '#888' },
        grid: { color: 'rgba(255,255,255,0.05)' }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          color: '#c0c0c0',
          font: { size: 12 }
        }
      }
    }
  };

  const getSentimentIcon = () => {
    const avg = stats.averageSentiment;
    if (avg > 0.2) return '😊';
    if (avg < -0.2) return '😞';
    return '😐';
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>📊 Analytics Dashboard</h2>
        <button onClick={fetchData} className="refresh-btn">🔄 Refresh</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📰</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalArticles}</div>
            <div className="stat-label">Total Articles</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🕒</div>
          <div className="stat-content">
            <div className="stat-value">{stats.recentArticles}</div>
            <div className="stat-label">Last 7 Days</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">{getSentimentIcon()}</div>
          <div className="stat-content">
            <div className="stat-value">{stats.averageSentiment.toFixed(2)}</div>
            <div className="stat-label">Avg Sentiment</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <div className="stat-value">
              {categoryLabels.length > 0 ? categoryLabels[0] : 'N/A'}
            </div>
            <div className="stat-label">Top Category</div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Sentiment Distribution</h3>
          <div className="chart-wrapper">
            <Pie data={sentimentData} options={pieOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3>ESG Category Distribution</h3>
          <div className="chart-wrapper">
            <Bar data={categoryData} options={chartOptions} />
          </div>
        </div>
      </div>

      {trendData && trends.length > 0 && (
        <div className="chart-card full-width">
          <h3>📈 ESG Trends Over Time</h3>
          <div className="chart-wrapper-large">
            <Line data={trendData} options={chartOptions} />
          </div>
        </div>
      )}

      <div className="category-breakdown">
        <h3>Category Details</h3>
        <div className="category-grid">
          {categoryLabels.map((category) => (
            <div key={category} className="category-item">
              <div className="category-header">
                <span className="category-name">{category}</span>
                <span className="category-count">
                  {stats.categoryDistribution[category].count} articles
                </span>
              </div>
              <div className="category-sentiment">
                <span>Avg Sentiment:</span>
                <span className={`sentiment-value ${
                  stats.categoryDistribution[category].avgSentiment > 0 
                    ? 'positive' 
                    : stats.categoryDistribution[category].avgSentiment < 0 
                      ? 'negative' 
                      : 'neutral'
                }`}>
                  {stats.categoryDistribution[category].avgSentiment.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
