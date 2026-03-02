import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReadingPayload {
  sensor_id: string;
  value: number;
  unit?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const payload: ReadingPayload = await req.json();
    const { sensor_id, value, unit = "cm" } = payload;

    if (!sensor_id || value === undefined) {
      return new Response(JSON.stringify({ error: "sensor_id and value required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Insert reading
    const { error: readingError } = await supabase
      .from("readings")
      .insert({ sensor_id, value, unit });

    if (readingError) throw readingError;

    // 2. Update sensor last_reading_at
    await supabase
      .from("sensors")
      .update({ last_reading_at: new Date().toISOString(), status: "online" })
      .eq("id", sensor_id);

    // 3. Get sensor + reservoir info for threshold check
    const { data: sensor } = await supabase
      .from("sensors")
      .select("type, reservoir_id, reservoirs(id, name, height_cm, capacity_liters)")
      .eq("id", sensor_id)
      .single();

    if (!sensor || sensor.type !== "nivel") {
      return new Response(JSON.stringify({ ok: true, alert: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reservoir = (sensor as any).reservoirs;
    if (!reservoir) {
      return new Response(JSON.stringify({ ok: true, alert: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const levelPercent = reservoir.height_cm > 0
      ? Math.round((value / reservoir.height_cm) * 100)
      : 0;

    // 4. Check thresholds and generate alerts
    let alertData: { title: string; message: string; severity: string } | null = null;

    if (levelPercent <= 10) {
      alertData = {
        title: "Nível Crítico",
        message: `${reservoir.name} está com apenas ${levelPercent}% de capacidade (${value}cm / ${reservoir.height_cm}cm)`,
        severity: "critical",
      };
    } else if (levelPercent <= 25) {
      alertData = {
        title: "Nível Baixo",
        message: `${reservoir.name} está com ${levelPercent}% de capacidade (${value}cm / ${reservoir.height_cm}cm)`,
        severity: "warning",
      };
    } else if (levelPercent >= 98) {
      alertData = {
        title: "Reservatório Cheio",
        message: `${reservoir.name} atingiu ${levelPercent}% da capacidade. Verifique a boia.`,
        severity: "info",
      };
    }

    if (alertData) {
      // Check if there's already an active alert of same severity for this reservoir
      const { data: existingAlerts } = await supabase
        .from("alerts")
        .select("id")
        .eq("reservoir_id", reservoir.id)
        .eq("status", "active")
        .eq("severity", alertData.severity)
        .limit(1);

      if (!existingAlerts || existingAlerts.length === 0) {
        await supabase.from("alerts").insert({
          reservoir_id: reservoir.id,
          title: alertData.title,
          message: alertData.message,
          severity: alertData.severity,
        });
      }
    }

    // 5. Auto-resolve old low-level alerts if level is now normal
    if (levelPercent > 25 && levelPercent < 98) {
      await supabase
        .from("alerts")
        .update({ status: "resolved", resolved_at: new Date().toISOString() })
        .eq("reservoir_id", reservoir.id)
        .eq("status", "active")
        .in("title", ["Nível Crítico", "Nível Baixo", "Reservatório Cheio"]);
    }

    return new Response(
      JSON.stringify({ ok: true, levelPercent, alert: alertData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
