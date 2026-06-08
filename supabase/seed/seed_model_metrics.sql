-- Seed: model_metrics (one row per plant x energy). Idempotent.
-- Requires the model_metrics table (see its migration). plant_id resolved by name.
BEGIN;
INSERT INTO public.model_metrics
  (plant_id, energy, model_type, mape_monthly, mape_quarterly, r2, mae, rmse,
   annual_error, meets_threshold, status)
VALUES
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), 'electricity', 'OLS', 2.56, NULL, 0.9312, 100.6, 138.0, -0.32, true, 'ready'),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), 'water', 'Ridge', 5.18, 3.22, 0.366, 262.6, 357.7, -1.61, true, 'ready'),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), 'gas', NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, 'in_progress'),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), 'electricity', 'OLS', 3.05, NULL, 0.7053, 139.9, 211.4, 1.18, true, 'ready'),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), 'water', 'Naive seasonal', 10.8, 10.89, -11.6552, 313.2, 395.6, -10.95, false, 'ready'),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), 'gas', 'Naive seasonal', 14.99, 11.73, -0.6577, 11.3, 13.9, 8.06, false, 'ready')
ON CONFLICT (plant_id, energy) DO UPDATE SET
  model_type = EXCLUDED.model_type,
  mape_monthly = EXCLUDED.mape_monthly,
  mape_quarterly = EXCLUDED.mape_quarterly,
  r2 = EXCLUDED.r2,
  mae = EXCLUDED.mae,
  rmse = EXCLUDED.rmse,
  annual_error = EXCLUDED.annual_error,
  meets_threshold = EXCLUDED.meets_threshold,
  status = EXCLUDED.status;
COMMIT;
