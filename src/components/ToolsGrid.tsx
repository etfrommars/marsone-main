import { Usb, Cable, Radio, ExternalLink, Play, Layers, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { ToolItem } from '../types';
import { TOOLS_LIST } from '../data/toolsData';
import { playAlienBeep } from '../utils/audioSynthesizer';

interface ToolsGridProps {
  onOpenTool: (tool: ToolItem) => void;
  onActivateDecoder: () => void;
  alienMode: boolean;
}

export default function ToolsGrid({ onOpenTool, onActivateDecoder, alienMode }: ToolsGridProps) {
  const getToolIcon = (icon: string) => {
    switch (icon) {
      case 'Usb':
        return <Usb className="w-6 h-6 text-emerald-300" />;
      case 'Cable':
        return <Cable className="w-6 h-6 text-cyan-300" />;
      case 'Radio':
        return <Radio className="w-6 h-6 text-teal-300 animate-pulse" />;
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
            基于浏览器原生 Web 标准 API 构建的极客硬件调试与物理信号解码中枢。
          </p>
        </div>

        <div className="text-xs font-mono-code text-slate-400 flex items-center gap-2">
          <span>总节点:</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
            3 ACTIVE NODES
          </span>
        </div>
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {TOOLS_LIST.map((tool) => {
          const isDecoder = tool.id === 'xenoir';

          return (
            <div
              key={tool.id}
              className={`relative rounded-2xl bg-[#080e18] border transition-all duration-300 flex flex-col justify-between overflow-hidden group corner-bracket ${
                isDecoder
                  ? 'border-emerald-500/40 hover:border-emerald-400 alien-glow-sm'
                  : 'border-slate-800 hover:border-emerald-500/40 hover:bg-[#0a1220]'
              }`}
            >
              {/* Card Top Accent Light */}
              <div
                className={`h-1 w-full bg-gradient-to-r ${
                  tool.id === 'usbee'
                    ? 'from-emerald-500 to-teal-400'
                    : tool.id === 'serialink'
                    ? 'from-cyan-500 to-blue-400'
                    : 'from-teal-400 via-emerald-400 to-cyan-400'
                }`}
              />

              <div className="p-6 space-y-4">
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
                    <h3 className="font-alien-display font-bold text-lg text-slate-100 group-hover:text-emerald-300 transition-colors">
                      {tool.name}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono-code text-slate-300">
                      {tool.badge}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono-code text-emerald-400/90 mt-0.5">
                    {tool.nameEn}
                  </div>
                  <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                    {tool.subtitle}
                  </p>
                </div>

                {/* Protocol Info */}
                <div className="p-2.5 rounded-lg bg-[#05080f] border border-slate-800/80 text-[11px] font-mono-code">
                  <div className="text-slate-500 text-[10px]">协议标准:</div>
                  <div className="text-slate-200 truncate mt-0.5">{tool.protocol}</div>
                </div>

                {/* Feature Bullet List */}
                <div className="space-y-1.5 pt-1">
                  {tool.features.map((feat, fidx) => (
                    <div key={fidx} className="flex items-center gap-2 text-xs text-slate-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-5 pt-0 mt-2 flex items-center gap-2">
                {isDecoder ? (
                  <button
                    id="activate-decoder-card-btn"
                    onClick={() => {
                      onActivateDecoder();
                      playAlienBeep(850, 'triangle', 0.08);
                    }}
                    className="w-full py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-black hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(13,242,201,0.3)]"
                  >
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span>启动内置红外解码矩阵</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <>
                    <a
                      id={`direct-link-${tool.id}`}
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => playAlienBeep(700, 'sine', 0.04)}
                      className="flex-1 py-2.5 rounded-xl font-semibold text-xs bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
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
                      className="py-2.5 px-3.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 active:scale-[0.98] transition-all flex items-center gap-1.5"
                      title="在站内弹窗预览该工具"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>站内预览</span>
                    </button>
                  </>
                )}
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
            外星科技 Web 硬件互联矩阵已打通 WebUSB / Web Serial / Web Audio 全光子通讯链路。无需安装外置应用，纯浏览器端即刻探测与解码。
          </span>
        </div>
        <div className="text-emerald-400/80 shrink-0">
          NODE STATUS: ALL RELAYS OPERATIONAL
        </div>
      </div>
    </div>
  );
}
