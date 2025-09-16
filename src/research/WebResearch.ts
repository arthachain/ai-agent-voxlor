import axios from 'axios';
import * as cheerio from 'cheerio';

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  content?: string;
  relevance: number;
}

export interface ScrapedContent {
  title: string;
  content: string;
  images: string[];
  links: string[];
  metadata: {
    description?: string;
    keywords?: string[];
    author?: string;
    publishedDate?: string;
  };
}

export class WebResearch {
  private searchApiKey?: string;
  private searchEngineId?: string;

  constructor(searchApiKey?: string, searchEngineId?: string) {
    this.searchApiKey = searchApiKey;
    this.searchEngineId = searchEngineId;
  }

  async searchWeb(query: string, numResults: number = 10): Promise<WebSearchResult[]> {
    console.log(`🔍 Web Research: Searching for "${query}"...`);
    
    try {
      // Use Google Custom Search API if available
      if (this.searchApiKey && this.searchEngineId) {
        return await this.googleSearch(query, numResults);
      } else {
        // Fallback to mock search for development
        return await this.mockSearch(query, numResults);
      }
    } catch (error) {
      console.error('Web search error:', error);
      return await this.mockSearch(query, numResults);
    }
  }

  private async googleSearch(query: string, numResults: number): Promise<WebSearchResult[]> {
    const searchUrl = 'https://www.googleapis.com/customsearch/v1';
    const params = {
      key: this.searchApiKey,
      cx: this.searchEngineId,
      q: query,
      num: Math.min(numResults, 10) // Google API limit
    };

    const response = await axios.get(searchUrl, { params });
    const items = response.data.items || [];

    return items.map((item: any) => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet,
      relevance: 0.8 // Default relevance score
    }));
  }

  private async mockSearch(query: string, numResults: number): Promise<WebSearchResult[]> {
    // Real DuckDuckGo search implementation
    try {
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const results: WebSearchResult[] = [];
      
      // Extract search results from DuckDuckGo
      $('.result').each((index, element) => {
        if (index >= numResults) return false;
        
        const $result = $(element);
        const title = $result.find('.result__title a').text().trim();
        const url = $result.find('.result__title a').attr('href');
        const snippet = $result.find('.result__snippet').text().trim();
        
        if (title && url && snippet) {
          results.push({
            title,
            url: url.startsWith('//') ? 'https:' + url : url,
            snippet,
            relevance: this.calculateRelevance(snippet, query)
          });
        }
      });

      // If no results from DuckDuckGo, try alternative search engines
      if (results.length === 0) {
        return await this.alternativeSearch(query, numResults);
      }

      return results;
    } catch (error) {
      console.error('DuckDuckGo search failed:', error);
      return await this.alternativeSearch(query, numResults);
    }
  }

  private calculateRelevance(content: string, query: string): number {
    const contentLower = content.toLowerCase();
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(' ').filter(word => word.length > 2);
    
    let score = 0;
    queryWords.forEach(word => {
      const matches = (contentLower.match(new RegExp(word, 'g')) || []).length;
      score += matches * 0.1;
    });
    
    return Math.min(score, 1.0);
  }

  private async alternativeSearch(query: string, numResults: number): Promise<WebSearchResult[]> {
    try {
      // Try Bing search as alternative
      const bingUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
      const response = await axios.get(bingUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const results: WebSearchResult[] = [];
      
      $('.b_algo').each((index, element) => {
        if (index >= numResults) return false;
        
        const $result = $(element);
        const title = $result.find('h2 a').text().trim();
        const url = $result.find('h2 a').attr('href');
        const snippet = $result.find('.b_caption p').text().trim();
        
        if (title && url && snippet) {
          results.push({
            title,
            url,
            snippet,
            relevance: this.calculateRelevance(snippet, query)
          });
        }
      });

      return results;
    } catch (error) {
      console.error('Alternative search failed:', error);
      // Fallback to mock data
      return this.getFallbackResults(query, numResults);
    }
  }

  private getFallbackResults(query: string, numResults: number): WebSearchResult[] {
    return [
      {
        title: `Search Result 1 for "${query}"`,
        url: 'https://example.com/result1',
        snippet: `This is a fallback search result for "${query}". It contains relevant information about the topic.`,
        relevance: 0.9
      },
      {
        title: `Search Result 2 for "${query}"`,
        url: 'https://example.com/result2',
        snippet: `Another fallback search result for "${query}". This provides additional context and examples.`,
        relevance: 0.8
      },
      {
        title: `Search Result 3 for "${query}"`,
        url: 'https://example.com/result3',
        snippet: `Third fallback search result for "${query}". This shows best practices and implementation details.`,
        relevance: 0.7
      }
    ].slice(0, numResults);
  }

  async scrapeContent(url: string): Promise<ScrapedContent> {
    console.log(`📄 Web Research: Scraping content from ${url}...`);
    
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      
      // Extract title
      const title = $('title').text().trim() || 
                   $('h1').first().text().trim() || 
                   'Untitled';

      // Extract main content
      const content = this.extractMainContent($);
      
      // Extract images
      const images: string[] = [];
      $('img').each((_, img) => {
        const src = $(img).attr('src');
        if (src) {
          images.push(this.resolveUrl(url, src));
        }
      });

      // Extract links
      const links: string[] = [];
      $('a[href]').each((_, link) => {
        const href = $(link).attr('href');
        if (href) {
          links.push(this.resolveUrl(url, href));
        }
      });

      // Extract metadata
      const metadata = {
        description: $('meta[name="description"]').attr('content') || 
                    $('meta[property="og:description"]').attr('content'),
        keywords: $('meta[name="keywords"]').attr('content')?.split(',').map(k => k.trim()),
        author: $('meta[name="author"]').attr('content') || 
                $('meta[property="article:author"]').attr('content'),
        publishedDate: $('meta[property="article:published_time"]').attr('content') ||
                      $('time[datetime]').attr('datetime')
      };

      return {
        title,
        content,
        images,
        links,
        metadata
      };
    } catch (error) {
      console.error('Content scraping error:', error);
      return {
        title: 'Error',
        content: `Failed to scrape content from ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        images: [],
        links: [],
        metadata: {}
      };
    }
  }

  private extractMainContent($: cheerio.CheerioAPI): string {
    // Try to find the main content area
    const selectors = [
      'main',
      'article',
      '[role="main"]',
      '.content',
      '.main-content',
      '.post-content',
      '.entry-content'
    ];

    for (const selector of selectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        return element.text().trim();
      }
    }

    // Fallback to body content
    return $('body').text().trim();
  }

  private resolveUrl(baseUrl: string, relativeUrl: string): string {
    try {
      return new URL(relativeUrl, baseUrl).href;
    } catch {
      return relativeUrl;
    }
  }

  async researchApp(prompt: string): Promise<{
    similarApps: WebSearchResult[];
    bestPractices: WebSearchResult[];
    codeExamples: WebSearchResult[];
    tutorials: WebSearchResult[];
  }> {
    console.log(`🔍 Web Research: Researching app "${prompt}"...`);
    
    const searchQueries = [
      `${prompt} app examples`,
      `${prompt} best practices`,
      `${prompt} code examples`,
      `${prompt} tutorial guide`
    ];

    const [similarApps, bestPractices, codeExamples, tutorials] = await Promise.all(
      searchQueries.map(query => this.searchWeb(query, 5))
    );

    return {
      similarApps,
      bestPractices,
      codeExamples,
      tutorials
    };
  }

  async findCodePatterns(query: string): Promise<{
    githubRepos: WebSearchResult[];
    codeSnippets: WebSearchResult[];
    documentation: WebSearchResult[];
  }> {
    console.log(`💻 Web Research: Finding code patterns for "${query}"...`);
    
    const searchQueries = [
      `"${query}" site:github.com`,
      `"${query}" code example`,
      `"${query}" documentation`
    ];

    const [githubRepos, codeSnippets, documentation] = await Promise.all(
      searchQueries.map(searchQuery => this.searchWeb(searchQuery, 5))
    );

    return {
      githubRepos,
      codeSnippets,
      documentation
    };
  }

  async findUIPatterns(query: string): Promise<{
    designInspiration: WebSearchResult[];
    uiComponents: WebSearchResult[];
    designSystems: WebSearchResult[];
  }> {
    console.log(`🎨 Web Research: Finding UI patterns for "${query}"...`);
    
    const searchQueries = [
      `"${query}" UI design inspiration`,
      `"${query}" UI components`,
      `"${query}" design system`
    ];

    const [designInspiration, uiComponents, designSystems] = await Promise.all(
      searchQueries.map(searchQuery => this.searchWeb(searchQuery, 5))
    );

    return {
      designInspiration,
      uiComponents,
      designSystems
    };
  }

  async analyzeCompetitors(appDescription: string): Promise<{
    competitors: WebSearchResult[];
    features: string[];
    techStack: string[];
    pricing: string[];
  }> {
    console.log(`🏢 Web Research: Analyzing competitors for "${appDescription}"...`);
    
    const competitorResults = await this.searchWeb(`"${appDescription}" competitors alternatives`, 10);
    
    // Analyze competitor websites
    const competitorAnalysis = await Promise.all(
      competitorResults.slice(0, 3).map(async (result) => {
        try {
          const content = await this.scrapeContent(result.url);
          return {
            url: result.url,
            title: result.title,
            content: content.content,
            features: this.extractFeatures(content.content),
            techStack: this.extractTechStack(content.content)
          };
        } catch (error) {
          console.error(`Error analyzing competitor ${result.url}:`, error);
          return null;
        }
      })
    );

    const validAnalysis = competitorAnalysis.filter(Boolean);
    
    return {
      competitors: competitorResults,
      features: this.aggregateFeatures(validAnalysis),
      techStack: this.aggregateTechStack(validAnalysis),
      pricing: ['Free', 'Freemium', 'Paid'] // Mock pricing data
    };
  }

  private extractFeatures(content: string): string[] {
    // Simple feature extraction based on common patterns
    const featurePatterns = [
      /user authentication/i,
      /real-time/i,
      /mobile responsive/i,
      /dashboard/i,
      /analytics/i,
      /notifications/i,
      /search/i,
      /filters/i,
      /export/i,
      /import/i
    ];

    const features: string[] = [];
    featurePatterns.forEach(pattern => {
      if (pattern.test(content)) {
        features.push(pattern.source.replace(/[\/i]/g, ''));
      }
    });

    return features;
  }

  private extractTechStack(content: string): string[] {
    // Extract technology mentions
    const techPatterns = [
      /react/i,
      /vue/i,
      /angular/i,
      /node\.js/i,
      /python/i,
      /typescript/i,
      /javascript/i,
      /postgresql/i,
      /mongodb/i,
      /aws/i,
      /vercel/i,
      /netlify/i
    ];

    const techStack: string[] = [];
    techPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        techStack.push(pattern.source.replace(/[\/i]/g, ''));
      }
    });

    return techStack;
  }

  private aggregateFeatures(analysis: any[]): string[] {
    const allFeatures = analysis.flatMap(item => item.features);
    const uniqueFeatures = [...new Set(allFeatures)];
    return uniqueFeatures.slice(0, 10); // Top 10 features
  }

  private aggregateTechStack(analysis: any[]): string[] {
    const allTech = analysis.flatMap(item => item.techStack);
    const uniqueTech = [...new Set(allTech)];
    return uniqueTech.slice(0, 10); // Top 10 technologies
  }
}
