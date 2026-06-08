-- Seed: unit_costs (tariffs). GLOBAL table keyed by (energy, effective_from):
-- one rate per energy per period, shared across plants (front does consumo * cost_per_unit).
-- electricity stored as $/MWHr (= $/kWh x1000), water $/M3, gas $/MWHr.
-- Idempotent.
BEGIN;
INSERT INTO public.unit_costs (energy, cost_per_unit, currency, effective_from, notes)
VALUES
  ('electricity', 2137.0, 'MXN', '2022-01-01', '2.137 $/kWh x1000 -> $/MWHr'),
  ('water', 25.53, 'MXN', '2022-01-01', '$/M3'),
  ('gas', 615.99, 'MXN', '2022-01-01', 'weighted annual avg $/MWHr (Fundicion)'),
  ('electricity', 2134.0, 'MXN', '2023-01-01', '2.134 $/kWh x1000 -> $/MWHr'),
  ('water', 28.1, 'MXN', '2023-01-01', '$/M3'),
  ('gas', 330.09, 'MXN', '2023-01-01', 'weighted annual avg $/MWHr (Fundicion)'),
  ('electricity', 2232.0, 'MXN', '2024-01-01', '2.232 $/kWh x1000 -> $/MWHr'),
  ('water', 29.73, 'MXN', '2024-01-01', '$/M3'),
  ('gas', 322.64, 'MXN', '2024-01-01', 'weighted annual avg $/MWHr (Fundicion)'),
  ('electricity', 2315.0, 'MXN', '2025-01-01', '2.315 $/kWh x1000 -> $/MWHr'),
  ('water', 30.7, 'MXN', '2025-01-01', '$/M3'),
  ('gas', 377.46, 'MXN', '2025-01-01', 'weighted annual avg $/MWHr (Fundicion)')
ON CONFLICT (energy, effective_from) DO UPDATE SET
  cost_per_unit = EXCLUDED.cost_per_unit,
  notes = EXCLUDED.notes;
COMMIT;
