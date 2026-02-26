// Mock data for HydroVision dashboard

export interface Condominium {
  id: string;
  name: string;
  address: string;
  towers: number;
  reservoirs: number;
  status: 'ok' | 'warning' | 'critical' | 'offline';
}

export interface Reservoir {
  id: string;
  name: string;
  condominiumId: string;
  towerId: string;
  towerName: string;
  capacityLiters: number;
  currentLevelPercent: number;
  currentVolumeLiters: number;
  status: 'ok' | 'warning' | 'critical' | 'offline';
  pumpStatus: 'on' | 'off' | 'fault';
  lastReading: string;
  flowRate: number; // liters per hour
}

export interface Alert {
  id: string;
  type: 'low_level' | 'pump_fault' | 'no_response' | 'leak_suspected' | 'pump_overtime';
  severity: 'warning' | 'critical';
  message: string;
  reservoirName: string;
  condominiumName: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface Reading {
  timestamp: string;
  levelPercent: number;
  volumeLiters: number;
  pumpStatus: 'on' | 'off';
}

export interface KPI {
  label: string;
  value: string;
  change: number;
  unit: string;
}

export const condominiums: Condominium[] = [
  { id: '1', name: 'Residencial Águas Claras', address: 'Rua das Palmeiras, 200', towers: 10, reservoirs: 3, status: 'ok' },
  { id: '2', name: 'Condomínio Solar', address: 'Av. Brasil, 1500', towers: 6, reservoirs: 2, status: 'warning' },
  { id: '3', name: 'Edifício Horizonte', address: 'Rua Nova, 45', towers: 4, reservoirs: 2, status: 'ok' },
];

export const reservoirs: Reservoir[] = [
  { id: 'r1', name: 'Reservatório Principal', condominiumId: '1', towerId: 't1', towerName: 'Central', capacityLiters: 50000, currentLevelPercent: 78, currentVolumeLiters: 39000, status: 'ok', pumpStatus: 'off', lastReading: '2026-02-26T14:30:00', flowRate: 120 },
  { id: 'r2', name: 'Reservatório Torre A-E', condominiumId: '1', towerId: 't2', towerName: 'Torres A-E', capacityLiters: 30000, currentLevelPercent: 45, currentVolumeLiters: 13500, status: 'warning', pumpStatus: 'on', lastReading: '2026-02-26T14:30:00', flowRate: 200 },
  { id: 'r3', name: 'Reservatório Torre F-J', condominiumId: '1', towerId: 't3', towerName: 'Torres F-J', capacityLiters: 30000, currentLevelPercent: 82, currentVolumeLiters: 24600, status: 'ok', pumpStatus: 'off', lastReading: '2026-02-26T14:30:00', flowRate: 80 },
  { id: 'r4', name: 'Reservatório Norte', condominiumId: '2', towerId: 't4', towerName: 'Bloco Norte', capacityLiters: 25000, currentLevelPercent: 18, currentVolumeLiters: 4500, status: 'critical', pumpStatus: 'on', lastReading: '2026-02-26T14:29:00', flowRate: 350 },
  { id: 'r5', name: 'Reservatório Sul', condominiumId: '2', towerId: 't5', towerName: 'Bloco Sul', capacityLiters: 25000, currentLevelPercent: 65, currentVolumeLiters: 16250, status: 'ok', pumpStatus: 'off', lastReading: '2026-02-26T14:30:00', flowRate: 95 },
];

export const alerts: Alert[] = [
  { id: 'a1', type: 'low_level', severity: 'critical', message: 'Nível crítico: Reservatório Norte abaixo de 20%', reservoirName: 'Reservatório Norte', condominiumName: 'Condomínio Solar', timestamp: '2026-02-26T14:25:00', acknowledged: false },
  { id: 'a2', type: 'pump_overtime', severity: 'warning', message: 'Bomba ligada há mais de 3 horas sem aumento significativo de nível', reservoirName: 'Reservatório Torre A-E', condominiumName: 'Residencial Águas Claras', timestamp: '2026-02-26T13:50:00', acknowledged: false },
  { id: 'a3', type: 'leak_suspected', severity: 'warning', message: 'Queda abrupta de nível detectada — possível vazamento', reservoirName: 'Reservatório Norte', condominiumName: 'Condomínio Solar', timestamp: '2026-02-26T12:10:00', acknowledged: true },
  { id: 'a4', type: 'no_response', severity: 'warning', message: 'Sensor sem comunicação há 15 minutos', reservoirName: 'Reservatório Sul', condominiumName: 'Condomínio Solar', timestamp: '2026-02-26T10:05:00', acknowledged: true },
];

export const kpis: KPI[] = [
  { label: 'Consumo Médio Diário', value: '12.500', change: -3.2, unit: 'litros' },
  { label: 'Tempo Médio Bombeamento', value: '4,2', change: 8.1, unit: 'horas/dia' },
  { label: 'Taxa de Falhas', value: '2,1', change: -15, unit: '%' },
  { label: 'Previsão Esvaziamento', value: '18', change: 0, unit: 'horas' },
];

export const historicalReadings: Reading[] = Array.from({ length: 24 }, (_, i) => {
  const hour = 23 - i;
  const base = 60 + Math.sin(hour * 0.5) * 20 + (Math.random() - 0.5) * 10;
  return {
    timestamp: `${hour.toString().padStart(2, '0')}:00`,
    levelPercent: Math.round(Math.max(10, Math.min(95, base))),
    volumeLiters: Math.round(Math.max(10, Math.min(95, base)) * 500),
    pumpStatus: base < 40 ? 'on' as const : 'off' as const,
  };
});

export const weeklyConsumption = [
  { day: 'Seg', consumo: 11200 },
  { day: 'Ter', consumo: 13400 },
  { day: 'Qua', consumo: 12800 },
  { day: 'Qui', consumo: 14100 },
  { day: 'Sex', consumo: 15600 },
  { day: 'Sáb', consumo: 9800 },
  { day: 'Dom', consumo: 8200 },
];
