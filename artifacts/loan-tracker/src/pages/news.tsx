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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/news");
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
    </div>
  );
}
