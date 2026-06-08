import { jsxs, jsx } from "react/jsx-runtime";
import { useRouterState, Link } from "@tanstack/react-router";
import { Droplet, LayoutDashboard, Factory, LineChart, Wallet, Activity, SlidersHorizontal, Database } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/plantas", label: "Plants", icon: Factory },
  { to: "/historico", label: "History", icon: LineChart },
  { to: "/costos", label: "Costs", icon: Wallet },
  { to: "/modelos", label: "Models", icon: Activity },
  { to: "/simulador", label: "Simulator", icon: SlidersHorizontal },
  { to: "/datos", label: "Data", icon: Database }
];
function AppShell({ children }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex bg-background", children: [
    /* @__PURE__ */ jsxs("aside", { className: "hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-card", children: [
      /* @__PURE__ */ jsxs("div", { className: "px-6 py-6 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "h-9 w-9 rounded-xl bg-primary text-primary-foreground grid place-items-center", children: /* @__PURE__ */ jsx(Droplet, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "font-display text-lg leading-tight", children: "EnergyOps" }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Industrial Complex" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("nav", { className: "px-3 py-2 flex flex-col gap-1", children: NAV.map((item) => {
        const active = pathname === item.to || item.to !== "/" && pathname.startsWith(item.to);
        const Icon = item.icon;
        return /* @__PURE__ */ jsxs(
          Link,
          {
            to: item.to,
            className: cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              active ? "bg-secondary text-foreground font-medium" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            ),
            children: [
              /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }),
              item.label
            ]
          },
          item.to
        );
      }) }),
      /* @__PURE__ */ jsx("div", { className: "mt-auto p-4 text-xs text-muted-foreground", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-center", children: [
        /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-positive" }),
        " Data up to date"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col min-w-0", children: [
      /* @__PURE__ */ jsxs("header", { className: "md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card", children: [
        /* @__PURE__ */ jsx("div", { className: "font-display text-lg", children: "EnergyOps" }),
        /* @__PURE__ */ jsx("nav", { className: "flex gap-1", children: NAV.map((item) => {
          const active = pathname === item.to || item.to !== "/" && pathname.startsWith(item.to);
          const Icon = item.icon;
          return /* @__PURE__ */ jsx(
            Link,
            {
              to: item.to,
              className: cn(
                "p-2 rounded-md",
                active ? "bg-secondary text-foreground" : "text-muted-foreground"
              ),
              "aria-label": item.label,
              children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" })
            },
            item.to
          );
        }) })
      ] }),
      /* @__PURE__ */ jsx("main", { className: "flex-1 min-w-0", children })
    ] })
  ] });
}
function createSupabaseClient() {
  const SUPABASE_URL = "https://ymulldopiopivliptlov.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!SUPABASE_PUBLISHABLE_KEY) {
    const missing = [
      ...[],
      ...!SUPABASE_PUBLISHABLE_KEY ? ["SUPABASE_PUBLISHABLE_KEY"] : []
    ];
    const message = `Missing Supabase environment variable(s): ${missing.join(", ")}. Connect Supabase in Lovable Cloud.`;
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : void 0,
      persistSession: true,
      autoRefreshToken: true
    }
  });
}
let _supabase;
const supabase = new Proxy({}, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  }
});
const ENERGIES = ["water", "gas", "electricity"];
const ENERGY_META = {
  water: { label: "Water", unit: "M3", color: "var(--color-water)", soft: "var(--color-water-soft)", predKey: "water_pred" },
  gas: { label: "NG", unit: "MWHr", color: "var(--color-gas)", soft: "var(--color-gas-soft)", predKey: "gas_pred" },
  electricity: { label: "Electricity", unit: "MWHr", color: "var(--color-electricity)", soft: "var(--color-electricity-soft)", predKey: "electricity_pred" }
};
async function fetchUnitCosts() {
  const { data, error } = await supabase.from("unit_costs").select("*").order("effective_from", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
function costForPeriod(costs, energy, period) {
  const applicable = costs.filter((c) => c.energy === energy && c.effective_from <= period).sort((a, b) => b.effective_from.localeCompare(a.effective_from));
  return applicable[0]?.cost_per_unit ?? null;
}
function currencyOf(costs) {
  return costs[0]?.currency ?? "MXN";
}
function formatCurrency(n, currency = "MXN") {
  if (n == null || isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}
async function fetchModelMetrics() {
  const { data, error } = await supabase.from("model_metrics").select("*");
  if (error) throw error;
  return data ?? [];
}
async function fetchPlants() {
  const { data, error } = await supabase.from("plants").select("*").order("sort_order");
  if (error) throw error;
  return data ?? [];
}
async function fetchReadings() {
  const { data, error } = await supabase.from("energy_readings").select("*").order("period", { ascending: true }).limit(5e3);
  if (error) throw error;
  return data ?? [];
}
function formatPeriod(d) {
  const date = new Date(d);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}
function formatPeriodLong(d) {
  const date = new Date(d);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}
function formatNumber(n, digits = 0) {
  if (n == null || isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n);
}
function pctChange(current, previous) {
  if (current == null || previous == null || previous === 0) return null;
  return (current - previous) / previous * 100;
}
function uniquePeriods(readings) {
  const set = new Set(readings.map((r) => r.period));
  return [...set].sort();
}
function sumByPeriod(readings, energy) {
  const map = /* @__PURE__ */ new Map();
  for (const r of readings) {
    const v = r[energy];
    if (v == null) continue;
    map.set(r.period, (map.get(r.period) ?? 0) + v);
  }
  return map;
}
function useDashboardData() {
  const plants = useQuery({ queryKey: ["plants"], queryFn: fetchPlants });
  const readings = useQuery({ queryKey: ["readings"], queryFn: fetchReadings });
  const costs = useQuery({ queryKey: ["unit_costs"], queryFn: fetchUnitCosts });
  return {
    plants: plants.data ?? [],
    readings: readings.data ?? [],
    costs: costs.data ?? [],
    isLoading: plants.isLoading || readings.isLoading || costs.isLoading,
    error: plants.error || readings.error || costs.error
  };
}
function PageHeader({ title, subtitle, right }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end justify-between gap-4 mb-8", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "font-display text-3xl font-semibold", children: title }),
      subtitle && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: subtitle })
    ] }),
    right
  ] });
}
function PageContainer({ children }) {
  return /* @__PURE__ */ jsx("div", { className: "px-4 md:px-8 py-6 md:py-10 max-w-[1400px] mx-auto", children });
}
export {
  AppShell as A,
  ENERGIES as E,
  PageContainer as P,
  PageHeader as a,
  formatCurrency as b,
  cn as c,
  uniquePeriods as d,
  formatPeriodLong as e,
  formatNumber as f,
  ENERGY_META as g,
  fetchModelMetrics as h,
  formatPeriod as i,
  costForPeriod as j,
  currencyOf as k,
  sumByPeriod as l,
  pctChange as p,
  supabase as s,
  useDashboardData as u
};
