export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string
          id: string
          message: string | null
          reservoir_id: string
          resolved_at: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          status: Database["public"]["Enums"]["alert_status"]
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          id?: string
          message?: string | null
          reservoir_id: string
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          status?: Database["public"]["Enums"]["alert_status"]
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          id?: string
          message?: string | null
          reservoir_id?: string
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          status?: Database["public"]["Enums"]["alert_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_reservoir_id_fkey"
            columns: ["reservoir_id"]
            isOneToOne: false
            referencedRelation: "reservoirs"
            referencedColumns: ["id"]
          },
        ]
      }
      condominiums: {
        Row: {
          address: string | null
          city: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          name: string
          state: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name: string
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name?: string
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          alert_id: string | null
          channel: Database["public"]["Enums"]["notification_channel"]
          delivered: boolean
          error_message: string | null
          id: string
          recipient: string
          sent_at: string
          user_id: string
        }
        Insert: {
          alert_id?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"]
          delivered?: boolean
          error_message?: string | null
          id?: string
          recipient: string
          sent_at?: string
          user_id: string
        }
        Update: {
          alert_id?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"]
          delivered?: boolean
          error_message?: string | null
          id?: string
          recipient?: string
          sent_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pumps: {
        Row: {
          created_at: string
          hours_run: number
          id: string
          last_maintenance_at: string | null
          model: string | null
          name: string
          power_hp: number | null
          reservoir_id: string
          status: Database["public"]["Enums"]["pump_status"]
        }
        Insert: {
          created_at?: string
          hours_run?: number
          id?: string
          last_maintenance_at?: string | null
          model?: string | null
          name: string
          power_hp?: number | null
          reservoir_id: string
          status?: Database["public"]["Enums"]["pump_status"]
        }
        Update: {
          created_at?: string
          hours_run?: number
          id?: string
          last_maintenance_at?: string | null
          model?: string | null
          name?: string
          power_hp?: number | null
          reservoir_id?: string
          status?: Database["public"]["Enums"]["pump_status"]
        }
        Relationships: [
          {
            foreignKeyName: "pumps_reservoir_id_fkey"
            columns: ["reservoir_id"]
            isOneToOne: false
            referencedRelation: "reservoirs"
            referencedColumns: ["id"]
          },
        ]
      }
      readings: {
        Row: {
          id: string
          recorded_at: string
          sensor_id: string
          unit: string
          value: number
        }
        Insert: {
          id?: string
          recorded_at?: string
          sensor_id: string
          unit?: string
          value: number
        }
        Update: {
          id?: string
          recorded_at?: string
          sensor_id?: string
          unit?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "readings_sensor_id_fkey"
            columns: ["sensor_id"]
            isOneToOne: false
            referencedRelation: "sensors"
            referencedColumns: ["id"]
          },
        ]
      }
      reservoirs: {
        Row: {
          capacity_liters: number
          created_at: string
          height_cm: number
          id: string
          name: string
          tower_id: string
          type: Database["public"]["Enums"]["reservoir_type"]
          updated_at: string
        }
        Insert: {
          capacity_liters?: number
          created_at?: string
          height_cm?: number
          id?: string
          name: string
          tower_id: string
          type?: Database["public"]["Enums"]["reservoir_type"]
          updated_at?: string
        }
        Update: {
          capacity_liters?: number
          created_at?: string
          height_cm?: number
          id?: string
          name?: string
          tower_id?: string
          type?: Database["public"]["Enums"]["reservoir_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservoirs_tower_id_fkey"
            columns: ["tower_id"]
            isOneToOne: false
            referencedRelation: "towers"
            referencedColumns: ["id"]
          },
        ]
      }
      sensors: {
        Row: {
          created_at: string
          id: string
          installed_at: string | null
          last_reading_at: string | null
          model: string | null
          reservoir_id: string
          serial_number: string | null
          status: Database["public"]["Enums"]["sensor_status"]
          type: Database["public"]["Enums"]["sensor_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          installed_at?: string | null
          last_reading_at?: string | null
          model?: string | null
          reservoir_id: string
          serial_number?: string | null
          status?: Database["public"]["Enums"]["sensor_status"]
          type?: Database["public"]["Enums"]["sensor_type"]
        }
        Update: {
          created_at?: string
          id?: string
          installed_at?: string | null
          last_reading_at?: string | null
          model?: string | null
          reservoir_id?: string
          serial_number?: string | null
          status?: Database["public"]["Enums"]["sensor_status"]
          type?: Database["public"]["Enums"]["sensor_type"]
        }
        Relationships: [
          {
            foreignKeyName: "sensors_reservoir_id_fkey"
            columns: ["reservoir_id"]
            isOneToOne: false
            referencedRelation: "reservoirs"
            referencedColumns: ["id"]
          },
        ]
      }
      towers: {
        Row: {
          condominium_id: string
          created_at: string
          floors: number | null
          id: string
          name: string
          units: number | null
        }
        Insert: {
          condominium_id: string
          created_at?: string
          floors?: number | null
          id?: string
          name: string
          units?: number | null
        }
        Update: {
          condominium_id?: string
          created_at?: string
          floors?: number | null
          id?: string
          name?: string
          units?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "towers_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
        ]
      }
      user_condominiums: {
        Row: {
          condominium_id: string
          id: string
          user_id: string
        }
        Insert: {
          condominium_id: string
          id?: string
          user_id: string
        }
        Update: {
          condominium_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_condominiums_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_condominiums_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      user_belongs_to_condominium: {
        Args: { _condominium_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      alert_severity: "info" | "warning" | "critical"
      alert_status: "active" | "acknowledged" | "resolved"
      app_role:
        | "admin"
        | "sindico"
        | "zelador"
        | "tecnico"
        | "empresa_manutencao"
      notification_channel: "email" | "sms" | "push" | "whatsapp"
      pump_status: "ligada" | "desligada" | "manutencao" | "falha"
      reservoir_type: "superior" | "inferior" | "intermediario"
      sensor_status: "online" | "offline" | "manutencao"
      sensor_type: "nivel" | "pressao" | "vazao" | "qualidade"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alert_severity: ["info", "warning", "critical"],
      alert_status: ["active", "acknowledged", "resolved"],
      app_role: [
        "admin",
        "sindico",
        "zelador",
        "tecnico",
        "empresa_manutencao",
      ],
      notification_channel: ["email", "sms", "push", "whatsapp"],
      pump_status: ["ligada", "desligada", "manutencao", "falha"],
      reservoir_type: ["superior", "inferior", "intermediario"],
      sensor_status: ["online", "offline", "manutencao"],
      sensor_type: ["nivel", "pressao", "vazao", "qualidade"],
    },
  },
} as const
