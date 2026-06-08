import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from "recharts";
import { ArrowLeft } from "lucide-react";
import { u as useDashboardData, d as uniquePeriods, A as AppShell, P as PageContainer, a as PageHeader, E as ENERGIES, g as ENERGY_META, e as formatPeriodLong, f as formatNumber, p as pctChange, i as formatPeriod } from "./shared-FQOCBefy.js";
import { R as Route } from "./router-qCmiUvXx.js";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
import "@supabase/supabase-js";
import "sonner";
function PlantDetail() {
  const {
    plantId
  } = Route.useParams();
  const {
    plants,
    readings,
    isLoading
  } = useDashboardData();
  const plant = plants.find((p) => p.id === plantId);
  const plantReadings = useMemo(() => readings.filter((r) => r.plant_id === plantId).sort((a, b) => a.period.localeCompare(b.period)), [readings, plantId]);
  const periods = uniquePeriods(plantReadings);
  const last = plantReadings[plantReadings.length - 1];
  const prev = plantReadings[plantReadings.length - 2];
  if (!isLoading && !plant) {
    return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs(PageContainer, { children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Plant not found." }),
      /* @__PURE__ */ jsx(Link, { to: "/plantas", className: "text-sm underline", children: "Back to plants" })
    ] }) });
  }
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs(PageContainer, { children: [
    /* @__PURE__ */ jsxs(Link, { to: "/plantas", className: "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2", children: [
      /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
      " Plants"
    ] }),
    /* @__PURE__ */ jsx(PageHeader, { title: plant?.name ?? "—", subtitle: plant?.location ? `Location: ${plant.location}` : void 0 }),
    last && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6", children: ENERGIES.map((e) => {
      const meta = ENERGY_META[e];
      const v = last[e] ?? null;
      const pv = prev ? prev[e] ?? null : null;
      const change = pctChange(v, pv);
      return /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsx("span", { children: meta.label }),
          /* @__PURE__ */ jsx("span", { className: "text-xs", children: formatPeriodLong(last.period) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "font-display text-2xl font-semibold tabular-nums", children: [
          formatNumber(v),
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: meta.unit })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground mt-1", children: change != null ? `${change > 0 ? "+" : ""}${change.toFixed(1)}% vs prev. month` : "—" })
      ] }, e);
    }) }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4 mb-6", children: ENERGIES.map((e) => /* @__PURE__ */ jsx(PlantLine, { energy: e, readings: plantReadings, periods }, e)) }),
    /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-display text-lg font-semibold mb-4", children: "Last 12 months" }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "text-xs text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "text-left px-2 py-2 font-medium", children: "Month" }),
          ENERGIES.map((e) => /* @__PURE__ */ jsx("th", { className: "text-right px-2 py-2 font-medium", children: ENERGY_META[e].label }, e))
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: plantReadings.slice(-12).reverse().map((r) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-border", children: [
          /* @__PURE__ */ jsx("td", { className: "px-2 py-2 font-medium", children: formatPeriodLong(r.period) }),
          ENERGIES.map((e) => /* @__PURE__ */ jsx("td", { className: "px-2 py-2 text-right tabular-nums", children: formatNumber(r[e]) }, e))
        ] }, r.id)) })
      ] }) })
    ] })
  ] }) });
}
function PlantLine({
  energy,
  readings,
  periods
}) {
  const meta = ENERGY_META[energy];
  const data = periods.map((p) => {
    const r = readings.find((x) => x.period === p);
    return {
      period: formatPeriod(p),
      real: r?.[energy] ?? null,
      pred: r?.[meta.predKey] ?? null
    };
  });
  return /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxs("h2", { className: "font-display text-lg font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "h-3 w-3 rounded", style: {
          background: meta.color
        } }),
        meta.label
      ] }),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: meta.unit })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "h-[260px]", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(LineChart, { data, children: [
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
      /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "real", name: "Actual", stroke: meta.color, strokeWidth: 2.5, dot: false, connectNulls: true }),
      /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "pred", name: "Forecast", stroke: meta.color, strokeDasharray: "6 4", strokeWidth: 2, dot: false, connectNulls: true })
    ] }) }) })
  ] });
}
export {
  PlantDetail as component
};
