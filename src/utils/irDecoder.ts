import { DecodedIRResult, IRPreset, Pulse } from '../types';

// Converts raw microsecond array [mark, space, mark, space...] into structured Pulse objects
export function rawPulsesToPulseObjects(raw: number[]): Pulse[] {
  return raw.map((val, idx) => ({
    type: idx % 2 === 0 ? 'mark' : 'space',
    duration: Math.abs(val),
  }));
}

// Tolerance checker with percentage leeway
function isWithinTolerance(val: number, target: number, tolerancePct = 0.35): boolean {
  const delta = target * tolerancePct;
  return Math.abs(val - target) <= delta;
}

// NEC Protocol Decoder
export function decodeNEC(raw: number[]): DecodedIRResult | null {
  if (raw.length < 4) return null;

  const markLeader = raw[0];
  const spaceLeader = raw[1];

  // Leader test: ~9000µs mark
  if (!isWithinTolerance(markLeader, 9000, 0.3)) return null;

  // Check Repeat frame: ~9000µs mark + ~2250µs space + ~560µs mark
  if (isWithinTolerance(spaceLeader, 2250, 0.35)) {
    return {
      protocol: 'NEC',
      protocolName: 'NEC (Repeat Code / 重复脉冲)',
      frequencyKhz: 38,
      integrityValid: true,
      repeat: true,
      totalPulses: raw.length,
      totalDurationMs: Math.round(raw.reduce((a, b) => a + b, 0) / 1000),
      details: '检测到 NEC 连续按键保持/重复脉冲信标 (9.0ms Header + 2.25ms Space)。',
    };
  }

  // Normal NEC leader space: ~4500µs
  if (!isWithinTolerance(spaceLeader, 4500, 0.3)) return null;

  // Each bit is 1 mark (~560µs) followed by 1 space (0: ~560µs, 1: ~1690µs)
  const bits: number[] = [];
  let currentIndex = 2;

  while (currentIndex + 1 < raw.length && bits.length < 32) {
    const bitMark = raw[currentIndex];
    const bitSpace = raw[currentIndex + 1];

    if (!isWithinTolerance(bitMark, 560, 0.45)) break;

    if (isWithinTolerance(bitSpace, 560, 0.45)) {
      bits.push(0);
    } else if (isWithinTolerance(bitSpace, 1690, 0.45)) {
      bits.push(1);
    } else {
      break;
    }
    currentIndex += 2;
  }

  if (bits.length < 16) return null;

  // Parse bytes LSB first (NEC standard transmission)
  const bytes: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    const byteBits = bits.slice(i, i + 8);
    let byteVal = 0;
    for (let b = 0; b < byteBits.length; b++) {
      if (byteBits[b] === 1) {
        byteVal |= 1 << b;
      }
    }
    bytes.push(byteVal);
  }

  const rawBitsStr = bits.join('');
  const addr = bytes[0] ?? 0;
  const addrInv = bytes[1] ?? 0;
  const cmd = bytes[2] ?? 0;
  const cmdInv = bytes[3] ?? 0;

  const isStandardNEC = bytes.length >= 4 && (addr ^ addrInv) === 0xff && (cmd ^ cmdInv) === 0xff;
  const isExtendedNEC = bytes.length >= 4 && (cmd ^ cmdInv) === 0xff && (addr ^ addrInv) !== 0xff;

  const fullAddr = isExtendedNEC ? addr | (addrInv << 8) : addr;
  const hexCode = `0x${((fullAddr << 16) | (cmd << 8) | (cmdInv & 0xff)).toString(16).toUpperCase().padStart(8, '0')}`;

  return {
    protocol: isExtendedNEC ? 'NEC_EXT' : 'NEC',
    protocolName: isExtendedNEC ? 'NEC Extended (扩展型 16位地址)' : 'NEC 32-bit (标准消费电子协议)',
    address: fullAddr,
    command: cmd,
    rawBits: rawBitsStr,
    hex: hexCode,
    frequencyKhz: 38,
    integrityValid: isStandardNEC || isExtendedNEC,
    repeat: false,
    totalPulses: raw.length,
    totalDurationMs: Math.round(raw.reduce((a, b) => a + b, 0) / 1000),
    details: isStandardNEC
      ? `校验通过：地址码 0x${addr.toString(16).padStart(2, '0').toUpperCase()} 与反码互补；操作码 0x${cmd.toString(16).padStart(2, '0').toUpperCase()} 与反码互补。`
      : isExtendedNEC
      ? `扩展地址模式：16位地址 0x${fullAddr.toString(16).padStart(4, '0').toUpperCase()}，操作码 0x${cmd.toString(16).padStart(2, '0').toUpperCase()} 反码校验有效。`
      : `解码完成：检测到 ${bits.length} 位数据。`,
  };
}

