
CREATE TABLE public.model_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id uuid REFERENCES public.plants(id) ON DELETE CASCADE,
  energy text NOT NULL CHECK (energy IN ('water','gas','electricity')),
  model_type text,
  mape_monthly numeric,
  mape_quarterly numeric,
  r2 numeric,
  mae numeric,
  rmse numeric,
  annual_error numeric,
  meets_threshold boolean,
  status text NOT NULL DEFAULT 'ready',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (plant_id, energy)
);

ALTER TABLE public.model_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read model_metrics" ON public.model_metrics FOR SELECT USING (true);
CREATE POLICY "public write model_metrics" ON public.model_metrics FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER trg_model_metrics_updated
BEFORE UPDATE ON public.model_metrics
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
