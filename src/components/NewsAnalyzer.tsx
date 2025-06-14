import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Newspaper, RefreshCw, TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  source: string;
  timestamp: string;
  relevance: number;
  url: string;
}

interface NewsAnalyzerProps {
  selectedStock: string;
}

const NewsAnalyzer = ({ selectedStock }: NewsAnalyzerProps) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  // Simple sentiment analysis based on keywords
  const analyzeSentiment = (title: string, summary: string): { sentiment: 'bullish' | 'bearish' | 'neutral', confidence: number } => {
    const text = (title + ' ' + summary).toLowerCase();
    
    const bullishWords = ['earnings beat', 'profit', 'growth', 'up', 'rise', 'gain', 'positive', 'strong', 'beats', 'exceeds', 'partnership', 'investment', 'innovation'];
    const bearishWords = ['loss', 'down', 'fall', 'decline', 'negative', 'weak', 'misses', 'regulatory', 'concern', 'volatility', 'drop'];
    
    let bullishScore = 0;
    let bearishScore = 0;
    
    bullishWords.forEach(word => {
      if (text.includes(word)) bullishScore++;
    });
    
    bearishWords.forEach(word => {
      if (text.includes(word)) bearishScore++;
    });
    
    if (bullishScore > bearishScore) {
      return { sentiment: 'bullish', confidence: Math.min(0.9, 0.6 + (bullishScore - bearishScore) * 0.1) };
    } else if (bearishScore > bullishScore) {
      return { sentiment: 'bearish', confidence: Math.min(0.9, 0.6 + (bearishScore - bullishScore) * 0.1) };
    } else {
      return { sentiment: 'neutral', confidence: 0.5 + Math.random() * 0.2 };
    }
  };

  const fetchYahooFinanceNews = async () => {
    setIsLoading(true);
    console.log(`Fetching Yahoo Finance news for ${selectedStock}`);
    
    try {
      // Using Yahoo Finance RSS feed via RSS2JSON (free service)
      const response = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=https://feeds.finance.yahoo.com/rss/2.0/headline?s=${selectedStock}&region=US&lang=en-US`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      
      const data = await response.json();
      
      if (data.status !== 'ok' || !data.items) {
        throw new Error('Invalid response format');
      }
      
      const newsItems: NewsItem[] = data.items.slice(0, 10).map((item: any, index: number) => {
        const sentimentAnalysis = analyzeSentiment(item.title, item.description || '');
        
        return {
          id: `yahoo-${index}-${Date.now()}`,
          title: item.title,
          summary: item.description ? item.description.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : 'No summary available',
          sentiment: sentimentAnalysis.sentiment,
          confidence: sentimentAnalysis.confidence,
          source: 'Yahoo Finance',
          timestamp: item.pubDate,
          relevance: 0.8 + Math.random() * 0.2, // High relevance since it's stock-specific
          url: item.link
        };
      });
      
      setNews(newsItems);
      setLastUpdated(new Date());
      
      toast({
        title: "News Updated",
        description: `Fetched ${newsItems.length} real articles for ${selectedStock}`,
      });
    } catch (error) {
      console.error("Error fetching Yahoo Finance news:", error);
      
      // Fallback to mock data if API fails
      toast({
        title: "Using Sample Data",
        description: "Yahoo Finance API unavailable, showing sample news",
        variant: "destructive",
      });
      
      // Keep existing mock data as fallback
      const mockNews = generateMockNews();
      setNews(mockNews);
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  // Keep mock data as fallback
  const generateMockNews = (): NewsItem[] => {
    const newsTemplates = [
      {
        title: `${selectedStock} Reports Strong Q4 Earnings, Beats Expectations`,
        summary: "Company demonstrates robust financial performance with revenue growth exceeding analyst predictions.",
        sentiment: 'bullish' as const,
        source: "Financial Times",
        baseUrl: "https://www.ft.com/content/"
      },
      {
        title: `Market Volatility Affects ${selectedStock} Trading Volume`,
        summary: "Recent market fluctuations have led to increased trading activity and price movements.",
        sentiment: 'neutral' as const,
        source: "Reuters",
        baseUrl: "https://www.reuters.com/business/"
      },
      {
        title: `${selectedStock} Announces Strategic Partnership with Tech Giant`,
        summary: "New collaboration expected to drive innovation and expand market reach significantly.",
        sentiment: 'bullish' as const,
        source: "Bloomberg",
        baseUrl: "https://www.bloomberg.com/news/articles/"
      },
      {
        title: `Regulatory Concerns Impact ${selectedStock} Stock Performance`,
        summary: "New industry regulations raise questions about potential compliance costs and operational changes.",
        sentiment: 'bearish' as const,
        source: "Wall Street Journal",
        baseUrl: "https://www.wsj.com/articles/"
      },
      {
        title: `${selectedStock} Invests $2B in AI and Machine Learning Infrastructure`,
        summary: "Major technology investment positions company for future growth in artificial intelligence sector.",
        sentiment: 'bullish' as const,
        source: "TechCrunch",
        baseUrl: "https://techcrunch.com/"
      }
    ];

    return newsTemplates.map((template, index) => ({
      id: `news-${index}-${Date.now()}`,
      title: template.title,
      summary: template.summary,
      sentiment: template.sentiment,
      confidence: Math.random() * 0.3 + 0.7,
      source: template.source,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      relevance: Math.random() * 0.3 + 0.7,
      url: `${template.baseUrl}${selectedStock.toLowerCase()}-${Date.now()}-${index}`
    }));
  };

  const fetchNews = async () => {
    await fetchYahooFinanceNews();
  };

  useEffect(() => {
    fetchNews();
  }, [selectedStock]);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUp className="h-4 w-4 text-bull" />;
      case 'bearish':
        return <TrendingDown className="h-4 w-4 text-bear" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'text-bull border-bull/20 bg-bull/10';
      case 'bearish':
        return 'text-bear border-bear/20 bg-bear/10';
      default:
        return 'text-muted-foreground border-muted/20 bg-muted/10';
    }
  };

  const overallSentiment = news.length > 0 
    ? news.reduce((acc, item) => {
        const weight = item.relevance * item.confidence;
        if (item.sentiment === 'bullish') return acc + weight;
        if (item.sentiment === 'bearish') return acc - weight;
        return acc;
      }, 0) / news.length
    : 0;

  return (
    <Card className="financial-card h-[600px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Newspaper className="h-5 w-5" />
            <span>News Analysis - {selectedStock}</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNews}
            disabled={isLoading}
            className="ml-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        {/* Overall Sentiment */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Overall Sentiment:</span>
            <Badge className={`${
              overallSentiment > 0.1 ? 'bg-bull/20 text-bull border-bull/30' :
              overallSentiment < -0.1 ? 'bg-bear/20 text-bear border-bear/30' :
              'bg-muted/20 text-muted-foreground border-muted/30'
            }`}>
              {overallSentiment > 0.1 ? 'Bullish' : 
               overallSentiment < -0.1 ? 'Bearish' : 'Neutral'}
            </Badge>
          </div>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[450px] pr-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {news.map((item) => (
                <Card key={item.id} className="hover:bg-financial-card/80 transition-colors">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-semibold text-sm leading-tight hover:text-bull transition-colors flex items-start gap-2 group"
                        >
                          <span className="flex-1">{item.title}</span>
                          <ExternalLink className="h-3 w-3 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </a>
                        <div className="flex items-center space-x-2 ml-4">
                          {getSentimentIcon(item.sentiment)}
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getSentimentColor(item.sentiment)}`}
                          >
                            {(item.confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {item.summary}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{item.source}</span>
                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">Relevance:</span>
                        <div className="flex-1 bg-muted rounded-full h-1">
                          <div 
                            className="bg-bull h-1 rounded-full transition-all"
                            style={{ width: `${item.relevance * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {(item.relevance * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default NewsAnalyzer;
