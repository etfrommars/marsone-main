import { useState } from 'react';
import Navbar from './components/Navbar';
import ToolsGrid from './components/ToolsGrid';
import IrDecoderView from './components/ir-decoder/IrDecoderView';
import EmbeddedToolModal from './components/EmbeddedToolModal';
import AlienBackground from './components/AlienBackground';
import Footer from './components/Footer';
import { ToolItem } from './types';
import { TOOLS_LIST } from './data/toolsData';
import { Radio, Usb, Cable, ExternalLink, Sparkles, Terminal, Shield, Zap } from 'lucide-react';
import { playAlienBeep } from './utils/audioSynthesizer';

export default function App() {
  const [activeTab, setActiveTab] = useState<'all' | 'usbee' | 'serialink' | 'xenoir'>('all');
  const [alienMode, setAlienMode] = useState(false);
  const [previewTool, setPreviewTool] = useState<ToolItem | null>(null);

  const handleOpenTool = (tool: ToolItem) => {
    if (tool.id === 'xenoir') {
      setActiveTab('xenoir');
    } else {
      setPreviewTool(tool);
    }
  };

  const scrollToDecoder = () => {
    setActiveTab('xenoir');
    setTimeout(() => {
      const el = document.getElementById('xenoir-decoder');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const usbeeTool = TOOLS_LIST.find((t) => t.id === 'usbee')!;
  const serialinkTool = TOOLS_LIST.find((t) => t.id === 'serialink')!;

  return (
    <div className="min-h-screen bg-[#05080f] text-slate-100 flex flex-col relative selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Dynamic Alien Star & Radar Canvas */}
      <AlienBackground />

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alienMode={alienMode}
        setAlienMode={setAlienMode}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12 relative z-10">
        {/* Hero Extraterrestrial Banner */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#09111f]/90 via-[#070d17]/80 to-[#05080f]/90 border border-emerald-500/30 overflow-hidden corner-bracket alien-glow-sm">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono-code">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>MARS-ONE EXTRATERRESTRIAL WEB SUITE</span>
                <span className="text-slate-600">|</span>
                <span className="text-cyan-300">异星科技</span>
              </div>

              <h1 className="font-alien-display font-black text-2xl sm:text-4xl text-slate-100 tracking-wide leading-tight">
                {alienMode ? (
                  <span>⏣ XENOWEB // 异星量子硬件与信号调试矩阵 ◈</span>
                ) : (
                  <>
                    外星人 <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-200 to-teal-400">Web 硬件与信号</span> 调试工具集
                  </>
                )}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 font-mono-code leading-relaxed">
                面向未来硬件极客的外星文明科技工坊。深度融合现代 Web 标准：免驱底层 <span className="text-emerald-300 font-semibold">WebUSB 数据包嗅探</span>、极速 <span className="text-cyan-300 font-semibold">Web Serial 串口通信</span>，以及全新加入的原生 <span className="text-teal-300 font-semibold">Web 红外数据微秒解码矩阵</span>。
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-mono-code">
                <span className="px-2.5 py-1 rounded-lg bg-[#070e19] border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>浏览器原生 Direct Hardware</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#070e19] border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>免驱动即开即用</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#070e19] border border-teal-500/30 text-teal-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>微秒级光脉冲示波</span>
                </span>
              </div>
            </div>

            {/* Quick Station Stats Display */}
            <div className="w-full lg:w-72 p-4 rounded-2xl bg-[#060b14] border border-emerald-500/25 font-mono-code text-xs space-y-2.5 shrink-0 alien-glow-sm">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">基站遥测中继</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  CONNECTED
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">调制载波基频:</span>
                <span className="text-cyan-300 font-semibold">38.0 ~ 42.5 kHz</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">时序采样分辨率:</span>
                <span className="text-emerald-300 font-semibold">1 µs (微秒)</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">活动工具节点:</span>
                <span className="text-purple-300 font-semibold">3 / 3 在线</span>
              </div>
              <button
                id="hero-jump-decoder-btn"
                onClick={scrollToDecoder}
                className="w-full mt-2 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>立即探索红外解码矩阵</span>
              </button>
            </div>
          </div>
        </div>

        {/* View Switch: All Tools, or specific Tool Tab */}
        {activeTab === 'all' && (
          <div className="space-y-14">
            {/* 1. Tools Grid: USBee, SeriaLink, XenoIR */}
            <section id="tools-showcase">
              <ToolsGrid
                onOpenTool={handleOpenTool}
                onActivateDecoder={scrollToDecoder}
                alienMode={alienMode}
              />
            </section>

            {/* 2. Built-in Web IR Decoder Terminal */}
            <section id="xenoir-section" className="space-y-4 pt-4 border-t border-emerald-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <h2 className="font-alien-display font-bold text-lg sm:text-xl text-slate-100 tracking-wide">
                      内置核心工具 // 异星光脉冲红外解码器
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono-code">
                    原生 Web 环境交互式微秒红外脉冲分析器，即时解析 NEC、Sony SIRC 及异星深空遥测。
                  </p>
                </div>
              </div>

              <IrDecoderView />
            </section>
          </div>
        )}

        {/* Dedicated USBee view */}
        {activeTab === 'usbee' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#080e18] border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center">
                  <Usb className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <h2 className="font-alien-display font-bold text-xl text-slate-100">
                    {usbeeTool.name} ({usbeeTool.nameEn})
                  </h2>
                  <p className="text-xs text-slate-400 font-mono-code mt-1">{usbeeTool.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={usbeeTool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-black hover:bg-emerald-400 transition-all flex items-center gap-1.5"
                >
                  <span>在新标签打开</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setActiveTab('all')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-300 hover:text-emerald-300 transition-colors"
                >
                  返回全部
                </button>
              </div>
            </div>

            <div className="w-full h-[700px] rounded-2xl bg-[#05080f] border border-slate-800 overflow-hidden shadow-2xl">
              <iframe
                src={usbeeTool.url}
                title="USBee"
                className="w-full h-full border-none"
                allow="usb; serial; hid"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              />
            </div>
          </div>
        )}

        {/* Dedicated SeriaLink view */}
        {activeTab === 'serialink' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#080e18] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center">
                  <Cable className="w-6 h-6 text-cyan-300" />
                </div>
                <div>
                  <h2 className="font-alien-display font-bold text-xl text-slate-100">
                    {serialinkTool.name} ({serialinkTool.nameEn})
                  </h2>
                  <p className="text-xs text-slate-400 font-mono-code mt-1">{serialinkTool.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={serialinkTool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 text-black hover:bg-cyan-400 transition-all flex items-center gap-1.5"
                >
                  <span>在新标签打开</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setActiveTab('all')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
                >
                  返回全部
                </button>
              </div>
            </div>

            <div className="w-full h-[700px] rounded-2xl bg-[#05080f] border border-slate-800 overflow-hidden shadow-2xl">
              <iframe
                src={serialinkTool.url}
                title="SeriaLink"
                className="w-full h-full border-none"
                allow="usb; serial; hid"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              />
            </div>
          </div>
        )}

        {/* Dedicated XenoIR view */}
        {activeTab === 'xenoir' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setActiveTab('all');
                  playAlienBeep(600, 'sine', 0.04);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-mono-code bg-slate-900 border border-slate-700 text-slate-300 hover:text-emerald-300 transition-colors"
              >
                &larr; 返回工具集合大厅
              </button>
              <div className="text-xs font-mono-code text-slate-400">
                MODE: FULLSCREEN DECODER WORKBENCH
              </div>
            </div>

            <IrDecoderView />
          </div>
        )}
      </main>

      {/* Embedded Tool Modal (for USBee or SeriaLink) */}
      <EmbeddedToolModal
        tool={previewTool}
        onClose={() => setPreviewTool(null)}
      />

      {/* Footer */}
      <Footer onScrollToDecoder={scrollToDecoder} />
    </div>
  );
}
