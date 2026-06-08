import { jsx, jsxs } from "react/jsx-runtime";
import * as React from "react";
import { useMemo, useState } from "react";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from "recharts";
import { Check, Download } from "lucide-react";
import { c as cn, u as useDashboardData, d as uniquePeriods, A as AppShell, P as PageContainer, a as PageHeader, E as ENERGIES, g as ENERGY_META, f as formatNumber, i as formatPeriod } from "./shared-FQOCBefy.js";
import { B as Button } from "./button-CsN5oC7l.js";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-FLmr99I2.js";
import "@tanstack/react-router";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-tabs";
const Checkbox = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  CheckboxPrimitive.Root,
  {
    ref,
    className: cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(CheckboxPrimitive.Indicator, { className: cn("grid place-content-center text-current"), children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) })
  }
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
function yearOf(period) {
  return Number(period.slice(0, 4));
}
function quarterOf(period) {
  return Math.ceil(Number(period.slice(5, 7)) / 3);
}
function groupPeriods(periods, agg) {
  if (agg === "monthly") return periods.map((p) => ({
    label: formatPeriod(p),
    members: [p]
  }));
  const map = /* @__PURE__ */ new Map();
  for (const p of periods) {
    const y = yearOf(p);
    const key = agg === "annual" ? `${y}` : `${y}-Q${quarterOf(p)}`;
    const label = agg === "annual" ? `${y}` : `Q${quarterOf(p)} ${y}`;
    if (!map.has(key)) map.set(key, {
      label,
      members: []
    });
    map.get(key).members.push(p);
  }
  return [...map.values()];
}
function mape(pairs) {
  const valid = pairs.filter((p) => p.real > 0);
  if (valid.length === 0) return null;
  return 100 * valid.reduce((a, p) => a + Math.abs((p.real - p.pred) / p.real), 0) / valid.length;
}
function HistoricoPage() {
  const {
    plants,
    readings
  } = useDashboardData();
  const periods = useMemo(() => uniquePeriods(readings), [readings]);
  const [visiblePlants, setVisiblePlants] = useState(/* @__PURE__ */ new Set());
  const [showTotal, setShowTotal] = useState(true);
  const [agg, setAgg] = useState("monthly");
  const allActive = visiblePlants.size === 0;
  const togglePlant = (id) => {
    setVisiblePlants((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs(PageContainer, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "History by energy", subtitle: "Monthly trend with actuals and forecast lines. Toggle aggregation to see how error shrinks.", right: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: () => exportCsv(readings, plants), children: [
      /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 mr-2" }),
      "Export CSV"
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-4 mb-6 flex flex-wrap gap-4 items-center", children: [
      /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Plants:" }),
      plants.map((p) => {
        const checked = allActive || visiblePlants.has(p.id);
        return /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
          /* @__PURE__ */ jsx(Checkbox, { checked, onCheckedChange: () => togglePlant(p.id) }),
          p.name
        ] }, p.id);
      }),
      /* @__PURE__ */ jsx("div", { className: "h-5 w-px bg-border mx-1" }),
      /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
        /* @__PURE__ */ jsx(Checkbox, { checked: showTotal, onCheckedChange: (v) => setShowTotal(!!v) }),
        "Show total"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "h-5 w-px bg-border mx-1" }),
      /* @__PURE__ */ jsx(Tabs, { value: agg, onValueChange: (v) => setAgg(v), children: /* @__PURE__ */ jsxs(TabsList, { children: [
        /* @__PURE__ */ jsx(TabsTrigger, { value: "monthly", children: "Monthly" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "quarterly", children: "Quarterly" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "annual", children: "Annual" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4", children: ENERGIES.map((energy) => /* @__PURE__ */ jsx(EnergyChart, { energy, plants, readings, periods, visiblePlants, showTotal, agg }, energy)) })
  ] }) });
}
function EnergyChart({
  energy,
  plants,
  readings,
  periods,
  visiblePlants,
  showTotal,
  agg
}) {
  const meta = ENERGY_META[energy];
  const allActive = visiblePlants.size === 0;
  const palette = ["var(--color-water)", "var(--color-gas)", "var(--color-electricity)", "oklch(0.6 0.15 340)"];
  const byKey = useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const r of readings) m.set(`${r.period}|${r.plant_id}`, r);
    return m;
  }, [readings]);
  const groups = useMemo(() => groupPeriods(periods, agg), [periods, agg]);
  const data = groups.map((g) => {
    const row = {
      period: g.label
    };
    let total = 0;
    let predTotal = 0;
    let hasPred = false;
    for (const plant of plants) {
      let v = null;
      for (const p of g.members) {
        const r = byKey.get(`${p}|${plant.id}`);
        const x = r?.[energy] ?? null;
        if (x != null) v = (v ?? 0) + x;
        const pred = r?.[meta.predKey] ?? null;
        if (pred != null) {
          predTotal += pred;
          hasPred = true;
        }
      }
      row[plant.name] = v;
      if (v != null) total += v;
    }
    row.__total = total;
    row.__pred = hasPred ? predTotal : null;
    return row;
  });
  const mapeValue = useMemo(() => {
    const activePlants = plants.filter((p) => allActive || visiblePlants.has(p.id));
    const groups2025 = groupPeriods(periods.filter((p) => yearOf(p) === 2025), agg);
    const pairs = [];
    for (const g of groups2025) {
      let real = 0;
      let pred = 0;
      let any = false;
      for (const plant of activePlants) {
        for (const p of g.members) {
          const r = byKey.get(`${p}|${plant.id}`);
          const pv = r?.[meta.predKey] ?? null;
          if (pv == null) continue;
          const rv = r?.[energy] ?? null;
          if (rv == null) continue;
          real += rv;
          pred += pv;
          any = true;
        }
      }
      if (any) pairs.push({
        real,
        pred
      });
    }
    return mape(pairs);
  }, [periods, plants, byKey, energy, meta.predKey, agg, allActive, visiblePlants]);
  return /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxs("h2", { className: "font-display text-lg font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "h-3 w-3 rounded", style: {
          background: meta.color
        } }),
        meta.label
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        mapeValue != null && /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
          "2025 forecast MAPE (",
          agg,
          "):",
          " ",
          /* @__PURE__ */ jsxs("span", { className: "tabular-nums font-medium text-foreground", children: [
            mapeValue.toFixed(2),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: meta.unit })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "h-[300px]", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(LineChart, { data, children: [
      /* @__PURE__ */ jsx(CartesianGrid, { stroke: "var(--color-border)", vertical: false }),
      /* @__PURE__ */ jsx(XAxis, { dataKey: "period", stroke: "var(--color-muted-foreground)", fontSize: 11 }),
      /* @__PURE__ */ jsx(YAxis, { stroke: "var(--color-muted-foreground)", fontSize: 11, tickFormatter: (v) => formatNumber(Number(v)) }),
      /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
        background: "var(--color-popover)",
        border: "1px solid var(--color-border)",
        borderRadius: 12,
        fontSize: 12
      }, formatter: (v) => formatNumber(Number(v)) }),
      /* @__PURE__ */ jsx(Legend, { wrapperStyle: {
        fontSize: 11
      } }),
      plants.map((p, i) => {
        if (!allActive && !visiblePlants.has(p.id)) return null;
        return /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: p.name, stroke: palette[i % palette.length], strokeWidth: 2, dot: false, connectNulls: true }, p.id);
      }),
      showTotal && /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "__total", name: "Total", stroke: meta.color, strokeWidth: 3, dot: false }),
      /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "__pred", name: "Total forecast", stroke: meta.color, strokeDasharray: "6 4", strokeWidth: 2, dot: false, connectNulls: true })
    ] }) }) })
  ] });
}
function exportCsv(readings, plants) {
  const byId = new Map(plants.map((p) => [p.id, p.name]));
  const header = ["plant", "month", "water_m3", "ng_mwhr", "electricity_mwhr", "water_pred", "gas_pred", "electricity_pred"];
  const rows = readings.map((r) => [byId.get(r.plant_id) ?? r.plant_id, r.period, r.water ?? "", r.gas ?? "", r.electricity ?? "", r.water_pred ?? "", r.gas_pred ?? "", r.electricity_pred ?? ""].join(","));
  const csv = [header.join(","), ...rows].join("\n");
  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `energy_history_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
export {
  HistoricoPage as component
};
