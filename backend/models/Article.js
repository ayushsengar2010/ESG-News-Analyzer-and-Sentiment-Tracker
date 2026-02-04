const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  url: {
    type: String,
    trim: true
  },
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    required: true
  },
  sentimentScore: {
    type: Number,
    min: -1,
    max: 1,
    required: true
  },
  category: {
    type: String,
    enum: ['Environmental', 'Social', 'Governance', 'Multiple', 'Other'],
    required: true
  },
  esgScores: {
    environmental: {
      type: Number,
      default: 0,
      min: 0,
      max: 1
    },
    social: {
      type: Number,
      default: 0,
      min: 0,
      max: 1
    },
    governance: {
      type: Number,
      default: 0,
      min: 0,
      max: 1
    }
  },
  keywords: [{
    type: String,
    trim: true
  }],
  summary: {
    type: String,
    trim: true
  },
  analyzedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

articleSchema.index({ analyzedAt: -1 });
articleSchema.index({ sentiment: 1 });
articleSchema.index({ category: 1 });

articleSchema.virtual('dominantCategory').get(function() {
  const scores = this.esgScores;
  const max = Math.max(scores.environmental, scores.social, scores.governance);
  
  if (max === 0) return 'Other';
  
  if (scores.environmental === max) return 'Environmental';
  if (scores.social === max) return 'Social';
  if (scores.governance === max) return 'Governance';
  
  return 'Multiple';
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
