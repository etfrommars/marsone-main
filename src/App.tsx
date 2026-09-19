import { useState } from 'react';
import Navbar from './components/Navbar';
import ToolsGrid from './components/ToolsGrid';
import EmbeddedToolModal from './components/EmbeddedToolModal';
import AlienBackground from './components/AlienBackground';
import Footer from './components/Footer';
import { ToolItem } from './types';
import { TOOLS_LIST } from './data/toolsData';
import { Usb, Cable, Cpu, ExternalLink, Sparkles, Terminal, Shield, ArrowRight } from 'lucide-react';
import { playAlienBeep } from './utils/audioSynthesizer';

export default function App() {
  const [activeTab, setActiveTab] = useState<'all' | 'usbee' | 'serialink' | 'ch552t'>('all');
  const [alienMode, setAlienMode] = useState(false);
  const [previewTool, setPreviewTool] = useState<ToolItem | null>(null);

  const handleOpenTool = (tool: ToolItem) => {
    setPreviewTool(tool);
  };

  const usbeeTool = TOOLS_LIST.find((t) => t.id === 'usbee')!;
  const serialinkTool = TOOLS_LIST.find((t) => t.id === 'serialink')!;
  const ch552tTool = TOOLS_LIST.find((t) => t.id === 'ch552t')!;

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
                <span>MARS ONE // 火星一号</span>
                <span className="text-slate-600">|</span>
                <span className="text-cyan-300">火星科技</span>
              </div>

              <h1 className="font-alien-display font-black text-2xl sm:text-4xl text-slate-100 tracking-wide leading-tight">
                {alienMode ? (
                  <span>⏣ MARS ONE // 火星一号硬件与通信控制矩阵 ◈</span>
                ) : (
                  <>
                    MARS ONE <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-200 to-teal-400">火星一号 Web 硬件与通信</span> 调试工具集
                  </>
                )}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 font-mono-code leading-relaxed">
                面向未来硬件极客的火星一号与火星科技工坊。深度融合现代 Web 标准：免安装驱动底层 <span className="text-emerald-300 font-semibold">WebUSB 数据包嗅探控制台</span> 与极速自适应波特率 <span className="text-cyan-300 font-semibold">Web Serial 串口通信控制台</span>。
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-mono-code">
                <span className="px-2.5 py-1 rounded-lg bg-[#070e19] border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>浏览器原生 Direct Hardware</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#070e19] border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>免安装第三方驱动</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#070e19] border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
                  <Usb className="w-3.5 h-3.5" />
                  <span>HEX / 字节双向监听</span>
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
                <span className="text-slate-500">波特率自适应:</span>
                <span className="text-cyan-300 font-semibold">300 ~ 921600+ bps</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">硬件接口层:</span>
                <span className="text-emerald-300 font-semibold">WebUSB & Web Serial</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">活动工具节点:</span>
                <span className="text-emerald-300 font-semibold">3 / 3 在线</span>
              </div>
              <button
                id="hero-jump-usbee-btn"
                onClick={() => {
                  setActiveTab('usbee');
                  playAlienBeep(800, 'sine', 0.05);
                }}
                className="w-full mt-2 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span>进入 USB 调试工具</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* View Switch: All Tools, or specific Tool Tab */}
        {activeTab === 'all' && (
          <div className="space-y-12">
            {/* Tools Grid: USBee, SeriaLink */}
            <section id="tools-showcase">
              <ToolsGrid
                onOpenTool={handleOpenTool}
                alienMode={alienMode}
              />
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

        {/* Dedicated CH552T-TOOLS view */}
        {activeTab === 'ch552t' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#080e18] border border-teal-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-400 flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-teal-300" />
                </div>
                <div>
                  <h2 className="font-alien-display font-bold text-xl text-slate-100">
                    {ch552tTool.name} ({ch552tTool.nameEn})
                  </h2>
                  <p className="text-xs text-slate-400 font-mono-code mt-1">{ch552tTool.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={ch552tTool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-500 text-black hover:bg-teal-400 transition-all flex items-center gap-1.5"
                >
                  <span>在新标签打开</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setActiveTab('all')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-300 hover:text-teal-300 transition-colors"
                >
                  返回全部
                </button>
              </div>
            </div>

            <div className="w-full h-[700px] rounded-2xl bg-[#05080f] border border-slate-800 overflow-hidden shadow-2xl">
              <iframe
                src={ch552tTool.url}
                title="CH552T-TOOLS"
                className="w-full h-full border-none"
                allow="usb; serial; hid"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              />
            </div>
          </div>
        )}
      </main>

      {/* Embedded Tool Modal (for USBee, SeriaLink, or CH552T) */}
      <EmbeddedToolModal
        tool={previewTool}
        onClose={() => setPreviewTool(null)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
