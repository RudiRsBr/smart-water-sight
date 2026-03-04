-- Add flow rate to pumps
ALTER TABLE public.pumps ADD COLUMN IF NOT EXISTS flow_rate_lph numeric DEFAULT 0;

-- Create pump_events table to track on/off transitions
CREATE TABLE public.pump_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pump_id uuid REFERENCES public.pumps(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('on', 'off', 'fault')),
  occurred_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pump_events ENABLE ROW LEVEL SECURITY;

-- RLS: Admins manage
CREATE POLICY "Admins manage pump_events"
  ON public.pump_events FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS: Users see pump events of own condominiums
CREATE POLICY "Users see pump_events of own condominiums"
  ON public.pump_events FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM pumps p
      JOIN reservoirs r ON r.id = p.reservoir_id
      JOIN towers t ON t.id = r.tower_id
      WHERE p.id = pump_events.pump_id
      AND user_belongs_to_condominium(auth.uid(), t.condominium_id)
    )
  );

-- Index for efficient queries
CREATE INDEX idx_pump_events_pump_occurred ON public.pump_events(pump_id, occurred_at DESC);