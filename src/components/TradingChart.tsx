
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface ChartData {
  time: string;
  price: number;
  volume: number;
  sentiment: number;
}

interface TradingChartProps {
  selectedStock: string;
}

const TradingChart = ({ selectedStock }: TradingChartProps) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M'>('1D');
  const [isLoading, setIsLoading] = useState(false);

  const generateChartData = (timeframe: string): ChartData[] => {
    const dataPoints = timeframe === '1D' ? 24 : timeframe === '1W' ? 7 : 30;
    const basePrice = Math.random() * 500 + 100;
    
    const data: ChartData[] = [];
    let currentPrice = basePrice;
    
    for (let i = 0; i < dataPoints; i++) {
      const priceChange = (Math.random() - 0.5) * 10;
      currentPrice += priceChange;
      
      const timeLabel = timeframe === '1D' 
        ? `${i}:00`
        : timeframe === '1W'
        ? `Day ${i + 1}`
        : `Day ${i + 1}`;
      
      data.push({
        time: timeLabel,
        price: Math.max(currentPrice, 10), // Ensure positive price
        volume: Math.random() * 1000000 + 500000,
        sentiment: (Math.random() - 0.5) * 2 // -1 to 1
      });
    }
    
    return data;
  };

  const fetchChartData = async () => {
    setIsLoading(true);
    console.log(`Fetching chart data for ${selectedStock} - ${timeframe}`);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newData = generateChartData(timeframe);
      setChartData(newData);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [selectedStock, timeframe]);

  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].price : 0;
  const previousPrice = chartData.length > 1 ? chartData[chartData.length - 2].price : currentPrice;
  const priceChange = currentPrice - previousPrice;
  const isPositive = priceChange >= 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-financial-card border border-financial-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{`Time: ${label}`}</p>
          <p className="text-sm text-bull">
            {`Price: $${data.price.toFixed(2)}`}
          </p>
          <p className="text-xs text-muted-foreground">
            {`Volume: ${(data.volume / 1000000).toFixed(1)}M`}
          </p>
          <p className="text-xs">
            Sentiment: 
            <span className={data.sentiment > 0 ? 'text-bull' : 'text-bear'}>
              {data.sentiment > 0 ? ' Bullish' : ' Bearish'}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="financial-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Price Chart - {selectedStock}</span>
          </CardTitle>
          
          <div className="flex items-center space-x-4">
            {/* Current Price */}
            <div className="text-right">
              <div className="text-lg font-bold flex items-center space-x-1">
                <DollarSign className="h-4 w-4" />
                <span>{currentPrice.toFixed(2)}</span>
              </div>
              <div className={`text-sm flex items-center space-x-1 ${
                isPositive ? 'text-bull' : 'text-bear'
              }`}>
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{isPositive ? '+' : ''}{priceChange.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Timeframe Buttons */}
            <div className="flex space-x-1">
              {(['1D', '1W', '1M'] as const).map((tf) => (
                <Button
                  key={tf}
                  variant={timeframe === tf ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe(tf)}
                  className={timeframe === tf ? "bg-bull hover:bg-bull-dark" : ""}
                >
                  {tf}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center space-y-4">
              <BarChart3 className="h-12 w-12 mx-auto text-bull animate-pulse" />
              <p className="text-muted-foreground">Loading chart data...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Price Chart */}
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00D4AA" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2F45" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => `$${value.toFixed(0)}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#00D4AA"
                    strokeWidth={2}
                    fill="url(#priceGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* Volume Chart */}
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6B7280" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#6B7280" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2F45" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${(value / 1000000).toFixed(1)}M`, 'Volume']}
                    labelFormatter={(label) => `Time: ${label}`}
                    contentStyle={{
                      backgroundColor: '#1A1F35',
                      border: '1px solid #2A2F45',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="#6B7280"
                    strokeWidth={1}
                    fill="url(#volumeGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* Chart Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">High</div>
                <div className="text-lg font-bold text-bull">
                  ${Math.max(...chartData.map(d => d.price)).toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Low</div>
                <div className="text-lg font-bold text-bear">
                  ${Math.min(...chartData.map(d => d.price)).toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Avg Volume</div>
                <div className="text-lg font-bold">
                  {(chartData.reduce((acc, d) => acc + d.volume, 0) / chartData.length / 1000000).toFixed(1)}M
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Volatility</div>
                <Badge variant="outline" className="text-sm">
                  {(Math.max(...chartData.map(d => d.price)) - Math.min(...chartData.map(d => d.price))).toFixed(1)}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TradingChart;
