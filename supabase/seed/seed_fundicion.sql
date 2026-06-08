-- Seed: Fundición Aluminio energy_readings (48 months, real + predicted CONSUMPTION).
-- Idempotent: safe to run multiple times. Paste into Supabase SQL Editor and Run.
BEGIN;

-- 1) Ensure the plant exists (resolved by name, generic/anonymized).
INSERT INTO public.plants (name, location, sort_order)
SELECT 'Fundición Aluminio', NULL, 0
WHERE NOT EXISTS (SELECT 1 FROM public.plants WHERE name = 'Fundición Aluminio');

-- 2) Upsert the 48 monthly readings.
INSERT INTO public.energy_readings
  (plant_id, period, electricity, water, gas, electricity_pred, water_pred, gas_pred)
VALUES
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2022-01-01', 3841.3575, 3383.0000, 5562.5002, 4242.2531, 4223.1391, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2022-02-01', 4211.9782, 3711.6613, 5556.4712, 4321.3639, 4382.7342, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2022-03-01', 4296.6163, 3753.0000, 5504.1107, 4107.6144, 4217.6545, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2022-04-01', 3259.6299, 3539.0000, 4088.6524, 3420.7789, 3596.7831, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2022-05-01', 4468.9809, 3687.0000, 5668.4315, 4397.4201, 4204.3951, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2022-06-01', 4808.6240, 3970.8651, 6630.0892, 4755.4926, 4323.8800, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2022-07-01', 5056.7353, 4923.8138, 6420.6006, 4751.5685, 4204.0558, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2022-08-01', 4760.7729, 4339.0000, 6390.0000, 4611.5091, 4059.1235, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2022-09-01', 4253.5202, 4103.0000, 6014.4400, 4271.7881, 3858.0625, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2022-10-01', 3871.6630, 4876.4185, 6769.3441, 4843.4412, 4451.6647, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2022-11-01', 4648.2254, 4687.2138, 6867.4968, 4567.9869, 4447.9762, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2022-12-01', 2483.0780, 3074.7526, 3341.7218, 2918.6098, 3391.8791, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2023-01-01', 4169.1128, 4957.0000, 6342.4570, 4128.9227, 4506.2339, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2023-02-01', 4230.3275, 4729.4184, 6223.2953, 4440.5564, 4845.6088, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2023-03-01', 4876.8859, 5304.6480, 6899.0865, 4866.9854, 5175.4964, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2023-04-01', 4279.7206, 4902.8414, 6098.4405, 4118.6061, 4507.0410, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2023-05-01', 4668.8104, 4859.0000, 6521.4040, 4470.3791, 4631.5233, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2023-06-01', 4635.8220, 4622.0000, 6252.9615, 4392.9646, 4414.3025, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2023-07-01', 4585.1008, 4009.0000, 6393.9800, 4292.4106, 4219.7670, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2023-08-01', 3382.8824, 3430.2895, 4671.4955, 3567.8923, 3622.9483, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2023-09-01', 4311.8743, 3838.8525, 5770.3995, 4121.0816, 4112.2592, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2023-10-01', 3960.6668, 3955.3651, 5166.1615, 3832.3060, 4040.6033, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2023-11-01', 4035.4551, 3998.6229, 5583.5872, 3965.8992, 4353.1783, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2023-12-01', 4248.2981, 4707.3294, 6000.3097, 4228.6286, 4775.4656, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2024-01-01', 3207.6163, 4776.4989, 3797.0324, 2983.8113, 3991.5861, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2024-02-01', 4376.6771, 5406.7762, 6749.3811, 4492.8245, 5256.7396, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2024-03-01', 4193.0426, 5865.9919, 6073.2305, 4153.6225, 4994.6638, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2024-04-01', 4252.4468, 5545.7273, 6240.4559, 4429.7766, 5118.3475, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2024-05-01', 4355.9318, 4888.4540, 6031.7996, 4213.8261, 4803.8827, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2024-06-01', 4428.0291, 4888.4540, 6426.5612, 4183.9383, 4623.4082, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2024-07-01', 4260.2760, 3430.6287, 5754.4634, 4032.7148, 4389.6964, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2024-08-01', 3786.5632, 3894.0900, 4946.9700, 3766.3727, 4147.1261, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2024-09-01', 4128.7911, 4567.7073, 5806.5539, 4221.5317, 4560.6429, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2024-10-01', 4475.4655, 4844.8169, 6253.9734, 4493.2922, 4922.3770, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2024-11-01', 4339.2273, 4874.7116, 6084.6105, 4455.1380, 5102.1619, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2024-12-01', 3935.2338, 5115.9850, 5055.1208, 4022.1312, 4986.5264, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2025-01-01', 2596.4072, 4502.0773, 2864.3415, 2716.5515, 4155.6673, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2025-02-01', 4037.4787, 5346.8001, 5562.2095, 4231.4281, 5425.3541, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2025-03-01', 4338.4622, 5529.4368, 5480.7379, 4289.6906, 5470.5861, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2025-04-01', 4051.0478, 5142.7233, 5197.1966, 4090.2637, 5226.5647, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2025-05-01', 4300.2000, 5456.6928, 5101.0239, 4332.7131, 5266.5212, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2025-06-01', 4257.0256, 5670.8176, 5088.0183, 4191.4204, 4999.9116, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2025-07-01', 4480.3350, 5726.9410, 5619.9903, 4445.9243, 5079.8964, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2025-08-01', 4427.7743, 4982.3592, 5357.9860, 4461.3823, 5055.2056, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2025-09-01', 4170.4716, 4575.8855, 4883.6146, 3989.7077, 4752.1219, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2025-10-01', 4567.4409, 5451.3653, 5880.2850, 4583.7479, 5363.0332, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2025-11-01', 4339.2273, 5182.0390, 6344.6051, 3987.1597, 5111.0534, NULL),
  ((SELECT id FROM public.plants WHERE name = 'Fundición Aluminio'), '2025-12-01', 3465.8829, 4330.0449, 3943.2720, 3556.0507, 4996.8853, NULL)
ON CONFLICT (plant_id, period) DO UPDATE SET
  electricity = EXCLUDED.electricity,
  water = EXCLUDED.water,
  gas = EXCLUDED.gas,
  electricity_pred = EXCLUDED.electricity_pred,
  water_pred = EXCLUDED.water_pred,
  gas_pred = EXCLUDED.gas_pred;

COMMIT;
