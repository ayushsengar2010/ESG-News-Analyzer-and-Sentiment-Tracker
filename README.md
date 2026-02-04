# ESG News Analyzer and Sentiment Tracker

A full-stack web application that analyzes ESG (Environmental, Social, Governance) news articles using NLP-powered sentiment analysis and categorization.

## Features

- Analyze news articles for ESG relevance and sentiment
- AI-powered sentiment detection (positive, negative, neutral)
- Automatic categorization into Environmental, Social, or Governance
- Historical tracking of analyzed articles in MongoDB
- Interactive dashboard with charts and statistics
- Filter and search through analysis history

## Tech Stack

### Frontend
- React 18 with JavaScript
- Axios for API communication
- Chart.js for data visualization
- Responsive CSS3 styling

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- NLP-based sentiment analysis
- RESTful API architecture

## Prerequisites

1. Node.js (version 14 or higher)
2. MongoDB (local installation or MongoDB Atlas)

## Installation

1. Install backend dependencies:
   ```
   npm install
   ```

2. Install frontend dependencies:
   ```
   cd frontend
   npm install
   cd ..
   ```

3. Configure environment:
   - Copy `.env.example` to `.env`
   - Update MongoDB URI if using Atlas

4. Start MongoDB on your system

5. Run the application:
   ```
   npm run dev
   ```

6. Open http://localhost:3000 in your browser


## Usage

1. Enter an article title and content in the analyzer form
2. Click "Analyze Article" to process the content
3. View sentiment analysis results and ESG scores
4. Check the Dashboard for trends and statistics
5. Browse History to see all analyzed articles

