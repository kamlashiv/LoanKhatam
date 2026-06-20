import React, { useState } from "react";
import "./_group.css";
import {
  Sparkles,
  CalendarClock,
  Wallet,
  TrendingDown,
  Clock3,
  PiggyBank,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  CalendarRange,
  Coins,
  Percent,
  Banknote,
  Repeat,
  Rocket,
  Layers,
  Pencil,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ------------------------------------------------------------------ */
/* Brand tokens (RinMukti, light)                                      */
/* ------------------------------------------------------------------ */
const C = {
  bg: "#f8fafc",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  card: "#ffffff",
  indigo: "#4f46e5",
  indigoSoft: "#eef2ff",
  emerald: "#10b981",
  emeraldSoft: "#ecfdf5",
  amber: "#f59e0b",
  rose: "#f43f5e",
};

const mono = "'Space Mono', Menlo, monospace";
const sans = "'Outfit', sans-serif";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const inr = (val: number) => `₹${Math.round(val).toLocaleString("en-IN")}`;
const inrCompact = (val: number) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
};

/* Consistent illustrative data */
const DATA = {
  principal: 2500000,
  rate: 8.5,
  tenureMonths: 240,
  baseEmi: 21696,
  extra: 5000,
  baselineInterest: 2710000,
  newInterest: 2030000,
  interestSaved: 680000,
  monthsSaved: 60,
  startDate: "June 2026",
  standardPayoff: "June 2046",
  acceleratedPayoff: "June 2041",
};

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function AssistantBubble({
  children,
  step,
}: {
  children: React.ReactNode;
  step?: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full shadow-sm"
        style={{ background: C.indigo }}
      >
        <Sparkles className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1">
        {step && (
          <div
            className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: C.indigo }}
          >
            {step}
          </div>
        )}
        <div
          className="inline-block rounded-2xl rounded-tl-md px-5 py-4 text-[17px] leading-relaxed"
          style={{
            background: C.indigoSoft,
            color: C.text,
            border: `1px solid #e0e7ff`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function GoalToggle({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
      style={{
        background: active ? C.indigo : C.card,
        color: active ? "#fff" : C.muted,
        border: `1px solid ${active ? C.indigo : C.border}`,
        boxShadow: active ? "0 2px 8px rgba(79,70,229,0.25)" : "none",
      }}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-4 py-2 text-sm font-medium transition-all"
      style={{
        background: active ? C.indigo : "#fff",
        color: active ? "#fff" : C.text,
        border: `1px solid ${active ? C.indigo : C.border}`,
        fontFamily: mono,
      }}
    >
      {children}
    </button>
  );
}

function PlanStat({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: any;
  label: string;
  value: string;
  sub?: string;
  accent: string;
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "#fff", border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: `${accent}14` }}
        >
          <Icon className="h-4 w-4" style={{ color: accent }} />
        </div>
        <span
          className="text-[12px] font-medium uppercase tracking-wide"
          style={{ color: C.muted }}
        >
          {label}
        </span>
      </div>
      <div
        className="mt-3 text-[26px] font-bold leading-none"
        style={{ fontFamily: mono, color: C.text }}
      >
        {value}
      </div>
      {sub && (
        <div className="mt-1.5 text-[13px]" style={{ color: C.muted }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function StrategyCard({
  icon: Icon,
  title,
  desc,
  saveAmt,
  saveTime,
  recommended,
  selected,
  onClick,
}: {
  icon: any;
  title: string;
  desc: string;
  saveAmt: string;
  saveTime: string;
  recommended?: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative flex w-full flex-col rounded-2xl p-5 text-left transition-all"
      style={{
        background: selected ? C.emeraldSoft : "#fff",
        border: `1.5px solid ${selected ? C.emerald : C.border}`,
        boxShadow: selected
          ? "0 4px 14px rgba(16,185,129,0.18)"
          : "0 1px 2px rgba(15,23,42,0.04)",
      }}
    >
      {recommended && (
        <span
          className="absolute -top-2.5 right-4 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
          style={{ background: C.indigo }}
        >
          Recommended
        </span>
      )}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            background: selected ? C.emerald : C.indigoSoft,
          }}
        >
          <Icon
            className="h-5 w-5"
            style={{ color: selected ? "#fff" : C.indigo }}
          />
        </div>
        <div className="font-semibold" style={{ color: C.text }}>
          {title}
        </div>
        {selected && (
          <CheckCircle2
            className="ml-auto h-5 w-5"
            style={{ color: C.emerald }}
          />
        )}
      </div>
      <p className="mt-3 text-[13px] leading-relaxed" style={{ color: C.muted }}>
        {desc}
      </p>
      <div
        className="mt-4 flex items-center justify-between border-t pt-3"
        style={{ borderColor: selected ? "#bbf7d0" : C.border }}
      >
        <div>
          <div
            className="text-[15px] font-bold"
            style={{ fontFamily: mono, color: C.emerald }}
          >
            {saveAmt}
          </div>
          <div className="text-[11px]" style={{ color: C.muted }}>
            interest saved
          </div>
        </div>
        <div className="text-right">
          <div
            className="text-[15px] font-bold"
            style={{ fontFamily: mono, color: C.text }}
          >
            {saveTime}
          </div>
          <div className="text-[11px]" style={{ color: C.muted }}>
            sooner
          </div>
        </div>
      </div>
    </button>
  );
}

/* Lightweight SVG payoff projection: standard vs accelerated */
function PayoffChart() {
  const w = 760;
  const h = 240;
  const padL = 8;
  const padB = 28;
  const padT = 16;
  const innerW = w - padL - 8;
  const innerH = h - padB - padT;

  // 20 years standard, 15 years accelerated. balance declines (convex)
  const stdPts: [number, number][] = [];
  const accPts: [number, number][] = [];
  const N = 20;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    // convex decay for standard
    const bal = DATA.principal * (1 - Math.pow(t, 1.55));
    const x = padL + t * innerW;
    const y = padT + (1 - bal / DATA.principal) * innerH;
    stdPts.push([x, y]);
  }
  const Nacc = 15;
  for (let i = 0; i <= Nacc; i++) {
    const t = i / Nacc;
    const bal = DATA.principal * (1 - Math.pow(t, 1.4));
    const x = padL + (i / N) * innerW;
    const y = padT + (1 - bal / DATA.principal) * innerH;
    accPts.push([x, y]);
  }

  const toPath = (pts: [number, number][]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

  const accArea =
    toPath(accPts) +
    ` L${accPts[accPts.length - 1][0].toFixed(1)},${padT + innerH} L${padL},${padT + innerH} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="accFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.emerald} stopOpacity="0.22" />
          <stop offset="100%" stopColor={C.emerald} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map((g) => (
        <line
          key={g}
          x1={padL}
          x2={padL + innerW}
          y1={padT + g * innerH}
          y2={padT + g * innerH}
          stroke={C.border}
          strokeWidth={1}
          strokeDasharray="3 4"
        />
      ))}
      {/* accelerated area */}
      <path d={accArea} fill="url(#accFill)" />
      {/* standard line */}
      <path d={toPath(stdPts)} fill="none" stroke={C.muted} strokeWidth={2.5} strokeDasharray="5 5" />
      {/* accelerated line */}
      <path d={toPath(accPts)} fill="none" stroke={C.emerald} strokeWidth={3} />
      {/* payoff marker accelerated */}
      <circle cx={accPts[accPts.length - 1][0]} cy={padT + innerH} r={5} fill={C.emerald} />
      <circle cx={stdPts[stdPts.length - 1][0]} cy={padT + innerH} r={5} fill={C.muted} />
      {/* x labels */}
      {["2026", "2031", "2036", "2041", "2046"].map((yr, i) => (
        <text
          key={yr}
          x={padL + (i / 4) * innerW}
          y={h - 6}
          fontSize={11}
          fill={C.muted}
          textAnchor={i === 0 ? "start" : i === 4 ? "end" : "middle"}
          fontFamily={mono}
        >
          {yr}
        </text>
      ))}
    </svg>
  );
}

function ScheduleRow({
  year,
  date,
  emi,
  extra,
  interest,
  balance,
}: {
  year: number;
  date: string;
  emi: string;
  extra: string;
  interest: string;
  balance: string;
}) {
  return (
    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
      <td className="py-2.5 pl-5 pr-3 text-[13px] font-medium" style={{ color: C.text }}>
        Year {year}
        <span className="ml-2 text-[12px] font-normal" style={{ color: C.muted }}>
          {date}
        </span>
      </td>
      <td className="px-3 py-2.5 text-right text-[13px]" style={{ fontFamily: mono, color: C.text }}>
        {emi}
      </td>
      <td className="px-3 py-2.5 text-right text-[13px]" style={{ fontFamily: mono, color: C.emerald }}>
        {extra}
      </td>
      <td className="px-3 py-2.5 text-right text-[13px]" style={{ fontFamily: mono, color: C.amber }}>
        {interest}
      </td>
      <td className="px-3 py-2.5 pr-5 text-right text-[13px]" style={{ fontFamily: mono, color: C.text }}>
        {balance}
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */
export function GoalFirstAssistant() {
  const [goalMode, setGoalMode] = useState<"date" | "budget">("budget");
  const [budget, setBudget] = useState(5000);
  const [strategy, setStrategy] = useState("boost");
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const strategies = [
    {
      key: "extra-emi",
      icon: Repeat,
      title: "1 Extra EMI / Year",
      desc: "Pay one bonus EMI annually — easiest to sustain with a yearly bonus.",
      saveAmt: "₹4.1L",
      saveTime: "2 yr 9 mo",
    },
    {
      key: "micro",
      icon: Coins,
      title: "Micro-Savings (₹5/day)",
      desc: "Round up ₹150/month from daily savings — barely noticeable.",
      saveAmt: "₹1.4L",
      saveTime: "11 mo",
    },
    {
      key: "boost",
      icon: Rocket,
      title: "10% Monthly Boost",
      desc: "Add ₹5,000 extra every month. Matches your set-aside budget.",
      saveAmt: "₹6.8L",
      saveTime: "5 yr",
      recommended: true,
    },
    {
      key: "combo",
      icon: Layers,
      title: "Super-Saver Combo",
      desc: "Extra ₹5,000/month plus one bonus EMI a year — maximum impact.",
      saveAmt: "₹9.3L",
      saveTime: "6 yr 4 mo",
    },
  ];

  const schedule = [
    { year: 1, date: "2026–27", emi: "₹2,60,352", extra: "+₹60,000", interest: "₹2,08,400", balance: "₹24,32,100" },
    { year: 3, date: "2028–29", emi: "₹2,60,352", extra: "+₹60,000", interest: "₹1,92,600", balance: "₹22,18,400" },
    { year: 6, date: "2031–32", emi: "₹2,60,352", extra: "+₹60,000", interest: "₹1,58,900", balance: "₹17,42,700" },
    { year: 9, date: "2034–35", emi: "₹2,60,352", extra: "+₹60,000", interest: "₹1,14,200", balance: "₹11,38,500" },
    { year: 12, date: "2037–38", emi: "₹2,60,352", extra: "+₹60,000", interest: "₹62,800", balance: "₹4,86,200" },
    { year: 15, date: "2040–41", emi: "₹2,18,640", extra: "+₹48,000", interest: "₹12,400", balance: "₹0" },
  ];

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: C.bg, color: C.text, fontFamily: sans }}
    >
      {/* Top bar */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-10 py-4"
        style={{
          background: "rgba(248,250,252,0.85)",
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: C.indigo }}
          >
            <PiggyBank className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-[15px] font-bold leading-none">Smart Loan Saver</div>
            <div className="text-[11px]" style={{ color: C.muted }}>
              RinMukti · debt-free planner
            </div>
          </div>
        </div>
        <Badge
          variant="outline"
          className="gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium"
          style={{ borderColor: C.border, color: C.muted, background: "#fff" }}
        >
          <Banknote className="h-3.5 w-3.5" />
          Home Loan · {inrCompact(DATA.principal)}
        </Badge>
      </header>

      {/* Guided single-column flow */}
      <main className="mx-auto max-w-[920px] px-6 pb-24 pt-12">
        {/* Intro */}
        <div className="mb-10 text-center">
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm"
            style={{ background: C.indigo }}
          >
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-[34px] font-bold leading-tight">
            Let's plan your way to <span style={{ color: C.emerald }}>debt-free</span>.
          </h1>
          <p className="mx-auto mt-3 max-w-[560px] text-[16px]" style={{ color: C.muted }}>
            Tell me your goal and I'll work out the plan — no spreadsheets, no jargon.
            We're starting from your ₹25,00,000 home loan at 8.5% for 20 years.
          </p>
        </div>

        {/* Step 1 — Goal */}
        <section className="mb-8">
          <AssistantBubble step="Step 1 · Your goal">
            How would you like to plan? You can give me a{" "}
            <strong>monthly budget</strong> you can spare, or pick a{" "}
            <strong>date</strong> you want to be debt-free by.
          </AssistantBubble>

          <div className="ml-[60px] mt-5">
            <div className="flex flex-wrap gap-3">
              <GoalToggle
                active={goalMode === "budget"}
                onClick={() => setGoalMode("budget")}
                icon={Wallet}
                label="I have a monthly budget"
              />
              <GoalToggle
                active={goalMode === "date"}
                onClick={() => setGoalMode("date")}
                icon={CalendarClock}
                label="I have a target date"
              />
            </div>

            <div
              className="mt-5 rounded-2xl p-6"
              style={{ background: "#fff", border: `1px solid ${C.border}` }}
            >
              {goalMode === "budget" ? (
                <>
                  <label className="text-[14px] font-medium" style={{ color: C.text }}>
                    How much extra can you set aside each month?
                  </label>
                  <div className="mt-4 flex items-end gap-6">
                    <div
                      className="text-[40px] font-bold leading-none"
                      style={{ fontFamily: mono, color: C.indigo }}
                    >
                      {inr(budget)}
                      <span className="text-[18px]" style={{ color: C.muted }}>
                        /mo
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 pb-1">
                      {[2000, 5000, 8000, 12000].map((b) => (
                        <Chip key={b} active={budget === b} onClick={() => setBudget(b)}>
                          {inrCompact(b)}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={15000}
                    step={500}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="mt-5 w-full"
                    style={{ accentColor: C.indigo }}
                  />
                  <div className="mt-2 flex justify-between text-[12px]" style={{ color: C.muted }}>
                    <span style={{ fontFamily: mono }}>₹0</span>
                    <span style={{ fontFamily: mono }}>₹15,000</span>
                  </div>
                </>
              ) : (
                <>
                  <label className="text-[14px] font-medium" style={{ color: C.text }}>
                    When do you want to be debt-free?
                  </label>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {["June 2041", "June 2039", "June 2037"].map((d, i) => (
                      <button
                        key={d}
                        className="rounded-xl px-5 py-3 text-left transition-all"
                        style={{
                          background: i === 0 ? C.indigoSoft : "#fff",
                          border: `1.5px solid ${i === 0 ? C.indigo : C.border}`,
                        }}
                      >
                        <div
                          className="text-[18px] font-bold"
                          style={{ fontFamily: mono, color: i === 0 ? C.indigo : C.text }}
                        >
                          {d}
                        </div>
                        <div className="text-[12px]" style={{ color: C.muted }}>
                          in {20 - i * 2} years
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 text-[13px]" style={{ color: C.muted }}>
                    To hit <strong>June 2041</strong>, you'd need about{" "}
                    <strong style={{ color: C.indigo, fontFamily: mono }}>₹5,000/mo</strong> extra.
                  </p>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Step 2 — Strategy suggestions */}
        <section className="mb-8">
          <AssistantBubble step="Step 2 · Pick an approach">
            Based on a{" "}
            <strong style={{ fontFamily: mono }}>{inr(budget)}/mo</strong> budget, here are four
            ways to get there. I'd suggest the{" "}
            <strong>10% Monthly Boost</strong> — it fits neatly and saves the most for the effort.
          </AssistantBubble>

          <div className="ml-[60px] mt-5 grid grid-cols-2 gap-4">
            {strategies.map((s) => (
              <StrategyCard
                key={s.key}
                icon={s.icon}
                title={s.title}
                desc={s.desc}
                saveAmt={s.saveAmt}
                saveTime={s.saveTime}
                recommended={s.recommended}
                selected={strategy === s.key}
                onClick={() => setStrategy(s.key)}
              />
            ))}
          </div>
        </section>

        {/* Step 3 — Your plan response */}
        <section className="mb-8">
          <AssistantBubble step="Step 3 · Your plan">
            Here's what that does to your loan. You'll be{" "}
            <strong style={{ color: C.emerald }}>debt-free 5 years sooner</strong> and keep{" "}
            <strong style={{ color: C.emerald }}>₹6.8 lakh</strong> in interest in your pocket.
          </AssistantBubble>

          <div className="ml-[60px] mt-5">
            {/* Hero outcome card */}
            <div
              className="overflow-hidden rounded-2xl"
              style={{ border: `1.5px solid ${C.emerald}`, background: "#fff" }}
            >
              <div
                className="flex items-center justify-between px-6 py-5"
                style={{ background: C.emeraldSoft, borderBottom: `1px solid #bbf7d0` }}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6" style={{ color: C.emerald }} />
                  <div>
                    <div className="text-[13px] font-semibold uppercase tracking-wide" style={{ color: C.emerald }}>
                      New debt-free date
                    </div>
                    <div className="text-[28px] font-bold leading-tight" style={{ fontFamily: mono }}>
                      {DATA.acceleratedPayoff}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[12px]" style={{ color: C.muted }}>
                    was {DATA.standardPayoff}
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-bold text-white" style={{ background: C.emerald }}>
                    <Clock3 className="h-3.5 w-3.5" />5 years earlier
                  </div>
                </div>
              </div>

              {/* Plan stats grid */}
              <div className="grid grid-cols-4 gap-4 p-6">
                <PlanStat
                  icon={Wallet}
                  label="Monthly EMI"
                  value={inr(DATA.baseEmi)}
                  sub={`+ ${inr(budget)} extra`}
                  accent={C.indigo}
                />
                <PlanStat
                  icon={TrendingDown}
                  label="Interest saved"
                  value="₹6.8L"
                  sub={`of ${inrCompact(DATA.baselineInterest)} baseline`}
                  accent={C.emerald}
                />
                <PlanStat
                  icon={Clock3}
                  label="Time saved"
                  value="5 yrs"
                  sub="60 months sooner"
                  accent={C.amber}
                />
                <PlanStat
                  icon={Coins}
                  label="New total interest"
                  value="₹20.3L"
                  sub={`net principal ${inrCompact(DATA.principal)}`}
                  accent={C.rose}
                />
              </div>
            </div>

            {/* Projection */}
            <div
              className="mt-4 rounded-2xl p-6"
              style={{ background: "#fff", border: `1px solid ${C.border}` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[15px] font-semibold">Your payoff journey</div>
                  <div className="text-[13px]" style={{ color: C.muted }}>
                    Balance over time — standard vs your accelerated plan
                  </div>
                </div>
                <div className="flex items-center gap-5 text-[12px]">
                  <span className="flex items-center gap-2" style={{ color: C.muted }}>
                    <span className="inline-block h-0.5 w-5" style={{ background: C.muted, borderTop: `2px dashed ${C.muted}` }} />
                    Standard
                  </span>
                  <span className="flex items-center gap-2" style={{ color: C.text }}>
                    <span className="inline-block h-1 w-5 rounded" style={{ background: C.emerald }} />
                    Your plan
                  </span>
                </div>
              </div>
              <div className="mt-5">
                <PayoffChart />
              </div>
            </div>

            {/* Comparison strip */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div
                className="rounded-2xl p-5"
                style={{ background: "#fff", border: `1px solid ${C.border}` }}
              >
                <div className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
                  Standard plan
                </div>
                <div className="mt-3 space-y-2.5">
                  <CompareRow label="Total interest" value={inrCompact(DATA.baselineInterest)} color={C.muted} />
                  <CompareRow label="Total paid" value={inrCompact(DATA.principal + DATA.baselineInterest)} color={C.muted} />
                  <CompareRow label="Debt-free" value={DATA.standardPayoff} color={C.muted} />
                </div>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full" style={{ background: C.border }}>
                  <div className="h-full rounded-full" style={{ width: "100%", background: C.muted }} />
                </div>
              </div>
              <div
                className="rounded-2xl p-5"
                style={{ background: C.emeraldSoft, border: `1.5px solid ${C.emerald}` }}
              >
                <div className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: C.emerald }}>
                  Your accelerated plan
                </div>
                <div className="mt-3 space-y-2.5">
                  <CompareRow label="Total interest" value={inrCompact(DATA.newInterest)} color={C.text} strong />
                  <CompareRow label="Total paid" value={inrCompact(DATA.principal + DATA.newInterest)} color={C.text} strong />
                  <CompareRow label="Debt-free" value={DATA.acceleratedPayoff} color={C.text} strong />
                </div>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full" style={{ background: "#bbf7d0" }}>
                  <div className="h-full rounded-full" style={{ width: "75%", background: C.emerald }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 4 — schedule (collapsed) */}
        <section className="ml-[60px]">
          <button
            onClick={() => setScheduleOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-2xl px-6 py-4 transition-all"
            style={{ background: "#fff", border: `1px solid ${C.border}` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: C.indigoSoft }}
              >
                <CalendarRange className="h-4.5 w-4.5" style={{ color: C.indigo }} />
              </div>
              <div className="text-left">
                <div className="text-[15px] font-semibold">View full repayment schedule</div>
                <div className="text-[13px]" style={{ color: C.muted }}>
                  Year-by-year breakdown of EMI, extra payments &amp; balance
                </div>
              </div>
            </div>
            {scheduleOpen ? (
              <ChevronDown className="h-5 w-5" style={{ color: C.muted }} />
            ) : (
              <ChevronRight className="h-5 w-5" style={{ color: C.muted }} />
            )}
          </button>

          {scheduleOpen && (
            <div
              className="mt-3 overflow-hidden rounded-2xl"
              style={{ background: "#fff", border: `1px solid ${C.border}` }}
            >
              <table className="w-full">
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: `1px solid ${C.border}` }}>
                    <th className="py-3 pl-5 pr-3 text-left text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
                      Period
                    </th>
                    <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
                      EMI paid
                    </th>
                    <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
                      Extra
                    </th>
                    <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
                      Interest
                    </th>
                    <th className="px-3 py-3 pr-5 text-right text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((r) => (
                    <ScheduleRow key={r.year} {...r} />
                  ))}
                </tbody>
              </table>
              <div className="px-5 py-3 text-[12px]" style={{ color: C.muted, background: "#f8fafc" }}>
                Selected milestone years shown · loan fully repaid by{" "}
                <strong style={{ color: C.emerald }}>{DATA.acceleratedPayoff}</strong>
              </div>
            </div>
          )}
        </section>

        {/* Footer CTA */}
        <div className="ml-[60px] mt-8 flex items-center gap-3">
          <Button
            className="h-12 gap-2 rounded-xl px-6 text-[15px] font-semibold text-white"
            style={{ background: C.indigo }}
          >
            Lock in this plan
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-12 gap-2 rounded-xl px-5 text-[15px]"
            style={{ borderColor: C.border, color: C.text, background: "#fff" }}
          >
            <Pencil className="h-4 w-4" />
            Adjust loan details
          </Button>
        </div>
      </main>
    </div>
  );
}

function CompareRow({
  label,
  value,
  color,
  strong,
}: {
  label: string;
  value: string;
  color: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px]" style={{ color: C.muted }}>
        {label}
      </span>
      <span
        className="text-[14px]"
        style={{ fontFamily: mono, color, fontWeight: strong ? 700 : 500 }}
      >
        {value}
      </span>
    </div>
  );
}
