#!/usr/bin/env python3
"""
generate_predictions.py
=======================================================================
Reproducible generator for the dashboard's `*_pred` columns and tariffs.

Reads the real monthly data (data/raw/) and applies the 5 validated models
(+ "in process" gas Fundicion left empty). Emits:
  - data/predicciones_fundicion.csv
  - data/predicciones_norte.csv
  - data/model_metrics.json      (consumed later by the model_metrics seed)
  - data/unit_costs.json         (tariffs, in $/consumption-unit)

METHODOLOGY (matches the team's notebooks):
  Predict CONSUMPTION from operational drivers, apply the tariff later in the
  front-end. Temporal split: train 2022-2024 (36 mo), validate 2025 (12 mo).

  Model A  Fundicion Electricidad : MWh = 1861.65 + 1.5824*Volumen          (OLS)
  Model B  Fundicion Agua         : Ridge[trend, elec_PRED, vol, sin, cos]   (honest chain)
  Model C-bis Norte Electricidad  : MWh = 1267.43 + 0.11221*Volumen          (OLS mini-model)
  Model D  Norte Agua             : naive seasonal  water_pred[y] = water[y-1]
  Model E  Norte Gas              : naive seasonal  gas_pred[y]   = gas[y-1]
  Gas Fundicion                   : NO MODEL YET -> gas_pred left empty ("en proceso")

UNITS (critical): consumption is stored MWHr (elec/gas) and M3 (water); the
front computes cost = consumo * cost_per_unit, so electricity tariffs are
converted from $/kWh to $/MWHr (x1000). Water/gas are already per stored unit.

Run:  python scripts/generate_predictions.py   (from the repo root)
=======================================================================
"""
import csv
import json
import os
import numpy as np
import pandas as pd
import warnings
warnings.filterwarnings("ignore")
from sklearn.linear_model import LinearRegression, RidgeCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
RAW = os.path.join(ROOT, "data", "raw")
OUT = os.path.join(ROOT, "data")
YEARS = [2022, 2023, 2024, 2025]
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def periods():
    return [f"{y}-{m:02d}-01" for y in YEARS for m in range(1, 13)]


def mape(a, p):
    a, p = np.asarray(a, float), np.asarray(p, float)
    return 100 * np.mean(np.abs((a - p) / a))


def trimestres(v):
    v = np.asarray(v, float)
    return np.array([v[i:i + 3].sum() for i in range(0, 12, 3)])


# ---------------------------------------------------------------- load raw
def load_fundicion():
    df = pd.read_csv(os.path.join(RAW, "fundicion_aluminio_consolidado.csv"))
    df = df.sort_values(["Year"]).reset_index(drop=True)  # already chronological
    return df


def load_norte():
    """Wide sheet: index = concept rows, 48 month columns (2022Jan..2025Dec)."""
    df = pd.read_csv(os.path.join(RAW, "motores_norte_wide.csv"), index_col=0)

    def row(label):
        return (
            df.loc[label]
            .astype(str)
            .str.replace("$", "", regex=False)
            .str.replace(",", "", regex=False)
            .str.strip()
            .astype(float)
            .values[:48]
        )

    return {
        "vol": row("Volumen"),
        "elec": row("Electricity (MWHr)"),
        "gas": row("NG (MWHr)"),
        "water": row("Water (M3)"),
    }


# ---------------------------------------------------------------- helpers
t = np.arange(48)
m = t % 12
TR = slice(0, 36)   # 2022-2024
TE = slice(36, 48)  # 2025


def fourier(mm):
    return np.column_stack([np.sin(2 * np.pi * mm / 12), np.cos(2 * np.pi * mm / 12)])


def naive_seasonal(series):
    """pred[year][month] = actual[year-1][month]; first year (2022) -> NaN."""
    s = np.asarray(series, float)
    out = np.full(48, np.nan)
    out[12:] = s[:36]
    return out


def fmt(x):
    return "" if x is None or (isinstance(x, float) and np.isnan(x)) else f"{x:.4f}"


