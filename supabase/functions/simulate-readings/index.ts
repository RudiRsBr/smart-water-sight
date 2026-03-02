import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get all level sensors with their reservoirs
    const { data: sensors, error } = await supabase
      .from("sensors")
      .select("id, type, reservoir_id, reservoirs(height_cm)")
      .eq("type", "nivel")
      .eq("status", "online");

    if (error) throw error;
    if (!sensors || sensors.length === 0) {
      return new Response(JSON.stringify({ message: "No level sensors found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const baseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const results = [];

    for (const sensor of sensors) {
      const height = (sensor as any).reservoirs?.height_cm || 200;
      // Simulate a random level between 15% and 95% of height
      const value = Math.round(height * (0.15 + Math.random() * 0.8));

      const res = await fetch(`${baseUrl}/functions/v1/process-reading`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({ sensor_id: sensor.id, value, unit: "cm" }),
      });

      const result = await res.json();
      results.push({ sensor_id: sensor.id, value, ...result });
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
