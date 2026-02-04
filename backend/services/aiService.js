const axios = require('axios');

class AIService {
  constructor() {
    this.apiToken = process.env.HUGGINGFACE_TOKEN;
    this.baseURL = 'https://api-inference.huggingface.co/models';
    
    this.positiveWords = [
      'good', 'great', 'excellent', 'positive', 'growth', 'improve', 'success',
      'achieve', 'benefit', 'gain', 'profit', 'innovation', 'progress', 'advance',
      'sustainable', 'efficient', 'reduce', 'save', 'clean', 'green', 'renewable',
      'commitment', 'initiative', 'leadership', 'responsibility', 'transparency',
      'diversity', 'inclusion', 'community', 'investment', 'opportunity', 'award',
      'recognition', 'milestone', 'breakthrough', 'partnership', 'collaboration'
    ];
    
    this.negativeWords = [
      'bad', 'poor', 'negative', 'decline', 'loss', 'fail', 'failure', 'risk',
      'concern', 'problem', 'issue', 'challenge', 'violation', 'scandal', 'lawsuit',
      'pollution', 'emission', 'waste', 'damage', 'harm', 'controversy', 'criticism',
      'fine', 'penalty', 'breach', 'misconduct', 'fraud', 'corruption', 'layoff',
      'downturn', 'recession', 'crisis', 'disaster', 'accident', 'spill', 'leak'
    ];
    
    this.esgKeywords = {
      environmental: [
        'climate', 'carbon', 'emissions', 'renewable', 'sustainability', 'green',
        'environmental', 'pollution', 'energy', 'waste', 'recycling', 'solar',
        'wind', 'biodiversity', 'conservation', 'eco', 'footprint', 'neutral',
        'water', 'air', 'forest', 'deforestation', 'plastic', 'electric', 'clean'
      ],
      social: [
        'social', 'diversity', 'equality', 'labor', 'human rights', 'community',
        'employee', 'workplace', 'safety', 'health', 'inclusion', 'equity',
        'workers', 'training', 'education', 'welfare', 'fair', 'discrimination',
        'harassment', 'supply chain', 'stakeholder', 'philanthropy', 'volunteer'
      ],
      governance: [
        'governance', 'ethics', 'compliance', 'transparency', 'board', 'leadership',
        'accountability', 'audit', 'regulation', 'policy', 'executive', 'shareholder',
        'voting', 'compensation', 'disclosure', 'oversight', 'independent', 'risk',
        'management', 'integrity', 'corporate', 'fiduciary', 'stewardship'
      ]
    };
  }

  async analyzeArticle(title, content) {
    try {
      const fullText = `${title}. ${content}`;
      const truncatedText = fullText.substring(0, 512);

      let sentimentResult;
      let esgResult;
      
      try {
        [sentimentResult, esgResult] = await Promise.all([
          this.analyzeSentimentAPI(truncatedText),
          this.classifyESGAPI(truncatedText)
        ]);
      } catch (apiError) {
        console.log('API unavailable, using local analysis');
        sentimentResult = this.analyzeSentimentLocal(fullText);
        esgResult = this.classifyESGLocal(fullText);
      }

      const keywords = this.extractKeywords(fullText);
      const summary = this.generateSummary(fullText);

      return {
        sentiment: sentimentResult.sentiment,
        sentimentScore: sentimentResult.score,
        esgScores: esgResult.scores,
        category: esgResult.category,
        keywords: keywords,
        summary: summary
      };
      
    } catch (error) {
      console.error('AI Analysis Error:', error);
      throw new Error('Failed to analyze article. Please try again.');
    }
  }

  analyzeSentimentLocal(text) {
    const words = text.toLowerCase().split(/\W+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (this.positiveWords.includes(word)) positiveCount++;
      if (this.negativeWords.includes(word)) negativeCount++;
    });
    
    const total = positiveCount + negativeCount;
    if (total === 0) {
      return { sentiment: 'neutral', score: 0 };
    }
    
    const rawScore = (positiveCount - negativeCount) / total;
    const score = Math.max(-1, Math.min(1, rawScore));
    
    let sentiment = 'neutral';
    if (score > 0.15) sentiment = 'positive';
    else if (score < -0.15) sentiment = 'negative';
    