def write_pred_csv(path, per, elec, water, gas, elec_p, water_p, gas_p):
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["period", "electricity", "water", "gas",
                    "electricity_pred", "water_pred", "gas_pred"])
        for i, p in enumerate(per):
            w.writerow([p, fmt(elec[i]), fmt(water[i]), fmt(gas[i]),
                        fmt(elec_p[i]), fmt(water_p[i]), fmt(gas_p[i])])
    print(f"  wrote {os.path.relpath(path, ROOT)}")


# ---------------------------------------------------------------- seed SQL
def sqlnum(x):
    return "NULL" if x is None or (isinstance(x, float) and np.isnan(x)) else f"{x:.4f}"


SEED = os.path.join(ROOT, "supabase", "seed")


def write_reading_seed(filename, plant, sort_order, per, elec, water, gas, ep, wp, gp):
    """Idempotent per-plant seed: ensures the plant exists, then upserts 48 readings.
    plant_id is resolved by NAME via subquery (never a hardcoded UUID)."""
    path = os.path.join(SEED, filename)
    pid = f"(SELECT id FROM public.plants WHERE name = '{plant}')"
    lines = []
    lines.append(f"-- Seed: {plant} energy_readings (48 months, real + predicted CONSUMPTION).")
    lines.append("-- Idempotent: safe to run multiple times. Paste into Supabase SQL Editor and Run.")
    lines.append("BEGIN;")
    lines.append("")
    lines.append("-- 1) Ensure the plant exists (resolved by name, generic/anonymized).")
    lines.append("INSERT INTO public.plants (name, location, sort_order)")
    lines.append(f"SELECT '{plant}', NULL, {sort_order}")
    lines.append(f"WHERE NOT EXISTS (SELECT 1 FROM public.plants WHERE name = '{plant}');")
    lines.append("")
    lines.append("-- 2) Upsert the 48 monthly readings.")
    lines.append("INSERT INTO public.energy_readings")
    lines.append("  (plant_id, period, electricity, water, gas, electricity_pred, water_pred, gas_pred)")
    lines.append("VALUES")
    rows = []
    for i, p in enumerate(per):
        rows.append(f"  ({pid}, '{p}', {sqlnum(elec[i])}, {sqlnum(water[i])}, {sqlnum(gas[i])}, "
                    f"{sqlnum(ep[i])}, {sqlnum(wp[i])}, {sqlnum(gp[i])})")
    lines.append(",\n".join(rows))
    lines.append("ON CONFLICT (plant_id, period) DO UPDATE SET")
    lines.append("  electricity = EXCLUDED.electricity,")
    lines.append("  water = EXCLUDED.water,")
    lines.append("  gas = EXCLUDED.gas,")
    lines.append("  electricity_pred = EXCLUDED.electricity_pred,")
    lines.append("  water_pred = EXCLUDED.water_pred,")
    lines.append("  gas_pred = EXCLUDED.gas_pred;")
    lines.append("")
    lines.append("COMMIT;")
    lines.append("")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"  wrote {os.path.relpath(path, ROOT)}")


def write_model_metrics_seed(filename, metrics):
    path = os.path.join(SEED, filename)

    def num(x):
        return "NULL" if x is None else (f"{x}")

    def txt(x):
        return "NULL" if x is None else "'" + str(x).replace("'", "''") + "'"

    lines = []
    lines.append("-- Seed: model_metrics (one row per plant x energy). Idempotent.")
    lines.append("-- Requires the model_metrics table (see its migration). plant_id resolved by name.")
    lines.append("BEGIN;")
    lines.append("INSERT INTO public.model_metrics")
    lines.append("  (plant_id, energy, model_type, mape_monthly, mape_quarterly, r2, mae, rmse,")
    lines.append("   annual_error, meets_threshold, status)")
    lines.append("VALUES")
    rows = []
    for m in metrics:
        pid = f"(SELECT id FROM public.plants WHERE name = '{m['plant']}')"
        rows.append(
            f"  ({pid}, '{m['energy']}', {txt(m['model_type'])}, {num(m['mape_monthly'])}, "
            f"{num(m['mape_quarterly'])}, {num(m['r2'])}, {num(m['mae'])}, {num(m['rmse'])}, "
            f"{num(m['annual_error'])}, {str(m['meets_threshold']).lower()}, '{m['status']}')")
    lines.append(",\n".join(rows))
    lines.append("ON CONFLICT (plant_id, energy) DO UPDATE SET")
    lines.append("  model_type = EXCLUDED.model_type,")
    lines.append("  mape_monthly = EXCLUDED.mape_monthly,")
    lines.append("  mape_quarterly = EXCLUDED.mape_quarterly,")
    lines.append("  r2 = EXCLUDED.r2,")
    lines.append("  mae = EXCLUDED.mae,")
    lines.append("  rmse = EXCLUDED.rmse,")
    lines.append("  annual_error = EXCLUDED.annual_error,")
    lines.append("  meets_threshold = EXCLUDED.meets_threshold,")
    lines.append("  status = EXCLUDED.status;")
    lines.append("COMMIT;")
    lines.append("")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"  wrote {os.path.relpath(path, ROOT)}")


