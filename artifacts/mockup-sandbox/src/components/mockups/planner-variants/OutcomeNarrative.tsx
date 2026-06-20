import React, { useState } from "react";
import "./_group.css";
import {
  ArrowDown,
  CalendarCheck,
  Sparkles,
  TrendingDown,
  Clock,
  Wallet,
  PiggyBank,
  Coins,
  Rocket,
  Flame,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Pencil,
  ArrowRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ----------------------------------------------------------------------------
   Smart Loan Saver — "Outcome-Led Narrative"
   The planner as a coach: payoff first, the spreadsheet last.
---------------------------------------------------------------------------- */

const INK = "#0f172a";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";
const BG = "#f8fafc";
const INDIGO = "#4f46e5";
const EMERALD = "#10b981";
const AMBER = "#f59e0b";
const ROSE = "#f43f5e";

const sans = { fontFamily: "'Outfit', system-ui, sans-serif" };
const mono = { fontFamily: "'Space Mono', ui-monospace, monospace" };

const LOAN = {
  principal: 2500000,
  rate: 8.5,
  tenureYears: 20,
  tenureMonths: 240,
  baseEmi: 21696,
  extra: 5000,
  baselineInterest: 2710000,
  newInterest: 2030000,
  interestSaved: 680000,
  monthsSaved: 60,
  yearsSaved: 5,
  newTenureYears: 15,
  start: "June 2026",
  standardPayoff: "June 2046",
  acceleratedPayoff: "June 2041",
};

function compactRupee(v: number) {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
}
function fullRupee(v: number) {
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
}

/* ============================ HERO ============================ */
function Hero() {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(120% 120% at 80% -10%, rgba(16,185,129,0.10) 0%, rgba(16,185,129,0) 45%), radial-gradient(120% 120% at 0% 0%, rgba(79,70,229,0.07) 0%, rgba(79,70,229,0) 40%), #ffffff",
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      {/* soft grid texture */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(to right, rgba(15,23,42,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.025) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(70% 70% at 50% 30%, black 0%, transparent 100%)",
        }}
      />
      <div
        style={{
          position: "relative",
          maxWidth: 1500,
          margin: "0 auto",
          padding: "56px 64px 64px",
        }}
      >
        {/* top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 56,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                background: INDIGO,
                display: "grid",
                placeItems: "center",
                boxShadow: "0 8px 20px rgba(79,70,229,0.35)",
              }}
            >
              <PiggyBank size={20} color="#fff" />
            </div>
            <div>
              <div style={{ ...sans, fontWeight: 700, color: INK, fontSize: 16, lineHeight: 1 }}>
                Smart Loan Saver
              </div>
              <div style={{ ...sans, color: MUTED, fontSize: 12, marginTop: 3 }}>
                by RinMukti
              </div>
            </div>
          </div>
          <div
            style={{
              ...sans,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(16,185,129,0.10)",
              border: `1px solid rgba(16,185,129,0.25)`,
              color: "#047857",
              padding: "7px 14px",
              borderRadius: 999,
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            <Sparkles size={14} /> Active plan · paying ₹5,000 extra / month
          </div>
        </div>

        {/* eyebrow */}
        <div
          style={{
            ...sans,
            color: EMERALD,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontSize: 13,
            marginBottom: 18,
          }}
        >
          Here&apos;s your payoff
        </div>

        {/* Headline */}
        <h1
          style={{
            ...sans,
            color: INK,
            fontWeight: 800,
            fontSize: 56,
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            maxWidth: 1180,
            margin: 0,
          }}
        >
          You&apos;ll save{" "}
          <span style={{ color: EMERALD }}>₹6.8&nbsp;Lakh</span> and be{" "}
          <span style={{ color: INDIGO }}>debt-free 5&nbsp;years sooner.</span>
        </h1>
        <p
          style={{
            ...sans,
            color: MUTED,
            fontSize: 19,
            lineHeight: 1.5,
            maxWidth: 720,
            marginTop: 20,
          }}
        >
          On your ₹25,00,000 home loan at 8.5%, a small ₹5,000 monthly top-up
          rewrites the whole story. Here&apos;s exactly what it does for you.
        </p>

        {/* Two hero numbers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 28,
            marginTop: 48,
            maxWidth: 1000,
          }}
        >
          <HeroStat
            accent={EMERALD}
            bg="rgba(16,185,129,0.06)"
            icon={<TrendingDown size={22} color={EMERALD} />}
            label="Total interest you save"
            value="₹6.8L"
            sub="₹6,80,000 that stays in your pocket"
          />
          <HeroStat
            accent={INDIGO}
            bg="rgba(79,70,229,0.06)"
            icon={<Clock size={22} color={INDIGO} />}
            label="Time you cut off the loan"
            value="5 years"
            sub="60 EMIs you simply never pay"
          />
        </div>

        {/* debt-free marker */}
        <div
          style={{
            marginTop: 36,
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            background: "#fff",
            border: `1px solid ${BORDER}`,
            borderRadius: 16,
            padding: "16px 22px",
            boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: "rgba(16,185,129,0.12)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <CalendarCheck size={22} color={EMERALD} />
          </div>
          <div>
            <div style={{ ...sans, fontSize: 13, color: MUTED }}>
              Your new debt-free date
            </div>
            <div style={{ ...sans, fontSize: 22, fontWeight: 700, color: INK }}>
              June 2041{" "}
              <span
                style={{
                  ...sans,
                  fontSize: 13,
                  fontWeight: 600,
                  color: MUTED,
                  textDecoration: "line-through",
                  marginLeft: 8,
                }}
              >
                June 2046
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            ...sans,
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: MUTED,
            fontSize: 13,
            marginTop: 44,
          }}
        >
          <ArrowDown size={15} /> Scroll to see how your money works
        </div>
      </div>
    </section>
  );
}

