export type ProtocolType = 'NEC' | 'NEC_EXT' | 'SONY_SIRC' | 'RC5' | 'RAW' | 'XENO_PULSE';

export interface Pulse {
  type: 'mark' | 'space';
  duration: number; // in microseconds (µs)
  bit?: 0 | 1 | 'leader' | 'repeat' | 'stop' | 'unknown';
  label?: string;
}

export interface DecodedIRResult {
  protocol: ProtocolType;
  protocolName: string;
  address?: number;
  command?: number;
  rawBits?: string;
  hex?: string;
  prontoHex?: string;
  frequencyKhz: number;
  integrityValid: boolean;
  repeat: boolean;
  totalPulses: number;
  totalDurationMs: number;
  details: string;
  alienTelemetry?: {
    origin: string;
    coordinates: string;
    energyLevel: string;
    quantumChecksum: string;
    alienGlyphs: string;
    decodedMessage: string;
  };
}

export interface IRPreset {
  id: string;
  name: string;
  nameEn: string;
  category: 'alien' | 'earth' | 'industrial';
  description: string;
  protocol: ProtocolType;
  rawPulses: number[];
  frequencyKhz: number;
}

export interface ToolItem {
  id: string;
  name: string;
  nameEn: string;
  subtitle: string;
  url: string;
  isExternal: boolean;
  icon: string;
  badge: string;
  description: string;
  techStack: string[];
  protocol: string;
  alienCodename: string;
  status: 'ONLINE' | 'STANDBY' | 'READY';
  features: string[];
}
