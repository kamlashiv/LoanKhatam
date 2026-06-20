// Single source of truth for chart styling across the app (dashboard, planner,
// loan detail). Keeps colours, axis/grid styling, and the tooltip consistent so
// every chart reads as part of one system.

import { formatRupees } from "@/lib/loan-utils";

// Canonical RinMukti chart palette.
export const CHART_COLORS = {
  principal: "#6366f1", // indigo-500 — loan amount / principal
  interest: "#f59e0b", // amber-500 — interest paid / scheduled
  savings: "#10b981", // emerald-500 — savings / positive / accelerated
  overdue: "#f43f5e", // rose-500 — overdue / standard path / negative
  neutral: "#94a3b8", // slate-400 — remaining / inactive
  muted: "#e5e7eb", // gray-200 — empty / placeholder
} as const;

// Loan status → colour, shared by the dashboard pie and any status visuals.
export const STATUS_COLORS: Record<string, string> = {
  active: CHART_COLORS.principal,
  paid: CHART_COLORS.savings,
  overdue: CHART_COLORS.overdue,
};

// Shared recharts axis/grid styling.
export const CHART_GRID_STROKE = "#e2e8f0"; // slate-200
export const CHART_AXIS_TICK = { fontSize: 11, fill: "#64748b" } as const; // slate-500

interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
  payload?: { color?: string; fill?: string };
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
}

// Unified dark tooltip used by every chart in the app.
export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-800 text-white rounded-lg shadow-md px-3 py-2.5 text-xs">
      {label != null && label !== "" && (
        <p className="font-semibold mb-1 text-slate-300">{label}</p>
      )}
      {payload.map((p, i) => {
        const color = p.color ?? p.payload?.color ?? p.payload?.fill ?? "#fff";
        return (
          <div
            key={p.name ?? i}
            className="flex justify-between gap-4 py-0.5"
            style={{ color }}
          >
            <span>{p.name}:</span>
            <span className="font-black">
              {typeof p.value === "number" ? formatRupees(p.value) : p.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
