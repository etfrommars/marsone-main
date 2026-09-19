import { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair } from 'lucide-react';
import { DecodedIRResult } from '../../types';

interface IrWaveformCanvasProps {
  pulses: number[];
  decodedResult: DecodedIRResult;
}

export default function IrWaveformCanvas({ pulses, decodedResult }: IrWaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [hoveredPulse, setHoveredPulse] = useState<{
    index: number;
    type: 'mark' | 'space';
    duration: number;
    startTime: number;
    endTime: number;
    role: string;
    bit?: string;
  } | null>(null);

  // Determine role of each pulse according to protocol
  const getPulseMeta = (idx: number, isMark: boolean, duration: number) => {
    const proto = decodedResult.protocol;

    if (idx === 0) return { role: '前导脉冲 (Leader Mark)', color: '#ffb703' };
    if (idx === 1) {
      if (duration < 3000) return { role: '重复帧间隔 (Repeat Space)', color: '#f43f5e' };
      return { role: '前导间隔 (Leader Space)', color: '#ffb703' };
    }

    if (proto === 'NEC' || proto === 'NEC_EXT') {
      // Bits start at idx 2
      const bitIndex = Math.floor((idx - 2) / 2);
      const isSpace = !isMark;
      let bitVal = '';
      if (isSpace) {
        bitVal = duration > 1100 ? 'Bit 1 (长间隔 1.69ms)' : 'Bit 0 (短间隔 0.56ms)';
      }

      if (bitIndex < 8) {
        return { role: `地址位 [A${bitIndex}]`, color: '#00f0ff', bit: bitVal };
      } else if (bitIndex < 16) {
        return { role: proto === 'NEC' ? `地址反码 [~A${bitIndex - 8}]` : `地址高位 [A${bitIndex}]`, color: '#38bdf8', bit: bitVal };
      } else if (bitIndex < 24) {
        return { role: `操作指令 [C${bitIndex - 16}]`, color: '#0df2c9', bit: bitVal };
      } else if (bitIndex < 32) {
        return { role: `指令反码 [~C${bitIndex - 24}]`, color: '#c084fc', bit: bitVal };
      } else {
        return { role: '停止位 / 尾脉冲', color: '#94a3b8' };
      }
    }

    if (proto === 'SONY_SIRC') {
      const bitIndex = Math.floor((idx - 2) / 2);
      if (bitIndex < 7) {
        return { role: `指令位 [C${bitIndex}]`, color: '#0df2c9' };
      } else {
        return { role: `设备地址位 [A${bitIndex - 7}]`, color: '#00f0ff' };
      }
    }

    if (proto === 'XENO_PULSE') {
      return { role: `异星量子脉冲 [P${idx}]`, color: '#0df2c9' };
    }

    return { role: isMark ? `RAW 载波脉冲 #${idx}` : `RAW 间隔拍 #${idx}`, color: isMark ? '#0df2c9' : '#64748b' };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || pulses.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive canvas width
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = 240 * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = 240;

    // Total duration in µs
    const totalDuration = pulses.reduce((a, b) => a + Math.abs(b), 0) || 1;

    // Clear background
    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, width, height);

    // Draw tech background grid
    ctx.strokeStyle = 'rgba(13, 242, 201, 0.06)';
    ctx.lineWidth = 1;
    const gridStep = 40;
    for (let x = 0; x < width; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // High / Low Levels
    const highY = 65;
    const lowY = 175;
    const rulerY = 32;

    // Time to X conversion
    // Natural full fit scale: width / totalDuration
    const baseScale = (width - 40) / totalDuration;
    const scale = baseScale * zoom;
    const offsetX = 20 + panX;

    // Draw Time Ruler
    ctx.fillStyle = '#475569';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';

    const timeStepUs = totalDuration > 40000 ? 10000 : totalDuration > 15000 ? 5000 : 1000;
    for (let t = 0; t <= totalDuration; t += timeStepUs) {
      const tx = offsetX + t * scale;
      if (tx >= 0 && tx <= width) {
        ctx.beginPath();
        ctx.moveTo(tx, rulerY - 6);
        ctx.lineTo(tx, rulerY + 4);
        ctx.stroke();

        ctx.fillText(t >= 1000 ? `${(t / 1000).toFixed(1)}ms` : `${t}µs`, tx - 12, rulerY - 10);
      }
    }

    // Draw Voltage Level Guides (High / Low)
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(13, 242, 201, 0.15)';
    ctx.beginPath();
    ctx.moveTo(0, highY);
    ctx.lineTo(width, highY);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(100, 116, 139, 0.15)';
    ctx.beginPath();
    ctx.moveTo(0, lowY);
    ctx.lineTo(width, lowY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Level Labels
    ctx.fillStyle = '#0df2c9';
    ctx.fillText('MARK (HIGH / 38kHz)', 6, highY - 8);
    ctx.fillStyle = '#64748b';
    ctx.fillText('SPACE (LOW / IDLE)', 6, lowY + 16);

    // Draw Pulses
    let currentUs = 0;
    ctx.lineWidth = 2.5;

    pulses.forEach((duration, idx) => {
      const isMark = idx % 2 === 0;
      const startX = offsetX + currentUs * scale;
      const endX = offsetX + (currentUs + duration) * scale;
      const meta = getPulseMeta(idx, isMark, duration);

      const y = isMark ? highY : lowY;

      // Pulse fill area for glow
      if (isMark) {
        ctx.fillStyle = 'rgba(13, 242, 201, 0.08)';
        ctx.fillRect(startX, highY, endX - startX, lowY - highY);
      }

      // Pulse horizontal stroke
      ctx.strokeStyle = meta.color;
      ctx.shadowColor = meta.color;
      ctx.shadowBlur = isMark ? 6 : 0;

      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();

      // Vertical transition line to next level
      if (idx < pulses.length - 1) {
        const nextY = isMark ? lowY : highY;
        ctx.beginPath();
        ctx.moveTo(endX, y);
        ctx.lineTo(endX, nextY);
        ctx.stroke();
      }

      ctx.shadowBlur = 0;

      // Draw bit or role marker if enough width
      const pulseWidth = endX - startX;
      if (pulseWidth > 14) {
        ctx.fillStyle = meta.color;
        ctx.font = '9px "JetBrains Mono", monospace';
        if (meta.bit && !isMark) {
          ctx.fillText(duration > 1100 ? '1' : '0', startX + pulseWidth / 2 - 3, y - 6);
        } else if (idx === 0) {
          ctx.fillText('LEAD', startX + 4, y - 6);
        }
      }

      currentUs += duration;
    });

    // Hover indicator cursor
    if (hoveredPulse) {
      const hStart = offsetX + hoveredPulse.startTime * scale;
      const hEnd = offsetX + hoveredPulse.endTime * scale;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fillRect(hStart, 20, Math.max(hEnd - hStart, 2), height - 40);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hStart, 20);
      ctx.lineTo(hStart, height - 20);
      ctx.stroke();
    }
  }, [pulses, decodedResult, zoom, panX, hoveredPulse]);

  // Handle Canvas mouse move for hover detection
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || pulses.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    const width = rect.width;
    const totalDuration = pulses.reduce((a, b) => a + Math.abs(b), 0) || 1;
    const baseScale = (width - 40) / totalDuration;
    const scale = baseScale * zoom;
    const offsetX = 20 + panX;

    let currentUs = 0;
    for (let i = 0; i < pulses.length; i++) {
      const dur = pulses[i];
      const startX = offsetX + currentUs * scale;
      const endX = offsetX + (currentUs + dur) * scale;

      if (mouseX >= startX && mouseX <= endX) {
        const isMark = i % 2 === 0;
        const meta = getPulseMeta(i, isMark, dur);
        setHoveredPulse({
          index: i,
          type: isMark ? 'mark' : 'space',
          duration: dur,
          startTime: currentUs,
          endTime: currentUs + dur,
          role: meta.role,
          bit: meta.bit,
        });
        return;
      }
      currentUs += dur;
    }
    setHoveredPulse(null);
  };

  const handleMouseLeave = () => {
    setHoveredPulse(null);
  };

  return (
    <div ref={containerRef} className="relative w-full rounded-xl bg-[#060a12] border border-emerald-500/30 overflow-hidden corner-bracket">
      {/* Oscilloscope Header Controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0a101d] border-b border-emerald-500/20 text-xs">
        <div className="flex items-center gap-2 font-mono-code">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#0df2c9]" />
          <span className="text-emerald-300 font-bold">OSCILLOSCOPE // 脉冲时序示波器</span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">总脉冲: {pulses.length} 拍</span>
          <span className="text-slate-500 hidden md:inline">|</span>
          <span className="text-cyan-300 hidden md:inline">
            帧时长: {((pulses.reduce((a, b) => a + b, 0) || 0) / 1000).toFixed(2)} ms
          </span>
        </div>

        {/* Zoom & Reset Toolbar */}
        <div className="flex items-center gap-1.5">
          <button
            id="oscilloscope-zoom-in"
            onClick={() => setZoom((z) => Math.min(z * 1.35, 12))}
            title="放大波形"
            className="p-1.5 rounded bg-slate-900 border border-slate-700/60 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            id="oscilloscope-zoom-out"
            onClick={() => setZoom((z) => Math.max(z / 1.35, 0.8))}
            title="缩小波形"
            className="p-1.5 rounded bg-slate-900 border border-slate-700/60 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            id="oscilloscope-reset"
            onClick={() => {
              setZoom(1);
              setPanX(0);
            }}
            title="重置缩放"
            className="p-1.5 rounded bg-slate-900 border border-slate-700/60 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative w-full h-[240px]">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full cursor-crosshair block"
        />

        {/* Hover Tooltip Overlay */}
        {hoveredPulse && (
          <div className="absolute top-3 right-3 bg-[#0d1626]/95 border border-emerald-500/40 rounded-lg p-2.5 shadow-xl text-xs font-mono-code text-slate-200 pointer-events-none backdrop-blur-md alien-glow-sm max-w-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
              <Crosshair className="w-3.5 h-3.5" />
              <span>脉冲 #{hoveredPulse.index}</span>
              <span className="text-[10px] px-1 rounded bg-slate-800 text-slate-300">
                {hoveredPulse.type === 'mark' ? 'MARK (载波高电平)' : 'SPACE (低电平间隔)'}
              </span>
            </div>
            <div className="space-y-0.5 text-[11px]">
              <div>持续时间: <span className="text-cyan-300 font-bold">{hoveredPulse.duration} µs</span> ({(hoveredPulse.duration / 1000).toFixed(3)} ms)</div>
              <div>时序区间: {hoveredPulse.startTime} µs ~ {hoveredPulse.endTime} µs</div>
              <div>协议角色: <span className="text-emerald-300">{hoveredPulse.role}</span></div>
              {hoveredPulse.bit && <div className="text-purple-300 font-semibold">{hoveredPulse.bit}</div>}
            </div>
          </div>
        )}
      </div>

      {/* Color Legend Footer */}
      <div className="px-4 py-2 bg-[#080d18] border-t border-emerald-500/10 flex items-center justify-between text-[11px] font-mono-code text-slate-400 overflow-x-auto gap-3">
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#ffb703]" />
            <span>前导 Leader</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#00f0ff]" />
            <span>地址码 Addr</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#38bdf8]" />
            <span>地址反码 ~Addr</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#0df2c9]" />
            <span>指令码 Cmd</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#c084fc]" />
            <span>指令反码 ~Cmd</span>
          </span>
        </div>
        <div className="text-slate-500 shrink-0 text-[10px]">
          [鼠标滑过波形查看微秒测量与位定义]
        </div>
      </div>
    </div>
  );
}
