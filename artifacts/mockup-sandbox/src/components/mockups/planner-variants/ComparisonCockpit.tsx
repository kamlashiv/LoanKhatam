import "./_group.css";
import React from "react";
import {
  Building2,
  Rocket,
  TrendingDown,
  CalendarClock,
  Coins,
  Wallet,
  ArrowRight,
  Sparkles,
  Calculator,
  Percent,
  IndianRupee,
  CalendarDays,
  Timer,
  PiggyBank,
  Flame,
  CalendarPlus,
  Zap,
  Check,
  Repeat,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Palette                                                             */
/* ------------------------------------------------------------------ */
const C = {
  bg: "#f8fafc",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  card: "#ffffff",
  indigo: "#4f46e5",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  roseDeep: "#e11d48",
  slate400: "#94a3b8",
  slate200: "#e2e8f0",
  slate100: "#f1f5f9",
};

const mono = "'Space Mono', Menlo, monospace";
const sans = "'Outfit', sans-serif";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
function inr(val: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}
function compact(val: number) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
}

/* ------------------------------------------------------------------ */
/* Scenario data (illustrative, internally consistent)                */
/* ------------------------------------------------------------------ */
const DATA = {
  principal: 2500000,
  rate: 8.5,
  tenureMonths: 240,
  baseEMI: 21696,
  extra: 5000,
  start: "June 2026",
  std: {
    emi: 21696,
    interest: 2710000,
    total: 5210000,
    payoffYears: 20,
    payoffDate: "June 2046",
    months: 240,
  },
  acc: {
    emi: 26696,
    interest: 2030000,
    total: 4530000,
    payoffYears: 15,
    payoffDate: "June 2041",
    months: 180,
  },
  interestSaved: 680000,
  monthsSaved: 60,
  yearsSaved: 5,
};

