# ESG News Analyzer & Sentiment Tracker

A web application that aggregates ESG-related news about companies and uses AI to analyze sentiment and categorize issues into Environmental, Social, or Governance categories.

## Problem Statement

Investors, stakeholders, and conscious consumers struggle to stay informed about companies' ESG (Environmental, Social, Governance) performance. ESG-related news is scattered across multiple sources, making it difficult to track trends, understand sentiment, and identify critical issues affecting companies' sustainability practices.

This platform aggregates ESG news for companies, uses AI to analyze sentiment (positive/negative/neutral), automatically categorizes news into E, S, or G categories, and provides insights through visualizations and AI-generated summaries.

## Features

### Core Features
- **Company Search & News Aggregation** - Search for companies and display ESG-related news
- **AI-Powered Sentiment Analysis** - Analyzes each article's sentiment using Hugging Face AI models
- **ESG Auto-Categorization** - Automatically categorizes articles into Environmental, Social, or Governance
- **Trend Dashboard** - Charts showing sentiment trends and category distribution
- **AI Summary Generation** - Generates concise summaries of key ESG issues

### Technical Features
- Real-time news fetching from NewsAPI
- MongoDB database for article storage
- Responsive design for mobile and desktop
- Rate limiting for API protection

## Tech Stack

**Frontend:**
- React 18
- Chart.js for visualizations
- Axios for API calls
- CSS3 with modern styling

**Backend:**
- Node.js with Express
- MongoDB with Mongoose
- Hugging Face Inference API for AI/NLP

**AI Integration:**
- DistilBERT for sentiment analysis
- BART-large-mnli for ESG classification

## Sample Companies

The application includes these companies for testing:
- Tesla (TSLA)
- Apple (AAPL)
- Microsoft (MSFT)
- Amazon (AMZN)
- Google (GOOGL)
- BP (BP)
- Unilever (UL)
- Patagonia
- Nike (NKE)
- Nestlé (NSRGY)
- Walmart (WMT)

## Installation

### Prerequisites
- Node.js v18+
- MongoDB running locally or MongoDB Atlas account
- NewsAPI key (free at newsapi.org)
- Hugging Face API token (free at huggingface.co)

### Setup Steps

1. Clone the repository
```bash
git clone https://github.com/yourusername/esg-news-analyzer.git
cd esg-news-analyzer
```

2. Install dependencies
```bash
npm run install-all
```

3. Configure environment variables

Create a `.env` file in the root directory:
```
MONGODB_URI=mongodb://localhost:27017/esg-news-analyzer
HUGGINGFACE_TOKEN=your_huggingface_token
NEWS_API_KEY=your_newsapi_key
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

4. Start MongoDB (if running locally)
```bash
mongod
```

5. Run the application
```bash
npm run dev
```

The frontend runs on http://localhost:3000 and the backend on http://localhost:5000

## Usage

### Analyze an Article
1. Go to the "Analyze" tab
2. Enter an article title and content
3. Click "Analyze Article"
4. View sentiment score, ESG category, and AI summary

### Fetch News Automatically
1. Go to the "Fetch News" tab
2. Select a company or ESG topic
3. Click "Fetch & Analyze" to automatically fetch and analyze news

### View Dashboard
1. Go to the "Dashboard" tab
2. View sentiment distribution pie chart
3. View ESG category bar chart
4. View trend analysis over time

### View History
1. Go to the "History" tab
2. Filter by sentiment or category
3. View all analyzed articles

## API Endpoints

### Analysis
- `POST /api/analyze` - Analyze a new article

### Articles
- `GET /api/articles` - Get all articles with filtering
- `GET /api/articles/stats` - Get statistics
- `GET /api/articles/trends` - Get trend data
- `GET /api/articles/:id` - Get single article
- `DELETE /api/articles/:id` - Delete article

### News
- `GET /api/news/companies` - Get sample companies
- `GET /api/news/company/:name` - Fetch company news
- `GET /api/news/esg` - Fetch ESG news
- `GET /api/news/headlines` - Fetch headlines
- `POST /api/news/fetch-and-analyze` - Fetch and analyze news

## ESG Categories Explained

**Environmental (E)**
- Climate change and carbon emissions
- Renewable energy initiatives
- Pollution and waste management
- Water conservation

**Social (S)**
- Labor practices and worker rights
- Diversity and inclusion
- Community relations
- Product safety

**Governance (G)**
- Board diversity and independence
- Executive compensation
- Business ethics
- Transparency and disclosure

## Project Structure

```
esg-news-analyzer/
├── backend/
│   ├── models/
│   │   └── Article.js
│   ├── routes/
│   │   ├── analyze.js
│   │   ├── articles.js
│   │   └── news.js
│   ├── services/
│   │   ├── aiService.js
│   │   └── newsService.js
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── AnalyzerForm.js
│       │   ├── ArticlesList.js
│       │   ├── Dashboard.js
│       │   ├── NewsFetcher.js
│       │   └── ResultsDisplay.js
│       ├── services/
│       │   └── api.js
│       ├── App.js
│       └── index.js
├── .env
├── package.json
└── README.md
```

## Screenshots

The application features:
- Modern dark theme UI
- Interactive charts and visualizations
- Responsive mobile-friendly design
- Real-time sentiment indicators

## Future Improvements

- Email alerts for significant ESG events
- Company watchlist feature
- Historical data comparison
- Export functionality
- More advanced trend analysis

## License

MIT License

