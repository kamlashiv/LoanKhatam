import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Sparkles, Send, Bot, User, HelpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: Date;
};

const SUGGESTIONS = [
  { q: "What is the Snowball Method?", key: "snowball" },
  { q: "What is the Avalanche Method?", key: "avalanche" },
  { q: "How does prepayment save money?", key: "prepayment" },
  { q: "What is Loan Khatam?", key: "loankhatam" },
];

const KNOWLEDGE_BASE: Record<string, string> = {
  snowball: "The **Debt Snowball Method** focuses on behavior and momentum. You list all your loans from smallest balance to largest. You pay the minimum on all loans except the smallest one, which you pay as much as possible towards. Once that smallest loan is paid off (first win!), you roll its payment amount into the next smallest loan. This builds rapid psychological momentum!",
  avalanche: "The **Debt Avalanche Method** focuses on mathematical efficiency. You list all your loans from highest interest rate to lowest. You pay the minimum on all loans except the one with the highest interest rate, which you attack first. Once that is paid off, you roll the payment into the next highest rate loan. This strategy minimizes the total interest you pay over time.",
  prepayment: "A **prepayment** is any extra payment you make towards your loan's principal amount, above your regular monthly EMI. Because it directly reduces the outstanding principal balance, the interest charged in subsequent months decreases. This results in two major benefits: it significantly reduces the total interest you pay and helps you close the loan months or even years earlier.",
  loankhatam: "**Loan Khatam** is a private, free loan ledger and planner. It lets you track money you lend or borrow from friends, family, or banks. You can record payments, view amortization tables, and use strategy engines like Snowball or Avalanche to plan your debt payoff. It also features a secure AI engine to extract loan details from files/images when you sign in.",
  default: "That is a great question! For detailed debt planning, Loan Khatam offers specialized tools. When you create a free account, you get access to a full **AI Assistant** that can read uploaded loan agreement PDFs/images, extract variables, and instantly build an amortization schedule for you. Would you like to sign up and try it out?"
};

export function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "Hello! I am **Khatam AI**, your personal financial strategy assistant. I can help you understand debt payoff methods, EMI calculations, and how to get debt-free faster. What would you like to ask?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (text: string, key?: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate bot response delay
    setTimeout(() => {
      let botText = KNOWLEDGE_BASE.default;
      
      if (key && KNOWLEDGE_BASE[key]) {
        botText = KNOWLEDGE_BASE[key];
      } else {
        // Simple word matching
        const normalized = text.toLowerCase();
        if (normalized.includes("snowball")) {
          botText = KNOWLEDGE_BASE.snowball;
        } else if (normalized.includes("avalanche") || normalized.includes("highest interest")) {
          botText = KNOWLEDGE_BASE.avalanche;
        } else if (normalized.includes("prepay") || normalized.includes("extra payment") || normalized.includes("saving")) {
          botText = KNOWLEDGE_BASE.prepayment;
        } else if (normalized.includes("loankhatam") || normalized.includes("loan khatam") || normalized.includes("app")) {
          botText = KNOWLEDGE_BASE.loankhatam;
        }
      }

      const botMsg: Message = {
        id: Math.random().toString(),
        sender: "bot",
        text: botText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 py-4 max-w-4xl mx-auto flex flex-col h-[calc(100vh-160px)]">
      {/* Top Controls */}
      <div className="shrink-0 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
          Back to Tools
        </Link>
        <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/30 px-3 py-1 rounded-full border border-indigo-100/30 dark:border-indigo-950/30">
          <Sparkles className="h-3 w-3 animate-pulse" />
          Virtual Guide
        </span>
      </div>

      {/* Chat Area */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-6">
        {/* Left Side: Chat log */}
        <div className="flex-1 flex flex-col rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          {/* Header */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 dark:text-slate-100">Khatam AI Assistant</h2>
              <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
                Always Active
              </span>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m) => {
              const isBot = m.sender === "bot";
              return (
                <div key={m.id} className={`flex items-start gap-3 ${!isBot && "flex-row-reverse"}`}>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white ${
                    isBot ? "bg-indigo-600" : "bg-slate-600"
                  }`}>
                    {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>

                  <div className={`max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                    isBot 
                      ? "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-850" 
                      : "bg-indigo-600 text-white rounded-tr-none shadow-sm shadow-indigo-600/10"
                  }`}>
                    {/* Render basic markdown bold formatting */}
                    {m.text.split("**").map((part, index) => 
                      index % 2 === 1 ? <strong key={index} className="font-extrabold">{part}</strong> : part
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl rounded-tl-none p-4 border border-slate-100 dark:border-slate-850">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about debt payoff, snowball, interest..."
              disabled={isTyping}
              className="rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-600 bg-white dark:bg-slate-950 font-medium"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isTyping || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 w-10 shrink-0 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* Right Side: Quick tips / Suggestions */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-6">
          {/* Suggestion list */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm">
              <HelpCircle className="h-4 w-4 text-indigo-500" />
              Suggested Questions
            </h3>
            <div className="flex flex-col gap-2">
              {SUGGESTIONS.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleSendMessage(item.q, item.key)}
                  disabled={isTyping}
                  className="text-left text-xs font-bold p-3 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 dark:text-slate-300 dark:hover:text-indigo-400 dark:hover:border-indigo-900 transition-all cursor-pointer disabled:opacity-50"
                >
                  {item.q}
                </button>
              ))}
            </div>
          </div>

          {/* Premium AI Promo Card */}
          <div className="rounded-3xl border border-indigo-100 bg-indigo-50/50 p-5 shadow-sm dark:border-indigo-950/40 dark:bg-indigo-950/20 text-center flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-9 w-9 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Unlock AI File Import</h4>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Sign up to upload loan statements, letters, or bills. Our AI will automatically parse the data, extract interest rates, terms, and build your dashboard logs!
              </p>
            </div>

            <Link href="/sign-up">
              <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl mt-4 cursor-pointer">
                Try AI Extraction
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
