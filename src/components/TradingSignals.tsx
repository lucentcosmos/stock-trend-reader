
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Target, TrendingUp, TrendingDown, RefreshCw, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  strength: number;
  description: string;
}

interface TradingSignal {
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  riskReward: number;
  timeframe: string;
  reasoning: string[];
}

interface SignalData {
  currentPrice: number;
  signal: TradingSignal;
  indicators: TechnicalIndicator[];
  marketSentiment: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface TradingSignalsProps {
  selectedStock: string;
}

const TradingSignals = ({ selectedStock }: TradingSignalsProps) => {
  const [signalData, setSignalData] = useState<SignalData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  // Technical indicator calculations (simplified for demo)
  const calculateTechnicalIndicators = (price: number): TechnicalIndicator[] => {
    const indicators: TechnicalIndicator[] = [];
    
    // RSI (Relative Strength Index)
    const rsi = Math.random() * 100;
    indicators.push({
      name: 'RSI (14)',
      value: rsi,
      signal: rsi < 30 ? 'BUY' : rsi > 70 ? 'SELL' : 'HOLD',
      strength: Math.abs(rsi - 50) / 50 * 100,
      description: 'Momentum oscillator measuring speed and magnitude of price changes'
    });

    // MACD
    const macd = (Math.random() - 0.5) * 5;
    indicators.push({
      name: 'MACD',
      value: macd,
      signal: macd > 0 ? 'BUY' : macd < -1 ? 'SELL' : 'HOLD',
      strength: Math.abs(macd) * 20,
      description: 'Trend-following momentum indicator'
    });

    // Moving Average Convergence
    const ma20 = price * (0.95 + Math.random() * 0.1);
    const ma50 = price * (0.92 + Math.random() * 0.16);
    indicators.push({
      name: 'MA Cross',
      value: ((ma20 - ma50) / ma50) * 100,
      signal: ma20 > ma50 ? 'BUY' : 'SELL',
      strength: Math.abs((ma20 - ma50) / ma50) * 500,
      description: '20-day vs 50-day moving average crossover'
    });

    // Bollinger Bands
    const upperBand = price * 1.02;
    const lowerBand = price * 0.98;
    const bbPosition = ((price - lowerBand) / (upperBand - lowerBand)) * 100;
    indicators.push({
      name: 'Bollinger Bands',
      value: bbPosition,
      signal: bbPosition < 20 ? 'BUY' : bbPosition > 80 ? 'SELL' : 'HOLD',
      strength: Math.abs(bbPosition - 50) * 2,
      description: 'Volatility indicator using standard deviations'
    });

    // Volume Analysis
    const volumeStrength = Math.random() * 100;
    indicators.push({
      name: 'Volume',
      value: volumeStrength,
      signal: volumeStrength > 70 ? 'BUY' : volumeStrength < 30 ? 'SELL' : 'HOLD',
      strength: volumeStrength,
      description: 'Trading volume momentum analysis'
    });

    return indicators;
  };

  const generateTradingSignal = (price: number, indicators: TechnicalIndicator[], sentiment: number): TradingSignal => {
    // Calculate overall signal strength
    const buySignals = indicators.filter(ind => ind.signal === 'BUY').length;
    const sellSignals = indicators.filter(ind => ind.signal === 'SELL').length;
    const holdSignals = indicators.filter(ind => ind.signal === 'HOLD').length;
    
    // Weight by indicator strength
    const buyStrength = indicators
      .filter(ind => ind.signal === 'BUY')
      .reduce((sum, ind) => sum + ind.strength, 0);
    const sellStrength = indicators
      .filter(ind => ind.signal === 'SELL')
      .reduce((sum, ind) => sum + ind.strength, 0);

    // Include sentiment in decision
    const sentimentWeight = sentiment * 20;
    const totalBuyStrength = buyStrength + (sentiment > 0 ? sentimentWeight : 0);
    const totalSellStrength = sellStrength + (sentiment < 0 ? Math.abs(sentimentWeight) : 0);

    let action: 'BUY' | 'SELL' | 'HOLD';
    let confidence: number;
    let reasoning: string[] = [];

    if (totalBuyStrength > totalSellStrength && buySignals >= 2) {
      action = 'BUY';
      confidence = Math.min(95, (totalBuyStrength / (totalBuyStrength + totalSellStrength)) * 100);
      reasoning.push(`${buySignals} technical indicators suggest buying`);
      if (sentiment > 0.1) reasoning.push('Positive market sentiment supports the buy signal');
    } else if (totalSellStrength > totalBuyStrength && sellSignals >= 2) {
      action = 'SELL';
      confidence = Math.min(95, (totalSellStrength / (totalBuyStrength + totalSellStrength)) * 100);
      reasoning.push(`${sellSignals} technical indicators suggest selling`);
      if (sentiment < -0.1) reasoning.push('Negative market sentiment supports the sell signal');
    } else {
      action = 'HOLD';
      confidence = 50 + Math.random() * 20;
      reasoning.push('Mixed signals suggest waiting for clearer direction');
      if (holdSignals > 0) reasoning.push(`${holdSignals} indicators are neutral`);
    }

    // Calculate entry, target, and stop loss prices
    const volatility = 0.02 + Math.random() * 0.03; // 2-5% volatility
    let entryPrice = price;
    let targetPrice = price;
    let stopLoss = price;

    if (action === 'BUY') {
      entryPrice = price * (1 - 0.005); // Enter slightly below current price
      targetPrice = price * (1 + volatility * 2); // 2x volatility upside
      stopLoss = price * (1 - volatility); // 1x volatility downside
      reasoning.push(`Target: ${((targetPrice - entryPrice) / entryPrice * 100).toFixed(1)}% upside potential`);
    } else if (action === 'SELL') {
      entryPrice = price * (1 + 0.005); // Enter slightly above current price
      targetPrice = price * (1 - volatility * 2); // 2x volatility downside
      stopLoss = price * (1 + volatility); // 1x volatility upside
      reasoning.push(`Target: ${((entryPrice - targetPrice) / entryPrice * 100).toFixed(1)}% downside potential`);
    }

    const riskReward = Math.abs((targetPrice - entryPrice) / (entryPrice - stopLoss));

    return {
      action,
      confidence,
      entryPrice,
      targetPrice,
      stopLoss,
      riskReward,
      timeframe: '1-3 days',
      reasoning
    };
  };

  const generateSignalData = (): SignalData => {
    const currentPrice = 100 + Math.random() * 400; // $100-500
    const marketSentiment = (Math.random() - 0.5) * 2; // -1 to 1
    const indicators = calculateTechnicalIndicators(currentPrice);
    const signal = generateTradingSignal(currentPrice, indicators, marketSentiment);
    
    // Determine risk level
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    if (signal.confidence > 80) riskLevel = 'LOW';
    else if (signal.confidence > 60) riskLevel = 'MEDIUM';
    else riskLevel = 'HIGH';

    return {
      currentPrice,
      signal,
      indicators,
      marketSentiment,
      riskLevel
    };
  };

  const fetchSignals = async () => {
    setIsLoading(true);
    console.log(`Generating trading signals for ${selectedStock}`);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newSignalData = generateSignalData();
      setSignalData(newSignalData);
      setLastUpdated(new Date());
      
      toast({
        title: "Signals Updated",
        description: `Generated new trading signals for ${selectedStock}`,
      });
    } catch (error) {
      console.error("Error generating signals:", error);
      toast({
        title: "Error",
        description: "Failed to generate trading signals",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
  }, [selectedStock]);

  const getSignalIcon = (action: string) => {
    switch (action) {
      case 'BUY':
        return <TrendingUp className="h-5 w-5 text-bull" />;
      case 'SELL':
        return <TrendingDown className="h-5 w-5 text-bear" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getSignalColor = (action: string) => {
    switch (action) {
      case 'BUY':
        return 'bg-bull/20 text-bull border-bull/30';
      case 'SELL':
        return 'bg-bear/20 text-bear border-bear/30';
      default:
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return 'text-bull';
      case 'MEDIUM':
        return 'text-yellow-500';
      default:
        return 'text-bear';
    }
  };

  if (isLoading) {
    return (
      <Card className="financial-card h-[600px]">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Trading Signals</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <Target className="h-12 w-12 mx-auto text-bull animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse"></div>
              <div className="h-3 bg-muted rounded w-2/3 mx-auto animate-pulse"></div>
            </div>
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2 animate-pulse">
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-2 bg-muted rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!signalData) return null;

  return (
    <Card className="financial-card h-[600px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Trading Signals - {selectedStock}</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSignals}
            disabled={isLoading}
            className="ml-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        {lastUpdated && (
          <span className="text-xs text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[450px] pr-4">
          <div className="space-y-6">
            {/* Main Signal */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-3">
                {getSignalIcon(signalData.signal.action)}
                <Badge className={`text-xl px-6 py-3 ${getSignalColor(signalData.signal.action)}`}>
                  {signalData.signal.action}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Current Price</span>
                  <div className="text-lg font-bold">${signalData.currentPrice.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Confidence</span>
                  <div className="text-lg font-bold">{signalData.signal.confidence.toFixed(1)}%</div>
                </div>
              </div>
              
              <Progress value={signalData.signal.confidence} className="h-3" />
            </div>

            <Separator />

            {/* Trading Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Trading Plan</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entry Price:</span>
                  <span className="font-medium">${signalData.signal.entryPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target Price:</span>
                  <span className="font-medium text-bull">${signalData.signal.targetPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stop Loss:</span>
                  <span className="font-medium text-bear">${signalData.signal.stopLoss.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Risk/Reward:</span>
                  <Badge variant="outline">{signalData.signal.riskReward.toFixed(1)}:1</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timeframe:</span>
                  <span className="font-medium">{signalData.signal.timeframe}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Risk Level:</span>
                  <Badge className={getRiskColor(signalData.riskLevel)}>{signalData.riskLevel}</Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Technical Indicators */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Technical Analysis</h3>
              <div className="space-y-3">
                {signalData.indicators.map((indicator, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{indicator.name}</span>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getSignalColor(indicator.signal)}`}
                        >
                          {indicator.signal}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {indicator.value.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <Progress value={Math.min(100, indicator.strength)} className="h-2" />
                    <p className="text-xs text-muted-foreground">{indicator.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Reasoning */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Signal Reasoning</h3>
              <div className="space-y-2">
                {signalData.signal.reasoning.map((reason, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-bull mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Disclaimer */}
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p className="font-medium">⚠️ Trading Disclaimer</p>
              <p>
                These signals are for educational purposes only. 
                Always do your own research and never risk more than you can afford to lose.
              </p>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TradingSignals;