// Sony SIRC Decoder
export function decodeSony(raw: number[]): DecodedIRResult | null {
  if (raw.length < 14) return null;

  const markLeader = raw[0];
  const spaceLeader = raw[1];

  // Leader test: ~2400µs mark + ~600µs space
  if (!isWithinTolerance(markLeader, 2400, 0.35) || !isWithinTolerance(spaceLeader, 600, 0.45)) {
    return null;
  }

  // Sony uses pulse length modulation:
  // Bit 0: 600µs mark + 600µs space
  // Bit 1: 1200µs mark + 600µs space
  const bits: number[] = [];
  let currentIndex = 2;

  while (currentIndex < raw.length && bits.length < 20) {
    const mark = raw[currentIndex];
    if (isWithinTolerance(mark, 1200, 0.4)) {
      bits.push(1);
    } else if (isWithinTolerance(mark, 600, 0.4)) {
      bits.push(0);
    } else {
      break;
    }
    currentIndex += 2;
  }

  if (bits.length < 12) return null;

  // In Sony SIRC: 7 bits Command (LSB first), remaining 5/8/13 bits Address (LSB first)
  let cmd = 0;
  for (let i = 0; i < 7; i++) {
    if (bits[i] === 1) cmd |= 1 << i;
  }

  let addr = 0;
  for (let i = 7; i < bits.length; i++) {
    if (bits[i] === 1) addr |= 1 << (i - 7);
  }

  return {
    protocol: 'SONY_SIRC',
    protocolName: `Sony SIRC (${bits.length}-bit Pulse Width)`,
    address: addr,
    command: cmd,
    rawBits: bits.join(''),
    hex: `0x${((addr << 7) | cmd).toString(16).toUpperCase()}`,
    frequencyKhz: 40,
    integrityValid: true,
    repeat: false,
    totalPulses: raw.length,
    totalDurationMs: Math.round(raw.reduce((a, b) => a + b, 0) / 1000),
    details: `索尼 SIRC 解码成功：7位指令码 0x${cmd.toString(16).padStart(2, '0').toUpperCase()} (${cmd})，${bits.length - 7}位地址设备码 0x${addr.toString(16).padStart(2, '0').toUpperCase()} (${addr})。`,
  };
}

// Alien Xeno-Pulse Protocol Decoder (Mars-One civilization quantum optical burst)
export function decodeXenoPulse(raw: number[]): DecodedIRResult | null {
  if (raw.length < 10) return null;

  // Look for signature Alien leader: ~6800µs mark + ~3400µs space
  const markLeader = raw[0];
  const spaceLeader = raw[1];

  if (!isWithinTolerance(markLeader, 6800, 0.35) || !isWithinTolerance(spaceLeader, 3400, 0.35)) {
    return null;
  }

  // Parse 24 alien quaternary / binary pulses
  const bits: number[] = [];
  for (let i = 2; i + 1 < raw.length && bits.length < 32; i += 2) {
    const space = raw[i + 1];
    if (space > 1200) {
      bits.push(1);
    } else {
      bits.push(0);
    }
  }

  let numericVal = 0;
  bits.forEach((b, idx) => {
    if (b) numericVal += Math.pow(2, idx % 16);
  });

  const glyphList = ['◈', '⎈', '⏣', '☍', '⚶', '⨀', '⟁', '⌬', '⍟', '⎇'];
  const alienGlyphs = bits.slice(0, 10).map((b, i) => glyphList[(b * 3 + i * 2) % glyphList.length]).join(' ');

  return {
    protocol: 'XENO_PULSE',
    protocolName: 'Xeno-Optical (Mars-One 异星子空间调制脉冲)',
    address: 0x7D,
    command: 0x5F,
    rawBits: bits.join(''),
    hex: '0x7D5F_MARS_ONE',
    frequencyKhz: 42.5,
    integrityValid: true,
    repeat: false,
    totalPulses: raw.length,
    totalDurationMs: Math.round(raw.reduce((a, b) => a + b, 0) / 1000),
    details: '异星量子光脉冲帧同步锁定，已解析轨道探测信标遥测流。',
    alienTelemetry: {
      origin: 'Mars-One // Elysium Planitia Relay [38.2°N, 142.5°E]',
      coordinates: 'Sector Zeta-09-Ω // Subspace Channel 42.5kHz',
      energyLevel: '89.4% Tachyon Flux Stability',
      quantumChecksum: 'OK (Hash: 0x9AF8-AE)',
      alienGlyphs,
      decodedMessage: 'BEACON ACTIVE: TELEMETRY STREAM NORMAL. ORBITAL SENSORS SYNCHRONIZED.',
    },
  };
}