function HeroStat({
  accent,
  bg,
  icon,
  label,
  value,
  sub,
}: {
  accent: string;
  bg: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        background: "#fff",
        border: `1px solid ${BORDER}`,
        borderRadius: 20,
        padding: "28px 32px",
        boxShadow: "0 12px 34px rgba(15,23,42,0.05)",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 5,
          background: accent,
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: bg,
            display: "grid",
            placeItems: "center",
          }}
        >
          {icon}
        </div>
        <div style={{ ...sans, fontSize: 15, fontWeight: 600, color: MUTED }}>
          {label}
        </div>
      </div>
      <div
        style={{
          ...sans,
          fontWeight: 800,
          fontSize: 84,
          lineHeight: 1,
          color: accent,
          letterSpacing: "-0.03em",
          marginTop: 18,
        }}
      >
        {value}
      </div>
      <div style={{ ...sans, fontSize: 15, color: MUTED, marginTop: 12 }}>
        {sub}
      </div>
    </div>
  );
}

/* ===================== SECTION: HOW YOUR MONEY WORKS ===================== */

function PayoffCurve() {
  // Build two declining balance curves over 20 years.
  const W = 920;
  const H = 320;
  const padL = 16;
  const padB = 28;
  const years = 20;
  const points = (payoffYear: number) =>
    Array.from({ length: years + 1 }, (_, i) => {
      const t = i / years;
      // accelerated curve bends to zero earlier; use eased decline
      const frac = Math.min(1, i / payoffYear);
      const bal = LOAN.principal * (1 - Math.pow(frac, 1.35));
      return { x: t, y: Math.max(0, bal) };
    });

  const std = points(20);
  const acc = points(15);

  const sx = (x: number) => padL + x * (W - padL * 2);
  const sy = (y: number) =>
    (H - padB) - (y / LOAN.principal) * (H - padB - 12);

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(" ");

  const toArea = (pts: { x: number; y: number }[]) =>
    `${toPath(pts)} L${sx(pts[pts.length - 1].x).toFixed(1)},${(H - padB).toFixed(1)} L${sx(pts[0].x).toFixed(1)},${(H - padB).toFixed(1)} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <defs>
        <linearGradient id="accFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={EMERALD} stopOpacity="0.20" />
          <stop offset="100%" stopColor={EMERALD} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map((g) => {
        const y = (H - padB) - g * (H - padB - 12);
        return (
          <g key={g}>
            <line x1={padL} y1={y} x2={W - padL} y2={y} stroke={BORDER} strokeWidth={1} />
            <text x={padL} y={y - 6} fontSize={11} fill={MUTED} style={mono}>
              {compactRupee(LOAN.principal * g)}
            </text>
          </g>
        );
      })}
      {/* standard area outline */}
      <path d={toPath(std)} fill="none" stroke={ROSE} strokeWidth={2.5} strokeDasharray="5 5" />
      {/* accelerated */}
      <path d={toArea(acc)} fill="url(#accFill)" />
      <path d={toPath(acc)} fill="none" stroke={EMERALD} strokeWidth={3} />

      {/* debt-free markers */}
      <g>
        <circle cx={sx(15 / 20)} cy={sy(0)} r={6} fill={EMERALD} stroke="#fff" strokeWidth={2.5} />
        <line x1={sx(15 / 20)} y1={sy(0)} x2={sx(15 / 20)} y2={20} stroke={EMERALD} strokeWidth={1.5} strokeDasharray="3 3" />
        <text x={sx(15 / 20)} y={14} fontSize={12} fill="#047857" textAnchor="middle" style={{ ...sans, fontWeight: 700 }}>
          2041 · debt-free
        </text>
      </g>
      <g>
        <circle cx={sx(1)} cy={sy(0)} r={5} fill={ROSE} stroke="#fff" strokeWidth={2} />
        <text x={sx(1) - 6} y={sy(0) - 12} fontSize={11} fill={ROSE} textAnchor="end" style={{ ...sans, fontWeight: 600 }}>
          2046
        </text>
      </g>

      {/* x labels */}
      {[0, 5, 10, 15, 20].map((yr) => (
        <text
          key={yr}
          x={sx(yr / 20)}
          y={H - 8}
          fontSize={11}
          fill={MUTED}
          textAnchor="middle"
          style={mono}
        >
          {2026 + yr}
        </text>
      ))}
    </svg>
  );
}

function CostBar({
  label,
  principal,
  interest,
  total,
  accent,
  dim,
}: {
  label: string;
  principal: number;
  interest: number;
  total: number;
  accent: string;
  dim?: boolean;
}) {
  const max = LOAN.principal + LOAN.baselineInterest;
  const pPct = (principal / max) * 100;
  const iPct = (interest / max) * 100;
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ ...sans, fontSize: 14, fontWeight: 600, color: INK }}>{label}</span>
        <span style={{ ...mono, fontSize: 14, fontWeight: 700, color: INK }}>{fullRupee(total)}</span>
      </div>
      <div
        style={{
          display: "flex",
          height: 26,
          borderRadius: 8,
          overflow: "hidden",
          background: "#f1f5f9",
        }}
      >
        <div style={{ width: `${pPct}%`, background: dim ? "#94a3b8" : INDIGO }} />
        <div style={{ width: `${iPct}%`, background: accent }} />
      </div>
      <div style={{ display: "flex", gap: 18, marginTop: 7 }}>
        <span style={{ ...sans, fontSize: 12, color: MUTED }}>
          Principal {compactRupee(principal)}
        </span>
        <span style={{ ...sans, fontSize: 12, color: accent, fontWeight: 600 }}>
          Interest {compactRupee(interest)}
        </span>
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <section style={{ background: BG, borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ maxWidth: 1500, margin: "0 auto", padding: "72px 64px" }}>
        <SectionHeading
          step="01"
          kicker="How your money works"
          title="Your balance falls off a cliff — five years early."
          desc="The dashed red line is the standard 20-year plan. The solid green is your accelerated plan. Every rupee of extra EMI attacks principal directly, so interest stops compounding sooner."
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.55fr 1fr",
            gap: 32,
            marginTop: 44,
            alignItems: "stretch",
          }}
        >
          <Panel>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ ...sans, fontSize: 17, fontWeight: 700, color: INK, margin: 0 }}>
                Outstanding balance over time
              </h3>
              <div style={{ display: "flex", gap: 18 }}>
                <LegendDot color={ROSE} label="Standard" dashed />
                <LegendDot color={EMERALD} label="Accelerated" />
              </div>
            </div>
            <PayoffCurve />
          </Panel>

          <Panel>
            <h3 style={{ ...sans, fontSize: 17, fontWeight: 700, color: INK, margin: "0 0 22px" }}>
              Where the money goes
            </h3>
            <CostBar
              label="Standard plan"
              principal={LOAN.principal}
              interest={LOAN.baselineInterest}
              total={LOAN.principal + LOAN.baselineInterest}
              accent={ROSE}
              dim
            />
            <CostBar
              label="Your accelerated plan"
              principal={LOAN.principal}
              interest={LOAN.newInterest}
              total={LOAN.principal + LOAN.newInterest}
              accent={EMERALD}
            />
            <div
              style={{
                marginTop: 18,
                padding: "16px 18px",
                borderRadius: 12,
                background: "rgba(16,185,129,0.07)",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <div style={{ ...sans, fontSize: 13, color: "#047857", fontWeight: 600 }}>
                Interest dropped by
              </div>
              <div style={{ ...mono, fontSize: 26, fontWeight: 700, color: "#047857", marginTop: 4 }}>
                ₹6,80,000
              </div>
              <div style={{ ...sans, fontSize: 13, color: MUTED, marginTop: 4 }}>
                from {compactRupee(LOAN.baselineInterest)} down to {compactRupee(LOAN.newInterest)} in interest paid.
              </div>
            </div>
          </Panel>
        </div>

        {/* quick facts strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 24,
            marginTop: 32,
          }}
        >
          <MiniFact icon={<Wallet size={18} color={INDIGO} />} label="Monthly EMI" value="₹21,696" note="+ ₹5,000 extra" />
          <MiniFact icon={<Coins size={18} color={INDIGO} />} label="Net principal" value="₹25.0L" note="Original loan amount" />
          <MiniFact icon={<TrendingDown size={18} color={EMERALD} />} label="New total interest" value="₹20.3L" note="was ₹27.1L" />
          <MiniFact icon={<CalendarCheck size={18} color={EMERALD} />} label="New tenure" value="15 yrs" note="down from 20 yrs" />
        </div>
      </div>
    </section>
  );
}

function MiniFact({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${BORDER}`,
        borderRadius: 14,
        padding: "18px 20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: "#f1f5f9", display: "grid", placeItems: "center" }}>
          {icon}
        </div>
        <span style={{ ...sans, fontSize: 13, color: MUTED, fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ ...mono, fontSize: 24, fontWeight: 700, color: INK }}>{value}</div>
      <div style={{ ...sans, fontSize: 12, color: MUTED, marginTop: 3 }}>{note}</div>
    </div>
  );
}

