import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Download } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  PageContainer,
  PageHeader,
  useDashboardData,
} from "@/components/dashboard/shared";
import {
  ENERGIES,
  ENERGY_META,
  formatNumber,
  formatPeriod,
  uniquePeriods,
  type Energy,
  type Plant,
  type Reading,
} from "@/lib/dashboard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Agg = "monthly" | "quarterly" | "annual";

export const Route = createFileRoute("/historico")({
  head: () => ({
    meta: [
      { title: "History — EnergyOps" },
      { name: "description", content: "Time series of consumption by plant and energy." },
    ],
  }),
  component: HistoricoPage,
});

// ---- aggregation helpers --------------------------------------------------
function yearOf(period: string) {
  return Number(period.slice(0, 4));
}
function quarterOf(period: string) {
  return Math.ceil(Number(period.slice(5, 7)) / 3);
}

/** Groups the sorted periods at the chosen granularity (chronological). */
function groupPeriods(periods: string[], agg: Agg): { label: string; members: string[] }[] {
  if (agg === "monthly") return periods.map((p) => ({ label: formatPeriod(p), members: [p] }));
  const map = new Map<string, { label: string; members: string[] }>();
  for (const p of periods) {
    const y = yearOf(p);
    const key = agg === "annual" ? `${y}` : `${y}-Q${quarterOf(p)}`;
    const label = agg === "annual" ? `${y}` : `Q${quarterOf(p)} ${y}`;
    if (!map.has(key)) map.set(key, { label, members: [] });
    map.get(key)!.members.push(p);
  }
  return [...map.values()];
}

function mape(pairs: { real: number; pred: number }[]): number | null {
  const valid = pairs.filter((p) => p.real > 0);
  if (valid.length === 0) return null;
  return (100 * valid.reduce((a, p) => a + Math.abs((p.real - p.pred) / p.real), 0)) / valid.length;
}