/* ------------------------------------------------------------------ */
/* Top control bar                                                    */
/* ------------------------------------------------------------------ */
function ControlField({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 14px",
        borderRadius: 12,
        background: C.slate100,
        border: `1px solid ${C.border}`,
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          flexShrink: 0,
          borderRadius: 8,
          background: "#fff",
          border: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={15} color={C.indigo} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: ".06em",
            textTransform: "uppercase",
            color: C.muted,
            fontWeight: 600,
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: mono }}>
          {value}
          {hint && (
            <span style={{ fontSize: 11, color: C.muted, marginLeft: 4, fontFamily: sans }}>
              {hint}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ControlBar() {
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: 16,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingRight: 6 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: C.indigo,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Calculator size={20} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Loan configuration</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Home Loan · HDFC</div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, flex: 1, minWidth: 0 }}>
        <ControlField icon={IndianRupee} label="Loan amount" value="₹25,00,000" />
        <ControlField icon={Percent} label="Interest rate" value="8.5%" hint="p.a." />
        <ControlField icon={CalendarDays} label="Tenure" value="20 yrs" hint="240 mo" />
        <ControlField icon={CalendarPlus} label="EMI starts" value="Jun 2026" />
        <ControlField icon={Zap} label="Extra / month" value="₹5,000" />
        <ControlField icon={CalendarClock} label="Annual top-up" value="—" />
      </div>

      <button
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 16px",
          borderRadius: 12,
          background: "#fff",
          border: `1px solid ${C.border}`,
          color: C.text,
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: sans,
        }}
      >
        <Repeat size={15} color={C.indigo} />
        Reverse calculator
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Side header                                                        */
/* ------------------------------------------------------------------ */
function SideHeader({
  side,
  icon: Icon,
  title,
  subtitle,
}: {
  side: "std" | "acc";
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  const accent = side === "std" ? C.rose : C.emerald;
  const bg = side === "std" ? "rgba(244,63,94,0.06)" : "rgba(16,185,129,0.06)";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 18px",
        borderRadius: 14,
        background: bg,
        border: `1px solid ${side === "std" ? "rgba(244,63,94,0.2)" : "rgba(16,185,129,0.2)"}`,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={21} color="#fff" />
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{title}</div>
        <div style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{subtitle}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Metric row: std value | delta | acc value                          */
/* ------------------------------------------------------------------ */
function MetricRow({
  icon: Icon,
  label,
  stdValue,
  accValue,
  delta,
  deltaGood,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  stdValue: string;
  accValue: string;
  delta: string;
  deltaGood?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 150px 1fr",
        alignItems: "stretch",
        gap: 0,
      }}
    >
      {/* Standard side */}
      <div
        style={{
          padding: "14px 18px",
          background: "#fff",
          border: `1px solid ${C.border}`,
          borderRight: "none",
          borderTopLeftRadius: 12,
          borderBottomLeftRadius: 12,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Icon size={14} color={C.muted} />
          <span style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>
            {label}
          </span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: mono }}>{stdValue}</div>
      </div>

      {/* Delta gutter */}
      <div
        style={{
          background: deltaGood ? C.emerald : C.slate100,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          borderTop: `1px solid ${deltaGood ? C.emerald : C.border}`,
          borderBottom: `1px solid ${deltaGood ? C.emerald : C.border}`,
        }}
      >
        <ArrowRight size={14} color={deltaGood ? "rgba(255,255,255,0.8)" : C.muted} />
        <div
          style={{
            fontSize: 15,
            fontWeight: 800,
            fontFamily: mono,
            color: deltaGood ? "#fff" : C.muted,
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          {delta}
        </div>
      </div>

      {/* Accelerated side */}
      <div
        style={{
          padding: "14px 18px",
          background: highlight ? "rgba(16,185,129,0.07)" : "#fff",
          border: `1px solid ${highlight ? "rgba(16,185,129,0.3)" : C.border}`,
          borderLeft: "none",
          borderTopRightRadius: 12,
          borderBottomRightRadius: 12,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-end",
          textAlign: "right",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>
            {label}
          </span>
          <Icon size={14} color={highlight ? C.emerald : C.muted} />
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: highlight ? C.emerald : C.text, fontFamily: mono }}>
          {accValue}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Overlaid payoff projection chart (SVG)                             */
/* ------------------------------------------------------------------ */
function ProjectionChart() {
  const W = 1000;
  const H = 320;
  const padL = 56;
  const padR = 24;
  const padT = 20;
  const padB = 36;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const years = 20;
  const maxBal = 2500000;

  // standard balance curve (declining over 20 years, convex)
  const stdPts: [number, number][] = [];
  const accPts: [number, number][] = [];
  for (let y = 0; y <= years; y++) {
    const t = y / years;
    // standard: remaining balance with interest-heavy early years
    const stdBal = maxBal * Math.pow(1 - t, 1.55);
    stdPts.push([y, stdBal]);
    // accelerated: hits zero at year 15
    const at = Math.min(y / 15, 1);
    const accBal = y <= 15 ? maxBal * Math.pow(1 - at, 1.4) : 0;
    accPts.push([y, accBal]);
  }

  const xScale = (y: number) => padL + (y / years) * plotW;
  const yScale = (b: number) => padT + (1 - b / maxBal) * plotH;

  const toPath = (pts: [number, number][]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(p[0]).toFixed(1)} ${yScale(p[1]).toFixed(1)}`).join(" ");

  const toArea = (pts: [number, number][]) => {
    const line = pts.map((p) => `L ${xScale(p[0]).toFixed(1)} ${yScale(p[1]).toFixed(1)}`).join(" ");
    return `M ${xScale(pts[0][0]).toFixed(1)} ${yScale(0).toFixed(1)} ${line} L ${xScale(
      pts[pts.length - 1][0]
    ).toFixed(1)} ${yScale(0).toFixed(1)} Z`;
  };

  const yTicks = [0, 625000, 1250000, 1875000, 2500000];

  return (
    <div style={{ width: "100%" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          <linearGradient id="stdGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.rose} stopOpacity="0.22" />
            <stop offset="100%" stopColor={C.rose} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.emerald} stopOpacity="0.28" />
            <stop offset="100%" stopColor={C.emerald} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* grid + y labels */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={padL}
              y1={yScale(t)}
              x2={W - padR}
              y2={yScale(t)}
              stroke={C.border}
              strokeWidth={1}
              strokeDasharray={i === 0 ? "0" : "4 4"}
            />
            <text x={padL - 10} y={yScale(t) + 4} fontSize={11} fill={C.muted} textAnchor="end" fontFamily={mono}>
              {t === 0 ? "₹0" : compact(t)}
            </text>
          </g>
        ))}

        {/* x labels */}
        {[0, 5, 10, 15, 20].map((y) => (
          <text key={y} x={xScale(y)} y={H - 12} fontSize={11} fill={C.muted} textAnchor="middle" fontFamily={mono}>
            Yr {y}
          </text>
        ))}

        {/* areas */}
        <path d={toArea(stdPts)} fill="url(#stdGrad)" />
        <path d={toArea(accPts)} fill="url(#accGrad)" />

        {/* lines */}
        <path d={toPath(stdPts)} fill="none" stroke={C.rose} strokeWidth={3} strokeLinecap="round" />
        <path d={toPath(accPts)} fill="none" stroke={C.emerald} strokeWidth={3} strokeLinecap="round" />

        {/* payoff marker for accelerated at year 15 */}
        <line
          x1={xScale(15)}
          y1={padT}
          x2={xScale(15)}
          y2={yScale(0)}
          stroke={C.emerald}
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />
        <circle cx={xScale(15)} cy={yScale(0)} r={6} fill={C.emerald} stroke="#fff" strokeWidth={2} />
        <circle cx={xScale(20)} cy={yScale(0)} r={6} fill={C.rose} stroke="#fff" strokeWidth={2} />

        {/* debt-free callout */}
        <g>
          <rect x={xScale(15) - 56} y={padT - 4} width={112} height={22} rx={6} fill={C.emerald} />
          <text x={xScale(15)} y={padT + 11} fontSize={11} fontWeight={700} fill="#fff" textAnchor="middle" fontFamily={sans}>
            Debt-free 2041
          </text>
        </g>
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Cost breakdown comparison (stacked horizontal bars)                */
/* ------------------------------------------------------------------ */
function CostBar({
  label,
  principal,
  interest,
  total,
  maxTotal,
  accent,
}: {
  label: string;
  principal: number;
  interest: number;
  total: number;
  maxTotal: number;
  accent: string;
}) {
  const wPct = (total / maxTotal) * 100;
  const pPct = (principal / total) * 100;
  const iPct = (interest / total) * 100;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: mono }}>{compact(total)}</span>
      </div>
      <div
        style={{
          display: "flex",
          height: 30,
          width: `${wPct}%`,
          borderRadius: 8,
          overflow: "hidden",
          border: `1px solid ${C.border}`,
          minWidth: 200,
        }}
      >
        <div
          style={{
            width: `${pPct}%`,
            background: C.indigo,
            display: "flex",
            alignItems: "center",
            paddingLeft: 8,
          }}
        >
          <span style={{ fontSize: 11, color: "#fff", fontWeight: 700, fontFamily: mono }}>{compact(principal)}</span>
        </div>
        <div
          style={{
            width: `${iPct}%`,
            background: accent,
            display: "flex",
            alignItems: "center",
            paddingLeft: 8,
          }}
        >
          <span style={{ fontSize: 11, color: "#fff", fontWeight: 700, fontFamily: mono }}>{compact(interest)}</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Strategy preset card                                               */
/* ------------------------------------------------------------------ */
function StrategyCard({
  icon: Icon,
  title,
  detail,
  saveAmt,
  saveTime,
  active,
}: {
  icon: React.ElementType;
  title: string;
  detail: string;
  saveAmt: string;
  saveTime: string;
  active?: boolean;
}) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 200,
        padding: 16,
        borderRadius: 14,
        background: active ? "rgba(79,70,229,0.05)" : "#fff",
        border: `1.5px solid ${active ? C.indigo : C.border}`,
        position: "relative",
      }}
    >
      {active && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: C.indigo,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Check size={13} color="#fff" />
        </div>
      )}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 9,
          background: C.slate100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <Icon size={18} color={C.indigo} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{title}</div>
      <div style={{ fontSize: 12, color: C.muted, marginTop: 2, marginBottom: 12 }}>{detail}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Coins size={13} color={C.emerald} />
          <span style={{ fontSize: 13, fontWeight: 700, color: C.emerald, fontFamily: mono }}>{saveAmt}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Timer size={13} color={C.amber} />
          <span style={{ fontSize: 12, fontWeight: 600, color: C.muted, fontFamily: mono }}>{saveTime}</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Amortization schedule (both-plan columns + savings)                */
/* ------------------------------------------------------------------ */
const SCHEDULE = [
  { year: "2026", stdBal: 2452000, accBal: 2398000, stdInt: 211000, accInt: 209000, saved: 54000 },
  { year: "2028", stdBal: 2330000, accBal: 2110000, stdInt: 396000, accInt: 388000, saved: 220000 },
  { year: "2031", stdBal: 2068000, accBal: 1540000, stdInt: 980000, accInt: 905000, saved: 528000 },
  { year: "2034", stdBal: 1690000, accBal: 880000, stdInt: 1520000, accInt: 1360000, saved: 810000 },
  { year: "2037", stdBal: 1190000, accBal: 320000, stdInt: 1990000, accInt: 1690000, saved: 870000 },
  { year: "2041", stdBal: 540000, accBal: 0, stdInt: 2450000, accInt: 2030000, saved: 940000 },
  { year: "2046", stdBal: 0, accBal: 0, stdInt: 2710000, accInt: 2030000, saved: 680000 },
];

function ScheduleTable() {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: sans }}>
        <thead>
          <tr>
            <th style={thStyle("left")} rowSpan={2}>
              Year
            </th>
            <th style={{ ...thGroup, color: C.rose }} colSpan={2}>
              Standard plan
            </th>
            <th style={{ ...thGroup, color: C.emerald }} colSpan={2}>
              Accelerated plan
            </th>
            <th style={{ ...thGroup, background: "rgba(16,185,129,0.08)", color: C.emerald }} rowSpan={2}>
              Cumulative saved
            </th>
          </tr>
          <tr>
            <th style={thStyle("right")}>Balance</th>
            <th style={thStyle("right")}>Interest paid</th>
            <th style={thStyle("right")}>Balance</th>
            <th style={thStyle("right")}>Interest paid</th>
          </tr>
        </thead>
        <tbody>
          {SCHEDULE.map((r, i) => (
            <tr key={r.year} style={{ background: i % 2 === 0 ? "#fff" : C.slate100 }}>
              <td style={{ ...tdStyle("left"), fontWeight: 700, color: C.text }}>{r.year}</td>
              <td style={tdStyle("right")}>{r.stdBal === 0 ? "—" : compact(r.stdBal)}</td>
              <td style={{ ...tdStyle("right"), color: C.rose }}>{compact(r.stdInt)}</td>
              <td style={tdStyle("right")}>{r.accBal === 0 ? "✓ Paid" : compact(r.accBal)}</td>
              <td style={{ ...tdStyle("right"), color: C.emerald }}>{compact(r.accInt)}</td>
              <td
                style={{
                  ...tdStyle("right"),
                  fontWeight: 700,
                  color: C.emerald,
                  background: "rgba(16,185,129,0.06)",
                }}
              >
                {compact(r.saved)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thGroup: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: ".06em",
  padding: "10px 14px",
  textAlign: "center",
  borderBottom: `1px solid ${C.border}`,
};
function thStyle(align: "left" | "right"): React.CSSProperties {
  return {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: ".04em",
    color: C.muted,
    padding: "8px 14px",
    textAlign: align,
    borderBottom: `1px solid ${C.border}`,
    fontFamily: sans,
  };
}
function tdStyle(align: "left" | "right"): React.CSSProperties {
  return {
    fontSize: 13,
    padding: "11px 14px",
    textAlign: align,
    color: C.text,
    fontFamily: mono,
    borderBottom: `1px solid ${C.border}`,
  };
}

/* ------------------------------------------------------------------ */
/* Section card wrapper                                                */
/* ------------------------------------------------------------------ */
function Panel({
  title,
  subtitle,
  icon: Icon,
  children,
  right,
}: {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: 24,
        boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: C.slate100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={17} color={C.indigo} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12, color: C.muted }}>{subtitle}</div>}
          </div>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 12, height: 12, borderRadius: 3, background: color, display: "inline-block" }} />
      <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main export                                                        */
/* ------------------------------------------------------------------ */
export function ComparisonCockpit() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: sans,
        color: C.text,
        padding: "28px 36px 60px",
      }}
    >
      <div style={{ maxWidth: 1680, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>
        {/* Top brand row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${C.indigo}, ${C.emerald})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={24} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.01em" }}>Smart Loan Saver</div>
              <div style={{ fontSize: 13, color: C.muted }}>
                Comparison Cockpit · Standard bank plan vs your accelerated plan
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 18px",
              borderRadius: 999,
              background: C.emerald,
              color: "#fff",
            }}
          >
            <TrendingDown size={18} />
            <span style={{ fontSize: 14, fontWeight: 700 }}>
              You save {compact(DATA.interestSaved)} & {DATA.yearsSaved} years
            </span>
          </div>
        </div>

        {/* Control bar */}
        <ControlBar />

        {/* Side headers row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 150px 1fr", gap: 0, alignItems: "stretch" }}>
          <SideHeader
            side="std"
            icon={Building2}
            title="Standard bank plan"
            subtitle="Minimum EMI for the full 20-year tenure"
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: ".1em",
                color: C.muted,
                textAlign: "center",
              }}
            >
              You
              <br />
              save
            </div>
          </div>
          <SideHeader
            side="acc"
            icon={Rocket}
            title="Your accelerated plan"
            subtitle="₹5,000 extra every month · debt-free sooner"
          />
        </div>

        {/* Metric comparison stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <MetricRow
            icon={Wallet}
            label="Effective monthly outflow"
            stdValue="₹21,696"
            accValue="₹26,696"
            delta="+₹5,000/mo"
          />
          <MetricRow
            icon={Coins}
            label="Total interest paid"
            stdValue={compact(DATA.std.interest)}
            accValue={compact(DATA.acc.interest)}
            delta={`−${compact(DATA.interestSaved)}`}
            deltaGood
            highlight
          />
          <MetricRow
            icon={CalendarClock}
            label="Loan-free by"
            stdValue="Jun 2046"
            accValue="Jun 2041"
            delta="−5 years"
            deltaGood
            highlight
          />
          <MetricRow
            icon={IndianRupee}
            label="Total amount repaid"
            stdValue={compact(DATA.std.total)}
            accValue={compact(DATA.acc.total)}
            delta={`−${compact(DATA.interestSaved)}`}
            deltaGood
          />
        </div>

        {/* Projection chart */}
        <Panel
          title="Payoff projection — both curves overlaid"
          subtitle="Outstanding balance over time · the green curve hits zero 5 years earlier"
          icon={TrendingDown}
          right={
            <div style={{ display: "flex", gap: 18 }}>
              <LegendDot color={C.rose} label="Standard balance" />
              <LegendDot color={C.emerald} label="Accelerated balance" />
            </div>
          }
        >
          <ProjectionChart />
        </Panel>

        {/* Cost breakdown + net principal */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 22 }}>
          <Panel
            title="Cost breakdown — head to head"
            subtitle="Principal stays ₹25.0L; the interest block is where you win"
            icon={Coins}
            right={
              <div style={{ display: "flex", gap: 18 }}>
                <LegendDot color={C.indigo} label="Principal" />
                <LegendDot color={C.rose} label="Std interest" />
                <LegendDot color={C.emerald} label="Acc interest" />
              </div>
            }
          >
            <div style={{ paddingTop: 4 }}>
              <CostBar
                label="Standard bank plan"
                principal={DATA.principal}
                interest={DATA.std.interest}
                total={DATA.std.total}
                maxTotal={DATA.std.total}
                accent={C.rose}
              />
              <CostBar
                label="Your accelerated plan"
                principal={DATA.principal}
                interest={DATA.acc.interest}
                total={DATA.acc.total}
                maxTotal={DATA.std.total}
                accent={C.emerald}
              />
              <div
                style={{
                  marginTop: 14,
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: "rgba(16,185,129,0.08)",
                  border: `1px solid rgba(16,185,129,0.25)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                  Interest avoided by paying extra
                </span>
                <span style={{ fontSize: 18, fontWeight: 800, color: C.emerald, fontFamily: mono }}>
                  −{compact(DATA.interestSaved)}
                </span>
              </div>
            </div>
          </Panel>

          <Panel title="Net position" subtitle="What it really costs you" icon={PiggyBank}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <NetStat label="Net principal borrowed" value={compact(DATA.principal)} color={C.indigo} />
              <NetStat label="Interest saved" value={`−${compact(DATA.interestSaved)}`} color={C.emerald} big />
              <NetStat label="Time saved" value={`${DATA.monthsSaved} months`} color={C.amber} />
              <div
                style={{
                  marginTop: 4,
                  padding: 16,
                  borderRadius: 12,
                  background: C.text,
                  color: "#fff",
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 600 }}>Cost of the loan drops from</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      fontFamily: mono,
                      color: C.rose,
                      textDecoration: "line-through",
                      opacity: 0.8,
                    }}
                  >
                    {compact(DATA.std.interest)}
                  </span>
                  <ArrowRight size={16} color="#fff" />
                  <span style={{ fontSize: 26, fontWeight: 800, fontFamily: mono, color: C.emerald }}>
                    {compact(DATA.acc.interest)}
                  </span>
                </div>
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>in total interest charges</div>
              </div>
            </div>
          </Panel>
        </div>

        {/* Strategy presets */}
        <Panel
          title="Strategy presets"
          subtitle="Swap your accelerated plan for a different savings tactic"
          icon={Zap}
        >
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <StrategyCard
              icon={CalendarPlus}
              title="1 Extra EMI / Year"
              detail="One bonus EMI every year"
              saveAmt={`Save ${compact(514000)}`}
              saveTime="3 yr 3 mo sooner"
            />
            <StrategyCard
              icon={PiggyBank}
              title="Micro-Savings (₹5/day)"
              detail="₹150 extra every month"
              saveAmt={`Save ${compact(72000)}`}
              saveTime="7 mo sooner"
            />
            <StrategyCard
              icon={Zap}
              title="10% Monthly Boost"
              detail="₹5,000 extra every month"
              saveAmt={`Save ${compact(680000)}`}
              saveTime="5 yr sooner"
              active
            />
            <StrategyCard
              icon={Flame}
              title="Super-Saver Combo"
              detail="₹5,000/mo + 1 EMI/yr"
              saveAmt={`Save ${compact(1110000)}`}
              saveTime="7 yr 2 mo sooner"
            />
          </div>
        </Panel>

        {/* Amortization schedule */}
        <Panel
          title="Amortization schedule — both plans side by side"
          subtitle="Year-by-year balance & interest with the running savings column"
          icon={CalendarDays}
        >
          <ScheduleTable />
        </Panel>
      </div>
    </div>
  );
}

function NetStat({
  label,
  value,
  color,
  big,
}: {
  label: string;
  value: string;
  color: string;
  big?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 14px",
        borderRadius: 10,
        background: C.slate100,
        border: `1px solid ${C.border}`,
      }}
    >
      <span style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: big ? 20 : 16, fontWeight: 800, color, fontFamily: mono }}>{value}</span>
    </div>
  );
}
