#!/usr/bin/env node
/**
 * load_data.mjs — alternative to the SQL seed: upsert the generated data into
 * Supabase using the JS client and your local .env credentials.
 *
 * Reads:
 *   data/predicciones_fundicion.csv
 *   data/predicciones_norte.csv
 *   data/unit_costs.json
 *   data/model_metrics.json        (only if the model_metrics table exists)
 *
 * Resolves plant_id by NAME (creates the plant if missing). Never hardcodes a UUID.
 * Idempotent: re-running upserts the same rows.
 *
 * Usage:
 *   npm install                 # once, to get @supabase/supabase-js
 *   node scripts/load_data.mjs  # reads .env at the repo root
 *
 * Env (any of these names work):
 *   URL : VITE_SUPABASE_URL | SUPABASE_URL
 *   KEY : VITE_SUPABASE_PUBLISHABLE_KEY | SUPABASE_PUBLISHABLE_KEY
 *         | VITE_SUPABASE_ANON_KEY | SUPABASE_ANON_KEY
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DATA = join(ROOT, "data");

// ---- minimal .env loader (no extra deps) ----------------------------------
function loadEnv() {
  const path = join(ROOT, ".env");
  if (!existsSync(path)) return;
  for (const raw of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

function pick(...names) {
  for (const n of names) if (process.env[n]) return process.env[n];
  return undefined;
}

// ---- tiny CSV reader (no embedded commas/quotes in our generated files) ----
function readCsv(file) {
  const text = readFileSync(join(DATA, file), "utf8").trim();
  const [head, ...rows] = text.split(/\r?\n/);
  const cols = head.split(",");
  return rows.map((line) => {
    const cells = line.split(",");
    const obj = {};
    cols.forEach((c, i) => {
      const v = cells[i];
      obj[c] = v === "" || v === undefined ? null : c === "period" ? v : Number(v);
    });
    return obj;
  });
}

async function ensurePlant(sb, name, sort_order) {
  const { data: found, error: e1 } = await sb.from("plants").select("id").eq("name", name).maybeSingle();
  if (e1) throw e1;
  if (found) return found.id;
  const { data: created, error: e2 } = await sb
    .from("plants")
    .insert({ name, sort_order })
    .select("id")
    .single();
  if (e2) throw e2;
  console.log(`  created plant "${name}"`);
  return created.id;
}

async function upsertReadings(sb, plantId, rows) {
  const payload = rows.map((r) => ({
    plant_id: plantId,
    period: r.period,
    electricity: r.electricity,
    water: r.water,
    gas: r.gas,
    electricity_pred: r.electricity_pred,
    water_pred: r.water_pred,
    gas_pred: r.gas_pred,
  }));
  const { error } = await sb.from("energy_readings").upsert(payload, { onConflict: "plant_id,period" });
  if (error) throw error;
}

async function main() {
  loadEnv();
  const url = pick("VITE_SUPABASE_URL", "SUPABASE_URL");
  const key = pick(
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_PUBLISHABLE_KEY",
    "VITE_SUPABASE_ANON_KEY",
    "SUPABASE_ANON_KEY",
  );
  if (!url || !key) {
    console.error("Missing Supabase credentials. Set VITE_SUPABASE_URL and a key var in .env.");
    process.exit(1);
  }
  const sb = createClient(url, key);

  // 1) unit_costs (global)
  const costs = JSON.parse(readFileSync(join(DATA, "unit_costs.json"), "utf8")).map((c) => ({
    energy: c.energy,
    cost_per_unit: c.cost_per_unit,
    currency: "MXN",
    effective_from: c.effective_from,
    notes: c.notes,
  }));
  {
    const { error } = await sb.from("unit_costs").upsert(costs, { onConflict: "energy,effective_from" });
    if (error) throw error;
    console.log(`unit_costs: upserted ${costs.length} rows`);
  }

  // 2) readings per plant
  const plants = [
    { name: "Fundición Aluminio", sort_order: 0, file: "predicciones_fundicion.csv" },
    { name: "Motores Norte", sort_order: 1, file: "predicciones_norte.csv" },
  ];
  for (const p of plants) {
    const id = await ensurePlant(sb, p.name, p.sort_order);
    const rows = readCsv(p.file);
    await upsertReadings(sb, id, rows);
    console.log(`${p.name}: upserted ${rows.length} readings`);
  }

  // 3) model_metrics (only if the table exists — created in a later migration)
  const mmPath = join(DATA, "model_metrics.json");
  if (existsSync(mmPath)) {
    const metrics = JSON.parse(readFileSync(mmPath, "utf8"));
    const byName = Object.fromEntries(
      await Promise.all(plants.map(async (p) => [p.name, await ensurePlant(sb, p.name, p.sort_order)])),
    );
    const payload = metrics.map((m) => ({
      plant_id: byName[m.plant],
      energy: m.energy,
      model_type: m.model_type,
      mape_monthly: m.mape_monthly,
      mape_quarterly: m.mape_quarterly,
      r2: m.r2,
      mae: m.mae,
      rmse: m.rmse,
      annual_error: m.annual_error,
      meets_threshold: m.meets_threshold,
      status: m.status,
    }));
    const { error } = await sb.from("model_metrics").upsert(payload, { onConflict: "plant_id,energy" });
    if (error) {
      console.warn(`model_metrics skipped (${error.message}). Run the migration first, then re-run.`);
    } else {
      console.log(`model_metrics: upserted ${payload.length} rows`);
    }
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
