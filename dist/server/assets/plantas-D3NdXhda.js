import { jsx, jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, PieChart, Pie, Cell } from "recharts";
import { u as useDashboardData, d as uniquePeriods, E as ENERGIES, A as AppShell, P as PageContainer, a as PageHeader, e as formatPeriodLong, f as formatNumber, g as ENERGY_META } from "./shared-FQOCBefy.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-C8_65cgt.js";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-FLmr99I2.js";
import "@tanstack/react-router";
import "lucide-react";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
import "@supabase/supabase-js";
import "@radix-ui/react-select";
import "@radix-ui/react-tabs";
function PlantsPage() {
  const {
    plants,
    readings
  } = useDashboardData();
  const periods = useMemo(() => uniquePeriods(readings), [readings]);
  const [period, setPeriod] = useState(null);
  const current = period ?? periods[periods.length - 1] ?? null;
  const [mode, setMode] = useState("abs");
  const [energy, setEnergy] = useState("electricity");
  const meta = ENERGY_META[energy];
  const data = useMemo(() => {
    if (!current) return [];
    return plants.map((p) => {
      const r = readings.find((x) => x.period === current && x.plant_id === p.id);
      const row = {
        name: p.name
      };
      for (const e of ENERGIES) {
        row[e] = r?.[e] ?? 0;
      }
      return row;
    });
  }, [plants, readings, current]);
  const pieData = useMemo(() => {
    if (!current) return [];
    const total = data.reduce((acc, r) => acc + Number(r[energy] ?? 0), 0);
    return data.map((r) => ({
      name: r.name,
      value: Number(r[energy] ?? 0),
      pct: total > 0 ? Number(r[energy] ?? 0) / total * 100 : 0
    }));
  }, [data, energy, current]);
  const palette = ["var(--color-water)", "var(--color-gas)", "var(--color-electricity)", "oklch(0.6 0.15 340)"];
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs(PageContainer, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Plants comparison", subtitle: current ? formatPeriodLong(current) : "", right: current && /* @__PURE__ */ jsxs(Select, { value: current, onValueChange: setPeriod, children: [
      /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[200px]", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
      /* @__PURE__ */ jsx(SelectContent, { children: [...periods].reverse().map((p) => /* @__PURE__ */ jsx(SelectItem, { value: p, children: formatPeriodLong(p) }, p)) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-3 mb-6", children: /* @__PURE__ */ jsx(Tabs, { value: mode, onValueChange: (v) => setMode(v), children: /* @__PURE__ */ jsxs(TabsList, { children: [
      /* @__PURE__ */ jsx(TabsTrigger, { value: "abs", children: "Absolute" }),
      /* @__PURE__ */ jsx(TabsTrigger, { value: "pct", children: "Percent" })
    ] }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 bg-card border border-border rounded-2xl p-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-display text-lg font-semibold mb-4", children: "Plants × Energy" }),
        /* @__PURE__ */ jsx("div", { className: "h-[380px]", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: mode === "pct" ? toPct(data) : data, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { stroke: "var(--color-border)", vertical: false }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "name", stroke: "var(--color-muted-foreground)", fontSize: 12 }),
          /* @__PURE__ */ jsx(YAxis, { stroke: "var(--color-muted-foreground)", fontSize: 12, tickFormatter: (v) => mode === "pct" ? `${v}%` : formatNumber(Number(v)) }),
          /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            fontSize: 12
          }, formatter: (v) => mode === "pct" ? `${Number(v).toFixed(1)}%` : formatNumber(Number(v)) }),
          /* @__PURE__ */ jsx(Legend, { wrapperStyle: {
            fontSize: 12
          } }),
          ENERGIES.map((e) => /* @__PURE__ */ jsx(Bar, { dataKey: e, name: ENERGY_META[e].label, fill: ENERGY_META[e].color, radius: [4, 4, 0, 0] }, e))
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-display text-lg font-semibold", children: "% per plant" }),
          /* @__PURE__ */ jsxs(Select, { value: energy, onValueChange: (v) => setEnergy(v), children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[140px] h-8 text-xs", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsx(SelectContent, { children: ENERGIES.map((e) => /* @__PURE__ */ jsx(SelectItem, { value: e, children: ENERGY_META[e].label }, e)) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-[300px]", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(PieChart, { children: [
          /* @__PURE__ */ jsx(Pie, { data: pieData, dataKey: "value", nameKey: "name", innerRadius: 60, outerRadius: 100, paddingAngle: 2, children: pieData.map((_, i) => /* @__PURE__ */ jsx(Cell, { fill: palette[i % palette.length] }, i)) }),
          /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            fontSize: 12
          }, formatter: (v) => `${formatNumber(Number(v))} ${meta.unit}` })
        ] }) }) }),
        /* @__PURE__ */ jsx("ul", { className: "mt-3 space-y-1 text-sm", children: pieData.map((d, i) => /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "h-2.5 w-2.5 rounded-full", style: {
              background: palette[i % palette.length]
            } }),
            d.name
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "tabular-nums text-muted-foreground", children: [
            d.pct.toFixed(1),
            "%"
          ] })
        ] }, d.name)) })
      ] })
    ] })
  ] }) });
}
function toPct(rows) {
  const totals = {};
  for (const e of ENERGIES) totals[e] = rows.reduce((a, r) => a + Number(r[e] ?? 0), 0);
  return rows.map((r) => {
    const out = {
      name: r.name
    };
    for (const e of ENERGIES) {
      out[e] = totals[e] > 0 ? Number((Number(r[e] ?? 0) / totals[e] * 100).toFixed(1)) : 0;
    }
    return out;
  });
}
export {
  PlantsPage as component
};
