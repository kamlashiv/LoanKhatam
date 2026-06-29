import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Newspaper,
  Flame,
  Calendar,
  ExternalLink,
  RefreshCw,
  Share2,
  Check,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Article {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
}

export function NewsPage() {
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Live Stock Market Data State
  const [stockData, setStockData] = useState([
    { symbol: "NIFTY 50", price: "24,120.50", change: "+0.45%", isUp: true },
    { symbol: "SENSEX", price: "79,230.10", change: "+0.52%", isUp: true },
    { symbol: "BANK NIFTY", price: "52,180.40", change: "-0.15%", isUp: false },
    { symbol: "HDFC BANK", price: "1,680.20", change: "+0.80%", isUp: true },
    { symbol: "ICICI BANK", price: "1,180.50", change: "+1.20%", isUp: true },
    { symbol: "SBI", price: "840.40", change: "-0.35%", isUp: false },
    { symbol: "AXIS BANK", price: "1,245.10", change: "+0.65%", isUp: true },
  ]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/news?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (err) {
      console.error("Failed to fetch news:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Update stock prices dynamically to simulate live feeds
  useEffect(() => {
    const interval = setInterval(() => {
      setStockData((prev) =>
        prev.map((stock) => {
          const currentPrice = parseFloat(stock.price.replace(/,/g, ""));
          const deltaPercent = (Math.random() * 0.16 - 0.08); // -0.08% to +0.08%
          const newPrice = currentPrice * (1 + deltaPercent / 100);
          
          const sign = stock.change.startsWith("-") ? -1 : 1;
          const currentChangeVal = parseFloat(stock.change.replace(/[+\-%]/g, ""));
          const newChangeVal = currentChangeVal * sign + deltaPercent;
          const isUp = newChangeVal >= 0;
          
          return {
            ...stock,
            price: newPrice.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
            change: (isUp ? "+" : "") + newChangeVal.toFixed(2) + "%",
            isUp,
          };
        })
      );
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const getArticleVisual = (source: string, title: string) => {
    const cleanTitle = title.toLowerCase();
    let gradient = "from-rose-500 to-orange-500";
    let emoji = "📰";
    
    if (cleanTitle.includes("credit card") || cleanTitle.includes("card")) {
      gradient = "from-cyan-500 to-blue-600";
      emoji = "💳";
    } else if (cleanTitle.includes("rate") || cleanTitle.includes("rbi") || cleanTitle.includes("repo") || cleanTitle.includes("reserve bank")) {
      gradient = "from-indigo-500 to-purple-600";
      emoji = "🏦";
    } else if (cleanTitle.includes("tax") || cleanTitle.includes("gst") || cleanTitle.includes("budget")) {
      gradient = "from-rose-500 to-pink-600";
      emoji = "📊";
    } else if (cleanTitle.includes("sip") || cleanTitle.includes("market") || cleanTitle.includes("mutual fund") || cleanTitle.includes("stock") || cleanTitle.includes("share")) {
      gradient = "from-emerald-500 to-teal-600";
      emoji = "📈";
    } else if (source === "Moneycontrol") {
      gradient = "from-amber-500 to-emerald-600";
      emoji = "💰";
    } else if (source === "Economic Times") {
      gradient = "from-violet-500 to-fuchsia-600";
      emoji = "🏢";
    }
    
    return (
      <div className={`h-36 w-full bg-gradient-to-tr ${gradient} relative flex items-center justify-center overflow-hidden transition-transform duration-500`}>
        <div className="absolute inset-0 bg-white/[0.06] [mask-image:linear-gradient(0deg,white,transparent)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent" />
        <span className="text-6xl drop-shadow-2xl filter transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
          {emoji}
        </span>
      </div>
    );
  };

  const handleShare = async (article: Article) => {
    const text = `🔥 ${article.title}\n\nRead more at:\n${article.link}\n\nShared via LoanKhatam`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(article.link);
      toast({
        title: "Copied to clipboard!",
        description: "Shareable link & snippet copied successfully.",
      });
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter logic (by search query or source)
  const filteredArticles = articles.filter((article) => {
    if (filter === "All") return true;
    if (filter === "Economic Times") return article.source === "Economic Times";
    if (filter === "Moneycontrol") return article.source === "Moneycontrol";
    if (filter === "RBI / Banks") return article.source.includes("RBI") || article.source.includes("SBI") || article.source === "Banking Sector";
    return true;
  });

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-[1300px] mx-auto px-4 py-8 space-y-10">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full px-4 py-1.5 text-sm font-bold">
          <Flame className="h-4 w-4 animate-bounce" />
          Live Finance Updates
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-800 dark:text-slate-100 leading-tight">
          Current <span className="text-rose-500">Financial & Loan News</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
          भारत में पर्सनल लोन, होम लोन, RBI ब्याज दरों और टैक्स से जुड़ी ताज़ा खबरें यहाँ पढ़ें।
        </p>
      </div>

      {/* Live Stock Market Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            Live Market Overview (शेयर बाजार झलक)
          </h2>
          <span className="text-[10px] font-bold text-muted-foreground bg-slate-150 dark:bg-slate-850 px-2 py-0.5 rounded-lg">
            Auto-Updates Live
          </span>
        </div>

        {/* Stock Indices Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stockData.slice(0, 4).map((stock) => (
            <Card
              key={stock.symbol}
              className="p-4 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm relative overflow-hidden group hover:shadow-md transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block truncate">
                    {stock.symbol}
                  </span>
                  <h4 className="text-base font-black text-slate-800 dark:text-slate-100 mt-1 font-mono tracking-tight">
                    {stock.price}
                  </h4>
                </div>
                <span
                  className={cn(
                    "text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-0.5 shrink-0 font-mono",
                    stock.isUp
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  )}
                >
                  {stock.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {stock.change}
                </span>
              </div>
              
              {/* Animated Live Sparkline */}
              <div className="h-7 mt-3 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path
                    d={stock.isUp
                      ? "M0,16 Q20,10 40,14 T80,4 T100,8"
                      : "M0,4 Q20,14 40,8 T80,16 T100,12"
                    }
                    fill="none"
                    stroke={stock.isUp ? "#10b981" : "#f43f5e"}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </Card>
          ))}
        </div>

        {/* Horizontal Scrolling Stock Ticker */}
        <div className="w-full bg-slate-900 text-white py-2.5 rounded-2xl overflow-hidden relative shadow-inner border border-slate-800">
          <div className="flex whitespace-nowrap animate-marquee gap-8 text-[11px] font-bold">
            {[...stockData, ...stockData].map((stock, i) => (
              <span key={i} className="inline-flex items-center gap-2 font-mono">
                <span className="text-slate-400">{stock.symbol}</span>
                <span className="font-extrabold">{stock.price}</span>
                <span className={stock.isUp ? "text-emerald-400" : "text-rose-450"}>
                  {stock.isUp ? "▲" : "▼"} {stock.change}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-3xl border border-slate-200/50 dark:border-slate-800/50">
        <div className="flex flex-wrap gap-2">
          {["All", "Economic Times", "Moneycontrol", "RBI / Banks"].map((item) => (
            <Button
              key={item}
              variant={filter === item ? "default" : "outline"}
              onClick={() => setFilter(item)}
              className="rounded-2xl font-bold text-xs h-9"
            >
              {item}
            </Button>
          ))}
        </div>
        <Button
          onClick={fetchNews}
          disabled={loading}
          variant="ghost"
          className="rounded-2xl font-bold text-xs gap-2 h-9 text-slate-600 dark:text-slate-400 hover:bg-slate-150"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Feed
        </Button>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse border border-slate-200 dark:border-slate-800 rounded-3xl h-64 bg-slate-100/50 dark:bg-slate-900/50" />
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <Newspaper className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-700" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-350">No News Available</h3>
          <p className="text-sm text-slate-450">चयनित फिल्टर के लिए फिलहाल कोई खबर उपलब्ध नहीं है।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article, idx) => (
            <Card
              key={idx}
              className="flex flex-col justify-between hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800 rounded-[2rem] bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm group overflow-hidden"
            >
              {getArticleVisual(article.source, article.title)}
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-3">
                  <Badge
                    variant="outline"
                    className="font-bold text-[10px] uppercase border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400 rounded-lg px-2.5 py-0.5"
                  >
                    {article.source}
                  </Badge>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                    <Calendar className="h-3 w-3" />
                    {formatDate(article.pubDate)}
                  </span>
                </div>
                <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug group-hover:text-rose-500 transition-colors">
                  {article.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col justify-between pt-0">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {article.description || "Click read full article to read complete details about this financial news update."}
                </p>
                <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                  <Button
                    onClick={() => handleShare(article)}
                    variant="outline"
                    className="flex-1 rounded-xl font-bold text-xs h-10 gap-1.5 border-slate-200 dark:border-slate-800"
                  >
                    {copiedLink === article.link ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Share2 className="h-3.5 w-3.5" />
                        Share
                      </>
                    )}
                  </Button>
                  <Button
                    asChild
                    className="flex-1 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 font-bold text-xs h-10 gap-1.5"
                  >
                    <a href={article.link} target="_blank" rel="noopener noreferrer">
                      Read Full
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Copyright & Fair Use Disclaimer */}
      <div className="rounded-3xl border border-slate-200/50 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/40 p-6 text-center max-w-3xl mx-auto space-y-2">
        <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Fair Use & News Aggregator Disclaimer (कॉपीराइट अस्वीकरण)
        </p>
        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
          Loan Khatam aggregates financial headlines and short summaries from public RSS feeds for informational and educational purposes. We do not host full articles. All copyrights, trademarks, logos, and content belong entirely to their respective original publishers (Economic Times, Moneycontrol, etc.). We redirect readers directly to the official websites of the publishers for full articles.
        </p>
      </div>
    </div>
  );
}