def write_unit_costs_seed(filename, costs):
    path = os.path.join(SEED, filename)
    lines = []
    lines.append("-- Seed: unit_costs (tariffs). GLOBAL table keyed by (energy, effective_from):")
    lines.append("-- one rate per energy per period, shared across plants (front does consumo * cost_per_unit).")
    lines.append("-- electricity stored as $/MWHr (= $/kWh x1000), water $/M3, gas $/MWHr.")
    lines.append("-- Idempotent.")
    lines.append("BEGIN;")
    lines.append("INSERT INTO public.unit_costs (energy, cost_per_unit, currency, effective_from, notes)")
    lines.append("VALUES")
    rows = []
    for c in costs:
        note = c["notes"].replace("'", "''")
        rows.append(f"  ('{c['energy']}', {c['cost_per_unit']}, 'MXN', '{c['effective_from']}', '{note}')")
    lines.append(",\n".join(rows))
    lines.append("ON CONFLICT (energy, effective_from) DO UPDATE SET")
    lines.append("  cost_per_unit = EXCLUDED.cost_per_unit,")
    lines.append("  notes = EXCLUDED.notes;")
    lines.append("COMMIT;")
    lines.append("")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"  wrote {os.path.relpath(path, ROOT)}")


# ================================================================ FUNDICION
def run_fundicion(metrics):
    df = load_fundicion()
    vol = df["Volumen"].values.astype(float)
    elec = df["ElectricidadMWh"].values.astype(float)
    water = df["AguaM3"].values.astype(float)
    gas = df["GasNaturalMWh"].values.astype(float)

    # Model A: MWh ~ Volumen (train 2022-24)
    A = LinearRegression().fit(vol[TR].reshape(-1, 1), elec[TR])
    elec_pred = A.predict(vol.reshape(-1, 1))

    # Model B: Ridge[trend, electricidad, vol, fourier] -> water.
    # Honest chain (as the notebook): TRAIN on real electricity, but PREDICT
    # feeding the electricity PREDICTED by Model A (so 2025 reproduces 5.18%).
    def Xw(idx, e):
        return np.column_stack([t[idx], e[idx], vol[idx], fourier(m[idx])])
    B = make_pipeline(StandardScaler(),
                      RidgeCV(alphas=np.logspace(-2, 3, 60))).fit(Xw(TR, elec), water[TR])
    water_pred = B.predict(Xw(slice(0, 48), elec_pred))

    gas_pred = np.full(48, np.nan)  # Gas Fundicion: en proceso

    per = periods()
    write_pred_csv(os.path.join(OUT, "predicciones_fundicion.csv"),
                   per, elec, water, gas, elec_pred, water_pred, gas_pred)
    write_reading_seed("seed_fundicion.sql", "Fundición Aluminio", 0,
                       per, elec, water, gas, elec_pred, water_pred, gas_pred)

    # metrics (test 2025)
    metrics.append(dict(
        plant="Fundición Aluminio", energy="electricity", model_type="OLS",
        mape_monthly=round(mape(elec[TE], elec_pred[TE]), 2), mape_quarterly=None,
        r2=round(r2_score(elec[TE], elec_pred[TE]), 4),
        mae=round(mean_absolute_error(elec[TE], elec_pred[TE]), 1),
        rmse=round(np.sqrt(mean_squared_error(elec[TE], elec_pred[TE])), 1),
        annual_error=round(100 * (elec_pred[TE].sum() - elec[TE].sum()) / elec[TE].sum(), 2),
        meets_threshold=True, status="ready"))
    mm = mape(water[TE], water_pred[TE])
    mq = mape(trimestres(water[TE]), trimestres(water_pred[TE]))
    metrics.append(dict(
        plant="Fundición Aluminio", energy="water", model_type="Ridge",
        mape_monthly=round(mm, 2), mape_quarterly=round(mq, 2),
        r2=round(r2_score(water[TE], water_pred[TE]), 4),
        mae=round(mean_absolute_error(water[TE], water_pred[TE]), 1),
        rmse=round(np.sqrt(mean_squared_error(water[TE], water_pred[TE])), 1),
        annual_error=round(100 * (water_pred[TE].sum() - water[TE].sum()) / water[TE].sum(), 2),
        meets_threshold=bool(mq < 5), status="ready"))
    metrics.append(dict(
        plant="Fundición Aluminio", energy="gas", model_type=None,
        mape_monthly=None, mape_quarterly=None, r2=None, mae=None, rmse=None,
        annual_error=None, meets_threshold=False, status="in_progress"))
    print(f"  A elec MAPE {mape(elec[TE], elec_pred[TE]):.2f}%  | B water MAPE mensual {mm:.2f}% trim {mq:.2f}%")
    return dict(plant="Fundición Aluminio", sort_order=0, per=per, elec=elec, water=water,
                gas=gas, ep=elec_pred, wp=water_pred, gp=gas_pred)


