import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, BookOpen, Calendar, User, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  readTime: string;
  content: string[];
  category: string;
  color: string;
};

const POSTS: BlogPost[] = [
  {
    slug: "5-ways-to-pay-off-loans-faster",
    title: "5 Smart Ways to Pay Off Your Personal Loan Faster",
    excerpt: "Tired of monthly EMIs draining your income? Here are 5 practical, mathematical strategies to prepay and close your personal loans early.",
    date: "June 25, 2026",
    author: "Amit Sharma",
    readTime: "4 min read",
    category: "Debt Management",
    color: "from-blue-500 to-indigo-600",
    content: [
      "Paying off a loan early is one of the most effective ways to free up your monthly cash flow and secure your financial future. Personal loans often carry high interest rates (11% to 20%), making them a primary candidate for early payoff. Here are five practical strategies you can use starting today:",
      "### 1. Make Micro-Prepayments\nPrepaying doesn't have to mean writing a check for lakhs of rupees. If you add just ₹2,000 or ₹5,000 extra to your principal amount each month, you directly reduce the base compounding balance. This reduces interest charged next month, starting a positive snowball effect.",
      "### 2. Commit Windfalls and Bonuses\nReceived an annual performance bonus, tax refund, or cash gift? Instead of spending it, put 50% or more directly toward your loan's outstanding principal. This one-time prepayment can shave months off your tenure.",
      "### 3. Adopt the 1-Extra-EMI Rule\nIf you pay just one extra monthly instalment (EMI) per year, you can shorten a 5-year loan by almost a full year. You can do this by dividing your EMI by 12 and adding that small amount to your payments each month.",
      "### 4. Round Up Your Monthly Payments\nIf your EMI is ₹14,200, round it up to ₹15,000. That extra ₹800 goes entirely toward the principal. It is a small enough amount that you won't miss it in your daily budget, but over years, it saves significant interest.",
      "### 5. Review Interest Rates Regularly\nIf market rates drop or your credit score improves, check if you can refinance your loan at a lower rate. Alternatively, use tools like Loan Khatam to calculate whether switching to a different bank is worth the transfer charges.",
      "By combining these strategies and tracking them in a personal ledger, you can gain absolute clarity and keep yourself motivated on your journey to becoming debt-free."
    ]
  },
  {
    slug: "snowball-vs-avalanche-debt-payoff",
    title: "Snowball vs. Avalanche: Which Debt Payoff Strategy is Best?",
    excerpt: "Compare the two most popular debt payoff strategies: the behavior-focused Debt Snowball and the interest-minimizing Debt Avalanche.",
    date: "June 20, 2026",
    author: "Rohan Verma",
    readTime: "5 min read",
    category: "Financial Planning",
    color: "from-purple-500 to-pink-600",
    content: [
      "When you have multiple debts—such as credit cards, family loans, and bank personal loans—it can feel overwhelming to decide which one to pay first. Financial experts generally recommend two major strategies: the Debt Snowball and the Debt Avalanche. Let's compare them to see which fits your personality best.",
      "### The Debt Snowball Method (Momentum Focus)\nIn the Snowball strategy, you list all your debts from **smallest balance to largest balance**, ignoring interest rates. You pay the minimum on all debts, and throw any extra money toward the smallest debt. Once the smallest is fully paid off, you roll its entire payment into the next smallest. This method provides quick mental wins, keeping you motivated through behavioral success.",
      "### The Debt Avalanche Method (Math Focus)\nIn the Avalanche strategy, you list all your debts from **highest interest rate to lowest interest rate**, ignoring balance sizes. You pay the minimum on all debts, and put all extra cash toward the debt with the highest rate. When that is paid off, you roll the money into the next highest. This is mathematically the cheapest route, saving you the maximum amount of money in interest fees.",
      "### Which should you choose?\n* **Choose Snowball** if you struggle with motivation and need quick, early satisfaction to stay committed to your payoff journey.\n* **Choose Avalanche** if you are highly disciplined, hate paying interest fees, and prefer the most mathematically optimal solution.",
      "Whichever strategy you select, the key is consistency. Using planning calculators to compare both methods is a great way to map out exactly when you will be debt-free."
    ]
  },
  {
    slug: "understanding-emi-calculations",
    title: "Understanding EMI: How Your Monthly Loan Payment is Calculated",
    excerpt: "Demystifying Equated Monthly Instalments (EMIs). Learn the math behind your payments and how interest vs principal changes over time.",
    date: "June 15, 2026",
    author: "Priya Nair",
    readTime: "4 min read",
    category: "Education",
    color: "from-emerald-500 to-teal-600",
    content: [
      "An Equated Monthly Instalment (EMI) is a fixed payment made by a borrower to a lender on a specific date each calendar month. While the total EMI amount stays constant, the internal share of principal and interest changes dynamically over time. Let's break down the math.",
      "### The EMI Formula\nThe standard mathematical formula used to calculate EMIs is:\n`EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)`\n* **P** = Principal loan amount\n* **r** = Monthly interest rate (Annual rate divided by 12, then divided by 100)\n* **n** = Number of monthly instalments (Tenure in months)",
      "### Why Principal Drops Slowly at First\nIn the initial months of a loan, your outstanding principal balance is at its highest. Because interest is always calculated as a percentage of your outstanding balance, a major portion of your early EMIs goes toward paying interest, and only a tiny sliver goes toward principal repayment.",
      "As you make payments and the principal slowly decreases, the interest charged also drops. Consequently, in the later stages of the loan, a much larger percentage of your EMI goes toward principal repayment, accelerating the final payoff.",
      "### The Prepayment Hack\nBecause interest is front-loaded, making prepayments in the **first half of your loan tenure** yields the highest interest savings. Even a small prepayment made in the first year can save thousands of rupees more than the same prepayment made in the final year.",
      "Understanding this amortization cycle is crucial for anyone taking a long-term loan. Use our EMI Calculator to model your schedule and take control of your interest outgo."
    ]
  }
];

