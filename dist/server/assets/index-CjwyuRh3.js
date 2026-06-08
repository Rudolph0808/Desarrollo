import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine, Line, BarChart, Legend, Bar } from "recharts";
import { ExternalLink, TrendingUp, TrendingDown, AlertTriangle, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { u as useDashboardData, d as uniquePeriods, A as AppShell, P as PageContainer, a as PageHeader, e as formatPeriodLong, E as ENERGIES, l as sumByPeriod, g as ENERGY_META, f as formatNumber, j as costForPeriod, b as formatCurrency, c as cn, p as pctChange } from "./shared-FQOCBefy.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-C8_65cgt.js";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
import "@supabase/supabase-js";
import "@radix-ui/react-select";
const HISTORICAL = [
  { period: "May 2025", value: 3.93 },
  { period: "Jun 2025", value: 4.42 },
  { period: "Jul 2025", value: 4.32 },
  { period: "Ago 2025", value: 3.51 },
  { period: "Sep 2025", value: 3.57 },
  { period: "Oct 2025", value: 3.76 },
  { period: "Nov 2025", value: 3.57 },
  { period: "Dic 2025", value: 3.8 },
  { period: "Ene 2026", value: 3.69 },
  { period: "Feb 2026", value: 3.79 },
  { period: "Mar 2026", value: 4.02 },
  { period: "Abr 2026", value: 4.59 },
  { period: "May 2026", value: 4.45 }
];
const LATEST = HISTORICAL[HISTORICAL.length - 1];
const PREV = HISTORICAL[HISTORICAL.length - 2];
const CORE = 4.26;
const FOOD = 6.36;
const FORECAST_QUARTER = 5.1;
const FORECAST_2027 = 3.7;
const BANXICO_TARGET = 3;
function InflationCard() {
  const delta = LATEST.value - PREV.value;
  const up = delta > 0;
  return /* @__PURE__ */ jsxs("div", { className: "mb-8 bg-card border border-border rounded-2xl p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-baseline justify-between gap-2 mb-1", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-display text-lg font-semibold", children: "Mexico Inflation (CPI)" }),
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: "https://es.tradingeconomics.com/mexico/inflation-cpi",
          target: "_blank",
          rel: "noopener noreferrer",
          className: "text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1",
          children: [
            "Trading Economics / INEGI ",
            /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-5", children: "Macro context to interpret cost variations across the complex. Dashed line: Banxico target (3%)." }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-5", children: [
      /* @__PURE__ */ jsx(
        MetricBox,
        {
          label: "YoY rate",
          value: `${LATEST.value.toFixed(2)}%`,
          sub: /* @__PURE__ */ jsxs(
            "span",
            {
              className: up ? "text-negative" : "text-positive",
              children: [
                up ? /* @__PURE__ */ jsx(TrendingUp, { className: "h-3 w-3 inline" }) : /* @__PURE__ */ jsx(TrendingDown, { className: "h-3 w-3 inline" }),
                " ",
                delta > 0 ? "+" : "",
                delta.toFixed(2),
                " pp vs prev. month"
              ]
            }
          ),
          highlight: true
        }
      ),
      /* @__PURE__ */ jsx(MetricBox, { label: "Core", value: `${CORE.toFixed(2)}%`, sub: "Excludes energy and food" }),
      /* @__PURE__ */ jsx(MetricBox, { label: "Food", value: `${FOOD.toFixed(2)}%`, sub: "Food inflation" }),
      /* @__PURE__ */ jsx(
        MetricBox,
        {
          label: "Forecast",
          value: `${FORECAST_QUARTER.toFixed(2)}%`,
          sub: `End of quarter · 2027: ${FORECAST_2027.toFixed(2)}%`
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "h-56", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(LineChart, { data: HISTORICAL, margin: { top: 10, right: 16, bottom: 0, left: 0 }, children: [
      /* @__PURE__ */ jsx(CartesianGrid, { stroke: "var(--color-border)", vertical: false }),
      /* @__PURE__ */ jsx(XAxis, { dataKey: "period", stroke: "var(--color-muted-foreground)", fontSize: 11 }),
      /* @__PURE__ */ jsx(
        YAxis,
        {
          stroke: "var(--color-muted-foreground)",
          fontSize: 11,
          domain: [2, 6],
          tickFormatter: (v) => `${v}%`
        }
      ),
      /* @__PURE__ */ jsx(
        Tooltip,
        {
          contentStyle: {
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            fontSize: 12
          },
          formatter: (v) => `${Number(v).toFixed(2)}%`
        }
      ),
      /* @__PURE__ */ jsx(
        ReferenceLine,
        {
          y: BANXICO_TARGET,
          stroke: "var(--brand-young-blue)",
          strokeDasharray: "4 4",
          label: { value: "Banxico target 3%", position: "insideBottomRight", fill: "var(--color-muted-foreground)", fontSize: 10 }
        }
      ),
      /* @__PURE__ */ jsx(
        Line,
        {
          type: "monotone",
          dataKey: "value",
          stroke: "var(--brand-deep-marine)",
          strokeWidth: 2.5,
          dot: { r: 3, fill: "var(--brand-deep-marine)" },
          activeDot: { r: 5 }
        }
      )
    ] }) }) })
  ] });
}
function MetricBox({
  label,
  value,
  sub,
  highlight
}) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "rounded-xl border border-border p-4",
      style: highlight ? { background: "var(--brand-deep-marine)", color: "#FFFFFF", borderColor: "var(--brand-deep-marine)" } : void 0,
      children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs " + (highlight ? "opacity-80" : "text-muted-foreground"), children: label }),
        /* @__PURE__ */ jsx("div", { className: "font-display text-2xl font-semibold tabular-nums mt-1", children: value }),
        sub && /* @__PURE__ */ jsx("div", { className: "text-xs mt-1 " + (highlight ? "opacity-80" : "text-muted-foreground"), children: sub })
      ]
    }
  );
}
function IndexPage() {
  const {
    plants,
    readings,
    costs,
    isLoading
  } = useDashboardData();
  const periods = useMemo(() => uniquePeriods(readings), [readings]);
  const [period, setPeriod] = useState(null);
  const currentPeriod = period ?? periods[periods.length - 1] ?? null;
  const prevPeriod = currentPeriod ? periods[periods.indexOf(currentPeriod) - 1] ?? null : null;
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs(PageContainer, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Complex overview", subtitle: currentPeriod ? `Selected month: ${formatPeriodLong(currentPeriod)}` : "No data yet", right: periods.length > 0 && /* @__PURE__ */ jsxs(Select, { value: currentPeriod ?? void 0, onValueChange: setPeriod, children: [
      /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[200px]", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select month" }) }),
      /* @__PURE__ */ jsx(SelectContent, { children: [...periods].reverse().map((p) => /* @__PURE__ */ jsx(SelectItem, { value: p, children: formatPeriodLong(p) }, p)) })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900", children: [
      /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5 shrink-0 text-amber-700" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "Demo mode — all figures shown are synthetic dummy data for demonstration purposes only." })
    ] }),
    isLoading ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: ENERGIES.map((e) => /* @__PURE__ */ jsx("div", { className: "h-44 bg-card border border-border rounded-2xl animate-pulse" }, e)) }) : !currentPeriod ? /* @__PURE__ */ jsx(EmptyState, {}) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-8", children: ENERGIES.map((energy) => /* @__PURE__ */ jsx(KpiCard, { energy, readings, currentPeriod, prevPeriod, periods }, energy)) }),
      /* @__PURE__ */ jsx(CostSummary, { readings, costs, currentPeriod, prevPeriod, plants }),
      /* @__PURE__ */ jsx(InflationCard, {}),
      /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-6 md:p-8 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-baseline justify-between gap-4 mb-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "font-display text-2xl font-semibold", children: "Plant contribution" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "How each plant splits the complex consumption." })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: formatPeriodLong(currentPeriod) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-5 gap-6", children: [
          /* @__PURE__ */ jsx("div", { className: "lg:col-span-3", children: /* @__PURE__ */ jsx(PlantStackedChart, { plants, readings, period: currentPeriod }) }),
          /* @__PURE__ */ jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsx(ContributionTable, { plants, readings, period: currentPeriod }) })
        ] })
      ] })
    ] })
  ] }) });
}
function EmptyState() {
  return /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-10 text-center", children: [
    /* @__PURE__ */ jsx("h2", { className: "font-display text-xl mb-2", children: "No data loaded yet" }),
    /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-4", children: "Upload monthly consumption from the Data section to populate the dashboard." }),
    /* @__PURE__ */ jsxs(Link, { to: "/datos", className: "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground", children: [
      "Go to Data ",
      /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4" })
    ] })
  ] });
}
function KpiCard({
  energy,
  readings,
  currentPeriod,
  prevPeriod,
  periods
}) {
  const meta = ENERGY_META[energy];
  const totals = sumByPeriod(readings, energy);
  const current = totals.get(currentPeriod) ?? 0;
  const previous = prevPeriod ? totals.get(prevPeriod) ?? null : null;
  const predTotal = readings.filter((r) => r.period === currentPeriod).reduce((acc, r) => acc + (r[meta.predKey] ?? 0), 0);
  const hasPred = readings.filter((r) => r.period === currentPeriod).some((r) => r[meta.predKey] != null);
  const monthChange = pctChange(current, previous);
  const last12 = periods.slice(-12).map((p) => ({
    period: p,
    value: totals.get(p) ?? 0
  }));
  return /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-6 relative overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 right-0 h-1", style: {
      background: meta.color
    } }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
      /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-muted-foreground", children: meta.label }),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: meta.unit })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "font-display text-3xl font-semibold mb-1 tabular-nums", children: formatNumber(current) }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 text-xs", children: /* @__PURE__ */ jsx(ChangePill, { value: monthChange, label: "vs previous month" }) }),
    /* @__PURE__ */ jsx("div", { className: "h-12 mt-3 -mx-2", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsx(LineChart, { data: last12, children: /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "value", stroke: meta.color, strokeWidth: 2, dot: false }) }) }) }),
    hasPred && /* @__PURE__ */ jsxs("div", { className: "border-t border-border mt-3 pt-3 flex items-baseline justify-between", children: [
      /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "Forecast" }),
      /* @__PURE__ */ jsx("span", { className: "font-display text-lg font-semibold tabular-nums", style: {
        color: meta.color
      }, children: formatNumber(predTotal) })
    ] })
  ] });
}
function ChangePill({
  value,
  label,
  invert = false
}) {
  if (value == null) return /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "—" });
  const positive = value > 0;
  const isGood = invert ? !positive : positive;
  const Icon = positive ? ArrowUp : value < 0 ? ArrowDown : Minus;
  return /* @__PURE__ */ jsxs("span", { className: cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full", isGood ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative"), title: label, children: [
    /* @__PURE__ */ jsx(Icon, { className: "h-3 w-3" }),
    value > 0 ? "+" : "",
    value.toFixed(1),
    "%"
  ] });
}
function PlantStackedChart({
  plants,
  readings,
  period
}) {
  const data = ENERGIES.map((e) => {
    const row = {
      energy: ENERGY_META[e].label
    };
    for (const p of plants) {
      const r = readings.find((x) => x.period === period && x.plant_id === p.id);
      row[p.name] = r?.[e] ?? 0;
    }
    return row;
  });
  const palette = ["var(--color-water)", "var(--color-gas)", "var(--color-electricity)", "oklch(0.6 0.15 340)"];
  return /* @__PURE__ */ jsx("div", { className: "h-72", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data, children: [
    /* @__PURE__ */ jsx(CartesianGrid, { stroke: "var(--color-border)", vertical: false }),
    /* @__PURE__ */ jsx(XAxis, { dataKey: "energy", stroke: "var(--color-muted-foreground)", fontSize: 12 }),
    /* @__PURE__ */ jsx(YAxis, { stroke: "var(--color-muted-foreground)", fontSize: 12, tickFormatter: (v) => formatNumber(v) }),
    /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
      background: "var(--color-popover)",
      border: "1px solid var(--color-border)",
      borderRadius: 12,
      fontSize: 12
    }, formatter: (v) => formatNumber(Number(v)) }),
    /* @__PURE__ */ jsx(Legend, { wrapperStyle: {
      fontSize: 12
    } }),
    plants.map((p, i) => /* @__PURE__ */ jsx(Bar, { dataKey: p.name, stackId: "a", fill: palette[i % palette.length], radius: [4, 4, 0, 0] }, p.id))
  ] }) }) });
}
function ContributionTable({
  plants,
  readings,
  period
}) {
  return /* @__PURE__ */ jsx("div", { className: "overflow-x-auto -mx-2", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
    /* @__PURE__ */ jsx("thead", { className: "text-xs text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
      /* @__PURE__ */ jsx("th", { className: "text-left font-medium px-2 py-2", children: "Plant" }),
      ENERGIES.map((e) => /* @__PURE__ */ jsx("th", { className: "text-right font-medium px-2 py-2", children: ENERGY_META[e].label }, e))
    ] }) }),
    /* @__PURE__ */ jsx("tbody", { children: plants.map((p) => {
      const r = readings.find((x) => x.period === period && x.plant_id === p.id);
      return /* @__PURE__ */ jsxs("tr", { className: "border-t border-border", children: [
        /* @__PURE__ */ jsx("td", { className: "px-2 py-2 font-medium", children: /* @__PURE__ */ jsx(Link, { to: "/planta/$plantId", params: {
          plantId: p.id
        }, className: "hover:underline", children: p.name }) }),
        ENERGIES.map((e) => {
          const total = readings.filter((x) => x.period === period).reduce((acc, x) => acc + (x[e] ?? 0), 0);
          const v = r?.[e] ?? 0;
          const pct = total > 0 ? v / total * 100 : 0;
          return /* @__PURE__ */ jsxs("td", { className: "px-2 py-2 text-right tabular-nums", children: [
            /* @__PURE__ */ jsx("div", { children: formatNumber(v) }),
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
              pct.toFixed(1),
              "%"
            ] })
          ] }, e);
        })
      ] }, p.id);
    }) })
  ] }) });
}
function CostSummary({
  readings,
  costs,
  currentPeriod,
  prevPeriod,
  plants
}) {
  const currency = costs[0]?.currency ?? "MXN";
  const energyTotals = ENERGIES.map((e) => {
    const total = sumByPeriod(readings, e).get(currentPeriod) ?? 0;
    const prev = prevPeriod ? sumByPeriod(readings, e).get(prevPeriod) ?? null : null;
    const rate = costForPeriod(costs, e, currentPeriod);
    const rateP = prevPeriod ? costForPeriod(costs, e, prevPeriod) : null;
    const cost = rate != null ? total * rate : null;
    const prevCost = prev != null && rateP != null ? prev * rateP : null;
    const predTotal = readings.filter((r) => r.period === currentPeriod).reduce((acc, r) => acc + (r[ENERGY_META[e].predKey] ?? 0), 0);
    const hasPred = readings.filter((r) => r.period === currentPeriod).some((r) => r[ENERGY_META[e].predKey] != null);
    const predCost = rate != null && hasPred ? predTotal * rate : null;
    return {
      energy: e,
      cost,
      prevCost,
      predCost,
      rate
    };
  });
  const totalReal = energyTotals.reduce((a, x) => a + (x.cost ?? 0), 0);
  const totalPrev = energyTotals.reduce((a, x) => a + (x.prevCost ?? 0), 0);
  const totalPred = energyTotals.reduce((a, x) => a + (x.predCost ?? 0), 0);
  const monthChange = pctChange(totalReal, totalPrev || null);
  const plantRows = plants.map((p) => {
    const r = readings.find((x) => x.period === currentPeriod && x.plant_id === p.id);
    let real = 0, pred = 0, hasPred = false;
    for (const e of ENERGIES) {
      const rate = costForPeriod(costs, e, currentPeriod) ?? 0;
      real += (r?.[e] ?? 0) * rate;
      const pv = r?.[ENERGY_META[e].predKey];
      if (pv != null) {
        pred += pv * rate;
        hasPred = true;
      }
    }
    return {
      plant: p,
      real,
      pred,
      hasPred
    };
  });
  return /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between mb-3", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-display text-lg font-semibold", children: "Cost of the month" }),
      /* @__PURE__ */ jsx(Link, { to: "/costos", className: "text-xs text-muted-foreground hover:text-foreground", children: "Edit rates →" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-5 md:col-span-1", children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground mb-1", children: "Complex total" }),
        /* @__PURE__ */ jsx("div", { className: "font-display text-3xl font-semibold tabular-nums", children: formatCurrency(totalReal, currency) }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground mt-1", children: monthChange != null ? /* @__PURE__ */ jsxs("span", { className: cn(monthChange > 0 ? "text-negative" : "text-positive"), children: [
          monthChange > 0 ? "+" : "",
          monthChange.toFixed(1),
          "% vs previous month"
        ] }) : "—" }),
        totalPred > 0 && /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
          "Forecast: ",
          /* @__PURE__ */ jsx("span", { className: "text-foreground", children: formatCurrency(totalPred, currency) })
        ] })
      ] }),
      energyTotals.map(({
        energy,
        cost,
        predCost,
        rate
      }) => {
        const meta = ENERGY_META[energy];
        return /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-5 relative overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 right-0 h-1", style: {
            background: meta.color
          } }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground mb-1", children: meta.label }),
          /* @__PURE__ */ jsx("div", { className: "font-display text-2xl font-semibold tabular-nums", children: formatCurrency(cost, currency) }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground mt-1", children: rate != null ? `${formatCurrency(rate, currency)} / ${meta.unit}` : "no rate" }),
          predCost != null && /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
            "Forecast: ",
            /* @__PURE__ */ jsx("span", { className: "text-foreground", children: formatCurrency(predCost, currency) })
          ] })
        ] }, energy);
      })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-display text-base font-semibold mb-3", children: "Spend contribution per plant" }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "text-xs text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "text-left px-2 py-2 font-medium", children: "Plant" }),
          /* @__PURE__ */ jsx("th", { className: "text-right px-2 py-2 font-medium", children: "Actual cost" }),
          /* @__PURE__ */ jsx("th", { className: "text-right px-2 py-2 font-medium", children: "% of total" }),
          /* @__PURE__ */ jsx("th", { className: "text-right px-2 py-2 font-medium", children: "Forecast cost" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: plantRows.map(({
          plant,
          real,
          pred,
          hasPred
        }) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-border", children: [
          /* @__PURE__ */ jsx("td", { className: "px-2 py-2 font-medium", children: /* @__PURE__ */ jsx(Link, { to: "/planta/$plantId", params: {
            plantId: plant.id
          }, className: "hover:underline", children: plant.name }) }),
          /* @__PURE__ */ jsx("td", { className: "px-2 py-2 text-right tabular-nums", children: formatCurrency(real, currency) }),
          /* @__PURE__ */ jsx("td", { className: "px-2 py-2 text-right tabular-nums", children: totalReal > 0 ? (real / totalReal * 100).toFixed(1) + "%" : "—" }),
          /* @__PURE__ */ jsx("td", { className: "px-2 py-2 text-right tabular-nums", children: hasPred ? formatCurrency(pred, currency) : "—" })
        ] }, plant.id)) })
      ] }) })
    ] })
  ] });
}
export {
  IndexPage as component
};
