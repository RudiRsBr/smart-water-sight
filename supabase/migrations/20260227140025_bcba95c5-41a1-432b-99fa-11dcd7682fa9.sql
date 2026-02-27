
-- =============================================
-- MODELAGEM COMPLETA: HydroVision
-- =============================================

-- 1. CONDOMÍNIOS
CREATE TABLE public.condominiums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.condominiums ENABLE ROW LEVEL SECURITY;

-- 2. TORRES / BLOCOS
CREATE TABLE public.towers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominium_id UUID NOT NULL REFERENCES public.condominiums(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  floors INTEGER,
  units INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.towers ENABLE ROW LEVEL SECURITY;

-- 3. RESERVATÓRIOS
CREATE TYPE public.reservoir_type AS ENUM ('superior', 'inferior', 'intermediario');

CREATE TABLE public.reservoirs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tower_id UUID NOT NULL REFERENCES public.towers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type public.reservoir_type NOT NULL DEFAULT 'superior',
  capacity_liters NUMERIC NOT NULL DEFAULT 0,
  height_cm NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reservoirs ENABLE ROW LEVEL SECURITY;

-- 4. SENSORES
CREATE TYPE public.sensor_type AS ENUM ('nivel', 'pressao', 'vazao', 'qualidade');
CREATE TYPE public.sensor_status AS ENUM ('online', 'offline', 'manutencao');

CREATE TABLE public.sensors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservoir_id UUID NOT NULL REFERENCES public.reservoirs(id) ON DELETE CASCADE,
  type public.sensor_type NOT NULL DEFAULT 'nivel',
  model TEXT,
  serial_number TEXT,
  status public.sensor_status NOT NULL DEFAULT 'online',
  installed_at TIMESTAMPTZ DEFAULT now(),
  last_reading_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sensors ENABLE ROW LEVEL SECURITY;

-- 5. BOMBAS
CREATE TYPE public.pump_status AS ENUM ('ligada', 'desligada', 'manutencao', 'falha');

CREATE TABLE public.pumps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservoir_id UUID NOT NULL REFERENCES public.reservoirs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  model TEXT,
  power_hp NUMERIC,
  status public.pump_status NOT NULL DEFAULT 'desligada',
  hours_run NUMERIC NOT NULL DEFAULT 0,
  last_maintenance_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pumps ENABLE ROW LEVEL SECURITY;

-- 6. LEITURAS
CREATE TABLE public.readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id UUID NOT NULL REFERENCES public.sensors(id) ON DELETE CASCADE,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'cm',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.readings ENABLE ROW LEVEL SECURITY;

-- 7. ALERTAS
CREATE TYPE public.alert_severity AS ENUM ('info', 'warning', 'critical');
CREATE TYPE public.alert_status AS ENUM ('active', 'acknowledged', 'resolved');

CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservoir_id UUID NOT NULL REFERENCES public.reservoirs(id) ON DELETE CASCADE,
  severity public.alert_severity NOT NULL DEFAULT 'info',
  status public.alert_status NOT NULL DEFAULT 'active',
  title TEXT NOT NULL,
  message TEXT,
  acknowledged_by UUID REFERENCES public.profiles(id),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- 8. LOG DE NOTIFICAÇÕES
CREATE TYPE public.notification_channel AS ENUM ('email', 'sms', 'push', 'whatsapp');

CREATE TABLE public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES public.alerts(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  channel public.notification_channel NOT NULL DEFAULT 'email',
  recipient TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT
);

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- 9. VÍNCULO USUÁRIO <-> CONDOMÍNIO (multi-tenant)
CREATE TABLE public.user_condominiums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  condominium_id UUID NOT NULL REFERENCES public.condominiums(id) ON DELETE CASCADE,
  UNIQUE (user_id, condominium_id)
);

ALTER TABLE public.user_condominiums ENABLE ROW LEVEL SECURITY;

-- =============================================
-- FUNÇÃO AUXILIAR: verifica se usuário pertence ao condomínio
-- =============================================
CREATE OR REPLACE FUNCTION public.user_belongs_to_condominium(_user_id UUID, _condominium_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_condominiums
    WHERE user_id = _user_id AND condominium_id = _condominium_id
  )
$$;

-- =============================================
-- RLS POLICIES
-- =============================================

-- CONDOMINIUMS: usuários veem apenas seus condomínios, admins veem todos
CREATE POLICY "Users see own condominiums" ON public.condominiums
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.user_belongs_to_condominium(auth.uid(), id)
  );

CREATE POLICY "Admins manage condominiums" ON public.condominiums
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- TOWERS: herda acesso do condomínio
CREATE POLICY "Users see towers of own condominiums" ON public.towers
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.user_belongs_to_condominium(auth.uid(), condominium_id)
  );

CREATE POLICY "Admins manage towers" ON public.towers
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RESERVOIRS: herda acesso via tower -> condominium
CREATE POLICY "Users see reservoirs of own condominiums" ON public.reservoirs
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    EXISTS (
      SELECT 1 FROM public.towers t
      WHERE t.id = tower_id
      AND public.user_belongs_to_condominium(auth.uid(), t.condominium_id)
    )
  );

CREATE POLICY "Admins manage reservoirs" ON public.reservoirs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- SENSORS: herda acesso via reservoir -> tower -> condominium
CREATE POLICY "Users see sensors of own condominiums" ON public.sensors
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    EXISTS (
      SELECT 1 FROM public.reservoirs r
      JOIN public.towers t ON t.id = r.tower_id
      WHERE r.id = reservoir_id
      AND public.user_belongs_to_condominium(auth.uid(), t.condominium_id)
    )
  );

CREATE POLICY "Admins manage sensors" ON public.sensors
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PUMPS: herda acesso via reservoir
CREATE POLICY "Users see pumps of own condominiums" ON public.pumps
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    EXISTS (
      SELECT 1 FROM public.reservoirs r
      JOIN public.towers t ON t.id = r.tower_id
      WHERE r.id = reservoir_id
      AND public.user_belongs_to_condominium(auth.uid(), t.condominium_id)
    )
  );

CREATE POLICY "Admins manage pumps" ON public.pumps
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- READINGS: herda acesso via sensor -> reservoir
CREATE POLICY "Users see readings of own condominiums" ON public.readings
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    EXISTS (
      SELECT 1 FROM public.sensors s
      JOIN public.reservoirs r ON r.id = s.reservoir_id
      JOIN public.towers t ON t.id = r.tower_id
      WHERE s.id = sensor_id
      AND public.user_belongs_to_condominium(auth.uid(), t.condominium_id)
    )
  );

CREATE POLICY "Admins manage readings" ON public.readings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ALERTS: herda acesso via reservoir
CREATE POLICY "Users see alerts of own condominiums" ON public.alerts
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    EXISTS (
      SELECT 1 FROM public.reservoirs r
      JOIN public.towers t ON t.id = r.tower_id
      WHERE r.id = reservoir_id
      AND public.user_belongs_to_condominium(auth.uid(), t.condominium_id)
    )
  );

CREATE POLICY "Admins manage alerts" ON public.alerts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- NOTIFICATION_LOGS: usuário vê apenas suas notificações
CREATE POLICY "Users see own notifications" ON public.notification_logs
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage notifications" ON public.notification_logs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- USER_CONDOMINIUMS: usuário vê seus vínculos, admin gerencia todos
CREATE POLICY "Users see own condominium links" ON public.user_condominiums
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage condominium links" ON public.user_condominiums
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- HABILITAR REALTIME para leituras e alertas
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.readings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pumps;
