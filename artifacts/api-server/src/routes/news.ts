import { Router } from "express";

const newsRouter = Router();

function cleanText(str: string): string {
  if (!str) return "";
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function getCategoryAndPriority(title: string, description: string): { category: string; priority: number } {
  const text = (title + " " + description).toLowerCase();
  
  let category = "Market & Economy";
  let priority = 1;

  if (
    text.includes("repo rate") || 
    text.includes("repo") ||
    text.includes("rbi") || 
    text.includes("interest rate") || 
    text.includes("lending rate") ||
    text.includes("mclr") ||
    text.includes("emi") ||
    text.includes("loan")
  ) {
    category = "Loans & Interest Rates";
    if (text.includes("repo rate") || text.includes("rbi") || text.includes("interest rate") || text.includes("emi")) {
      priority = 5;
    } else {
      priority = 4;
    }
  }
  else if (
    text.includes("tax") || 
    text.includes("gst") || 
    text.includes("80c") ||
    text.includes("saving") ||
    text.includes("deposit") ||
    text.includes("fixed deposit") ||
    text.includes("sip") ||
    text.includes("mutual fund") ||
    text.includes("gold") ||
    text.includes("epf") ||
    text.includes("pf")
  ) {
    category = "Savings & Tax";
    if (text.includes("tax") || text.includes("gst") || text.includes("fixed deposit")) {
      priority = 4;
    } else {
      priority = 3;
    }
  }
  else if (
    text.includes("bank") || 
    text.includes("sbi") || 
    text.includes("hdfc") || 
    text.includes("icici") || 
    text.includes("axis") || 
    text.includes("payment") || 
    text.includes("upi") ||
    text.includes("wallet") ||
    text.includes("card")
  ) {
    category = "Banking & Cards";
    if (text.includes("upi") || text.includes("payment") || text.includes("sbi") || text.includes("hdfc")) {
      priority = 3;
    } else {
      priority = 2;
    }
  }
  else if (
    text.includes("stock") ||
    text.includes("share") ||
    text.includes("nifty") ||
    text.includes("sensex") ||
    text.includes("market") ||
    text.includes("inflation") ||
    text.includes("gdp")
  ) {
    category = "Market & Economy";
    priority = 2;
  }

  return { category, priority };
}

const fallbackArticles = [
  {
    title: "RBI Keeps Repo Rate Stable: What This Means for Your Home & Personal Loan EMIs",
    link: "https://www.rbi.org.in",
    pubDate: new Date().toUTCString(),
    description: "The Reserve Bank of India has maintained the repo rate, meaning interest rates on personal and home loans will remain stable in the upcoming months.",
    source: "RBI Updates",
    category: "Loans & Interest Rates",
    priority: 5
  },
  {
    title: "SBI Interest Rates Update: SBI Announces Revised Interest Rates for Personal and Gold Loans",
    link: "https://sbi.co.in",
    pubDate: new Date().toUTCString(),
    description: "State Bank of India (SBI) has updated its lending rates. Check out the latest MCLR and interest rates for personal loans and collateral-free lending.",
    source: "SBI News",
    category: "Loans & Interest Rates",
    priority: 4
  },
  {
    title: "Income Tax India: Simple Strategies to Manage Debt and Save Tax Under Section 80C & Section 24",
    link: "https://www.incometax.gov.in",
    pubDate: new Date().toUTCString(),
    description: "Understanding tax deductions on loans in India. Learn how paying interest on home loans can save tax under Section 24 and Section 80C of the IT Act.",
    source: "Income Tax Dept",
    category: "Savings & Tax",
    priority: 4
  }
];

newsRouter.get("/", async (req, res) => {
  try {
    const urls = [
      {
        url: "https://economictimes.indiatimes.com/industry/banking/finance/banking/rssfeeds/13358259.cms",
        source: "Banking Sector"
      },
      {
        url: "https://economictimes.indiatimes.com/wealth/personal-finance/rssfeeds/8375551.cms",
        source: "Economic Times"
      },
      {
        url: "https://www.moneycontrol.com/rss/personalfinance.xml",
        source: "Moneycontrol"
      }
    ];

    const allArticles: any[] = [];

    for (const feed of urls) {
      try {
        const response = await fetch(feed.url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        });
        if (!response.ok) continue;
        const xml = await response.text();

        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;
        while ((match = itemRegex.exec(xml)) !== null) {
          const itemContent = match[1];
          const titleRaw = itemContent.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "";
          const linkRaw = itemContent.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "";
          const pubDateRaw = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || "";
          const descriptionRaw = itemContent.match(/<description>([\s\S]*?)<\/description>/)?.[1] || "";

          const title = cleanText(titleRaw);
          const link = linkRaw.trim();
          const pubDate = pubDateRaw.trim();
          const description = cleanText(descriptionRaw);

          if (title && link) {
            const { category, priority } = getCategoryAndPriority(title, description);
            allArticles.push({
              title,
              link,
              pubDate,
              description: description.slice(0, 180) + (description.length > 180 ? "..." : ""),
              source: feed.source,
              category,
              priority
            });
          }
        }
      } catch (err) {
        console.error(`Failed to fetch/parse ${feed.source}:`, err);
      }
    }

    if (allArticles.length === 0) {
      res.json(fallbackArticles);
      return;
    }

    allArticles.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      const dateA = new Date(a.pubDate).getTime();
      const dateB = new Date(b.pubDate).getTime();
      if (!isNaN(dateA) && !isNaN(dateB)) {
        return dateB - dateA;
      }
      return 0;
    });

    res.json(allArticles.slice(0, 30));
  } catch (error) {
    console.error("News endpoint error:", error);
    res.json(fallbackArticles);
  }
});

export default newsRouter;