function HistoricoPage() {
  const { plants, readings } = useDashboardData();
  const periods = useMemo(() => uniquePeriods(readings), [readings]);
  const [visiblePlants, setVisiblePlants] = useState<Set<string>>(new Set());
  const [showTotal, setShowTotal] = useState(true);
  const [agg, setAgg] = useState<Agg>("monthly");

  const allActive = visiblePlants.size === 0; // empty = all

  const togglePlant = (id: string) => {
    setVisiblePlants((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <AppShell>
      <PageContainer>
        <PageHeader
          title="History by energy"
          subtitle="Monthly trend with actuals and forecast lines. Toggle aggregation to see how error shrinks."
          right={
            <Button variant="outline" size="sm" onClick={() => exportCsv(readings, plants)}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          }
        />

        <div className="bg-card border border-border rounded-2xl p-4 mb-6 flex flex-wrap gap-4 items-center">
          <span className="text-sm font-medium">Plants:</span>
          {plants.map((p) => {
            const checked = allActive || visiblePlants.has(p.id);
            return (
              <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={checked} onCheckedChange={() => togglePlant(p.id)} />
                {p.name}
              </label>
            );
          })}
          <div className="h-5 w-px bg-border mx-1" />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox checked={showTotal} onCheckedChange={(v) => setShowTotal(!!v)} />
            Show total
          </label>
          <div className="h-5 w-px bg-border mx-1" />
          <Tabs value={agg} onValueChange={(v) => setAgg(v as Agg)}>
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
              <TabsTrigger value="annual">Annual</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {ENERGIES.map((energy) => (
            <EnergyChart
              key={energy}
              energy={energy}
              plants={plants}
              readings={readings}
              periods={periods}
              visiblePlants={visiblePlants}
              showTotal={showTotal}
              agg={agg}
            />
          ))}
        </div>
      </PageContainer>
    </AppShell>
  );
}

function EnergyChart({
  energy,
  plants,
  readings,
  periods,
  visiblePlants,
  showTotal,
  agg,
}: {
  energy: Energy;
  plants: Plant[];
  readings: Reading[];
  periods: string[];
  visiblePlants: Set<string>;
  showTotal: boolean;
  agg: Agg;
}) {
  const meta = ENERGY_META[energy];
  const allActive = visiblePlants.size === 0;
  const palette = [
    "var(--color-water)",
    "var(--color-gas)",
    "var(--color-electricity)",
    "oklch(0.6 0.15 340)",
  ];

  // Lookup: period -> plant -> reading
  const byKey = useMemo(() => {
    const m = new Map<string, Reading>();
    for (const r of readings) m.set(`${r.period}|${r.plant_id}`, r);
    return m;
  }, [readings]);

  const groups = useMemo(() => groupPeriods(periods, agg), [periods, agg]);

  const data = groups.map((g) => {
    const row: Record<string, string | number | null> = { period: g.label };
    let total = 0;
    let predTotal = 0;
    let hasPred = false;
    for (const plant of plants) {
      let v: number | null = null;
      for (const p of g.members) {
        const r = byKey.get(`${p}|${plant.id}`);
        const x = (r?.[energy] as number | null) ?? null;
        if (x != null) v = (v ?? 0) + x;
        const pred = (r?.[meta.predKey] as number | null) ?? null;
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

  // Honest forecast quality: MAPE on the validation year (2025) at the chosen
  // granularity, over the plants currently shown. Real is aligned to the plants
  // that actually have a forecast (so e.g. Fundicion gas, which has no model,
  // doesn't distort the figure). Filtering to a single plant tells its own story
  // (e.g. Fundicion water improves 5.2% -> 3.2% -> 1.6% as you aggregate).
  const mapeValue = useMemo(() => {
    const activePlants = plants.filter((p) => allActive || visiblePlants.has(p.id));
    const groups2025 = groupPeriods(
      periods.filter((p) => yearOf(p) === 2025),
      agg,
    );
    const pairs: { real: number; pred: number }[] = [];
    for (const g of groups2025) {
      let real = 0;
      let pred = 0;
      let any = false;
      for (const plant of activePlants) {
        for (const p of g.members) {
          const r = byKey.get(`${p}|${plant.id}`);
          const pv = (r?.[meta.predKey] as number | null) ?? null;
          if (pv == null) continue; // align real to plants with a forecast
          const rv = (r?.[energy] as number | null) ?? null;
          if (rv == null) continue;
          real += rv;
          pred += pv;
          any = true;
        }
      }
      if (any) pairs.push({ real, pred });
    }
    return mape(pairs);
  }, [periods, plants, byKey, energy, meta.predKey, agg, allActive, visiblePlants]);

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <span className="h-3 w-3 rounded" style={{ background: meta.color }} />
          {meta.label}
        </h2>
        <div className="flex items-center gap-3">
          {mapeValue != null && (
            <span className="text-xs text-muted-foreground">
              2025 forecast MAPE ({agg}):{" "}
              <span className="tabular-nums font-medium text-foreground">{mapeValue.toFixed(2)}%</span>
            </span>
          )}
          <span className="text-xs text-muted-foreground">{meta.unit}</span>
        </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="period" stroke="var(--color-muted-foreground)" fontSize={11} />
            <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickFormatter={(v) => formatNumber(Number(v))} />
            <Tooltip
              contentStyle={{
                background: "var(--color-popover)",
                border: "1px solid var(--color-border)",
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(v) => formatNumber(Number(v))}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {plants.map((p, i) => {
              if (!allActive && !visiblePlants.has(p.id)) return null;
              return (
                <Line
                  key={p.id}
                  type="monotone"
                  dataKey={p.name}
                  stroke={palette[i % palette.length]}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              );
            })}
            {showTotal && (
              <Line
                type="monotone"
                dataKey="__total"
                name="Total"
                stroke={meta.color}
                strokeWidth={3}
                dot={false}
              />
            )}
            <Line
              type="monotone"
              dataKey="__pred"
              name="Total forecast"
              stroke={meta.color}
              strokeDasharray="6 4"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function exportCsv(readings: Reading[], plants: Plant[]) {
  const byId = new Map(plants.map((p) => [p.id, p.name]));
  const header = [
    "plant",
    "month",
    "water_m3",
    "ng_mwhr",
    "electricity_mwhr",
    "water_pred",
    "gas_pred",
    "electricity_pred",
  ];
  const rows = readings.map((r) =>
    [
      byId.get(r.plant_id) ?? r.plant_id,
      r.period,
      r.water ?? "",
      r.gas ?? "",
      r.electricity ?? "",
      r.water_pred ?? "",
      r.gas_pred ?? "",
      r.electricity_pred ?? "",
    ].join(","),
  );
  const csv = [header.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `energy_history_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