// Master Decoder: Auto-detects protocol
export function decodeIR(rawPulses: number[]): DecodedIRResult {
  if (!rawPulses || rawPulses.length < 2) {
    return {
      protocol: 'RAW',
      protocolName: 'RAW (未检测到有效信号)',
      frequencyKhz: 38,
      integrityValid: false,
      repeat: false,
      totalPulses: 0,
      totalDurationMs: 0,
      details: '信号过短或为空，请输入红外脉冲时序数据。',
    };
  }

  // 1. Try Alien Xeno Pulse
  const xeno = decodeXenoPulse(rawPulses);
  if (xeno) return xeno;

  // 2. Try NEC
  const nec = decodeNEC(rawPulses);
  if (nec) return nec;

  // 3. Try Sony SIRC
  const sony = decodeSony(rawPulses);
  if (sony) return sony;

  // 4. Fallback to RAW
  const totalDurationMs = Math.round(rawPulses.reduce((acc, curr) => acc + Math.abs(curr), 0) / 1000);
  return {
    protocol: 'RAW',
    protocolName: `RAW Pulse Train (自定义脉冲 ${rawPulses.length} 拍)`,
    frequencyKhz: 38,
    integrityValid: true,
    repeat: false,
    totalPulses: rawPulses.length,
    totalDurationMs,
    details: `未匹配到已知标准协议前导码，以 RAW 脉冲宽度时序模式解析 (${rawPulses.length} 个高/低电平脉冲)。`,
  };
}

// Parse string inputs into raw number[]:
// Supports:
// 1. Array format: "[9000, 4500, 560, 560, ...]"
// 2. CSV / space separated: "9000 4500 560 560" or "+9000, -4500..."
// 3. Pronto Hex: "0000 006D 0022 0002 0157 00AC ..."
export function parseInputToPulses(text: string): { pulses: number[]; format: 'raw' | 'pronto' | 'invalid'; error?: string } {
  const clean = text.trim();
  if (!clean) return { pulses: [], format: 'invalid', error: '输入内容为空' };

  // Check Pronto Hex format: starts with 0000 or contains all 4-digit hex words
  const hexWords = clean.split(/\s+/).filter(w => /^[0-9a-fA-F]{4}$/.test(w));
  if (hexWords.length >= 6 && hexWords[0] === '0000') {
    try {
      // Pronto format:
      // Word 0: 0000 (Learned code)
      // Word 1: Frequency code. Freq = 1000000 / (N * 0.241246)
      // Word 2: Once sequence pair count
      // Word 3: Repeat sequence pair count
      // Remaining: pairs of burst duration in carrier cycles
      const freqCode = parseInt(hexWords[1], 16);
      const carrierPeriodUs = (freqCode * 0.241246);
      const oncePairs = parseInt(hexWords[2], 16);
      const repeatPairs = parseInt(hexWords[3], 16);
      const totalPairs = oncePairs + repeatPairs;

      const pulses: number[] = [];
      const pairTokens = hexWords.slice(4);

      for (let i = 0; i < pairTokens.length && i < totalPairs * 2; i += 2) {
        const markCycles = parseInt(pairTokens[i], 16);
        const spaceCycles = parseInt(pairTokens[i + 1] || '0', 16);
        pulses.push(Math.round(markCycles * carrierPeriodUs));
        pulses.push(Math.round(spaceCycles * carrierPeriodUs));
      }

      if (pulses.length > 0) {
        return { pulses, format: 'pronto' };
      }
    } catch {
      // fallback to number parser
    }
  }

  // Parse as regular numbers
  // Remove brackets and split by comma, space, newline
  const numberTokens = clean
    .replace(/[\[\]]/g, '')
    .split(/[\s,;]+/)
    .filter(t => t.length > 0 && /^[+-]?\d+$/.test(t));

  if (numberTokens.length === 0) {
    return { pulses: [], format: 'invalid', error: '无法解析数字脉冲或 Pronto Hex 编码' };
  }

  const pulses = numberTokens.map(t => Math.abs(parseInt(t, 10))).filter(n => n > 0 && !isNaN(n));
  return { pulses, format: 'raw' };
}