# ================================================================ NORTE
def run_norte(metrics):
    d = load_norte()
    vol, elec, gas, water = d["vol"], d["elec"], d["gas"], d["water"]

    # Model C-bis: MWh ~ Volumen (train 2022-24)
    C = LinearRegression().fit(vol[TR].reshape(-1, 1), elec[TR])
    elec_pred = C.predict(vol.reshape(-1, 1))

    # Model D: naive seasonal water ; Model E: naive seasonal gas
    water_pred = naive_seasonal(water)
    gas_pred = naive_seasonal(gas)

    per = periods()
    write_pred_csv(os.path.join(OUT, "predicciones_norte.csv"),
                   per, elec, water, gas, elec_pred, water_pred, gas_pred)
    write_reading_seed("seed_motores_norte.sql", "Motores Norte", 1,
                       per, elec, water, gas, elec_pred, water_pred, gas_pred)

    metrics.append(dict(
        plant="Motores Norte", energy="electricity", model_type="OLS",
        mape_monthly=round(mape(elec[TE], elec_pred[TE]), 2), mape_quarterly=None,
        r2=round(r2_score(elec[TE], elec_pred[TE]), 4),
        mae=round(mean_absolute_error(elec[TE], elec_pred[TE]), 1),
        rmse=round(np.sqrt(mean_squared_error(elec[TE], elec_pred[TE])), 1),
        annual_error=round(100 * (elec_pred[TE].sum() - elec[TE].sum()) / elec[TE].sum(), 2),
        meets_threshold=True, status="ready"))
    wm = mape(water[TE], water_pred[TE])
    metrics.append(dict(
        plant="Motores Norte", energy="water", model_type="Naive seasonal",
        mape_monthly=round(wm, 2),
        mape_quarterly=round(mape(trimestres(water[TE]), trimestres(water_pred[TE])), 2),
        r2=round(r2_score(water[TE], water_pred[TE]), 4),
        mae=round(mean_absolute_error(water[TE], water_pred[TE]), 1),
        rmse=round(np.sqrt(mean_squared_error(water[TE], water_pred[TE])), 1),
        annual_error=round(100 * (water_pred[TE].sum() - water[TE].sum()) / water[TE].sum(), 2),
        meets_threshold=bool(wm < 5), status="ready"))
    gm = mape(gas[TE], gas_pred[TE])
    metrics.append(dict(
        plant="Motores Norte", energy="gas", model_type="Naive seasonal",
        mape_monthly=round(gm, 2),
        mape_quarterly=round(mape(trimestres(gas[TE]), trimestres(gas_pred[TE])), 2),
        r2=round(r2_score(gas[TE], gas_pred[TE]), 4),
        mae=round(mean_absolute_error(gas[TE], gas_pred[TE]), 1),
        rmse=round(np.sqrt(mean_squared_error(gas[TE], gas_pred[TE])), 1),
        annual_error=round(100 * (gas_pred[TE].sum() - gas[TE].sum()) / gas[TE].sum(), 2),
        meets_threshold=bool(gm < 5), status="ready"))
    print(f"  C-bis elec MAPE {mape(elec[TE], elec_pred[TE]):.2f}%  | D water MAPE {wm:.2f}%  | E gas MAPE {gm:.2f}%")
    return dict(plant="Motores Norte", sort_order=1, per=per, elec=elec, water=water,
                gas=gas, ep=elec_pred, wp=water_pred, gp=gas_pred)


