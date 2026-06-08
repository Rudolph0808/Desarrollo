# Carga de datos al dashboard

Este dashboard lee de Supabase (nube). Las predicciones y tarifas se generan en
local y **tú** las cargas. Hay **dos caminos** (elige uno); ambos son idempotentes
(puedes repetirlos sin duplicar).

> Anonimización: las plantas se llaman siempre **`Fundición Aluminio`** y
> **`Motores Norte`**. El seed las crea con esos nombres exactos si no existen.

---

## ⭐ Proyecto Supabase NUEVO y vacío — un solo archivo

Si tu base no tiene **nada** todavía, usa el archivo todo‑en‑uno:

1. Supabase → **SQL Editor** → **New query**.
2. Pega **[supabase/setup_completo.sql](../supabase/setup_completo.sql)** completo y **Run**.

Crea de un jalón: tablas (`plants`, `energy_readings`, `unit_costs`, `model_metrics`)
con RLS y políticas → triggers → las 2 plantas → `unit_costs` → lecturas de Fundición
→ lecturas de Motores Norte → `model_metrics`. Es **idempotente** (puedes re‑correrlo)
y atómico (todo dentro de una transacción). No necesitas la migración aparte ni los
seeds sueltos: ese archivo ya incluye todo.

Los caminos A y B de abajo son para una base que **ya tiene** las tablas creadas.

---

## 0. (Opcional) Regenerar los artefactos

Solo si cambian los datos crudos en `data/raw/`. Requiere Python con
`numpy pandas scikit-learn statsmodels scipy`.

```bash
npm run predict        # = python scripts/generate_predictions.py
```

Genera, desde `data/raw/`:
- `data/predicciones_fundicion.csv`, `data/predicciones_norte.csv` (consumo real + predicho)
- `data/unit_costs.json`, `data/model_metrics.json`
- `supabase/seed/seed_fundicion.sql`, `seed_motores_norte.sql`, `seed_unit_costs.sql`

Los artefactos ya vienen generados en el repo, así que normalmente puedes saltar este paso.

---

## Camino A — SQL Editor de Supabase (recomendado, sin terminal ni .env)

1. Abre tu proyecto en supabase.com → **SQL Editor** → **New query**.
2. Pega y **Run**, en este orden:
   1. `supabase/seed/seed_unit_costs.sql`
   2. `supabase/seed/seed_fundicion.sql`
   3. `supabase/seed/seed_motores_norte.sql`
3. (Tras aplicar la migración de `model_metrics`, en la Tarea 2) `supabase/seed/seed_model_metrics.sql`.

Cada archivo crea la planta por nombre si falta y hace `UPSERT` de los 48 meses.

---

## Camino B — Script Node con tu `.env`

Lee credenciales de `.env` en la raíz del repo. Acepta cualquiera de estos nombres:
`VITE_SUPABASE_URL`/`SUPABASE_URL` y
`VITE_SUPABASE_PUBLISHABLE_KEY`/`SUPABASE_PUBLISHABLE_KEY`/`VITE_SUPABASE_ANON_KEY`.

```bash
npm install            # una vez (trae @supabase/supabase-js)
npm run load:data      # = node scripts/load_data.mjs
```

Carga `unit_costs`, las lecturas de ambas plantas y —si ya existe la tabla—
`model_metrics`. Si la tabla `model_metrics` aún no existe, ese paso se omite
con un aviso; aplica su migración y vuelve a correr el script.

---

## Convención de unidades (importante)

`energy_readings.*` guarda **CONSUMO** (electricidad/gas en **MWHr**, agua en **M³**).
El costo se calcula en el front: `consumo × cost_per_unit`. Por eso:

| Energía | `cost_per_unit` | Nota |
|---|---|---|
| electricity | **$/MWHr** | la tarifa del brief en $/kWh se multiplica ×1000 |
| water | $/M³ | igual a la del brief |
| gas | $/MWHr | promedio anual ponderado por consumo (Fundición) |

`unit_costs` es **global** (clave `energy, effective_from`): una tarifa por energía
por periodo, compartida entre plantas. Las tarifas de agua son idénticas entre
plantas; electricidad y gas se aproximan con la tarifa de Fundición.

## Predicciones por modelo (consumo)

| Planta · Energía | Modelo | MAPE test 2025 |
|---|---|---|
| Fundición · Electricidad | OLS `MWh=1861.65+1.5824·Vol` | 2.56% 🟢 |
| Fundición · Agua | Ridge (cadena, elec. predicha) | 5.18% mensual / 3.22% trim 🟡 |
| Fundición · Gas | — | en proceso ⚪ (sin predicción) |
| Motores Norte · Electricidad | OLS `MWh=1267.43+0.11221·Vol` | 3.05% 🟢 |
| Motores Norte · Agua | Naive estacional (=año previo) | 10.80% 🔴 |
| Motores Norte · Gas | Naive estacional (=año previo) | 14.99% 🔴 |

> El consumo predicho de agua/gas de Norte para 2022 queda vacío (el naive
> estacional no tiene año previo para predecir el primero).