// Convert pulses to Pronto Hex string
export function pulsesToProntoHex(pulses: number[], frequencyKhz = 38): string {
  // Carrier code: N = 1000000 / (freq * 0.241246)
  const freqFactor = Math.round(1000000 / (frequencyKhz * 1000 * 0.241246)) || 109; // 0x006D for 38kHz
  const pairsCount = Math.floor(pulses.length / 2);
  const words: string[] = ['0000', freqFactor.toString(16).padStart(4, '0'), pairsCount.toString(16).padStart(4, '0'), '0000'];

  for (let i = 0; i < pairsCount * 2; i += 2) {
    const markCycles = Math.round(pulses[i] / (freqFactor * 0.241246));
    const spaceCycles = Math.round(pulses[i + 1] / (freqFactor * 0.241246));
    words.push(markCycles.toString(16).padStart(4, '0'));
    words.push(spaceCycles.toString(16).padStart(4, '0'));
  }

  return words.join(' ').toUpperCase();
}

// Generate code snippets for engineers / embedded hackers
export function generateExportCode(result: DecodedIRResult, pulses: number[]) {
  const arduinoCpp = `// ===============================================
// XenoWeb Tools - 异星红外数据解码导出
// 协议: ${result.protocolName}
// 载波频率: ${result.frequencyKhz} kHz
// ===============================================
#include <Arduino.h>
#include <IRremote.hpp>

const uint16_t rawData[${pulses.length}] = {
  ${pulses.slice(0, 32).join(', ')}${pulses.length > 32 ? ',\n  // ... 省略后续脉冲' : ''}
};

void setup() {
  Serial.begin(115200);
  IrSender.begin(3); // 发射引脚 D3
}

void loop() {
${result.protocol === 'NEC' || result.protocol === 'NEC_EXT'
  ? `  // 发送标准 NEC 指令 (Address: 0x${(result.address || 0).toString(16).toUpperCase()}, Command: 0x${(result.command || 0).toString(16).toUpperCase()})
  IrSender.sendNEC(0x${(result.address || 0).toString(16)}, 0x${(result.command || 0).toString(16)}, 1);`
  : `  // 发送 RAW 脉冲序列
  IrSender.sendRaw(rawData, ${pulses.length}, ${result.frequencyKhz});`}
  delay(5000);
}`;

  const flipperZero = `Filetype: Flipper IR signals file
Version: 1
# Created by XenoWeb Alien IR Decryptor
name: ${result.protocolName.replace(/[^a-zA-Z0-9_]/g, '_')}
type: raw
frequency: ${result.frequencyKhz * 1000}
duty_cycle: 0.33
data: ${pulses.join(' ')}`;

  const jsonDump = JSON.stringify(
    {
      protocol: result.protocol,
      protocolName: result.protocolName,
      address: result.address !== undefined ? `0x${result.address.toString(16).toUpperCase()}` : null,
      command: result.command !== undefined ? `0x${result.command.toString(16).toUpperCase()}` : null,
      hex: result.hex,
      frequencyKhz: result.frequencyKhz,
      totalPulses: pulses.length,
      rawPulses: pulses,
      alienTelemetry: result.alienTelemetry || null,
    },
    null,
    2
  );

  return { arduinoCpp, flipperZero, jsonDump };
}

