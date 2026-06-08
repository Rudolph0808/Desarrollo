-- Seed: Motores Norte energy_readings (48 months, real + predicted CONSUMPTION).
-- Idempotent: safe to run multiple times. Paste into Supabase SQL Editor and Run.
BEGIN;

-- 1) Ensure the plant exists (resolved by name, generic/anonymized).
INSERT INTO public.plants (name, location, sort_order)
SELECT 'Motores Norte', NULL, 1
WHERE NOT EXISTS (SELECT 1 FROM public.plants WHERE name = 'Motores Norte');

-- 2) Upsert the 48 monthly readings.
INSERT INTO public.energy_readings
  (plant_id, period, electricity, water, gas, electricity_pred, water_pred, gas_pred)
VALUES
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2022-01-01', 4887.6700, 2428.0000, 102.6300, 4064.5101, NULL, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2022-02-01', 4928.9700, 2429.1000, 113.2700, 5057.8728, NULL, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2022-03-01', 5343.6100, 2720.0000, 156.1000, 5585.9158, NULL, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2022-04-01', 4890.4900, 2401.0000, 143.7000, 4755.4767, NULL, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2022-05-01', 5495.4600, 2515.0000, 155.3900, 5162.2247, NULL, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2022-06-01', 5825.3000, 2367.5700, 167.4900, 5443.3016, NULL, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2022-07-01', 5789.0900, 2520.0000, 170.2300, 5317.5183, NULL, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2022-08-01', 5620.2200, 2793.0000, 130.0900, 5171.0890, NULL, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2022-09-01', 5526.5700, 2880.0000, 122.1400, 5773.3004, NULL, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2022-10-01', 4472.0200, 3038.6600, 147.1300, 5448.7997, NULL, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2022-11-01', 4826.0000, 2888.9400, 131.4700, 4957.5603, NULL, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2022-12-01', 2712.0500, 1777.8000, 62.7300, 3459.6057, NULL, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2023-01-01', 5021.1300, 2710.0000, 112.4100, 4506.6031, 2428.0000, 102.6300),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2023-02-01', 5178.1000, 2710.6900, 122.9700, 5552.1417, 2429.1000, 113.2700),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2023-03-01', 6060.1600, 2795.0500, 133.0200, 6075.2477, 2720.0000, 156.1000),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2023-04-01', 5506.8800, 2631.5000, 124.1000, 5377.5487, 2401.0000, 143.7000),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2023-05-01', 5688.9000, 2641.0000, 125.8200, 5628.5543, 2515.0000, 155.3900),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2023-06-01', 4576.0900, 2375.0000, 112.0100, 4462.3938, 2367.5700, 167.4900),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2023-07-01', 4846.3100, 2124.0000, 116.9300, 4486.5181, 2520.0000, 170.2300),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2023-08-01', 5739.1000, 2539.0000, 99.2500, 5684.4330, 2793.0000, 130.0900),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2023-09-01', 5382.3200, 2402.6000, 149.8100, 5260.5175, 2880.0000, 122.1400),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2023-10-01', 5409.4900, 2641.2100, 136.7500, 5050.5794, 3038.6600, 147.1300),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2023-11-01', 4534.0000, 2127.7700, 120.9800, 4487.9768, 2888.9400, 131.4700),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2023-12-01', 2853.7800, 1290.9100, 30.0200, 3245.8526, 1777.8000, 62.7300),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2024-01-01', 4938.2000, 2348.6300, 90.8700, 4327.9706, 2710.0000, 112.4100),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2024-02-01', 5085.0700, 2736.3400, 81.9400, 5319.6502, 2710.6900, 122.9700),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2024-03-01', 5123.2500, 2767.3900, 81.9400, 4917.9515, 2795.0500, 133.0200),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2024-04-01', 5262.6600, 2773.4300, 80.6900, 5130.8069, 2631.5000, 124.1000),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2024-05-01', 4716.5100, 2460.1900, 85.9300, 4856.4624, 2641.0000, 125.8200),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2024-06-01', 4108.9900, 2460.1900, 74.3300, 4261.3200, 2375.0000, 112.0100),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2024-07-01', 4861.7500, 2441.5600, 81.6200, 4614.8822, 2124.0000, 116.9300),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2024-08-01', 5479.8400, 2602.4600, 89.8100, 5874.2861, 2539.0000, 99.2500),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2024-09-01', 5089.1100, 2503.5200, 88.5100, 5271.8503, 2402.6000, 149.8100),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2024-10-01', 5292.9100, 2732.1100, 86.7300, 5513.7672, 2641.2100, 136.7500),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2024-11-01', 4972.0200, 2711.4600, 81.2100, 5387.6472, 2127.7700, 120.9800),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2024-12-01', 2681.2900, 2034.0000, 85.8100, 3233.1733, 1290.9100, 30.0200),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2025-01-01', 4902.0000, 2927.9800, 72.2000, 4644.9535, 2348.6300, 90.8700),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2025-02-01', 4200.9400, 2761.2800, 65.9000, 4306.0903, 2736.3400, 81.9400),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2025-03-01', 4514.8200, 2898.6900, 82.8600, 4575.0489, 2767.3900, 81.9400),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2025-04-01', 4665.0700, 2898.0300, 81.2700, 4529.3810, 2773.4300, 80.6900),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2025-05-01', 4300.2000, 2993.4900, 81.9900, 4923.6740, 2460.1900, 85.9300),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2025-06-01', 4961.5700, 2806.2400, 72.2900, 4979.2162, 2460.1900, 74.3300),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2025-07-01', 4968.5800, 2862.5200, 69.6700, 5120.3717, 2441.5600, 81.6200),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2025-08-01', 5140.0800, 2738.0900, 70.6900, 5049.3451, 2602.4600, 89.8100),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2025-09-01', 4764.4100, 2636.3300, 69.2200, 4823.4738, 2503.5200, 88.5100),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2025-10-01', 5326.6100, 3065.5800, 72.2000, 5424.5631, 2732.1100, 86.7300),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2025-11-01', 4972.0200, 2831.4600, 105.5900, 4950.1547, 2711.4600, 81.2100),
  ((SELECT id FROM public.plants WHERE name = 'Motores Norte'), '2025-12-01', 3967.2900, 2909.4400, 90.2300, 4025.3501, 2034.0000, 85.8100)
ON CONFLICT (plant_id, period) DO UPDATE SET
  electricity = EXCLUDED.electricity,
  water = EXCLUDED.water,
  gas = EXCLUDED.gas,
  electricity_pred = EXCLUDED.electricity_pred,
  water_pred = EXCLUDED.water_pred,
  gas_pred = EXCLUDED.gas_pred;

COMMIT;
