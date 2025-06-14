import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, LogOut, User } from "lucide-react";
import NewsAnalyzer from "@/components/NewsAnalyzer";
import StockPrediction from "@/components/StockPrediction";
import TradingChart from "@/components/TradingChart";
import TradingSignals from "@/components/TradingSignals";
import LoginComponent from "@/components/LoginComponent";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";

const DashboardContent = () => {
  const [selectedStock, setSelectedStock] = useState("AAPL");
  const [stockInput, setStockInput] = useState("");
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const popularStocks = [
    { symbol: "AAPL", name: "Apple Inc.", price: 185.23, change: 2.34 },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: 142.87, change: -1.23 },
    { symbol: "MSFT", name: "Microsoft Corp.", price: 378.91, change: 5.67 },
    { symbol: "TSLA", name: "Tesla Inc.", price: 248.42, change: -8.91 },
    { symbol: "NVDA", name: "NVIDIA Corp.", price: 891.34, change: 15.67 },
  ];

  const handleStockSearch = () => {
    if (stockInput.trim()) {
      setSelectedStock(stockInput.toUpperCase());
      setStockInput("");
      toast({
        title: "Stock Selected",
        description: `Now analyzing ${stockInput.toUpperCase()}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-financial-gradient p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with User Info */}
        <div className="flex justify-between items-center">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <Activity className="h-8 w-8 text-bull animate-pulse-glow" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-bull to-bull-light bg-clip-text text-transparent">
                FinanceAI Agent
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              AI-Powered Financial News Analysis & Stock Trading Signals Platform
            </p>
          </div>
          
          {/* User Profile */}
          <Card className="financial-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                {user?.picture ? (
                  <img 
                    src={user.picture} 
                    alt={user.name} 
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-bull/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-bull" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={logout}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stock Search */}
        <Card className="financial-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Stock Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 mb-6">
              <Input
                placeholder="Enter stock symbol (e.g., AAPL, GOOGL)"
                value={stockInput}
                onChange={(e) => setStockInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleStockSearch()}
                className="flex-1"
              />
              <Button onClick={handleStockSearch} className="bg-bull hover:bg-bull-dark">
                Analyze
              </Button>
            </div>

            {/* Popular Stocks */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Popular Stocks</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {popularStocks.map((stock) => (
                  <Card
                    key={stock.symbol}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      selectedStock === stock.symbol 
                        ? 'ring-2 ring-bull glow-bull' 
                        : 'hover:bg-financial-card/80'
                    }`}
                    onClick={() => setSelectedStock(stock.symbol)}
                  >
                    <CardContent className="p-4">
                      <div className="text-center space-y-2">
                        <Badge variant="outline" className="font-mono">
                          {stock.symbol}
                        </Badge>
                        <div className="text-xs text-muted-foreground truncate">
                          {stock.name}
                        </div>
                        <div className="text-lg font-bold">
                          ${stock.price}
                        </div>
                        <div className={`text-sm flex items-center justify-center space-x-1 ${
                          stock.change >= 0 ? 'text-bull' : 'text-bear'
                        }`}>
                          {stock.change >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          <span>{stock.change >= 0 ? '+' : ''}{stock.change}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trading Signals */}
          <div>
            <TradingSignals selectedStock={selectedStock} />
          </div>

          {/* News Analysis */}
          <div>
            <NewsAnalyzer selectedStock={selectedStock} />
          </div>

          {/* Stock Prediction */}
          <div>
            <StockPrediction selectedStock={selectedStock} />
          </div>
        </div>

        {/* Trading Chart */}
        <TradingChart selectedStock={selectedStock} />
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
};

const AuthenticatedApp = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-financial-gradient flex items-center justify-center">
        <div className="text-center space-y-4">
          <Activity className="h-12 w-12 text-bull animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginComponent />;
  }

  return <DashboardContent />;
};

export default Index;
