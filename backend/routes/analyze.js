const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const aiService = require('../services/aiService');

router.post('/', async (req, res) => {
  try {
    const { title, content, url } = req.body;

    if (!title || !content) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Both title and content are required' 
      });
    }

    if (title.length < 5) {
      return res.status(400).json({ 
        error: 'Title too short',
        message: 'Title must be at least 5 characters' 
      });
    }

    if (content.length < 50) {
      return res.status(400).json({ 
        error: 'Content too short',
        message: 'Content must be at least 50 characters for accurate analysis' 
      });
    }

    console.log(`Analyzing article: ${title.substring(0, 50)}...`);
    const analysis = await aiService.analyzeArticle(title, content);

    const article = new Article({
      title,
      content,
      url: url || '',
      sentiment: analysis.sentiment,
      sentimentScore: analysis.sentimentScore,
      category: analysis.category,
      esgScores: analysis.esgScores,
      keywords: analysis.keywords,
      summary: analysis.summary
    });

    await article.save();
    console.log(`Article saved with ID: ${article._id}`);

    res.status(201).json({
      success: true,
      article: {
        id: article._id,
        title: article.title,
        sentiment: article.sentiment,
        sentimentScore: article.sentimentScore,
        category: article.category,
        esgScores: article.esgScores,
        keywords: article.keywords,
        summary: article.summary,
        analyzedAt: article.analyzedAt
      }
    });

  } catch (error) {
    console.error('Analysis error:', error);
    
    if (error.message.includes('API key')) {
      return res.status(500).json({
        error: 'Configuration Error',
        message: 'AI service not properly configured. Please contact administrator.'
      });
    }

    res.status(500).json({
      error: 'Analysis Failed',
      message: error.message || 'Unable to analyze article at this time'
    });
  }
});

module.exports = router;
