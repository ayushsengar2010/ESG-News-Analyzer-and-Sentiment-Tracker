const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

router.get('/', async (req, res) => {
  try {
    const { 
      sentiment, 
      category, 
      limit = 20, 
      skip = 0,
      sortBy = 'analyzedAt',
      order = 'desc'
    } = req.query;

    const query = {};
    if (sentiment) query.sentiment = sentiment;
    if (category) query.category = category;

    const sort = {};
    sort[sortBy] = order === 'desc' ? -1 : 1;

    const articles = await Article
      .find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('-content');

    const total = await Article.countDocuments(query);

    res.json({
      success: true,
      articles,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > (parseInt(skip) + parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      error: 'Failed to fetch articles',
      message: error.message
    });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const totalArticles = await Article.countDocuments();

    const sentimentStats = await Article.aggregate([
      {
        $group: {
          _id: '$sentiment',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Article.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgSentimentScore: { $avg: '$sentimentScore' }
        }
      }
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCount = await Article.countDocuments({
      analyzedAt: { $gte: sevenDaysAgo }
    });

    const avgSentiment = await Article.aggregate([
      {
        $group: {
          _id: null,
          average: { $avg: '$sentimentScore' }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalArticles,
        recentArticles: recentCount,
        averageSentiment: avgSentiment[0]?.average || 0,
        sentimentDistribution: sentimentStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        categoryDistribution: categoryStats.reduce((acc, item) => {
          acc[item._id] = {
            count: item.count,
            avgSentiment: item.avgSentimentScore
          };
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

router.get('/trends', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trends = await Article.aggregate([
      {
        $match: {
          analyzedAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$analyzedAt" } },
            category: "$category"
          },
          count: { $sum: 1 },
          avgSentiment: { $avg: "$sentimentScore" }
        }
      },
      {
        $sort: { "_id.date": 1 }
      }
    ]);

    const formattedTrends = {};
    trends.forEach(item => {
      const date = item._id.date;
      if (!formattedTrends[date]) {
        formattedTrends[date] = {
          date,
          Environmental: { count: 0, sentiment: 0 },
          Social: { count: 0, sentiment: 0 },
          Governance: { count: 0, sentiment: 0 },
          Multiple: { count: 0, sentiment: 0 },
          Other: { count: 0, sentiment: 0 }
        };
      }
      formattedTrends[date][item._id.category] = {
        count: item.count,
        sentiment: item.avgSentiment
      };
    });

    res.json({
      success: true,
      trends: Object.values(formattedTrends)
    });

  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({
      error: 'Failed to fetch trends',
      message: error.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        error: 'Article not found',
        message: 'No article exists with that ID'
      });
    }

    res.json({
      success: true,
      article
    });

  } catch (error) {
    console.error('Error fetching article:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'The provided ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to fetch article',
      message: error.message
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);

    if (!article) {
      return res.status(404).json({
        error: 'Article not found',
        message: 'No article exists with that ID'
      });
    }

    res.json({
      success: true,
      message: 'Article deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({
      error: 'Failed to delete article',
      message: error.message
    });
  }
});

module.exports = router;
