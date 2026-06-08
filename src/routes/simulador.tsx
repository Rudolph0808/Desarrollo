import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ZAxis,
} from "recharts";
import { AppShell } from "@/components/AppShell";
import { PageContainer, PageHeader } from "@/components/dashboard/shared";
import { formatCurrency, formatNumber } from "@/lib/dashboard";
import { ELEC_EQ, WATER_CHAIN, TARIFF_2025, SCATTER } from "@/lib/simulatorData";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/simulador")({
  head: () => ({
    meta: [
      { title: "Simulator — EnergyOps" },
      { name: "description", content: "Forecast consumption and cost from a production volume." },
    ],
  }),
  component: SimuladorPage,
});

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const VOL_MIN = 500;
const VOL_MAX = 2000;

type PlantKey = "fundicion" | "norte";
type EnergyKey = "electricity" | "water";

const PLANT_LABEL: Record<PlantKey, string> = {
  fundicion: "Fundición Aluminio",
  norte: "Motores Norte",
};

function elecFor(plant: PlantKey, vol: number) {
  const eq = ELEC_EQ[plant];
  return eq.a + eq.b * vol;
}

// Fundicion water honest chain: Volumen -> elec -> water, at a 2025 reference month.
function waterFor(vol: number, month: number) {
  const w = WATER_CHAIN;
  const elec = elecFor("fundicion", vol);
  const t = 36 + month; // 2025 reference (t in 36..47)
  const ang = (2 * Math.PI * month) / 12;
  return (
    w.intercept + w.t * t + w.elec * elec + w.vol * vol + w.sin * Math.sin(ang) + w.cos * Math.cos(ang)
  );
}

