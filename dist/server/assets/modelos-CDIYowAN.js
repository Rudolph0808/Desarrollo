import { jsx, jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { u as useDashboardData, h as fetchModelMetrics, A as AppShell, P as PageContainer, a as PageHeader, g as ENERGY_META, d as uniquePeriods } from "./shared-FQOCBefy.js";
import { B as Badge } from "./badge-C5WZK33y.js";
import "@tanstack/react-router";
import "lucide-react";
import "clsx";
import "tailwind-merge";
import "@supabase/supabase-js";
import "class-variance-authority";
const ENERGY_ORDER = {
  electricity: 0,
  water: 1,
  gas: 2
};
function semaphore(m) {
  if (m.status === "in_progress" || m.mape_monthly == null) {
    return {
      color: "var(--color-muted-foreground)",
      emoji: "⚪",
      label: "In progress"
    };
  }
  const v = m.mape_monthly;
  if (v < 5) return {
    color: "var(--color-positive)",
    emoji: "🟢",
    label: "Meets target"
  };
  if (v < 8) return {
    color: "oklch(0.78 0.15 80)",
    emoji: "🟡",
    label: "Borderline"
  };
  return {
    color: "var(--color-negative)",
    emoji: "🔴",
    label: "Above target"
  };
}
function ModelosPage() {
  const {
    plants,
    readings
  } = useDashboardData();
  const metricsQuery = useQuery({
    queryKey: ["model_metrics"],
    queryFn: fetchModelMetrics
  });
  const metrics = metricsQuery.data ?? [];
  const plantById = useMemo(() => new Map(plants.map((p) => [p.id, p])), [plants]);
  const sortOrder = (m) => m.plant_id ? plantById.get(m.plant_id)?.sort_order ?? 99 : 99;
  const ordered = useMemo(() => [...metrics].sort((a, b) => sortOrder(a) - sortOrder(b) || ENERGY_ORDER[a.energy] - ENERGY_ORDER[b.energy]), [metrics, plantById]);
  const ready = ordered.filter((m) => m.status !== "in_progress");
  const meeting = ready.filter((m) => m.meets_threshold).length;
  const total = ordered.length || 6;
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs(PageContainer, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Model health", subtitle: "Forecast accuracy validated on 2025 (trained 2022–2024). Industrial target: MAPE < 5%." }),
    /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-5 mb-6 flex items-center gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "font-display text-3xl font-semibold tabular-nums", children: [
        meeting,
        /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground text-xl", children: [
          "/",
          total
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground", children: [
        "models meet the 5% industrial constraint.",
        ordered.some((m) => m.status === "in_progress") && " One model is still in progress."
      ] })
    ] }),
    metricsQuery.isLoading && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Loading metrics…" }),
    !metricsQuery.isLoading && ordered.length === 0 && /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "No metrics yet. Apply the ",
      /* @__PURE__ */ jsx("code", { children: "model_metrics" }),
      " migration and run its seed."
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: ordered.map((m) => /* @__PURE__ */ jsx(MetricCard, { metric: m, plant: m.plant_id ? plantById.get(m.plant_id) : void 0, readings }, m.id)) })
  ] }) });
}
function MetricCard({
  metric,
  plant,
  readings
}) {
  const meta = ENERGY_META[metric.energy];
  const s = semaphore(metric);
  const inProgress = metric.status === "in_progress" || metric.mape_monthly == null;
  return /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-5 flex flex-col gap-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "font-medium", children: plant?.name ?? "—" }),
        /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "h-2.5 w-2.5 rounded", style: {
            background: meta.color
          } }),
          meta.label
        ] })
      ] }),
      /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "shrink-0", children: metric.model_type ?? "—" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Monthly MAPE" }),
        /* @__PURE__ */ jsx("div", { className: "font-display text-4xl font-semibold tabular-nums", style: {
          color: s.color
        }, children: inProgress ? "—" : `${metric.mape_monthly.toFixed(2)}%` }),
        /* @__PURE__ */ jsxs("div", { className: "text-xs mt-0.5", style: {
          color: s.color
        }, children: [
          s.emoji,
          " ",
          s.label
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-right text-xs text-muted-foreground space-y-0.5", children: [
        metric.mape_quarterly != null && /* @__PURE__ */ jsxs("div", { children: [
          "Quarterly ",
          /* @__PURE__ */ jsxs("span", { className: "tabular-nums text-foreground", children: [
            metric.mape_quarterly.toFixed(2),
            "%"
          ] })
        ] }),
        metric.r2 != null && /* @__PURE__ */ jsxs("div", { children: [
          "R² ",
          /* @__PURE__ */ jsx("span", { className: "tabular-nums text-foreground", children: metric.r2.toFixed(3) })
        ] }),
        metric.annual_error != null && /* @__PURE__ */ jsxs("div", { children: [
          "Annual ",
          /* @__PURE__ */ jsxs("span", { className: "tabular-nums text-foreground", children: [
            metric.annual_error > 0 ? "+" : "",
            metric.annual_error.toFixed(1),
            "%"
          ] })
        ] })
      ] })
    ] }),
    inProgress ? /* @__PURE__ */ jsx("div", { className: "h-[44px] grid place-items-center text-xs text-muted-foreground border border-dashed border-border rounded-lg", children: "No forecast yet" }) : /* @__PURE__ */ jsx(Sparkline, { plantId: metric.plant_id, energy: metric.energy, readings, color: meta.color })
  ] });
}
function Sparkline({
  plantId,
  energy,
  readings,
  color
}) {
  const predKey = ENERGY_META[energy].predKey;
  const data = useMemo(() => {
    const periods = uniquePeriods(readings);
    return periods.map((p) => {
      const r = readings.find((x) => x.period === p && x.plant_id === plantId);
      return {
        real: r?.[energy] ?? null,
        pred: r?.[predKey] ?? null
      };
    });
  }, [readings, plantId, energy, predKey]);
  if (data.every((d) => d.real == null)) {
    return /* @__PURE__ */ jsx("div", { className: "h-[44px]" });
  }
  return /* @__PURE__ */ jsx("div", { className: "h-[44px]", "aria-label": "Actual vs forecast sparkline", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(LineChart, { data, margin: {
    top: 4,
    bottom: 4,
    left: 0,
    right: 0
  }, children: [
    /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "real", stroke: color, strokeWidth: 2, dot: false, isAnimationActive: false }),
    /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "pred", stroke: color, strokeWidth: 1.5, strokeDasharray: "4 3", dot: false, connectNulls: true, isAnimationActive: false, opacity: 0.7 })
  ] }) }) });
}
export {
  ModelosPage as component
};