# ================================================================ TARIFFS
def build_unit_costs():
    """One rate per energy per year (unit_costs is global, keyed by energy+date).
    electricity: $/kWh from brief x1000 -> $/MWHr (consumption stored in MWHr).
    water: $/M3 (already correct). gas: consumption-weighted annual avg $/MWHr."""
    df = load_fundicion()
    elec_kwh = {2022: 2.137, 2023: 2.134, 2024: 2.232, 2025: 2.315}
    water_m3 = {2022: 25.53, 2023: 28.10, 2024: 29.73, 2025: 30.70}
    rows = []
    for y in YEARS:
        sub = df[df["Year"] == y]
        gas_rate = float(np.average(sub["GasNaturalTarifa"], weights=sub["GasNaturalMWh"]))
        eff = f"{y}-01-01"
        rows.append(dict(energy="electricity", cost_per_unit=round(elec_kwh[y] * 1000, 2),
                         effective_from=eff, notes=f"{elec_kwh[y]} $/kWh x1000 -> $/MWHr"))
        rows.append(dict(energy="water", cost_per_unit=water_m3[y],
                         effective_from=eff, notes="$/M3"))
        rows.append(dict(energy="gas", cost_per_unit=round(gas_rate, 2),
                         effective_from=eff, notes="weighted annual avg $/MWHr (Fundicion)"))
    return rows


