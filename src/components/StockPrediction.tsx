
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Target, TrendingUp, TrendingDown, Zap, DollarSign } from "lucide-react";

interface PredictionData {
  currentPrice: number;
  predictedPrice: number;
  confidence: number;
  priceChange: number;
  priceChangePercent: number;
  timeframe: string;
  factors: {
    name: string;
    impact: number;
    description: string;
  }[];
}

interface StockPredictionProps {
  selectedStock: string;
}

const StockPrediction = ({ selectedStock }: StockPredictionProps) => {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generatePrediction = (): PredictionData => {
    const basePrice = Math.random() * 500 + 100; // $100-600
    const priceChange = (Math.random() - 0.5) * 50; // -25 to +25
    const predictedPrice = basePrice + priceChange;
    const priceChangePercent = (priceChange / basePrice) * 100;

    const allFactors = [
      {
        name: "News Sentiment",
        impact: Math.random() * 40 + 10,
        description: "Overall sentiment from recent news articles"
      },
      {
        name: "Technical Analysis",
        impact: Math.random() * 30 + 15,
        description: "Chart patterns and technical indicators"
      },
      {
        name: "Market Volatility",
        impact: Math.random() * 25 + 5,
        description: "Current market conditions and VIX levels"
      },
      {
        name: "Sector Performance",
        impact: Math.random() * 20 + 10,
        description: "Performance of related industry sectors"
      },
      {
        name: "Volume Analysis",
        impact: Math.random() * 15 + 5,
        description: "Trading volume patterns and liquidity"
      },
      {
        name: "Options Flow",
        impact: Math.random() * 35 + 5,
        description: "Institutional options activity and sentiment"
      }
    ];

    // Select top 4 factors
    const factors = allFactors
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 4);

    return {
      currentPrice: basePrice,
      predictedPrice,
      priceChange,
      priceChangePercent,
      confidence: Math.random() * 30 + 60, // 60-90%
      timeframe: "24 hours",
      factors
    };
  };

  const fetchPrediction = async () => {
    setIsLoading(true);
    console.log(`Generating prediction for ${selectedStock}`);
    
    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newPrediction = generatePrediction();
      setPrediction(newPrediction);
    } catch (error) {
      console.error("Error generating prediction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, [selectedStock]);

  if (isLoading) {
    return (
      <Card className="financial-card h-[600px]">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>AI Prediction</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <Zap className="h-12 w-12 mx-auto text-bull animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse"></div>
              <div className="h-3 bg-muted rounded w-2/3 mx-auto animate-pulse"></div>
            </div>
          </div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2 animate-pulse">
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-2 bg-muted rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!prediction) return null;

  const isPositive = prediction.priceChange >= 0;

  return (
    <Card className="financial-card h-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <span>AI Prediction - {selectedStock}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current vs Predicted Price */}
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Current Price</span>
            <div className="text-2xl font-bold flex items-center justify-center space-x-2">
              <DollarSign className="h-6 w-6" />
              <span>{prediction.currentPrice.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            {isPositive ? (
              <TrendingUp className="h-8 w-8 text-bull" />
            ) : (
              <TrendingDown className="h-8 w-8 text-bear" />
            )}
          </div>
          
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Predicted Price ({prediction.timeframe})</span>
            <div className={`text-3xl font-bold flex items-center justify-center space-x-2 ${
              isPositive ? 'text-bull' : 'text-bear'
            }`}>
              <DollarSign className="h-8 w-8" />
              <span>{prediction.predictedPrice.toFixed(2)}</span>
            </div>
          </div>
          
          <Badge className={`text-lg px-4 py-2 ${
            isPositive 
              ? 'bg-bull/20 text-bull border-bull/30' 
              : 'bg-bear/20 text-bear border-bear/30'
          }`}>
            {isPositive ? '+' : ''}{prediction.priceChange.toFixed(2)} 
            ({isPositive ? '+' : ''}{prediction.priceChangePercent.toFixed(1)}%)
          </Badge>
        </div>

        <Separator />

        {/* Confidence Score */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Confidence Score</span>
            <span className="text-sm text-muted-foreground">
              {prediction.confidence.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={prediction.confidence} 
            className="h-3"
          />
          <p className="text-xs text-muted-foreground">
            Based on news sentiment, technical analysis, and market conditions
          </p>
        </div>

        <Separator />

        {/* Key Factors */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Key Prediction Factors</h3>
          <div className="space-y-3">
            {prediction.factors.map((factor, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{factor.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {factor.impact.toFixed(1)}% impact
                  </Badge>
                </div>
                <Progress 
                  value={factor.impact} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {factor.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Disclaimer */}
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p className="font-medium">⚠️ Investment Disclaimer</p>
          <p>
            This prediction is for educational purposes only. 
            Always conduct your own research before making investment decisions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockPrediction;
