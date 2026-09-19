import { Usb, Cable, ExternalLink, Play, Layers, ShieldCheck, Sparkles } from 'lucide-react';
import { ToolItem } from '../types';
import { TOOLS_LIST } from '../data/toolsData';
import { playAlienBeep } from '../utils/audioSynthesizer';

interface ToolsGridProps {
  onOpenTool: (tool: ToolItem) => void;
  alienMode: boolean;
}

export default function ToolsGrid({ onOpenTool, alienMode }: ToolsGridProps) {
  const getToolIcon = (icon: string) => {
    switch (icon) {
      case 'Usb':
        return <Usb className="w-6 h-6 text-emerald-300" />;
      case 'Cable':
        return <Cable className="w-6 h-6 text-cyan-300" />;
      default:
        return <Layers className="w-6 h-6 text-emerald-300" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h2 className="font-alien-display font-bold text-lg sm:text-xl text-slate-100 tracking-wide">
              {alienMode ? '◈ 异星殖民地 WEB 硬件与通讯控制矩阵' : '外星人 WEB 小工具集合'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono-code">
            基于现代浏览器原生 Web 标准 API 构建的极客硬件通讯与数据包控制台。
          </p>
        </div>

        <div className="text-xs font-mono-code text-slate-400 flex items-center gap-2">
          <span>总节点:</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
            2 ACTIVE NODES
          </span>
        </div>
      </div>

      {/* Grid of Tools (2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TOOLS_LIST.map((tool) => {
          return (
            <div
              key={tool.id}
              className="relative rounded-2xl bg-[#080e18] border border-slate-800 hover:border-emerald-500/40 hover:bg-[#0a1220] transition-all duration-300 flex flex-col justify-between overflow-hidden group corner-bracket"
            >
              {/* Card Top Accent Light */}
              <div
                className={`h-1 w-full bg-gradient-to-r ${
                  tool.id === 'usbee'
                    ? 'from-emerald-500 via-teal-400 to-cyan-500'
                    : 'from-cyan-500 via-blue-500 to-emerald-400'
                }`}
              />

              <div className="p-6 space-y-5">
                {/* Header: Icon, Codename, Status */}
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#05080f] border border-emerald-500/30 flex items-center justify-center group-hover:border-emerald-400 transition-colors alien-glow-sm">
                    {getToolIcon(tool.icon)}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono-code bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>{tool.status}</span>
                    </span>
                    <span className="text-[9px] font-mono-code text-slate-500">
                      {tool.alienCodename}
                    </span>
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-alien-display font-bold text-xl text-slate-100 group-hover:text-emerald-300 transition-colors">
                      {tool.name}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono-code text-slate-300">
                      {tool.badge}
                    </span>
                  </div>
                  <div className="text-xs font-mono-code text-emerald-400/90 mt-1">
                    {tool.nameEn}
                  </div>
                  <p className="text-sm text-slate-300 mt-2.5 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                {/* Protocol Info */}
                <div className="p-3 rounded-lg bg-[#05080f] border border-slate-800/80 text-xs font-mono-code">
                  <div className="text-slate-500 text-[10px] uppercase tracking-wider">协议标准与总线 / Protocol Standard:</div>
                  <div className="text-emerald-300/90 font-medium truncate mt-1">{tool.protocol}</div>
                </div>

                {/* Feature Bullet List */}
                <div className="space-y-2 pt-1">
                  {tool.features.map((feat, fidx) => (
                    <div key={fidx} className="flex items-center gap-2 text-xs text-slate-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-6 pt-2 flex items-center gap-3">
                <a
                  id={`direct-link-${tool.id}`}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playAlienBeep(700, 'sine', 0.04)}
                  className="flex-1 py-3 rounded-xl font-semibold text-xs bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 hover:border-emerald-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(13,242,201,0.15)]"
                >
                  <span>直达独立站</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  id={`preview-modal-${tool.id}`}
                  onClick={() => {
                    onOpenTool(tool);
                    playAlienBeep(800, 'sine', 0.05);
                  }}
                  className="py-3 px-5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 active:scale-[0.98] transition-all flex items-center gap-2"
                  title="在站内弹窗预览该工具"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>站内预览</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cyber Hardware Spec Info Banner */}
      <div className="p-4 rounded-xl bg-[#060a14] border border-emerald-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs font-mono-code text-slate-400">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            外星科技 Web 硬件互联矩阵已全面打通 WebUSB 与 Web Serial 双模物理通讯。无需安装外置应用或专用驱动，纯浏览器端即刻探测与调试。
          </span>
        </div>
        <div className="text-emerald-400/80 shrink-0">
          NODE STATUS: ALL RELAYS OPERATIONAL
        </div>
      </div>
    </div>
  );
}
