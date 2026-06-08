import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { AppShell } from "@/components/AppShell";
import { PageContainer, PageHeader, useDashboardData } from "@/components/dashboard/shared";
import {
  ENERGY_META,
  fetchModelMetrics,
  uniquePeriods,
  type Energy,
  type ModelMetric,
  type Plant,
  type Reading,
} from "@/lib/dashboard";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/modelos")({
  head: () => ({
    meta: [
      { title: "Model health — EnergyOps" },
      { name: "description", content: "Forecast accuracy (MAPE) per plant and energy against the 5% target." },
    ],
  }),
  component: ModelosPage,
});

const ENERGY_ORDER: Record<Energy, number> = { electricity: 0, water: 1, gas: 2 };

// Semaphore by monthly MAPE (industrial target < 5%).
function semaphore(m: ModelMetric): { color: string; emoji: string; label: string } {
  if (m.status === "in_progress" || m.mape_monthly == null) {
    return { color: "var(--color-muted-foreground)", emoji: "⚪", label: "In progress" };
  }
  const v = m.mape_monthly;
  if (v < 5) return { color: "var(--color-positive)", emoji: "🟢", label: "Meets target" };
  if (v < 8) return { color: "oklch(0.78 0.15 80)", emoji: "🟡", label: "Borderline" };
  return { color: "var(--color-negative)", emoji: "🔴", label: "Above target" };
}

function ModelosPage() {
  const { plants, readings } = useDashboardData();
  const metricsQuery = useQuery<ModelMetric[]>({ queryKey: ["model_metrics"], queryFn: fetchModelMetrics });
  const metrics = metricsQuery.data ?? [];

  const plantById = useMemo(() => new Map(plants.map((p) => [p.id, p])), [plants]);
  const sortOrder = (m: ModelMetric) => (m.plant_id ? plantById.get(m.plant_id)?.sort_order ?? 99 : 99);

  const ordered = useMemo(
    () =>
      [...metrics].sort(
        (a, b) => sortOrder(a) - sortOrder(b) || ENERGY_ORDER[a.energy] - ENERGY_ORDER[b.energy],
      ),
    [metrics, plantById],
  );

  const ready = ordered.filter((m) => m.status !== "in_progress");
  const meeting = ready.filter((m) => m.meets_threshold).length;
  const total = ordered.length || 6;

  return (
    <AppShell>
      <PageContainer>
        <PageHeader
          title="Model health"
          subtitle="Forecast accuracy validated on 2025 (trained 2022–2024). Industrial target: MAPE < 5%."
        />

        <div className="bg-card border border-border rounded-2xl p-5 mb-6 flex items-center gap-4">
          <div className="font-display text-3xl font-semibold tabular-nums">
            {meeting}<span className="text-muted-foreground text-xl">/{total}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            models meet the 5% industrial constraint.
            {ordered.some((m) => m.status === "in_progress") && " One model is still in progress."}
          </div>
        </div>

        {metricsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading metrics…</p>}
        {!metricsQuery.isLoading && ordered.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No metrics yet. Apply the <code>model_metrics</code> migration and run its seed.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ordered.map((m) => (
            <MetricCard
              key={m.id}
              metric={m}
              plant={m.plant_id ? plantById.get(m.plant_id) : undefined}
              readings={readings}
            />
          ))}
        </div>
      </PageContainer>
    </AppShell>
  );
}

function MetricCard({
  metric,
  plant,
  readings,
}: {
  metric: ModelMetric;
  plant: Plant | undefined;
  readings: Reading[];
}) {
  const meta = ENERGY_META[metric.energy];
  const s = semaphore(metric);
  const inProgress = metric.status === "in_progress" || metric.mape_monthly == null;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-medium">{plant?.name ?? "—"}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded" style={{ background: meta.color }} />
            {meta.label}
          </div>
        </div>
        <Badge variant="secondary" className="shrink-0">
          {metric.model_type ?? "—"}
        </Badge>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs text-muted-foreground">Monthly MAPE</div>
          <div className="font-display text-4xl font-semibold tabular-nums" style={{ color: s.color }}>
            {inProgress ? "—" : `${metric.mape_monthly!.toFixed(2)}%`}
          </div>
          <div className="text-xs mt-0.5" style={{ color: s.color }}>
            {s.emoji} {s.label}
          </div>
        </div>
        <div className="text-right text-xs text-muted-foreground space-y-0.5">
          {metric.mape_quarterly != null && (
            <div>Quarterly <span className="tabular-nums text-foreground">{metric.mape_quarterly.toFixed(2)}%</span></div>
          )}
          {metric.r2 != null && (
            <div>R² <span className="tabular-nums text-foreground">{metric.r2.toFixed(3)}</span></div>
          )}
          {metric.annual_error != null && (
            <div>Annual <span className="tabular-nums text-foreground">{metric.annual_error > 0 ? "+" : ""}{metric.annual_error.toFixed(1)}%</span></div>
          )}
        </div>
      </div>

      {inProgress ? (
        <div className="h-[44px] grid place-items-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
          No forecast yet
        </div>
      ) : (
        <Sparkline plantId={metric.plant_id} energy={metric.energy} readings={readings} color={meta.color} />
      )}
    </div>
  );
}

function Sparkline({
  plantId,
  energy,
  readings,
  color,
}: {
  plantId: string | null;
  energy: Energy;
  readings: Reading[];
  color: string;
}) {
  const predKey = ENERGY_META[energy].predKey;
  const data = useMemo(() => {
    const periods = uniquePeriods(readings);
    return periods.map((p) => {
      const r = readings.find((x) => x.period === p && x.plant_id === plantId);
      return {
        real: (r?.[energy] as number | null) ?? null,
        pred: (r?.[predKey] as number | null) ?? null,
      };
    });
  }, [readings, plantId, energy, predKey]);

  if (data.every((d) => d.real == null)) {
    return <div className="h-[44px]" />;
  }

  return (
    <div className="h-[44px]" aria-label="Actual vs forecast sparkline">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, bottom: 4, left: 0, right: 0 }}>
          <Line type="monotone" dataKey="real" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line
            type="monotone"
            dataKey="pred"
            stroke={color}
            strokeWidth={1.5}
            strokeDasharray="4 3"
            dot={false}
            connectNulls
            isAnimationActive={false}
            opacity={0.7}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