/* ===================== SECTION: WAYS TO GET THERE ===================== */

const STRATEGIES = [
  {
    title: "1 Extra EMI / Year",
    icon: CalendarCheck,
    color: INDIGO,
    desc: "Pay one bonus EMI each year — perfect for an annual bonus.",
    save: "₹5.1L",
    time: "3 yr 3 mo",
    detail: "₹21,696 / year",
  },
  {
    title: "Micro-Savings (₹5/day)",
    icon: PiggyBank,
    color: EMERALD,
    desc: "Round up daily spends. Tiny habit, surprising payoff.",
    save: "₹1.9L",
    time: "1 yr 6 mo",
    detail: "+ ₹150 / month",
  },
  {
    title: "10% Monthly Boost",
    icon: Rocket,
    color: AMBER,
    desc: "Add 10% to every EMI. Steady, automatic acceleration.",
    save: "₹4.0L",
    time: "2 yr 9 mo",
    detail: "+ ₹2,170 / month",
  },
  {
    title: "Super-Saver Combo",
    icon: Flame,
    color: ROSE,
    desc: "Extra monthly + a yearly top-up. The fastest route out.",
    save: "₹9.3L",
    time: "6 yr 2 mo",
    detail: "+ ₹5,000/mo · ₹21,696/yr",
  },
];

