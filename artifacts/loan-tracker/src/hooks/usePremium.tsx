import React, { createContext, useContext, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Crown, CheckCircle2, ShieldCheck, QrCode } from "lucide-react";
import { useTranslation } from "./useTranslation";

interface PremiumContextProps {
  isPremium: boolean;
  unlockPremium: (code: string) => boolean;
  showPaywall: boolean;
  setShowPaywall: (show: boolean) => void;
  lockFeature: () => void;
  discountEnabled: boolean;
  planTitle: string;
  regularPrice: number;
  offerPrice: number;
  promoText: string;
  features: string[];
  showPremiumPlan: boolean;
}

const PremiumContext = createContext<PremiumContextProps | undefined>(undefined);

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isPremiumState, setIsPremiumState] = useState<boolean>(() => {
    return localStorage.getItem("is_premium") === "true";
  });
  const [showPaywall, setShowPaywall] = useState(false);
  const [activationCode, setActivationCode] = useState("");
  const [discountEnabled, setDiscountEnabled] = useState(true);
  const [showPremiumPlan, setShowPremiumPlan] = useState(true);
  const [planTitle, setPlanTitle] = useState("Upgrade to Premium");
  const [regularPrice, setRegularPrice] = useState(1000);
  const [offerPrice, setOfferPrice] = useState(99);
  const [promoText, setPromoText] = useState("Special Offer: Buy 1 Year, Get 1 Year Extra FREE!");
  const [features, setFeatures] = useState<string[]>([
    "AI Financial Assistant — Ask custom strategy questions",
    "Splitwise Group Split — Split expenses seamlessly with friends",
    "EMI vs SIP Planner — Smart arbitrage calculation"
  ]);

  const isPremium = !showPremiumPlan || isPremiumState;

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/admin/config");
        if (res.ok) {
          const data = await res.json();
          setDiscountEnabled(data.discountEnabled !== false);
          setShowPremiumPlan(data.showPremiumPlan !== false);
          setPlanTitle(data.planTitle || "Upgrade to Premium");
          setRegularPrice(data.regularPrice ?? 1000);
          setOfferPrice(data.offerPrice ?? 99);
          setPromoText(data.promoText || "Special Offer: Buy 1 Year, Get 1 Year Extra FREE!");
          setFeatures(data.features || [
            "AI Financial Assistant — Ask custom strategy questions",
            "Splitwise Group Split — Split expenses seamlessly with friends",
            "EMI vs SIP Planner — Smart arbitrage calculation"
          ]);
        }
      } catch (e) {
        console.error("Failed to fetch paywall config:", e);
      }
    };
    fetchConfig();
  }, [showPaywall]);

  const unlockPremium = (code: string): boolean => {
    const cleaned = code.trim().toUpperCase();
    if (cleaned === "PREMIUM100" || cleaned === "LOAN100" || cleaned === "VIP100") {
      localStorage.setItem("is_premium", "true");
      setIsPremiumState(true);
      setShowPaywall(false);
      toast({
        title: "👑 Premium Unlocked!",
        description: "Welcome to Loan Khatam Premium. All advanced features are now unlocked.",
      });
      return true;
    }
    toast({
      title: "Invalid Code",
      description: "Please enter a valid activation code or complete the payment.",
      variant: "destructive",
    });
    return false;
  };

  const lockFeature = () => {
    if (!isPremium) {
      setShowPaywall(true);
    }
  };

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        unlockPremium,
        showPaywall,
        setShowPaywall,
        lockFeature,
        discountEnabled,
        planTitle,
        regularPrice,
        offerPrice,
        promoText,
        features,
        showPremiumPlan,
      }}
    >
      {children}

      {/* Premium Paywall Modal */}
      <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
        <DialogContent className="max-w-md rounded-3xl border border-amber-500/20 bg-card p-6 shadow-2xl overflow-hidden">
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
          <DialogHeader className="space-y-3 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20">
              <Crown className="h-7 w-7" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight text-foreground">
              {planTitle}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Unlock advanced features to manage your debts and investments.
            </DialogDescription>
          </DialogHeader>

          {/* Pricing Box */}
          <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-2xl p-5 text-center my-2 space-y-1 relative">
            {discountEnabled && (
              <div className="absolute top-2 right-2 bg-rose-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-sm tracking-wider">
                90% OFF
              </div>
            )}
            {discountEnabled ? (
              <span className="text-slate-400 dark:text-slate-500 text-xs font-bold line-through">
                Regular Price: ₹{regularPrice} / Yr
              </span>
            ) : (
              <span className="text-slate-400 dark:text-slate-500 text-xs font-bold">
                Premium Plan Pricing
              </span>
            )}
            <div className="text-4xl font-black text-amber-600 dark:text-amber-400 tracking-tight leading-none pt-1">
              ₹{discountEnabled ? offerPrice : regularPrice}
            </div>
            <span className="text-[11px] font-bold text-amber-500 dark:text-amber-400 block pt-0.5 animate-pulse">
              {discountEnabled ? promoText : "Full Premium Plan — 1 Year Access"}
            </span>
          </div>

          {/* Benefits list */}
          <div className="space-y-3 my-4">
            {features.map((feature, idx) => (
              <div key={idx} className="flex gap-3 items-start text-sm">
                <CheckCircle2 className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* Payment simulation (UPI QR Code) */}
          <div className="border border-border rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
            <div className="flex gap-3 items-center">
              <div className="h-8 w-8 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                <QrCode className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none">
                  Instant Payment via UPI
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">
                  Pay to UPI: <code className="bg-slate-200/50 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">loankhatam@upi</code>
                </p>
              </div>
            </div>

            {/* Code Activation form */}
            <div className="space-y-2 pt-2 border-t border-border">
              <Label htmlFor="actCode" className="text-xs font-bold text-slate-500">
                Have an activation code? Enter below:
              </Label>
              <div className="flex gap-2">
                <Input
                  id="actCode"
                  placeholder="e.g. PREMIUM100"
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value)}
                  className="rounded-xl h-10 font-bold"
                />
                <Button
                  onClick={() => unlockPremium(activationCode)}
                  className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold h-10 px-4"
                >
                  Activate
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="ghost"
              onClick={() => setShowPaywall(false)}
              className="w-full rounded-xl font-bold border border-slate-200/50 dark:border-slate-800 text-slate-500 dark:text-slate-400"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error("usePremium must be used within a PremiumProvider");
  }
  return context;
}