function SimuladorPage() {
  const [plant, setPlant] = useState<PlantKey>("fundicion");
  const [energy, setEnergy] = useState<EnergyKey>("electricity");
  const [vol, setVol] = useState(1400);
  const [month, setMonth] = useState(6); // Jul

  // Norte only has the clean electricity equation.
  const energyOptions: EnergyKey[] = plant === "fundicion" ? ["electricity", "water"] : ["electricity"];
  const effEnergy: EnergyKey = energyOptions.includes(energy) ? energy : "electricity";

  const model = useMemo(() => {
    if (effEnergy === "water") {
      return {
        consumo: waterFor(vol, month),
        elec: elecFor("fundicion", vol),
        rmse: WATER_CHAIN.rmse,
        tariff: TARIFF_2025.water,
        unit: "M³",
        mape: WATER_CHAIN.mapeMonthly,
        line: (v: number) => waterFor(v, month),
        cloud: SCATTER.fundicionWater,
        modelLabel: "Ridge chain (Volume → Electricity → Water)",
      };
    }
    const eq = ELEC_EQ[plant];
    return {
      consumo: elecFor(plant, vol),
      elec: null as number | null,
      rmse: eq.rmse,
      tariff: TARIFF_2025.electricity,
      unit: "MWHr",
      mape: eq.mapeMonthly,
      line: (v: number) => elecFor(plant, v),
      cloud: plant === "fundicion" ? SCATTER.fundicionElec : SCATTER.norteElec,
      modelLabel: `OLS  consumo = ${eq.a.toFixed(0)} + ${eq.b.toFixed(plant === "norte" ? 5 : 4)} × Volume`,
    };
  }, [plant, effEnergy, vol, month]);

  const cost = model.consumo * model.tariff;
  const costLow = (model.consumo - model.rmse) * model.tariff;
  const costHigh = (model.consumo + model.rmse) * model.tariff;

  // Chart: model line ± RMSE band over the volume domain, the historical cloud,
  // and the simulated point.
  const lineData = useMemo(() => {
    const xs = [VOL_MIN, VOL_MAX];
    return xs.map((v) => {
      const y = model.line(v);
      return { vol: v, model: y, high: y + model.rmse, low: y - model.rmse };
    });
  }, [model]);

  const simPoint = [{ vol, consumo: model.consumo }];

  return (
    <AppShell>
      <PageContainer>
        <PageHeader
          title="Forecast simulator"
          subtitle="Move production volume to project consumption and cost. Coefficients from the validated models; tariffs are 2025."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Controls */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Plant</Label>
                <Select
                  value={plant}
                  onValueChange={(v) => {
                    setPlant(v as PlantKey);
                    if (v === "norte") setEnergy("electricity");
                  }}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fundicion">Fundición Aluminio</SelectItem>
                    <SelectItem value="norte">Motores Norte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Energy</Label>
                <Select value={effEnergy} onValueChange={(v) => setEnergy(v as EnergyKey)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {energyOptions.map((e) => (
                      <SelectItem key={e} value={e}>{e === "water" ? "Water" : "Electricity"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs text-muted-foreground">Production volume</Label>
                <Input
                  type="number"
                  value={vol}
                  min={VOL_MIN}
                  max={VOL_MAX}
                  onChange={(e) => setVol(Math.max(VOL_MIN, Math.min(VOL_MAX, Number(e.target.value) || 0)))}
                  className="w-28 h-8 text-right tabular-nums"
                />
              </div>
              <Slider
                value={[vol]}
                min={VOL_MIN}
                max={VOL_MAX}
                step={5}
                onValueChange={([v]) => setVol(v)}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>{VOL_MIN}</span>
                <span>{VOL_MAX}</span>
              </div>
            </div>

            {effEnergy === "water" && (
              <div>
                <Label className="text-xs text-muted-foreground">Reference month (seasonality)</Label>
                <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => (
                      <SelectItem key={m} value={String(i)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="text-xs text-muted-foreground border-t border-border pt-3">
              <div className="font-medium text-foreground mb-1">{model.modelLabel}</div>
              <div>Validation MAPE (2025): <span className="tabular-nums">{model.mape.toFixed(2)}%</span></div>
              {effEnergy === "water" && (
                <div className="mt-1">Chained electricity: <span className="tabular-nums">{formatNumber(model.elec!)} MWHr</span></div>
              )}
              <p className="mt-2">
                Gas isn't simulated here because it isn't driven by production volume:
                Fundición gas is an MLR (rate-based, MAPE 11.80%) and Norte gas is naive
                seasonal. Both are live — see <span className="font-medium">Model health</span>.
              </p>
            </div>
          </div>

          {/* Outputs */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="text-xs text-muted-foreground">Projected consumption</div>
              <div className="font-display text-4xl font-semibold tabular-nums mt-1">
                {formatNumber(model.consumo)}
                <span className="text-lg text-muted-foreground ml-1">{model.unit}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                ± {formatNumber(model.rmse)} {model.unit} (RMSE)
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="text-xs text-muted-foreground">Projected monthly cost</div>
              <div className="font-display text-4xl font-semibold tabular-nums mt-1">{formatCurrency(cost)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatCurrency(costLow)} – {formatCurrency(costHigh)}
              </div>
            </div>

            <div className="sm:col-span-2 bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-lg font-semibold">
                  {PLANT_LABEL[plant]} · {effEnergy === "water" ? "Water" : "Electricity"}
                </h2>
                <Badge variant="secondary">Simulated point on history 2022–2025</Badge>
              </div>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart margin={{ top: 8, right: 12, bottom: 8, left: 4 }}>
                    <CartesianGrid stroke="var(--color-border)" vertical={false} />
                    <XAxis
                      type="number"
                      dataKey="vol"
                      domain={[VOL_MIN, VOL_MAX]}
                      stroke="var(--color-muted-foreground)"
                      fontSize={11}
                      tickFormatter={(v) => formatNumber(Number(v))}
                      name="Volume"
                    />
                    <YAxis
                      type="number"
                      stroke="var(--color-muted-foreground)"
                      fontSize={11}
                      tickFormatter={(v) => formatNumber(Number(v))}
                    />
                    <ZAxis range={[60, 60]} />
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
                    <Line data={lineData} dataKey="high" name="±RMSE" stroke="var(--color-muted-foreground)" strokeDasharray="4 3" strokeWidth={1} dot={false} legendType="none" />
                    <Line data={lineData} dataKey="low" name="±RMSE" stroke="var(--color-muted-foreground)" strokeDasharray="4 3" strokeWidth={1} dot={false} />
                    <Line data={lineData} dataKey="model" name="Model" stroke="var(--color-electricity)" strokeWidth={2} dot={false} />
                    <Scatter data={model.cloud} dataKey="real" name="History" fill="var(--color-muted-foreground)" fillOpacity={0.5} />
                    <Scatter data={simPoint} dataKey="consumo" name="Simulated" fill="var(--color-electricity)" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </AppShell>
  );
}