export function BlogsPage() {
  const [location, setLocation] = useLocation();
  
  // Extract slug from URL path if it is /blogs/some-slug
  const slug = location.replace(/^\/blogs\/?/, "");
  const activePost = POSTS.find(p => p.slug === slug);

  if (activePost) {
    return (
      <div className="space-y-8 py-4 max-w-3xl mx-auto">
        {/* Back Link */}
        <button
          onClick={() => setLocation("/blogs")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blogs
        </button>

        {/* Article Meta */}
        <header className="space-y-4">
          <span className="text-xs font-extrabold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30">
            {activePost.category}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-slate-800 dark:text-slate-100">
            {activePost.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400 dark:text-slate-500 pt-2">
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              <span>By {activePost.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{activePost.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{activePost.readTime}</span>
            </div>
          </div>
        </header>

        {/* Article Banner */}
        <div className={`h-48 w-full rounded-3xl bg-gradient-to-r ${activePost.color} opacity-85 shadow-md flex items-center justify-center`}>
          <BookOpen className="h-16 w-16 text-white/50" />
        </div>

        {/* Article Content */}
        <article className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed font-medium space-y-6">
          {activePost.content.map((paragraph, index) => {
            if (paragraph.startsWith("###")) {
              return (
                <h3 key={index} className="text-xl font-bold text-slate-800 dark:text-slate-100 pt-4">
                  {paragraph.replace("###", "").trim()}
                </h3>
              );
            }
            return (
              <p key={index} className="text-base">
                {/* Parse basic markdown code formatting like `EMI` */}
                {paragraph.split("`").map((part, pIdx) =>
                  pIdx % 2 === 1 ? (
                    <code key={pIdx} className="bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded text-sm font-mono text-indigo-600 dark:text-indigo-400">
                      {part}
                    </code>
                  ) : (
                    part
                  )
                )}
              </p>
            );
          })}
        </article>

        {/* Bottom CTA Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-center space-y-4 mt-12">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Ready to take control?</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Try our interactive calculators or create a free account to track your actual loans, log repayments, and see your payoff strategy timeline live.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/tools/emi-calculator">
              <Button variant="outline" className="rounded-xl font-bold cursor-pointer">EMI Calculator</Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer">Create Free Account</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Blog Directory Hub
  return (
    <div className="space-y-12 py-4">
      {/* Hero */}
      <section className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
          Financial Education & Guides
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          Learn how interest cycles work, understand debt acceleration methods, and pick up smart strategies to pay off loans faster.
        </p>
      </section>

      {/* Grid of posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {POSTS.map((post) => (
          <div
            key={post.slug}
            className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden hover:shadow-md transition-shadow group"
          >
            <div>
              {/* Header card image/color banner */}
              <div className={`h-36 bg-gradient-to-br ${post.color} flex items-center justify-center p-4 relative`}>
                <BookOpen className="h-10 w-10 text-white/40 absolute right-4 bottom-4" />
                <span className="absolute left-4 top-4 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md bg-white/20 text-white backdrop-blur-sm">
                  {post.category}
                </span>
              </div>

              {/* Title & Info */}
              <div className="p-6 space-y-3">
                <div className="flex gap-4 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                </div>

                <h2 className="text-xl font-bold leading-snug text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {post.title}
                </h2>
                
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-3">
                  {post.excerpt}
                </p>
              </div>
            </div>

            {/* Read more button */}
            <div className="px-6 pb-6 pt-2">
              <Button
                onClick={() => setLocation(`/blogs/${post.slug}`)}
                className="w-full justify-between rounded-xl font-bold bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-700 border border-slate-200 dark:bg-slate-800/50 dark:hover:bg-indigo-600 dark:text-slate-300 dark:border-slate-800 transition-all cursor-pointer"
              >
                <span>Read Article</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
