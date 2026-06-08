import { jsxs, jsx } from "react/jsx-runtime";
import * as React from "react";
import { useState, useMemo } from "react";
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, ZAxis, Tooltip, Legend, Line, Scatter } from "recharts";
import { c as cn, A as AppShell, P as PageContainer, a as PageHeader, f as formatNumber, b as formatCurrency } from "./shared-FQOCBefy.js";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { L as Label, I as Input } from "./label-DjFncnTu.js";
import { B as Badge } from "./badge-C5WZK33y.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-C8_65cgt.js";
import "@tanstack/react-router";
import "lucide-react";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
import "@supabase/supabase-js";
import "@radix-ui/react-label";
import "class-variance-authority";
import "@radix-ui/react-select";
const ELEC_EQ = {
  fundicion: { a: 1861.6576, b: 1.5824, rmse: 138, mapeMonthly: 2.56 },
  norte: { a: 1267.4305, b: 0.112206, rmse: 211.4, mapeMonthly: 3.05 }
};
const WATER_CHAIN = {
  intercept: 1594.556585,
  t: 30.893213,
  elec: 0.262595,
  vol: 0.807936,
  sin: 215.219105,
  cos: 299.115121,
  rmse: 357.7,
  mapeMonthly: 5.18
};
const TARIFF_2025 = { electricity: 2315, water: 30.7 };
const SCATTER = {
  fundicionElec: [{ vol: 1504.4, real: 3841.4 }, { vol: 1554.4, real: 4212 }, { vol: 1419.3, real: 4296.6 }, { vol: 985.3, real: 3259.6 }, { vol: 1602.5, real: 4469 }, { vol: 1828.8, real: 4808.6 }, { vol: 1826.3, real: 5056.7 }, { vol: 1737.8, real: 4760.8 }, { vol: 1523.1, real: 4253.5 }, { vol: 1884.3, real: 3871.7 }, { vol: 1710.3, real: 4648.2 }, { vol: 667.9, real: 2483.1 }, { vol: 1432.8, real: 4169.1 }, { vol: 1629.7, real: 4230.3 }, { vol: 1899.2, real: 4876.9 }, { vol: 1426.3, real: 4279.7 }, { vol: 1648.6, real: 4668.8 }, { vol: 1599.7, real: 4635.8 }, { vol: 1536.1, real: 4585.1 }, { vol: 1078.3, real: 3382.9 }, { vol: 1427.8, real: 4311.9 }, { vol: 1245.4, real: 3960.7 }, { vol: 1329.8, real: 4035.5 }, { vol: 1495.8, real: 4248.3 }, { vol: 709.1, real: 3207.6 }, { vol: 1662.8, real: 4376.7 }, { vol: 1448.4, real: 4193 }, { vol: 1622.9, real: 4252.4 }, { vol: 1486.5, real: 4355.9 }, { vol: 1467.6, real: 4428 }, { vol: 1372, real: 4260.3 }, { vol: 1203.7, real: 3786.6 }, { vol: 1491.3, real: 4128.8 }, { vol: 1663.1, real: 4475.5 }, { vol: 1639, real: 4339.2 }, { vol: 1365.3, real: 3935.2 }, { vol: 540.3, real: 2596.4 }, { vol: 1497.6, real: 4037.5 }, { vol: 1534.4, real: 4338.5 }, { vol: 1408.4, real: 4051 }, { vol: 1561.6, real: 4300.2 }, { vol: 1472.3, real: 4257 }, { vol: 1633.1, real: 4480.3 }, { vol: 1642.9, real: 4427.8 }, { vol: 1344.8, real: 4170.5 }, { vol: 1720.2, real: 4567.4 }, { vol: 1343.2, real: 4339.2 }, { vol: 1070.8, real: 3465.9 }],
  norteElec: [{ vol: 24928, real: 4887.7 }, { vol: 33781, real: 4929 }, { vol: 38487, real: 5343.6 }, { vol: 31086, real: 4890.5 }, { vol: 34711, real: 5495.5 }, { vol: 37216, real: 5825.3 }, { vol: 36095, real: 5789.1 }, { vol: 34790, real: 5620.2 }, { vol: 40157, real: 5526.6 }, { vol: 37265, real: 4472 }, { vol: 32887, real: 4826 }, { vol: 19537, real: 2712.1 }, { vol: 28868, real: 5021.1 }, { vol: 38186, real: 5178.1 }, { vol: 42848, real: 6060.2 }, { vol: 36630, real: 5506.9 }, { vol: 38867, real: 5688.9 }, { vol: 28474, real: 4576.1 }, { vol: 28689, real: 4846.3 }, { vol: 39365, real: 5739.1 }, { vol: 35587, real: 5382.3 }, { vol: 33716, real: 5409.5 }, { vol: 28702, real: 4534 }, { vol: 17632, real: 2853.8 }, { vol: 27276, real: 4938.2 }, { vol: 36114, real: 5085.1 }, { vol: 32534, real: 5123.2 }, { vol: 34431, real: 5262.7 }, { vol: 31986, real: 4716.5 }, { vol: 26682, real: 4109 }, { vol: 29833, real: 4861.8 }, { vol: 41057, real: 5479.8 }, { vol: 35688, real: 5089.1 }, { vol: 37844, real: 5292.9 }, { vol: 36720, real: 4972 }, { vol: 17519, real: 2681.3 }, { vol: 30101, real: 4902 }, { vol: 27081, real: 4200.9 }, { vol: 29478, real: 4514.8 }, { vol: 29071, real: 4665.1 }, { vol: 32585, real: 4300.2 }, { vol: 33080, real: 4961.6 }, { vol: 34338, real: 4968.6 }, { vol: 33705, real: 5140.1 }, { vol: 31692, real: 4764.4 }, { vol: 37049, real: 5326.6 }, { vol: 32821, real: 4972 }, { vol: 24579, real: 3967.3 }],
  fundicionWater: [{ vol: 1504.4, real: 3383 }, { vol: 1554.4, real: 3711.7 }, { vol: 1419.3, real: 3753 }, { vol: 985.3, real: 3539 }, { vol: 1602.5, real: 3687 }, { vol: 1828.8, real: 3970.9 }, { vol: 1826.3, real: 4923.8 }, { vol: 1737.8, real: 4339 }, { vol: 1523.1, real: 4103 }, { vol: 1884.3, real: 4876.4 }, { vol: 1710.3, real: 4687.2 }, { vol: 667.9, real: 3074.8 }, { vol: 1432.8, real: 4957 }, { vol: 1629.7, real: 4729.4 }, { vol: 1899.2, real: 5304.6 }, { vol: 1426.3, real: 4902.8 }, { vol: 1648.6, real: 4859 }, { vol: 1599.7, real: 4622 }, { vol: 1536.1, real: 4009 }, { vol: 1078.3, real: 3430.3 }, { vol: 1427.8, real: 3838.9 }, { vol: 1245.4, real: 3955.4 }, { vol: 1329.8, real: 3998.6 }, { vol: 1495.8, real: 4707.3 }, { vol: 709.1, real: 4776.5 }, { vol: 1662.8, real: 5406.8 }, { vol: 1448.4, real: 5866 }, { vol: 1622.9, real: 5545.7 }, { vol: 1486.5, real: 4888.5 }, { vol: 1467.6, real: 4888.5 }, { vol: 1372, real: 3430.6 }, { vol: 1203.7, real: 3894.1 }, { vol: 1491.3, real: 4567.7 }, { vol: 1663.1, real: 4844.8 }, { vol: 1639, real: 4874.7 }, { vol: 1365.3, real: 5116 }, { vol: 540.3, real: 4502.1 }, { vol: 1497.6, real: 5346.8 }, { vol: 1534.4, real: 5529.4 }, { vol: 1408.4, real: 5142.7 }, { vol: 1561.6, real: 5456.7 }, { vol: 1472.3, real: 5670.8 }, { vol: 1633.1, real: 5726.9 }, { vol: 1642.9, real: 4982.4 }, { vol: 1344.8, real: 4575.9 }, { vol: 1720.2, real: 5451.4 }, { vol: 1343.2, real: 5182 }, { vol: 1070.8, real: 4330 }]
};
const Slider = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs(
  SliderPrimitive.Root,
  {
    ref,
    className: cn("relative flex w-full touch-none select-none items-center", className),
    ...props,
    children: [
      /* @__PURE__ */ jsx(SliderPrimitive.Track, { className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20", children: /* @__PURE__ */ jsx(SliderPrimitive.Range, { className: "absolute h-full bg-primary" }) }),
      /* @__PURE__ */ jsx(SliderPrimitive.Thumb, { className: "block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" })
    ]
  }
));
Slider.displayName = SliderPrimitive.Root.displayName;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const VOL_MIN = 500;
const VOL_MAX = 2e3;
const PLANT_LABEL = {
  fundicion: "Fundición Aluminio",
  norte: "Motores Norte"
};
function elecFor(plant, vol) {
  const eq = ELEC_EQ[plant];
  return eq.a + eq.b * vol;
}
function waterFor(vol, month) {
  const w = WATER_CHAIN;
  const elec = elecFor("fundicion", vol);
  const t = 36 + month;
  const ang = 2 * Math.PI * month / 12;
  return w.intercept + w.t * t + w.elec * elec + w.vol * vol + w.sin * Math.sin(ang) + w.cos * Math.cos(ang);
}
function SimuladorPage() {
  const [plant, setPlant] = useState("fundicion");
  const [energy, setEnergy] = useState("electricity");
  const [vol, setVol] = useState(1400);
  const [month, setMonth] = useState(6);
  const energyOptions = plant === "fundicion" ? ["electricity", "water"] : ["electricity"];
  const effEnergy = energyOptions.includes(energy) ? energy : "electricity";
  const model = useMemo(() => {
    if (effEnergy === "water") {
      return {
        consumo: waterFor(vol, month),
        elec: elecFor("fundicion", vol),
        rmse: WATER_CHAIN.rmse,
        tariff: TARIFF_2025.water,
        unit: "M³",
        mape: WATER_CHAIN.mapeMonthly,
        line: (v) => waterFor(v, month),
        cloud: SCATTER.fundicionWater,
        modelLabel: "Ridge chain (Volume → Electricity → Water)"
      };
    }
    const eq = ELEC_EQ[plant];
    return {
      consumo: elecFor(plant, vol),
      elec: null,
      rmse: eq.rmse,
      tariff: TARIFF_2025.electricity,
      unit: "MWHr",
      mape: eq.mapeMonthly,
      line: (v) => elecFor(plant, v),
      cloud: plant === "fundicion" ? SCATTER.fundicionElec : SCATTER.norteElec,
      modelLabel: `OLS  consumo = ${eq.a.toFixed(0)} + ${eq.b.toFixed(plant === "norte" ? 5 : 4)} × Volume`
    };
  }, [plant, effEnergy, vol, month]);
  const cost = model.consumo * model.tariff;
  const costLow = (model.consumo - model.rmse) * model.tariff;
  const costHigh = (model.consumo + model.rmse) * model.tariff;
  const lineData = useMemo(() => {
    const xs = [VOL_MIN, VOL_MAX];
    return xs.map((v) => {
      const y = model.line(v);
      return {
        vol: v,
        model: y,
        high: y + model.rmse,
        low: y - model.rmse
      };
    });
  }, [model]);
  const simPoint = [{
    vol,
    consumo: model.consumo
  }];
  return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs(PageContainer, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Forecast simulator", subtitle: "Move production volume to project consumption and cost. Coefficients from the validated models; tariffs are 2025." }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-6 space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-xs text-muted-foreground", children: "Plant" }),
            /* @__PURE__ */ jsxs(Select, { value: plant, onValueChange: (v) => {
              setPlant(v);
              if (v === "norte") setEnergy("electricity");
            }, children: [
              /* @__PURE__ */ jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "fundicion", children: "Fundición Aluminio" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "norte", children: "Motores Norte" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-xs text-muted-foreground", children: "Energy" }),
            /* @__PURE__ */ jsxs(Select, { value: effEnergy, onValueChange: (v) => setEnergy(v), children: [
              /* @__PURE__ */ jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsx(SelectContent, { children: energyOptions.map((e) => /* @__PURE__ */ jsx(SelectItem, { value: e, children: e === "water" ? "Water" : "Electricity" }, e)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsx(Label, { className: "text-xs text-muted-foreground", children: "Production volume" }),
            /* @__PURE__ */ jsx(Input, { type: "number", value: vol, min: VOL_MIN, max: VOL_MAX, onChange: (e) => setVol(Math.max(VOL_MIN, Math.min(VOL_MAX, Number(e.target.value) || 0))), className: "w-28 h-8 text-right tabular-nums" })
          ] }),
          /* @__PURE__ */ jsx(Slider, { value: [vol], min: VOL_MIN, max: VOL_MAX, step: 5, onValueChange: ([v]) => setVol(v) }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[10px] text-muted-foreground mt-1", children: [
            /* @__PURE__ */ jsx("span", { children: VOL_MIN }),
            /* @__PURE__ */ jsx("span", { children: VOL_MAX })
          ] })
        ] }),
        effEnergy === "water" && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs text-muted-foreground", children: "Reference month (seasonality)" }),
          /* @__PURE__ */ jsxs(Select, { value: String(month), onValueChange: (v) => setMonth(Number(v)), children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsx(SelectContent, { children: MONTHS.map((m, i) => /* @__PURE__ */ jsx(SelectItem, { value: String(i), children: m }, m)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground border-t border-border pt-3", children: [
          /* @__PURE__ */ jsx("div", { className: "font-medium text-foreground mb-1", children: model.modelLabel }),
          /* @__PURE__ */ jsxs("div", { children: [
            "Validation MAPE (2025): ",
            /* @__PURE__ */ jsxs("span", { className: "tabular-nums", children: [
              model.mape.toFixed(2),
              "%"
            ] })
          ] }),
          effEnergy === "water" && /* @__PURE__ */ jsxs("div", { className: "mt-1", children: [
            "Chained electricity: ",
            /* @__PURE__ */ jsxs("span", { className: "tabular-nums", children: [
              formatNumber(model.elec),
              " MWHr"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mt-2", children: [
            "Gas isn't simulated here: it has no production driver (Norte is naive seasonal, Fundición is in progress). See ",
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Model health" }),
            "."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-6", children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Projected consumption" }),
          /* @__PURE__ */ jsxs("div", { className: "font-display text-4xl font-semibold tabular-nums mt-1", children: [
            formatNumber(model.consumo),
            /* @__PURE__ */ jsx("span", { className: "text-lg text-muted-foreground ml-1", children: model.unit })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
            "± ",
            formatNumber(model.rmse),
            " ",
            model.unit,
            " (RMSE)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-6", children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Projected monthly cost" }),
          /* @__PURE__ */ jsx("div", { className: "font-display text-4xl font-semibold tabular-nums mt-1", children: formatCurrency(cost) }),
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
            formatCurrency(costLow),
            " – ",
            formatCurrency(costHigh)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2 bg-card border border-border rounded-2xl p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsxs("h2", { className: "font-display text-lg font-semibold", children: [
              PLANT_LABEL[plant],
              " · ",
              effEnergy === "water" ? "Water" : "Electricity"
            ] }),
            /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "Simulated point on history 2022–2025" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-[320px]", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(ComposedChart, { margin: {
            top: 8,
            right: 12,
            bottom: 8,
            left: 4
          }, children: [
            /* @__PURE__ */ jsx(CartesianGrid, { stroke: "var(--color-border)", vertical: false }),
            /* @__PURE__ */ jsx(XAxis, { type: "number", dataKey: "vol", domain: [VOL_MIN, VOL_MAX], stroke: "var(--color-muted-foreground)", fontSize: 11, tickFormatter: (v) => formatNumber(Number(v)), name: "Volume" }),
            /* @__PURE__ */ jsx(YAxis, { type: "number", stroke: "var(--color-muted-foreground)", fontSize: 11, tickFormatter: (v) => formatNumber(Number(v)) }),
            /* @__PURE__ */ jsx(ZAxis, { range: [60, 60] }),
            /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
              background: "var(--color-popover)",
              border: "1px solid var(--color-border)",
              borderRadius: 12,
              fontSize: 12
            }, formatter: (v) => formatNumber(Number(v)) }),
            /* @__PURE__ */ jsx(Legend, { wrapperStyle: {
              fontSize: 11
            } }),
            /* @__PURE__ */ jsx(Line, { data: lineData, dataKey: "high", name: "±RMSE", stroke: "var(--color-muted-foreground)", strokeDasharray: "4 3", strokeWidth: 1, dot: false, legendType: "none" }),
            /* @__PURE__ */ jsx(Line, { data: lineData, dataKey: "low", name: "±RMSE", stroke: "var(--color-muted-foreground)", strokeDasharray: "4 3", strokeWidth: 1, dot: false }),
            /* @__PURE__ */ jsx(Line, { data: lineData, dataKey: "model", name: "Model", stroke: "var(--color-electricity)", strokeWidth: 2, dot: false }),
            /* @__PURE__ */ jsx(Scatter, { data: model.cloud, dataKey: "real", name: "History", fill: "var(--color-muted-foreground)", fillOpacity: 0.5 }),
            /* @__PURE__ */ jsx(Scatter, { data: simPoint, dataKey: "consumo", name: "Simulated", fill: "var(--color-electricity)" })
          ] }) }) })
        ] })
      ] })
    ] })
  ] }) });
}
export {
  SimuladorPage as component
};