# ================================================================ SIMULATOR TS
def write_simulator_ts(filename):
    """Emit client-side constants for the interactive simulator (src/lib/).
    Volume is NOT stored in Supabase, so the historical (volume -> consumption)
    cloud and the model coefficients live here as cited constants."""
    fund = load_fundicion()
    vol_f = fund["Volumen"].values.astype(float)
    elec_f = fund["ElectricidadMWh"].values.astype(float)
    water_f = fund["AguaM3"].values.astype(float)
    n = load_norte()

    # Model A (Fundicion elec) and C-bis (Norte elec)
    A = LinearRegression().fit(vol_f[TR].reshape(-1, 1), elec_f[TR])
    elec_pred_f = A.predict(vol_f.reshape(-1, 1))
    C = LinearRegression().fit(n["vol"][TR].reshape(-1, 1), n["elec"][TR])
    a_rmse = float(np.sqrt(mean_squared_error(elec_f[TE], elec_pred_f[TE])))
    c_pred = C.predict(n["vol"].reshape(-1, 1))
    c_rmse = float(np.sqrt(mean_squared_error(n["elec"][TE], c_pred[TE])))

    # Model B (Fundicion water) Ridge -> effective linear coefs in ORIGINAL space
    def Xw(idx, e):
        return np.column_stack([t[idx], e[idx], vol_f[idx], fourier(m[idx])])
    pipe = make_pipeline(StandardScaler(), RidgeCV(alphas=np.logspace(-2, 3, 60))).fit(Xw(TR, elec_f), water_f[TR])
    sc, rg = pipe.named_steps["standardscaler"], pipe.named_steps["ridgecv"]
    wc = rg.coef_ / sc.scale_
    wb0 = float(rg.intercept_ - np.sum(rg.coef_ * sc.mean_ / sc.scale_))
    w_pred = pipe.predict(Xw(slice(0, 48), elec_pred_f))
    w_rmse = float(np.sqrt(mean_squared_error(water_f[TE], w_pred[TE])))

    def pts(vol, real):
        return ", ".join(f"{{ vol: {v:.1f}, real: {r:.1f} }}" for v, r in zip(vol, real))

    ts = f"""// AUTO-GENERATED by scripts/generate_predictions.py — do not edit by hand.
// Source: the team notebooks (train 2022-2024, test 2025). Volume is not stored
// in Supabase, so the historical cloud and coefficients are cited constants here.

export type LinearEq = {{ a: number; b: number; rmse: number; mapeMonthly: number }};

// Consumption (MWHr) = a + b * Volumen
export const ELEC_EQ: Record<"fundicion" | "norte", LinearEq> = {{
  fundicion: {{ a: {A.intercept_:.4f}, b: {A.coef_[0]:.6f}, rmse: {a_rmse:.1f}, mapeMonthly: 2.56 }},
  norte: {{ a: {C.intercept_:.4f}, b: {C.coef_[0]:.6f}, rmse: {c_rmse:.1f}, mapeMonthly: 3.05 }},
}};

// Fundicion water (M3) honest chain: Volumen -> elec (ELEC_EQ.fundicion) -> water.
// Ridge expressed in ORIGINAL feature space: water = intercept + t*trend
//   + elec*elecMWh + vol*Volumen + sin*sin(2pi m/12) + cos*cos(2pi m/12).
export const WATER_CHAIN = {{
  intercept: {wb0:.6f},
  t: {wc[0]:.6f},
  elec: {wc[1]:.6f},
  vol: {wc[2]:.6f},
  sin: {wc[3]:.6f},
  cos: {wc[4]:.6f},
  rmse: {w_rmse:.1f},
  mapeMonthly: 5.18,
  mapeQuarterly: 3.22,
}};

// 2025 tariffs in $ per stored consumption unit (electricity $/MWHr, water $/M3).
export const TARIFF_2025 = {{ electricity: 2315.0, water: 30.70 }};

// Historical (Volumen -> real consumption) clouds, 48 months 2022-2025.
export const SCATTER = {{
  fundicionElec: [{pts(vol_f, elec_f)}],
  norteElec: [{pts(n['vol'], n['elec'])}],
  fundicionWater: [{pts(vol_f, water_f)}],
}};
"""
    path = os.path.join(ROOT, "src", "lib", filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(ts)
    print(f"  wrote {os.path.relpath(path, ROOT)}")


def _reading_values(plant, per, elec, water, gas, ep, wp, gp):
    pid = f"(SELECT id FROM public.plants WHERE name = '{plant}')"
    rows = []
    for i, p in enumerate(per):
        rows.append(f"  ({pid}, '{p}', {sqlnum(elec[i])}, {sqlnum(water[i])}, {sqlnum(gas[i])}, "
                    f"{sqlnum(ep[i])}, {sqlnum(wp[i])}, {sqlnum(gp[i])})")
    return (
        "INSERT INTO public.energy_readings\n"
        "  (plant_id, period, electricity, water, gas, electricity_pred, water_pred, gas_pred)\n"
        "VALUES\n" + ",\n".join(rows) + "\n"
        "ON CONFLICT (plant_id, period) DO UPDATE SET\n"
        "  electricity = EXCLUDED.electricity, water = EXCLUDED.water, gas = EXCLUDED.gas,\n"
        "  electricity_pred = EXCLUDED.electricity_pred, water_pred = EXCLUDED.water_pred,\n"
        "  gas_pred = EXCLUDED.gas_pred;"
    )


def _unit_costs_values(costs):
    rows = [f"  ('{c['energy']}', {c['cost_per_unit']}, 'MXN', '{c['effective_from']}', "
            f"'{c['notes'].replace(chr(39), chr(39) * 2)}')" for c in costs]
    return (
        "INSERT INTO public.unit_costs (energy, cost_per_unit, currency, effective_from, notes)\n"
        "VALUES\n" + ",\n".join(rows) + "\n"
        "ON CONFLICT (energy, effective_from) DO UPDATE SET\n"
        "  cost_per_unit = EXCLUDED.cost_per_unit, notes = EXCLUDED.notes;"
    )


def _model_metrics_values(metrics):
    def num(x):
        return "NULL" if x is None else f"{x}"

    def txt(x):
        return "NULL" if x is None else "'" + str(x).replace("'", "''") + "'"

    rows = []
    for m in metrics:
        pid = f"(SELECT id FROM public.plants WHERE name = '{m['plant']}')"
        rows.append(
            f"  ({pid}, '{m['energy']}', {txt(m['model_type'])}, {num(m['mape_monthly'])}, "
            f"{num(m['mape_quarterly'])}, {num(m['r2'])}, {num(m['mae'])}, {num(m['rmse'])}, "
            f"{num(m['annual_error'])}, {str(m['meets_threshold']).lower()}, '{m['status']}')")
    return (
        "INSERT INTO public.model_metrics\n"
        "  (plant_id, energy, model_type, mape_monthly, mape_quarterly, r2, mae, rmse,\n"
        "   annual_error, meets_threshold, status)\n"
        "VALUES\n" + ",\n".join(rows) + "\n"
        "ON CONFLICT (plant_id, energy) DO UPDATE SET\n"
        "  model_type = EXCLUDED.model_type, mape_monthly = EXCLUDED.mape_monthly,\n"
        "  mape_quarterly = EXCLUDED.mape_quarterly, r2 = EXCLUDED.r2, mae = EXCLUDED.mae,\n"
        "  rmse = EXCLUDED.rmse, annual_error = EXCLUDED.annual_error,\n"
        "  meets_threshold = EXCLUDED.meets_threshold, status = EXCLUDED.status;"
    )


DDL = """-- ============================================================================
-- setup_completo.sql — full schema + data for a FRESH, EMPTY Supabase project.
-- Run once in the Supabase SQL Editor. Idempotent (safe to re-run).
-- Anonymized: plants are only 'Fundición Aluminio' and 'Motores Norte'.
-- AUTO-GENERATED by scripts/generate_predictions.py — do not edit by hand.
-- ============================================================================
BEGIN;

-- shared trigger function: bump updated_at on UPDATE -------------------------
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- 1) TABLES ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.plants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.energy_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id uuid NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  period date NOT NULL,
  water numeric, gas numeric, electricity numeric,
  water_pred numeric, gas_pred numeric, electricity_pred numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (plant_id, period)
);
CREATE INDEX IF NOT EXISTS idx_readings_period ON public.energy_readings(period);
CREATE INDEX IF NOT EXISTS idx_readings_plant ON public.energy_readings(plant_id);

CREATE TABLE IF NOT EXISTS public.unit_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  energy text NOT NULL CHECK (energy IN ('water','gas','electricity')),
  cost_per_unit numeric NOT NULL,
  currency text NOT NULL DEFAULT 'MXN',
  effective_from date NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (energy, effective_from)
);

CREATE TABLE IF NOT EXISTS public.model_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id uuid REFERENCES public.plants(id) ON DELETE CASCADE,
  energy text NOT NULL CHECK (energy IN ('water','gas','electricity')),
  model_type text,
  mape_monthly numeric, mape_quarterly numeric, r2 numeric, mae numeric, rmse numeric,
  annual_error numeric, meets_threshold boolean,
  status text NOT NULL DEFAULT 'ready',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (plant_id, energy)
);

-- 2) ROW LEVEL SECURITY + public policies ------------------------------------
ALTER TABLE public.plants          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_costs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_metrics   ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read plants" ON public.plants;
DROP POLICY IF EXISTS "public write plants" ON public.plants;
CREATE POLICY "public read plants"  ON public.plants FOR SELECT USING (true);
CREATE POLICY "public write plants"  ON public.plants FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public read readings" ON public.energy_readings;
DROP POLICY IF EXISTS "public write readings" ON public.energy_readings;
CREATE POLICY "public read readings"  ON public.energy_readings FOR SELECT USING (true);
CREATE POLICY "public write readings" ON public.energy_readings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public read unit_costs" ON public.unit_costs;
DROP POLICY IF EXISTS "public write unit_costs" ON public.unit_costs;
CREATE POLICY "public read unit_costs"  ON public.unit_costs FOR SELECT USING (true);
CREATE POLICY "public write unit_costs" ON public.unit_costs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public read model_metrics" ON public.model_metrics;
DROP POLICY IF EXISTS "public write model_metrics" ON public.model_metrics;
CREATE POLICY "public read model_metrics"  ON public.model_metrics FOR SELECT USING (true);
CREATE POLICY "public write model_metrics" ON public.model_metrics FOR ALL USING (true) WITH CHECK (true);

-- 3) updated_at triggers -----------------------------------------------------
DROP TRIGGER IF EXISTS trg_readings_updated ON public.energy_readings;
CREATE TRIGGER trg_readings_updated BEFORE UPDATE ON public.energy_readings
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS touch_unit_costs ON public.unit_costs;
CREATE TRIGGER touch_unit_costs BEFORE UPDATE ON public.unit_costs
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_model_metrics_updated ON public.model_metrics;
CREATE TRIGGER trg_model_metrics_updated BEFORE UPDATE ON public.model_metrics
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
"""


def write_setup_completo(filename, plant_data, costs, metrics):
    parts = [DDL]
    parts.append("\n-- 4) PLANTS (anonymized, idempotent by name) ------------------------------")
    for pd in plant_data:
        parts.append(
            f"INSERT INTO public.plants (name, location, sort_order)\n"
            f"SELECT '{pd['plant']}', NULL, {pd['sort_order']}\n"
            f"WHERE NOT EXISTS (SELECT 1 FROM public.plants WHERE name = '{pd['plant']}');")
    parts.append("\n-- 5) UNIT COSTS -------------------------------------------------------------")
    parts.append(_unit_costs_values(costs))
    for pd in plant_data:
        parts.append(f"\n-- 6) ENERGY READINGS — {pd['plant']} (48 months) --------------------")
        parts.append(_reading_values(pd['plant'], pd['per'], pd['elec'], pd['water'],
                                     pd['gas'], pd['ep'], pd['wp'], pd['gp']))
    parts.append("\n-- 7) MODEL METRICS ---------------------------------------------------------")
    parts.append(_model_metrics_values(metrics))
    parts.append("\nCOMMIT;\n")
    path = os.path.join(ROOT, "supabase", filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(parts))
    print(f"  wrote {os.path.relpath(path, ROOT)}")


# ================================================================ MAIN
def main():
    os.makedirs(OUT, exist_ok=True)
    metrics = []
    print("Fundicion:")
    fund = run_fundicion(metrics)
    print("Motores Norte:")
    norte = run_norte(metrics)

    with open(os.path.join(OUT, "model_metrics.json"), "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2, ensure_ascii=False)
    print(f"  wrote {os.path.relpath(os.path.join(OUT, 'model_metrics.json'), ROOT)}")
    write_model_metrics_seed("seed_model_metrics.sql", metrics)

    costs = build_unit_costs()
    with open(os.path.join(OUT, "unit_costs.json"), "w", encoding="utf-8") as f:
        json.dump(costs, f, indent=2, ensure_ascii=False)
    print(f"  wrote {os.path.relpath(os.path.join(OUT, 'unit_costs.json'), ROOT)}")
    write_unit_costs_seed("seed_unit_costs.sql", costs)
    write_simulator_ts("simulatorData.ts")
    write_setup_completo("setup_completo.sql", [fund, norte], costs, metrics)

    print("\nDone. Review data/*.csv and data/*.json, then run the seed (see docs/CARGA_DATOS.md).")


if __name__ == "__main__":
    main()
