import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Save, Sparkles, Undo2 } from "lucide-react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Cell } from "recharts";
import { u as useDashboardData, A as AppShell, P as PageContainer, a as PageHeader, E as ENERGIES, g as ENERGY_META, e as formatPeriodLong, f as formatNumber, s as supabase, j as costForPeriod, k as currencyOf, b as formatCurrency } from "./shared-FQOCBefy.js";
import { B as Button } from "./button-CsN5oC7l.js";
import { L as Label, I as Input } from "./label-DjFncnTu.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-C8_65cgt.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-FLmr99I2.js";
import "@tanstack/react-router";
import "clsx";
import "tailwind-merge";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
import "@radix-ui/react-tabs";
function DataPage() {
  const {
    plants,
    readings,
    costs
  } = useDashboardData();
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({
    queryKey: ["readings"]
  });
  const recent = useMemo(() => [...readings].sort((a, b) => b.period.localeCompare(a.period)).slice(0, 20), [readings]);
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs(PageContainer, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Data entry", subtitle: "Fill in monthly consumption per plant and generate forecasts." }),
    /* @__PURE__ */ jsxs(Tabs, { defaultValue: "manual", children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "mb-6", children: [
        /* @__PURE__ */ jsx(TabsTrigger, { value: "manual", children: "Manual entry" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "predict", children: "Forecast" })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "manual", children: /* @__PURE__ */ jsx(ManualForm, { plants, onSaved: invalidate }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "predict", children: /* @__PURE__ */ jsx(PredictPanel, { plants, readings, costs, onSaved: invalidate }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-6 mt-8", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-display text-lg font-semibold mb-4", children: "Recent records" }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "text-xs text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "text-left px-2 py-2 font-medium", children: "Month" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-2 py-2 font-medium", children: "Plant" }),
          ENERGIES.map((e) => /* @__PURE__ */ jsx("th", { className: "text-right px-2 py-2 font-medium", children: ENERGY_META[e].label }, e)),
          /* @__PURE__ */ jsx("th", { className: "px-2 py-2" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: recent.map((r) => {
          const plant = plants.find((p) => p.id === r.plant_id);
          return /* @__PURE__ */ jsxs("tr", { className: "border-t border-border", children: [
            /* @__PURE__ */ jsx("td", { className: "px-2 py-2", children: formatPeriodLong(r.period) }),
            /* @__PURE__ */ jsx("td", { className: "px-2 py-2 font-medium", children: plant?.name ?? "—" }),
            ENERGIES.map((e) => /* @__PURE__ */ jsx("td", { className: "px-2 py-2 text-right tabular-nums", children: formatNumber(r[e]) }, e)),
            /* @__PURE__ */ jsx("td", { className: "px-2 py-2 text-right", children: /* @__PURE__ */ jsx("button", { "aria-label": "Delete", className: "text-muted-foreground hover:text-negative", onClick: async () => {
              if (!confirm("Delete this record?")) return;
              const {
                error
              } = await supabase.from("energy_readings").delete().eq("id", r.id);
              if (error) toast.error(error.message);
              else {
                toast.success("Record deleted");
                qc.invalidateQueries({
                  queryKey: ["readings"]
                });
              }
            }, children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) }) })
          ] }, r.id);
        }) })
      ] }) })
    ] })
  ] }) });
}
function currentMonthInput() {
  const d = /* @__PURE__ */ new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function ManualForm({
  plants,
  onSaved
}) {
  const [plantId, setPlantId] = useState("");
  const [month, setMonth] = useState(currentMonthInput());
  const [values, setValues] = useState({
    water: "",
    gas: "",
    electricity: ""
  });
  const [saving, setSaving] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!plantId) return toast.error("Select a plant");
    setSaving(true);
    const period = `${month}-01`;
    const num = (s) => s.trim() === "" ? null : Number(s);
    const payload = {
      plant_id: plantId,
      period,
      water: num(values.water),
      gas: num(values.gas),
      electricity: num(values.electricity)
    };
    const {
      error
    } = await supabase.from("energy_readings").upsert(payload, {
      onConflict: "plant_id,period"
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Record saved");
    setValues({
      water: "",
      gas: "",
      electricity: ""
    });
    onSaved();
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "bg-card border border-border rounded-2xl p-6 grid gap-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { className: "mb-2 block", children: "Plant" }),
        /* @__PURE__ */ jsxs(Select, { value: plantId, onValueChange: setPlantId, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select plant" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: plants.map((p) => /* @__PURE__ */ jsx(SelectItem, { value: p.id, children: p.name }, p.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { className: "mb-2 block", children: "Month" }),
        /* @__PURE__ */ jsx(Input, { type: "month", value: month, onChange: (e) => setMonth(e.target.value), required: true })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: ENERGIES.map((e) => /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs(Label, { className: "mb-2 block", children: [
        ENERGY_META[e].label,
        " (",
        ENERGY_META[e].unit,
        ")"
      ] }),
      /* @__PURE__ */ jsx(Input, { type: "number", step: "any", inputMode: "decimal", placeholder: "0", value: values[e], onChange: (ev) => setValues((v) => ({
        ...v,
        [e]: ev.target.value
      })) })
    ] }, e)) }),
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(Button, { type: "submit", disabled: saving, children: [
      /* @__PURE__ */ jsx(Save, { className: "h-4 w-4 mr-2" }),
      saving ? "Saving..." : "Save record"
    ] }) })
  ] });
}
function nextMonthISO(period) {
  const [y, m] = period.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1, 1));
  d.setUTCMonth(d.getUTCMonth() + 1);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
}
function forecastNext(values) {
  const xs = [];
  const ys = [];
  values.forEach((v, i) => {
    if (v != null && !isNaN(v)) {
      xs.push(i);
      ys.push(v);
    }
  });
  if (ys.length === 0) return null;
  if (ys.length === 1) return ys[0];
  const n = ys.length;
  const sx = xs.reduce((a, b) => a + b, 0);
  const sy = ys.reduce((a, b) => a + b, 0);
  const sxy = xs.reduce((a, x, i) => a + x * ys[i], 0);
  const sxx = xs.reduce((a, x) => a + x * x, 0);
  const denom = n * sxx - sx * sx;
  const meanY = sy / n;
  if (denom === 0) return meanY;
  const slope = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;
  const next = intercept + slope * values.length;
  return Math.max(0, next);
}
function PredictPanel({
  plants,
  readings,
  costs,
  onSaved
}) {
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const {
    targetPeriod,
    forecasts,
    hasData
  } = useMemo(() => {
    const periods = [...new Set(readings.map((r) => r.period))].sort();
    const last = periods[periods.length - 1];
    if (!last) return {
      targetPeriod: null,
      forecasts: [],
      hasData: false
    };
    const target = nextMonthISO(last);
    const out = plants.map((p) => {
      const series = readings.filter((r) => r.plant_id === p.id).sort((a, b) => a.period.localeCompare(b.period));
      const values = {
        water: null,
        gas: null,
        electricity: null
      };
      const costsMap = {
        water: null,
        gas: null,
        electricity: null
      };
      for (const e of ENERGIES) {
        const arr = series.map((r) => r[e]).filter((v2) => v2 != null);
        const v = forecastNext(arr);
        values[e] = v;
        const rate = costForPeriod(costs, e, target);
        costsMap[e] = v != null && rate != null ? v * rate : null;
      }
      return {
        plantId: p.id,
        plantName: p.name,
        values,
        costs: costsMap
      };
    });
    return {
      targetPeriod: target,
      forecasts: out,
      hasData: true
    };
  }, [plants, readings, costs]);
  const totalsByEnergy = useMemo(() => {
    const t = {
      water: {
        v: 0,
        c: 0
      },
      gas: {
        v: 0,
        c: 0
      },
      electricity: {
        v: 0,
        c: 0
      }
    };
    for (const f of forecasts) {
      for (const e of ENERGIES) {
        if (f.values[e] != null) t[e].v += f.values[e];
        if (f.costs[e] != null) t[e].c += f.costs[e];
      }
    }
    return t;
  }, [forecasts]);
  const currency = currencyOf(costs);
  const savePredictions = async () => {
    if (!targetPeriod) return;
    setSaving(true);
    const {
      data: existing
    } = await supabase.from("energy_readings").select("id, plant_id, water, gas, electricity").eq("period", targetPeriod);
    const map = new Map((existing ?? []).map((r) => [r.plant_id, r]));
    const payload = forecasts.map((f) => {
      const row = map.get(f.plantId);
      return {
        plant_id: f.plantId,
        period: targetPeriod,
        water: row?.water ?? null,
        gas: row?.gas ?? null,
        electricity: row?.electricity ?? null,
        water_pred: f.values.water,
        gas_pred: f.values.gas,
        electricity_pred: f.values.electricity
      };
    });
    const {
      error
    } = await supabase.from("energy_readings").upsert(payload, {
      onConflict: "plant_id,period"
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(`Forecasts saved for ${formatPeriodLong(targetPeriod)}`);
    onSaved();
  };
  const deleteLastPredictions = async () => {
    const periodsWithPred = [...new Set(readings.filter((r) => r.water_pred != null || r.gas_pred != null || r.electricity_pred != null).map((r) => r.period))].sort();
    const last = periodsWithPred[periodsWithPred.length - 1];
    if (!last) return toast.error("No forecasts on record");
    if (!confirm(`Delete forecasts for ${formatPeriodLong(last)}?`)) return;
    setRemoving(true);
    const rows = readings.filter((r) => r.period === last);
    const toDelete = rows.filter((r) => r.water == null && r.gas == null && r.electricity == null).map((r) => r.id);
    const toNull = rows.filter((r) => !toDelete.includes(r.id)).map((r) => r.id);
    if (toDelete.length) {
      const {
        error
      } = await supabase.from("energy_readings").delete().in("id", toDelete);
      if (error) {
        setRemoving(false);
        return toast.error(error.message);
      }
    }
    if (toNull.length) {
      const {
        error
      } = await supabase.from("energy_readings").update({
        water_pred: null,
        gas_pred: null,
        electricity_pred: null
      }).in("id", toNull);
      if (error) {
        setRemoving(false);
        return toast.error(error.message);
      }
    }
    setRemoving(false);
    toast.success(`Forecasts for ${formatPeriodLong(last)} deleted`);
    onSaved();
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx("div", { className: "bg-card border border-border rounded-2xl p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "font-display text-lg font-semibold", children: "Base forecast (linear trend)" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: hasData && targetPeriod ? /* @__PURE__ */ jsxs(Fragment, { children: [
          "Forecast for ",
          /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: formatPeriodLong(targetPeriod) }),
          " — monthly horizon (next month only)."
        ] }) : "Not enough historical data to forecast yet." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-end gap-3", children: [
        /* @__PURE__ */ jsxs(Button, { onClick: savePredictions, disabled: !hasData || saving, children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 mr-2" }),
          saving ? "Saving..." : "Forecast and save"
        ] }),
        /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: deleteLastPredictions, disabled: removing, children: [
          /* @__PURE__ */ jsx(Undo2, { className: "h-4 w-4 mr-2" }),
          removing ? "Removing..." : "Remove last"
        ] })
      ] })
    ] }) }),
    hasData && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: ENERGIES.map((e) => /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
          ENERGY_META[e].label,
          " forecast"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "font-display text-2xl font-semibold mt-1 tabular-nums", children: [
          formatNumber(totalsByEnergy[e].v),
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground font-normal", children: ENERGY_META[e].unit })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground mt-1", children: [
          "Estimated cost: ",
          /* @__PURE__ */ jsx("span", { className: "text-foreground font-medium", children: formatCurrency(totalsByEnergy[e].c, currency) })
        ] })
      ] }, e)) }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-display text-base font-semibold mb-4", children: "Forecast per plant" }),
        /* @__PURE__ */ jsx("div", { className: "h-72", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: forecasts.map((f) => ({
          name: f.plantName,
          ...f.values
        })), children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.2 }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "name", tick: {
            fontSize: 12
          } }),
          /* @__PURE__ */ jsx(YAxis, { tick: {
            fontSize: 12
          } }),
          /* @__PURE__ */ jsx(Tooltip, {}),
          /* @__PURE__ */ jsx(Legend, {}),
          ENERGIES.map((e) => /* @__PURE__ */ jsx(Bar, { dataKey: e, name: ENERGY_META[e].label, fill: ENERGY_META[e].color, radius: [4, 4, 0, 0], children: forecasts.map((_, i) => /* @__PURE__ */ jsx(Cell, {}, i)) }, e))
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-6 overflow-x-auto", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-display text-base font-semibold mb-4", children: "Forecast detail and cost per plant" }),
        /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsx("thead", { className: "text-xs text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "text-left px-2 py-2 font-medium", children: "Plant" }),
            ENERGIES.map((e) => /* @__PURE__ */ jsxs("th", { className: "text-right px-2 py-2 font-medium", children: [
              ENERGY_META[e].label,
              " (",
              ENERGY_META[e].unit,
              ")"
            ] }, e)),
            ENERGIES.map((e) => /* @__PURE__ */ jsxs("th", { className: "text-right px-2 py-2 font-medium", children: [
              ENERGY_META[e].label,
              " cost"
            ] }, `c-${e}`)),
            /* @__PURE__ */ jsx("th", { className: "text-right px-2 py-2 font-medium", children: "Total" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: forecasts.map((f) => {
            const total = ENERGIES.reduce((s, e) => s + (f.costs[e] ?? 0), 0);
            return /* @__PURE__ */ jsxs("tr", { className: "border-t border-border", children: [
              /* @__PURE__ */ jsx("td", { className: "px-2 py-2 font-medium", children: f.plantName }),
              ENERGIES.map((e) => /* @__PURE__ */ jsx("td", { className: "px-2 py-2 text-right tabular-nums", children: formatNumber(f.values[e]) }, e)),
              ENERGIES.map((e) => /* @__PURE__ */ jsx("td", { className: "px-2 py-2 text-right tabular-nums", children: formatCurrency(f.costs[e], currency) }, `c-${e}`)),
              /* @__PURE__ */ jsx("td", { className: "px-2 py-2 text-right tabular-nums font-medium", children: formatCurrency(total, currency) })
            ] }, f.plantId);
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(ModelsCatalog, { plants, readings })
    ] })
  ] });
}
function fitLinear(values) {
  const xs = [];
  const ys = [];
  values.forEach((v, i) => {
    if (v != null && !isNaN(v)) {
      xs.push(i);
      ys.push(v);
    }
  });
  if (ys.length < 2) return null;
  const n = ys.length;
  const sx = xs.reduce((a2, b2) => a2 + b2, 0);
  const sy = ys.reduce((a2, b2) => a2 + b2, 0);
  const sxy = xs.reduce((a2, x, i) => a2 + x * ys[i], 0);
  const sxx = xs.reduce((a2, x) => a2 + x * x, 0);
  const denom = n * sxx - sx * sx;
  if (denom === 0) return {
    a: sy / n,
    b: 0,
    n
  };
  const b = (n * sxy - sx * sy) / denom;
  const a = (sy - b * sx) / n;
  return {
    a,
    b,
    n
  };
}
function fmtCoef(x) {
  const abs = Math.abs(x);
  if (abs >= 1e3) return x.toFixed(0);
  if (abs >= 1) return x.toFixed(2);
  return x.toFixed(4);
}
function ModelsCatalog({
  plants,
  readings
}) {
  const models = useMemo(() => {
    const out = [];
    for (const p of plants) {
      const series = readings.filter((r) => r.plant_id === p.id).sort((a, b) => a.period.localeCompare(b.period));
      for (const e of ENERGIES) {
        const arr = series.map((r) => r[e]).filter((v) => v != null);
        out.push({
          plantId: p.id,
          plantName: p.name,
          energy: e,
          fit: fitLinear(arr)
        });
      }
    }
    return out;
  }, [plants, readings]);
  return /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-6", children: [
    /* @__PURE__ */ jsx("h3", { className: "font-display text-base font-semibold", children: "Models catalog" }),
    /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: [
      "One simple linear regression per plant × energy. Forecast horizon: ",
      /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: "1 month" }),
      "."
    ] }),
    /* @__PURE__ */ jsx("div", { className: "overflow-x-auto mt-4", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { className: "text-xs text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "text-left px-2 py-2 font-medium", children: "#" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-2 py-2 font-medium", children: "Plant" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-2 py-2 font-medium", children: "Energy" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-2 py-2 font-medium", children: "Type" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-2 py-2 font-medium", children: "Equation" }),
        /* @__PURE__ */ jsx("th", { className: "text-right px-2 py-2 font-medium", children: "Samples (n)" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: models.map((m, i) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-border", children: [
        /* @__PURE__ */ jsx("td", { className: "px-2 py-2 tabular-nums text-muted-foreground", children: i + 1 }),
        /* @__PURE__ */ jsx("td", { className: "px-2 py-2 font-medium", children: m.plantName }),
        /* @__PURE__ */ jsxs("td", { className: "px-2 py-2", children: [
          ENERGY_META[m.energy].label,
          " (",
          ENERGY_META[m.energy].unit,
          ")"
        ] }),
        /* @__PURE__ */ jsx("td", { className: "px-2 py-2 text-muted-foreground", children: "Linear regression" }),
        /* @__PURE__ */ jsx("td", { className: "px-2 py-2 font-mono text-xs", children: m.fit ? /* @__PURE__ */ jsxs(Fragment, { children: [
          "ŷ = ",
          fmtCoef(m.fit.a),
          " ",
          m.fit.b >= 0 ? "+" : "−",
          " ",
          fmtCoef(Math.abs(m.fit.b)),
          "·t"
        ] }) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "insufficient data" }) }),
        /* @__PURE__ */ jsx("td", { className: "px-2 py-2 text-right tabular-nums", children: m.fit?.n ?? 0 })
      ] }, `${m.plantId}-${m.energy}`)) })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6", children: [
      /* @__PURE__ */ jsx("h4", { className: "font-display text-sm font-semibold mb-2", children: "Data dictionary" }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "text-xs text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "text-left px-2 py-2 font-medium", children: "Variable" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-2 py-2 font-medium", children: "Type" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-2 py-2 font-medium", children: "Unit" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-2 py-2 font-medium", children: "Meaning" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: [{
          v: "ŷ",
          t: "Output",
          u: "energy unit",
          m: "Forecasted consumption for the next month."
        }, {
          v: "t",
          t: "Input",
          u: "month index (0…n−1)",
          m: "Ordinal position of each historical month, oldest = 0."
        }, {
          v: "a",
          t: "Coefficient",
          u: "energy unit",
          m: "Intercept — baseline consumption when t = 0."
        }, {
          v: "b",
          t: "Coefficient",
          u: "energy unit / month",
          m: "Slope — monthly change in consumption (trend)."
        }, {
          v: "n",
          t: "Metadata",
          u: "count",
          m: "Number of historical monthly samples used to fit the model."
        }, {
          v: "Electricity",
          t: "Series",
          u: "MWHr",
          m: "Monthly electrical energy consumption per plant."
        }, {
          v: "NG",
          t: "Series",
          u: "MWHr",
          m: "Monthly natural gas energy consumption per plant."
        }, {
          v: "Water",
          t: "Series",
          u: "M3",
          m: "Monthly water volume consumption per plant."
        }].map((row) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-border", children: [
          /* @__PURE__ */ jsx("td", { className: "px-2 py-2 font-mono text-xs", children: row.v }),
          /* @__PURE__ */ jsx("td", { className: "px-2 py-2 text-muted-foreground", children: row.t }),
          /* @__PURE__ */ jsx("td", { className: "px-2 py-2 text-muted-foreground", children: row.u }),
          /* @__PURE__ */ jsx("td", { className: "px-2 py-2", children: row.m })
        ] }, row.v)) })
      ] }) })
    ] })
  ] });
}
export {
  DataPage as component
};