    return { sentiment, score };
  }

  classifyESGLocal(text) {
    const words = text.toLowerCase();
    
    let envCount = 0;
    let socCount = 0;
    let govCount = 0;
    
    this.esgKeywords.environmental.forEach(keyword => {
      const matches = (words.match(new RegExp(keyword, 'gi')) || []).length;
      envCount += matches;
    });
    
    this.esgKeywords.social.forEach(keyword => {
      const matches = (words.match(new RegExp(keyword, 'gi')) || []).length;
      socCount += matches;
    });
    
    this.esgKeywords.governance.forEach(keyword => {
      const matches = (words.match(new RegExp(keyword, 'gi')) || []).length;
      govCount += matches;
    });
    
    const total = envCount + socCount + govCount || 1;
    
    const environmental = envCount / total;
    const social = socCount / total;
    const governance = govCount / total;
    
    const maxScore = Math.max(environmental, social, governance);
    let category = 'Other';
    
    if (maxScore > 0.4) {
      if (environmental === maxScore) category = 'Environmental';
      else if (social === maxScore) category = 'Social';
      else if (governance === maxScore) category = 'Governance';
    }
    
    const relevantScores = [environmental, social, governance].filter(s => s > 0.25);
    if (relevantScores.length > 1 && maxScore < 0.6) {
      category = 'Multiple';
    }
    
    return {
      scores: { environmental, social, governance },
      category
    };
  }

  async analyzeSentimentAPI(text) {
    try {
      const response = await axios.post(
        `${this.baseURL}/distilbert-base-uncased-finetuned-sst-2-english`,
        { inputs: text },
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      if (response.data && response.data[0]) {
        const result = response.data[0];
        const topResult = Array.isArray(result) ? result[0] : result;
        const label = (topResult.label || '').toLowerCase();
        
        let sentiment = 'neutral';
        let score = 0;

        if (label === 'positive') {
          sentiment = 'positive';
          score = topResult.score || 0.5;
        } else if (label === 'negative') {
          sentiment = 'negative';
          score = -(topResult.score || 0.5);
        }

        return { sentiment, score };
      }
      
      throw new Error('Invalid API response');
      
    } catch (error) {
      throw error;
    }
  }

  async classifyESGAPI(text) {
    try {
      const labels = [
        'environmental sustainability climate carbon emissions',
        'social responsibility human rights labor diversity',
        'corporate governance ethics compliance transparency'
      ];

      const response = await axios.post(
        `${this.baseURL}/facebook/bart-large-mnli`,
        {
          inputs: text,
          parameters: { candidate_labels: labels }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      if (response.data && response.data.scores) {
        const result = response.data;
        
        const environmental = result.scores[0] || 0;
        const social = result.scores[1] || 0;
        const governance = result.scores[2] || 0;

        const maxScore = Math.max(environmental, social, governance);
        let category = 'Other';

        if (maxScore > 0.4) {
          if (environmental === maxScore) category = 'Environmental';
          else if (social === maxScore) category = 'Social';
          else if (governance === maxScore) category = 'Governance';
        }

        const relevantScores = [environmental, social, governance].filter(s => s > 0.35);
        if (relevantScores.length > 1) {
          category = 'Multiple';
        }

        return {
          scores: { environmental, social, governance },
          category
        };
      }
      
      throw new Error('Invalid API response');
      
    } catch (error) {
      throw error;
    }
  }

  extractKeywords(text) {
    const allEsgTerms = [
      ...this.esgKeywords.environmental,
      ...this.esgKeywords.social,
      ...this.esgKeywords.governance,
      'esg', 'sustainable', 'responsibility', 'stakeholder'
    ];

    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    const keywords = Object.entries(wordFreq)
      .filter(([word]) => {
        return allEsgTerms.includes(word) || wordFreq[word] > 2;
      })
      .sort((a, b) => {
        const aIsESG = allEsgTerms.includes(a[0]) ? 1 : 0;
        const bIsESG = allEsgTerms.includes(b[0]) ? 1 : 0;
        if (aIsESG !== bIsESG) return bIsESG - aIsESG;
        return b[1] - a[1];
      })
      .slice(0, 7)
      .map(([word]) => word);

    return keywords.length > 0 ? keywords : ['esg', 'news', 'analysis'];
  }

  generateSummary(text) {
    const sentences = text
      .replace(/([.!?])\s+/g, '$1|')
      .split('|')
      .filter(s => s.trim().length > 20);

    let summary = '';
    for (let i = 0; i < Math.min(3, sentences.length); i++) {
      if ((summary + sentences[i]).length > 250) break;
      summary += sentences[i].trim() + ' ';
    }

    return summary.trim() || 'No summary available.';
  }

  normalizeSentiment(sentiment) {
    const normalized = (sentiment || 'neutral').toLowerCase();
    return ['positive', 'negative', 'neutral'].includes(normalized) ? normalized : 'neutral';
  }

  normalizeCategory(category) {
    const validCategories = ['Environmental', 'Social', 'Governance', 'Multiple', 'Other'];
    return validCategories.includes(category) ? category : 'Other';
  }

  clampNumber(value, min, max) {
    const num = parseFloat(value) || 0;
    return Math.max(min, Math.min(max, num));
  }
}

module.exports = new AIService();
