import { jsxs, jsx } from "react/jsx-runtime";
import * as React from "react";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Trash2, FileText, Download, Printer } from "lucide-react";
import { c as cn, u as useDashboardData, d as uniquePeriods, A as AppShell, P as PageContainer, a as PageHeader, E as ENERGIES, l as sumByPeriod, j as costForPeriod, g as ENERGY_META, b as formatCurrency, f as formatNumber, e as formatPeriodLong, s as supabase, p as pctChange } from "./shared-FQOCBefy.js";
import { B as Button } from "./button-CsN5oC7l.js";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-C8_65cgt.js";
import "@tanstack/react-router";
import "clsx";
import "tailwind-merge";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-select";
const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxs(
    DialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxs(DialogPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = DialogPrimitive.Content.displayName;
const DialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className), ...props });
DialogHeader.displayName = "DialogHeader";
const DialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  }
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;
const DialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
function CostosPage() {
  const {
    plants,
    readings,
    costs
  } = useDashboardData();
  const qc = useQueryClient();
  const periods = useMemo(() => uniquePeriods(readings), [readings]);
  const lastPeriod = periods[periods.length - 1] ?? null;
  const currency = costs[0]?.currency ?? "MXN";
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs(PageContainer, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Costs and rates", subtitle: "Define cost per unit for each energy. The most recent rate applies from its effective month.", right: lastPeriod ? /* @__PURE__ */ jsx(ReportDialog, { plants, readings, costs, periods }) : null }),
    lastPeriod && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-8", children: ENERGIES.map((e) => {
      const total = sumByPeriod(readings, e).get(lastPeriod) ?? 0;
      const rate = costForPeriod(costs, e, lastPeriod);
      const cost = rate != null ? total * rate : null;
      const predTotal = readings.filter((r) => r.period === lastPeriod).reduce((acc, r) => acc + (r[ENERGY_META[e].predKey] ?? 0), 0);
      const predCost = rate != null ? predTotal * rate : null;
      return /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-muted-foreground", children: ENERGY_META[e].label }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: rate != null ? `${formatCurrency(rate, currency)} / ${ENERGY_META[e].unit}` : "no rate" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "font-display text-2xl font-semibold tabular-nums", children: formatCurrency(cost, currency) }),
        /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
          "Usage ",
          formatNumber(total),
          " ",
          ENERGY_META[e].unit,
          " · Forecast ",
          formatCurrency(predCost, currency)
        ] })
      ] }, e);
    }) }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-6", children: /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-display text-lg font-semibold mb-4", children: "Active rates" }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "text-xs text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "text-left px-2 py-2 font-medium", children: "Energy" }),
          /* @__PURE__ */ jsx("th", { className: "text-right px-2 py-2 font-medium", children: "Cost" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-2 py-2 font-medium", children: "Effective from" }),
          /* @__PURE__ */ jsx("th", { className: "px-2 py-2" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { children: [
          [...costs].sort((a, b) => b.effective_from.localeCompare(a.effective_from)).map((c) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-border", children: [
            /* @__PURE__ */ jsx("td", { className: "px-2 py-2", children: ENERGY_META[c.energy].label }),
            /* @__PURE__ */ jsxs("td", { className: "px-2 py-2 text-right tabular-nums", children: [
              formatCurrency(c.cost_per_unit, c.currency),
              " / ",
              ENERGY_META[c.energy].unit
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-2 py-2", children: formatPeriodLong(c.effective_from) }),
            /* @__PURE__ */ jsx("td", { className: "px-2 py-2 text-right", children: /* @__PURE__ */ jsx("button", { "aria-label": "Delete", className: "text-muted-foreground hover:text-negative", onClick: async () => {
              if (!confirm("Delete this rate?")) return;
              const {
                error
              } = await supabase.from("unit_costs").delete().eq("id", c.id);
              if (error) toast.error(error.message);
              else {
                toast.success("Deleted");
                qc.invalidateQueries({
                  queryKey: ["unit_costs"]
                });
              }
            }, children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) }) })
          ] }, c.id)),
          costs.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 4, className: "text-center text-muted-foreground py-6", children: "No rates yet" }) })
        ] })
      ] }) })
    ] }) }),
    plants.length > 0 && lastPeriod && /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-6 mt-6", children: [
      /* @__PURE__ */ jsxs("h2", { className: "font-display text-lg font-semibold mb-1", children: [
        "Cost per plant · ",
        formatPeriodLong(lastPeriod)
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-4", children: "Share of total complex spend (actual and forecast)." }),
      /* @__PURE__ */ jsx(PlantCostTable, {})
    ] })
  ] }) });
}
function PlantCostTable() {
  const {
    plants,
    readings,
    costs
  } = useDashboardData();
  const periods = uniquePeriods(readings);
  const lastPeriod = periods[periods.length - 1];
  const currency = costs[0]?.currency ?? "MXN";
  const rows = plants.map((p) => {
    const r = readings.find((x) => x.period === lastPeriod && x.plant_id === p.id);
    let real = 0, pred = 0, hasPred = false;
    for (const e of ENERGIES) {
      const rate = costForPeriod(costs, e, lastPeriod) ?? 0;
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
  const totalReal = rows.reduce((a, r) => a + r.real, 0);
  return /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
    /* @__PURE__ */ jsx("thead", { className: "text-xs text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
      /* @__PURE__ */ jsx("th", { className: "text-left px-2 py-2 font-medium", children: "Plant" }),
      /* @__PURE__ */ jsx("th", { className: "text-right px-2 py-2 font-medium", children: "Actual cost" }),
      /* @__PURE__ */ jsx("th", { className: "text-right px-2 py-2 font-medium", children: "Share %" }),
      /* @__PURE__ */ jsx("th", { className: "text-right px-2 py-2 font-medium", children: "Forecast cost" })
    ] }) }),
    /* @__PURE__ */ jsxs("tbody", { children: [
      rows.map(({
        plant,
        real,
        pred,
        hasPred
      }) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-border", children: [
        /* @__PURE__ */ jsx("td", { className: "px-2 py-2 font-medium", children: plant.name }),
        /* @__PURE__ */ jsx("td", { className: "px-2 py-2 text-right tabular-nums", children: formatCurrency(real, currency) }),
        /* @__PURE__ */ jsx("td", { className: "px-2 py-2 text-right tabular-nums", children: totalReal > 0 ? (real / totalReal * 100).toFixed(1) + "%" : "—" }),
        /* @__PURE__ */ jsx("td", { className: "px-2 py-2 text-right tabular-nums", children: hasPred ? formatCurrency(pred, currency) : "—" })
      ] }, plant.id)),
      /* @__PURE__ */ jsxs("tr", { className: "border-t-2 border-border font-semibold", children: [
        /* @__PURE__ */ jsx("td", { className: "px-2 py-2", children: "Complex total" }),
        /* @__PURE__ */ jsx("td", { className: "px-2 py-2 text-right tabular-nums", children: formatCurrency(totalReal, currency) }),
        /* @__PURE__ */ jsx("td", { className: "px-2 py-2 text-right tabular-nums", children: "100%" }),
        /* @__PURE__ */ jsx("td", { className: "px-2 py-2 text-right tabular-nums", children: formatCurrency(rows.reduce((a, r) => a + r.pred, 0), currency) })
      ] })
    ] })
  ] }) });
}
function ReportDialog({
  plants,
  readings,
  costs,
  periods
}) {
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState(periods[periods.length - 1] ?? "");
  const currency = costs[0]?.currency ?? "MXN";
  const report = useMemo(() => {
    const rows = plants.map((p) => {
      const r = readings.find((x) => x.period === period && x.plant_id === p.id);
      const energies = ENERGIES.map((e) => {
        const usage = r?.[e] ?? 0;
        const pred = r?.[ENERGY_META[e].predKey] ?? null;
        const rate = costForPeriod(costs, e, period) ?? 0;
        return {
          energy: e,
          usage,
          pred,
          rate,
          cost: usage * rate,
          predCost: pred != null ? pred * rate : null
        };
      });
      const totalCost2 = energies.reduce((a, x) => a + x.cost, 0);
      const totalPred2 = energies.reduce((a, x) => a + (x.predCost ?? 0), 0);
      return {
        plant: p,
        energies,
        totalCost: totalCost2,
        totalPred: totalPred2
      };
    });
    const totalCost = rows.reduce((a, r) => a + r.totalCost, 0);
    const totalPred = rows.reduce((a, r) => a + r.totalPred, 0);
    const prevIdx = periods.indexOf(period) - 1;
    const prevPeriod = prevIdx >= 0 ? periods[prevIdx] : null;
    let prevTotal = 0;
    if (prevPeriod) {
      for (const p of plants) {
        const r = readings.find((x) => x.period === prevPeriod && x.plant_id === p.id);
        for (const e of ENERGIES) {
          const rate = costForPeriod(costs, e, prevPeriod) ?? 0;
          prevTotal += (r?.[e] ?? 0) * rate;
        }
      }
    }
    const change = pctChange(totalCost, prevTotal || null);
    return {
      rows,
      totalCost,
      totalPred,
      change,
      prevPeriod
    };
  }, [plants, readings, costs, period, periods]);
  const downloadCsv = () => {
    const lines = [];
    lines.push(`Finance report,${formatPeriodLong(period)}`);
    lines.push("");
    lines.push("Plant,Energy,Usage,Unit,Rate,Cost,Forecast cost");
    for (const row of report.rows) {
      for (const e of row.energies) {
        lines.push([row.plant.name, ENERGY_META[e.energy].label, e.usage, ENERGY_META[e.energy].unit, e.rate, e.cost.toFixed(2), e.predCost != null ? e.predCost.toFixed(2) : ""].join(","));
      }
      lines.push([row.plant.name, "TOTAL", "", "", "", row.totalCost.toFixed(2), row.totalPred.toFixed(2)].join(","));
    }
    lines.push("");
    lines.push(`Complex total,,,,,${report.totalCost.toFixed(2)},${report.totalPred.toFixed(2)}`);
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finance-report-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return /* @__PURE__ */ jsxs(Dialog, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "outline", children: [
      /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4 mr-2" }),
      " Generate report"
    ] }) }),
    /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Finance report" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 print:hidden", children: [
        /* @__PURE__ */ jsxs(Select, { value: period, onValueChange: setPeriod, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[220px]", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsx(SelectContent, { children: [...periods].reverse().map((p) => /* @__PURE__ */ jsx(SelectItem, { value: p, children: formatPeriodLong(p) }, p)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: downloadCsv, children: [
            /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 mr-2" }),
            " CSV"
          ] }),
          /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: () => window.print(), children: [
            /* @__PURE__ */ jsx(Printer, { className: "h-4 w-4 mr-2" }),
            " Print"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { id: "report-body", className: "space-y-6 mt-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "border-b border-border pb-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wide text-muted-foreground", children: "Reporting period" }),
          /* @__PURE__ */ jsx("div", { className: "font-display text-2xl font-semibold", children: formatPeriodLong(period) }),
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
            "Generated ",
            (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
              dateStyle: "long"
            })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "border border-border rounded-xl p-4", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Actual spend" }),
            /* @__PURE__ */ jsx("div", { className: "font-display text-2xl font-semibold tabular-nums mt-1", children: formatCurrency(report.totalCost, currency) }),
            report.change != null && /* @__PURE__ */ jsxs("div", { className: `text-xs mt-1 ${report.change > 0 ? "text-negative" : "text-positive"}`, children: [
              report.change > 0 ? "+" : "",
              report.change.toFixed(1),
              "% vs previous month"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "border border-border rounded-xl p-4", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Forecast spend" }),
            /* @__PURE__ */ jsx("div", { className: "font-display text-2xl font-semibold tabular-nums mt-1", children: report.totalPred > 0 ? formatCurrency(report.totalPred, currency) : "—" }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "Sum of plant forecasts" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "border border-border rounded-xl p-4", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Variance" }),
            /* @__PURE__ */ jsx("div", { className: "font-display text-2xl font-semibold tabular-nums mt-1", children: report.totalPred > 0 ? formatCurrency(report.totalCost - report.totalPred, currency) : "—" }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "Actual − forecast" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-display text-base font-semibold mb-3", children: "Breakdown per plant" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-5", children: report.rows.map(({
            plant,
            energies,
            totalCost,
            totalPred
          }) => /* @__PURE__ */ jsxs("div", { className: "border border-border rounded-xl overflow-hidden", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between px-4 py-3 bg-muted/40", children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium", children: plant.name }),
              /* @__PURE__ */ jsx("div", { className: "text-sm tabular-nums", children: formatCurrency(totalCost, currency) })
            ] }),
            /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
              /* @__PURE__ */ jsx("thead", { className: "text-xs text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
                /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-2 font-medium", children: "Energy" }),
                /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-2 font-medium", children: "Usage" }),
                /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-2 font-medium", children: "Rate" }),
                /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-2 font-medium", children: "Cost" }),
                /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-2 font-medium", children: "Forecast" })
              ] }) }),
              /* @__PURE__ */ jsx("tbody", { children: energies.map((e) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-border", children: [
                /* @__PURE__ */ jsx("td", { className: "px-4 py-2", children: ENERGY_META[e.energy].label }),
                /* @__PURE__ */ jsxs("td", { className: "px-4 py-2 text-right tabular-nums", children: [
                  formatNumber(e.usage),
                  " ",
                  ENERGY_META[e.energy].unit
                ] }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-2 text-right tabular-nums text-muted-foreground", children: formatCurrency(e.rate, currency) }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-2 text-right tabular-nums", children: formatCurrency(e.cost, currency) }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-2 text-right tabular-nums text-muted-foreground", children: e.predCost != null ? formatCurrency(e.predCost, currency) : "—" })
              ] }, e.energy)) })
            ] })
          ] }, plant.id)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border-t-2 border-border pt-4 flex items-baseline justify-between", children: [
          /* @__PURE__ */ jsx("div", { className: "font-display text-base font-semibold", children: "Complex total" }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("div", { className: "font-display text-xl font-semibold tabular-nums", children: formatCurrency(report.totalCost, currency) }),
            report.totalPred > 0 && /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
              "Forecast ",
              formatCurrency(report.totalPred, currency)
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  CostosPage as component
};
