const express = require('express');
const router = express.Router();
const newsService = require('../services/newsService');
const aiService = require('../services/aiService');
const Article = require('../models/Article');

router.get('/companies', (req, res) => {
  try {
    const companies = newsService.getSampleCompanies();
    res.json({
      success: true,
      companies
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get companies',
      message: error.message
    });
  }
});

router.get('/company/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { pageSize = 10, page = 1 } = req.query;

    const result = await newsService.fetchCompanyNews(name, {
      pageSize: parseInt(pageSize),
      page: parseInt(page)
    });

    res.json({
      success: true,
      company: name,
      ...result
    });

  } catch (error) {
    const status = error.message.includes('not configured') ? 503 : 500;
    res.status(status).json({
      error: 'Failed to fetch company news',
      message: error.message
    });
  }
});

router.get('/esg', async (req, res) => {
  try {
    const { pageSize = 10, page = 1, topic = null } = req.query;

    const result = await newsService.fetchESGNews({
      pageSize: parseInt(pageSize),
      page: parseInt(page),
      topic
    });

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    const status = error.message.includes('not configured') ? 503 : 500;
    res.status(status).json({
      error: 'Failed to fetch ESG news',
      message: error.message
    });
  }
});

router.get('/headlines', async (req, res) => {
  try {
    const { country = 'us', category = 'business', pageSize = 10 } = req.query;

    const result = await newsService.fetchTopHeadlines({
      country,
      category,
      pageSize: parseInt(pageSize)
    });

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    const status = error.message.includes('not configured') ? 503 : 500;
    res.status(status).json({
      error: 'Failed to fetch headlines',
      message: error.message
    });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q, pageSize = 10, page = 1, from, to } = req.query;

    if (!q) {
      return res.status(400).json({
        error: 'Missing query',
        message: 'Please provide a search query (q parameter)'
      });
    }

    const result = await newsService.searchNews(q, {
      pageSize: parseInt(pageSize),
      page: parseInt(page),
      from,
      to
    });

    res.json({
      success: true,
      query: q,
      ...result
    });

  } catch (error) {
    const status = error.message.includes('not configured') ? 503 : 500;
    res.status(status).json({
      error: 'Failed to search news',
      message: error.message
    });
  }
});

router.post('/fetch-and-analyze', async (req, res) => {
  try {
    const { company, topic, limit = 5 } = req.body;

    let newsResult;
    
    if (company) {
      newsResult = await newsService.fetchCompanyNews(company, { pageSize: limit });
    } else if (topic) {
      newsResult = await newsService.fetchESGNews({ pageSize: limit, topic });
    } else {
      newsResult = await newsService.fetchESGNews({ pageSize: limit });
    }

    const analyzedArticles = [];
    const errors = [];

    for (const article of newsResult.articles) {
      try {
        if (!article.content || article.content.length < 50) {
          continue;
        }

        const existing = await Article.findOne({ 
          $or: [
            { url: article.url },
            { title: article.title }
          ]
        });

        if (existing) {
          analyzedArticles.push({
            ...existing.toObject(),
            alreadyExists: true
          });
          continue;
        }

        const analysis = await aiService.analyzeArticle(article.title, article.content);

        const savedArticle = new Article({
          title: article.title,
          content: article.content,
          url: article.url,
          sentiment: analysis.sentiment,
          sentimentScore: analysis.sentimentScore,
          category: analysis.category,
          esgScores: analysis.esgScores,
          keywords: analysis.keywords,
          summary: analysis.summary
        });

        await savedArticle.save();
        
        analyzedArticles.push({
          id: savedArticle._id,
          title: savedArticle.title,
          sentiment: savedArticle.sentiment,
          sentimentScore: savedArticle.sentimentScore,
          category: savedArticle.category,
          esgScores: savedArticle.esgScores,
          source: article.source,
          publishedAt: article.publishedAt,
          url: article.url,
          alreadyExists: false
        });

      } catch (analysisError) {
        errors.push({
          title: article.title,
          error: analysisError.message
        });
      }
    }

    res.json({
      success: true,
      message: `Analyzed ${analyzedArticles.length} articles`,
      articles: analyzedArticles,
      errors: errors.length > 0 ? errors : undefined,
      totalFetched: newsResult.articles.length
    });

  } catch (error) {
    const status = error.message.includes('not configured') ? 503 : 500;
    res.status(status).json({
      error: 'Failed to fetch and analyze news',
      message: error.message
    });
  }
});

router.get('/status', (req, res) => {
  const isConfigured = !!process.env.NEWS_API_KEY;
  res.json({
    success: true,
    newsApiConfigured: isConfigured,
    message: isConfigured 
      ? 'News API is configured and ready' 
      : 'News API key not configured. Add NEWS_API_KEY to .env file.'
  });
});

module.exports = router;
