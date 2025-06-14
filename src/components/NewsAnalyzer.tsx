
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Newspaper, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";
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
}

interface NewsAnalyzerProps {
  selectedStock: string;
}

const NewsAnalyzer = ({ selectedStock }: NewsAnalyzerProps) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  // Simulated news data generator
  const generateMockNews = (): NewsItem[] => {
    const newsTemplates = [
      {
        title: `${selectedStock} Reports Strong Q4 Earnings, Beats Expectations`,
        summary: "Company demonstrates robust financial performance with revenue growth exceeding analyst predictions.",
        sentiment: 'bullish' as const,
        source: "Financial Times"
      },
      {
        title: `Market Volatility Affects ${selectedStock} Trading Volume`,
        summary: "Recent market fluctuations have led to increased trading activity and price movements.",
        sentiment: 'neutral' as const,
        source: "Reuters"
      },
      {
        title: `${selectedStock} Announces Strategic Partnership with Tech Giant`,
        summary: "New collaboration expected to drive innovation and expand market reach significantly.",
        sentiment: 'bullish' as const,
        source: "Bloomberg"
      },
      {
        title: `Regulatory Concerns Impact ${selectedStock} Stock Performance`,
        summary: "New industry regulations raise questions about potential compliance costs and operational changes.",
        sentiment: 'bearish' as const,
        source: "Wall Street Journal"
      },
      {
        title: `${selectedStock} Invests $2B in AI and Machine Learning Infrastructure`,
        summary: "Major technology investment positions company for future growth in artificial intelligence sector.",
        sentiment: 'bullish' as const,
        source: "TechCrunch"
      }
    ];

    return newsTemplates.map((template, index) => ({
      id: `news-${index}-${Date.now()}`,
      title: template.title,
      summary: template.summary,
      sentiment: template.sentiment,
      confidence: Math.random() * 0.3 + 0.7, // 70-100%
      source: template.source,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      relevance: Math.random() * 0.3 + 0.7 // 70-100%
    }));
  };

  const fetchNews = async () => {
    setIsLoading(true);
    console.log(`Fetching news for ${selectedStock}`);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockNews = generateMockNews();
      setNews(mockNews);
      setLastUpdated(new Date());
      
      toast({
        title: "News Updated",
        description: `Fetched ${mockNews.length} articles for ${selectedStock}`,
      });
    } catch (error) {
      console.error("Error fetching news:", error);
      toast({
        title: "Error",
        description: "Failed to fetch news. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
                        <h3 className="font-semibold text-sm leading-tight">
                          {item.title}
                        </h3>
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