function WaysToGetThere() {
  const [active, setActive] = useState(3);
  return (
    <section style={{ background: "#fff", borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ maxWidth: 1500, margin: "0 auto", padding: "72px 64px" }}>
        <SectionHeading
          step="02"
          kicker="Ways to get there"
          title="Pick the path that fits your life."
          desc="Your current plan (₹5,000 extra/month) already saves ₹6.8L. Here are other strategies — switch any time and we'll recalculate instantly."
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 24,
            marginTop: 44,
          }}
        >
          {STRATEGIES.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === active;
            return (
              <button
                key={s.title}
                onClick={() => setActive(i)}
                style={{
                  textAlign: "left",
                  cursor: "pointer",
                  background: isActive ? "#fff" : "#fff",
                  border: `1.5px solid ${isActive ? s.color : BORDER}`,
                  borderRadius: 18,
                  padding: "26px 24px",
                  boxShadow: isActive
                    ? `0 16px 36px ${s.color}22`
                    : "0 4px 14px rgba(15,23,42,0.03)",
                  transition: "all 0.15s ease",
                  position: "relative",
                }}
              >
                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      ...sans,
                      fontSize: 11,
                      fontWeight: 700,
                      color: s.color,
                      background: `${s.color}14`,
                      padding: "4px 9px",
                      borderRadius: 999,
                    }}
                  >
                    <Check size={12} /> Selected
                  </div>
                )}
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 13,
                    background: `${s.color}14`,
                    display: "grid",
                    placeItems: "center",
                    marginBottom: 18,
                  }}
                >
                  <Icon size={23} color={s.color} />
                </div>
                <div style={{ ...sans, fontSize: 17, fontWeight: 700, color: INK, marginBottom: 8 }}>
                  {s.title}
                </div>
                <div style={{ ...sans, fontSize: 13.5, color: MUTED, lineHeight: 1.5, minHeight: 60 }}>
                  {s.desc}
                </div>
                <div
                  style={{
                    marginTop: 18,
                    paddingTop: 16,
                    borderTop: `1px solid ${BORDER}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                  }}
                >
                  <div>
                    <div style={{ ...sans, fontSize: 11, color: MUTED, marginBottom: 3 }}>You save</div>
                    <div style={{ ...mono, fontSize: 24, fontWeight: 700, color: s.color }}>{s.save}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ ...sans, fontSize: 11, color: MUTED, marginBottom: 3 }}>Sooner by</div>
                    <div style={{ ...mono, fontSize: 14, fontWeight: 700, color: INK }}>{s.time}</div>
                  </div>
                </div>
                <div style={{ ...sans, fontSize: 11.5, color: MUTED, marginTop: 12 }}>{s.detail}</div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ===================== ADJUST YOUR PLAN (calm config) ===================== */

function AdjustPlan() {
  return (
    <section style={{ background: BG, borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ maxWidth: 1500, margin: "0 auto", padding: "64px 64px" }}>
        <Panel>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              gap: 36,
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 13,
                  background: "rgba(79,70,229,0.10)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Pencil size={22} color={INDIGO} />
              </div>
              <div>
                <div style={{ ...sans, fontSize: 18, fontWeight: 700, color: INK }}>
                  Adjust your plan
                </div>
                <div style={{ ...sans, fontSize: 13, color: MUTED, marginTop: 2 }}>
                  Tweak the inputs — the story above updates live.
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 18,
              }}
            >
              <ConfigField label="Loan amount" value="₹25,00,000" />
              <ConfigField label="Interest rate" value="8.5% p.a." />
              <ConfigField label="Tenure" value="20 years" />
              <ConfigField label="EMI starts" value="June 2026" />
              <ConfigField label="Extra / month" value="₹5,000" accent={EMERALD} />
            </div>

            <Button
              style={{
                ...sans,
                background: INDIGO,
                color: "#fff",
                fontWeight: 600,
                fontSize: 14,
                padding: "0 22px",
                height: 46,
                borderRadius: 12,
                whiteSpace: "nowrap",
              }}
            >
              Recalculate <ArrowRight size={16} style={{ marginLeft: 6 }} />
            </Button>
          </div>

          <div
            style={{
              marginTop: 26,
              paddingTop: 22,
              borderTop: `1px solid ${BORDER}`,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Badge
              style={{
                ...sans,
                background: "rgba(245,158,11,0.12)",
                color: "#b45309",
                border: "none",
                fontWeight: 600,
                fontSize: 12,
                padding: "5px 11px",
                borderRadius: 999,
              }}
            >
              Reverse calculator
            </Badge>
            <span style={{ ...sans, fontSize: 13.5, color: MUTED }}>
              Want to be debt-free by a target date instead?{" "}
              <span style={{ color: INDIGO, fontWeight: 600 }}>
                Tell us the year — we&apos;ll find the extra EMI you need.
              </span>
            </span>
          </div>
        </Panel>
      </div>
    </section>
  );
}

function ConfigField({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        background: BG,
        border: `1px solid ${BORDER}`,
        borderRadius: 12,
        padding: "12px 14px",
      }}
    >
      <div style={{ ...sans, fontSize: 11.5, color: MUTED, marginBottom: 5 }}>{label}</div>
      <div style={{ ...mono, fontSize: 15, fontWeight: 700, color: accent ?? INK }}>{value}</div>
    </div>
  );
}

/* ===================== FINE PRINT: AMORTIZATION ===================== */

const SCHEDULE = [
  { year: "2026", emi: 151872, principal: 76200, interest: 75672, extra: 35000, balance: 2388800 },
  { year: "2027", emi: 260352, principal: 142800, interest: 117552, extra: 60000, balance: 2186000 },
  { year: "2028", emi: 260352, principal: 155300, interest: 105052, extra: 60000, balance: 1970700 },
  { year: "2029", emi: 260352, principal: 168900, interest: 91452, extra: 60000, balance: 1741800 },
  { year: "2030", emi: 260352, principal: 183700, interest: 76652, extra: 60000, balance: 1498100 },
  { year: "2031", emi: 260352, principal: 199700, interest: 60652, extra: 60000, balance: 1238400 },
  { year: "2032", emi: 260352, principal: 217100, interest: 43252, extra: 60000, balance: 961300 },
  { year: "2033", emi: 260352, principal: 236100, interest: 24252, extra: 60000, balance: 665200 },
  { year: "2034", emi: 260352, principal: 256600, interest: 3752, extra: 60000, balance: 348600 },
  { year: "2035", emi: 260352, principal: 268900, interest: 1450, extra: 60000, balance: 79700 },
];

function FinePrint() {
  const [open, setOpen] = useState(false);
  return (
    <section style={{ background: "#fff" }}>
      <div style={{ maxWidth: 1500, margin: "0 auto", padding: "72px 64px 96px" }}>
        <SectionHeading
          step="03"
          kicker="The fine print"
          title="Every rupee, year by year."
          desc="The full amortization schedule for your accelerated plan. Nothing hidden — see exactly how principal, interest and your extra payments move the balance each year."
        />

        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            marginTop: 36,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            ...sans,
            cursor: "pointer",
            background: open ? "#fff" : INDIGO,
            color: open ? INDIGO : "#fff",
            border: `1.5px solid ${INDIGO}`,
            borderRadius: 12,
            padding: "12px 22px",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          {open ? "Hide full schedule" : "See full schedule"}
        </button>

        {open && (
          <Panel style={{ marginTop: 28, padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: BG }}>
                  {["Year", "EMIs paid", "Principal", "Interest", "Extra paid", "Year-end balance"].map((h, i) => (
                    <th
                      key={h}
                      style={{
                        ...sans,
                        textAlign: i === 0 ? "left" : "right",
                        padding: "16px 24px",
                        fontSize: 12,
                        fontWeight: 700,
                        color: MUTED,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        borderBottom: `1px solid ${BORDER}`,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SCHEDULE.map((r, idx) => (
                  <tr
                    key={r.year}
                    style={{
                      background: idx % 2 ? "#fff" : "rgba(248,250,252,0.6)",
                    }}
                  >
                    <td style={{ ...sans, padding: "14px 24px", fontSize: 14, fontWeight: 700, color: INK, borderBottom: `1px solid ${BORDER}` }}>
                      {r.year}
                    </td>
                    <td style={cellNum}>{fullRupee(r.emi)}</td>
                    <td style={{ ...cellNum, color: INDIGO }}>{fullRupee(r.principal)}</td>
                    <td style={{ ...cellNum, color: ROSE }}>{fullRupee(r.interest)}</td>
                    <td style={{ ...cellNum, color: EMERALD }}>{fullRupee(r.extra)}</td>
                    <td style={{ ...cellNum, fontWeight: 700, color: INK }}>{fullRupee(r.balance)}</td>
                  </tr>
                ))}
                <tr style={{ background: "rgba(16,185,129,0.08)" }}>
                  <td style={{ ...sans, padding: "16px 24px", fontSize: 14, fontWeight: 700, color: "#047857" }}>
                    2041
                  </td>
                  <td colSpan={4} style={{ ...sans, padding: "16px 24px", fontSize: 14, fontWeight: 600, color: "#047857" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <CheckCircle2 size={17} /> Loan fully paid off — 5 years ahead of schedule.
                    </span>
                  </td>
                  <td style={{ ...mono, padding: "16px 24px", textAlign: "right", fontSize: 16, fontWeight: 700, color: "#047857" }}>
                    ₹0
                  </td>
                </tr>
              </tbody>
            </table>
          </Panel>
        )}

        {/* closing reassurance */}
        <div
          style={{
            marginTop: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            background: INK,
            borderRadius: 22,
            padding: "40px 48px",
          }}
        >
          <div>
            <div style={{ ...sans, fontSize: 24, fontWeight: 700, color: "#fff" }}>
              Small extra. Big freedom.
            </div>
            <div style={{ ...sans, fontSize: 15, color: "#94a3b8", marginTop: 8, maxWidth: 560 }}>
              ₹5,000 a month is the difference between June 2046 and June 2041 — and ₹6.8 Lakh that&apos;s yours to keep.
            </div>
          </div>
          <Button
            style={{
              ...sans,
              background: EMERALD,
              color: "#022c22",
              fontWeight: 700,
              fontSize: 15,
              padding: "0 26px",
              height: 50,
              borderRadius: 13,
              whiteSpace: "nowrap",
            }}
          >
            Lock in this plan <ArrowRight size={18} style={{ marginLeft: 8 }} />
          </Button>
        </div>
      </div>
    </section>
  );
}

const cellNum: React.CSSProperties = {
  ...mono,
  padding: "14px 24px",
  fontSize: 13.5,
  textAlign: "right",
  color: INK,
  borderBottom: `1px solid ${BORDER}`,
};

/* ===================== SHARED ===================== */

function SectionHeading({
  step,
  kicker,
  title,
  desc,
}: {
  step: string;
  kicker: string;
  title: string;
  desc: string;
}) {
  return (
    <div style={{ maxWidth: 820 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <span
          style={{
            ...mono,
            fontSize: 13,
            fontWeight: 700,
            color: INDIGO,
            background: "rgba(79,70,229,0.08)",
            borderRadius: 8,
            padding: "4px 10px",
          }}
        >
          {step}
        </span>
        <span
          style={{
            ...sans,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: MUTED,
          }}
        >
          {kicker}
        </span>
      </div>
      <h2
        style={{
          ...sans,
          fontSize: 38,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: INK,
          margin: 0,
          lineHeight: 1.12,
        }}
      >
        {title}
      </h2>
      <p style={{ ...sans, fontSize: 17, color: MUTED, lineHeight: 1.55, marginTop: 16 }}>
        {desc}
      </p>
    </div>
  );
}

function Panel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${BORDER}`,
        borderRadius: 20,
        padding: 28,
        boxShadow: "0 8px 28px rgba(15,23,42,0.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function LegendDot({
  color,
  label,
  dashed,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
      <span
        style={{
          width: 22,
          height: 0,
          borderTop: `3px ${dashed ? "dashed" : "solid"} ${color}`,
        }}
      />
      <span style={{ ...sans, fontSize: 13, color: MUTED, fontWeight: 500 }}>{label}</span>
    </span>
  );
}

/* ===================== ROOT ===================== */

export function OutcomeNarrative() {
  return (
    <div
      style={{
        ...sans,
        background: BG,
        color: INK,
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <Hero />
      <HowItWorks />
      <WaysToGetThere />
      <AdjustPlan />
      <FinePrint />
    </div>
  );
}

export default OutcomeNarrative;