// Default Presets
export const IR_PRESETS: IRPreset[] = [
  {
    id: 'xeno-beacon',
    name: 'Mars-One 异星轨道探测器遥测脉冲',
    nameEn: 'Mars-One Orbital Quantum Telemetry',
    category: 'alien',
    description: '火星第一殖民基地轨道中继站下行脉冲，内嵌天体坐标与子空间校验码。',
    protocol: 'XENO_PULSE',
    frequencyKhz: 42.5,
    rawPulses: [
      6800, 3400, 560, 1690, 560, 560, 560, 1690, 560, 1690,
      560, 560, 560, 1690, 560, 1690, 560, 560, 560, 1690,
      560, 560, 560, 1690, 560, 560, 560, 1690, 560, 1690,
      560, 560, 560, 1690, 560, 560, 560, 1690, 560, 1690,
      560, 560, 560, 1690, 560, 560, 560, 1690, 560, 560, 560
    ],
  },
  {
    id: 'earth-tv-power',
    name: '地球消费级 TV 电源键 (NEC 32-bit)',
    nameEn: 'Earth TV Remote Power Key',
    category: 'earth',
    description: '标准消费电子 NEC 协议：9ms Leader，地址 0x00，按键指令 0x12 (Power 开关)。',
    protocol: 'NEC',
    frequencyKhz: 38,
    // NEC Addr: 0x00 (00000000), ~Addr: 0xFF (11111111), Cmd: 0x12 (01001000 lsb: 0,1,0,0,1,0,0,0), ~Cmd: 0xED
    rawPulses: [
      9000, 4500,
      // Addr 0x00 (all 0s)
      560, 560, 560, 560, 560, 560, 560, 560, 560, 560, 560, 560, 560, 560, 560, 560,
      // ~Addr 0xFF (all 1s)
      560, 1690, 560, 1690, 560, 1690, 560, 1690, 560, 1690, 560, 1690, 560, 1690, 560, 1690,
      // Cmd 0x12 -> bit0=0, bit1=1, bit2=0, bit3=0, bit4=1, bit5=0, bit6=0, bit7=0
      560, 560, 560, 1690, 560, 560, 560, 560, 560, 1690, 560, 560, 560, 560, 560, 560,
      // ~Cmd 0xED -> 1,0,1,1,0,1,1,1
      560, 1690, 560, 560, 560, 1690, 560, 1690, 560, 560, 560, 1690, 560, 1690, 560, 1690,
      560 // Stop bit
    ],
  },
  {
    id: 'earth-ac-temp',
    name: '智能空调制冷控制 (NEC Extended 16-bit Addr)',
    nameEn: 'Smart AC Cool Mode',
    category: 'earth',
    description: 'NEC 扩展协议：地址 0x207F，操作码 0xA5 (制冷 24℃ 自动风速)。',
    protocol: 'NEC_EXT',
    frequencyKhz: 38,
    rawPulses: [
      9000, 4500,
      // Addr byte 0: 0x7F (11111110 lsb: 1,1,1,1,1,1,1,0)
      560, 1690, 560, 1690, 560, 1690, 560, 1690, 560, 1690, 560, 1690, 560, 1690, 560, 560,
      // Addr byte 1: 0x20 (00000100 lsb: 0,0,0,0,0,1,0,0)
      560, 560, 560, 560, 560, 560, 560, 560, 560, 560, 560, 1690, 560, 560, 560, 560,
      // Cmd 0xA5 (1,0,1,0,0,1,0,1)
      560, 1690, 560, 560, 560, 1690, 560, 560, 560, 560, 560, 1690, 560, 560, 560, 1690,
      // ~Cmd 0x5A (0,1,0,1,1,0,1,0)
      560, 560, 560, 1690, 560, 560, 560, 1690, 560, 1690, 560, 560, 560, 1690, 560, 560,
      560
    ],
  },
  {
    id: 'sony-volume-up',
    name: '索尼视讯终端音量增加 (Sony SIRC 12-bit)',
    nameEn: 'Sony SIRC TV Volume Up',
    category: 'earth',
    description: '索尼 SIRC 脉冲宽度调制协议：前导脉冲 2.4ms，音量加按键。',
    protocol: 'SONY_SIRC',
    frequencyKhz: 40,
    rawPulses: [
      2400, 600,
      // 7 bits cmd 0x12 (0100100 -> 0,1,0,0,1,0,0)
      600, 600, 1200, 600, 600, 600, 600, 600, 1200, 600, 600, 600, 600, 600,
      // 5 bits addr 0x01 (1,0,0,0,0)
      1200, 600, 600, 600, 600, 600, 600, 600, 600, 600
    ],
  },
  {
    id: 'nec-repeat',
    name: '连续按键保持/重复脉冲 (NEC Repeat Frame)',
    nameEn: 'NEC Long Press Repeat Burst',
    category: 'earth',
    description: '当红外遥控器按键保持按住不放时，每 110ms 发送一次的极简重复帧。',
    protocol: 'NEC',
    frequencyKhz: 38,
    rawPulses: [9000, 2250, 560],
  },
  {
    id: 'pronto-demo',
    name: '工业级 Pronto Hex 光学指令编码',
    nameEn: 'Pronto Hex Industrial Optical Command',
    category: 'industrial',
    description: '工业控制系统通用的 Pronto 16进制编码解析示例。',
    protocol: 'RAW',
    frequencyKhz: 38,
    rawPulses: [
      8980, 4480, 560, 560, 560, 1680, 560, 560, 560, 1680,
      560, 560, 560, 1680, 560, 560, 560, 1680, 560, 560, 560
    ],
  },
];
