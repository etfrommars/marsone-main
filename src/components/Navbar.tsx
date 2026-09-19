import { useEffect, useState } from 'react';
import { Usb, Cable, Cpu, Volume2, VolumeX, Sparkles, ShieldCheck, AlertTriangle } from 'lucide-react';
import { isSoundEnabled, toggleSound, playAlienBeep } from '../utils/audioSynthesizer';

interface NavbarProps {
  activeTab: 'all' | 'usbee' | 'serialink' | 'ch552t';
  setActiveTab: (tab: 'all' | 'usbee' | 'serialink' | 'ch552t') => void;
  alienMode: boolean;
  setAlienMode: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export default function Navbar({ activeTab, setActiveTab, alienMode, setAlienMode }: NavbarProps) {
  const [soundOn, setSoundOn] = useState(true);
  const [apiSupport, setApiSupport] = useState({
    usb: false,
    serial: false,
  });

  useEffect(() => {
    setSoundOn(isSoundEnabled());
    setApiSupport({
      usb: typeof navigator !== 'undefined' && 'usb' in navigator,
      serial: typeof navigator !== 'undefined' && 'serial' in navigator,
    });
  }, []);

  const handleSoundToggle = () => {
    const newState = toggleSound();
    setSoundOn(newState);
    if (newState) {
      playAlienBeep(880, 'sine', 0.08);
    }
  };

  const handleAlienModeToggle = () => {
    setAlienMode((prev) => !prev);
    playAlienBeep(1200, 'triangle', 0.06);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-500/20 bg-[#05080f]/85 backdrop-blur-md">
      {/* Top Telemetry Ticker */}
      <div className="w-full bg-[#080e18] border-b border-emerald-500/10 px-4 py-1 text-[11px] font-mono-code text-slate-400 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>MARS-ONE SUBSPACE RELAY // 7D5F</span>
          </span>
          <span className="text-slate-600">|</span>
          <span>BAUD BUS: <span className="text-cyan-300">AUTO-SYNC (300 ~ 921600)</span></span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="hidden sm:inline">COORDINATES: <span className="text-emerald-300">38°12'N 142°50'E</span></span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Hardware API status pills */}
          <div className="flex items-center gap-2">
            <span
              title={apiSupport.usb ? 'WebUSB 硬件直连支持正常' : '当前环境缺少 WebUSB 支持'}
              className={`px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 border ${
                apiSupport.usb
                  ? 'border-emerald-500/30 text-emerald-300 bg-emerald-950/40'
                  : 'border-amber-500/30 text-amber-300 bg-amber-950/40'
              }`}
            >
              <Usb className="w-2.5 h-2.5" />
              <span>WebUSB</span>
              {apiSupport.usb ? <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" /> : <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />}
            </span>

            <span
              title={apiSupport.serial ? 'Web Serial 串口通信支持正常' : '当前环境缺少 Web Serial 支持'}
              className={`px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 border ${
                apiSupport.serial
                  ? 'border-cyan-500/30 text-cyan-300 bg-cyan-950/40'
                  : 'border-amber-500/30 text-amber-300 bg-amber-950/40'
              }`}
            >
              <Cable className="w-2.5 h-2.5" />
              <span>WebSerial</span>
              {apiSupport.serial ? <ShieldCheck className="w-2.5 h-2.5 text-cyan-400" /> : <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />}
            </span>
          </div>

          <span className="text-slate-600">|</span>

          {/* Sound Toggle */}
          <button
            id="sound-toggle-btn"
            onClick={handleSoundToggle}
            title={soundOn ? '关闭火星音效反馈' : '开启火星音效反馈'}
            className="text-slate-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            <span className="hidden md:inline">{soundOn ? 'SFX ON' : 'SFX MUTED'}</span>
          </button>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo & Alien Station Title */}
        <div 
          onClick={() => {
            setActiveTab('all');
            playAlienBeep(700, 'sine', 0.05);
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          {/* Logo icon with MARS typography */}
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#061e1a] via-[#071722] to-[#040e16] border border-emerald-400/50 flex flex-col items-center justify-center alien-glow-sm group-hover:border-emerald-300 group-hover:shadow-[0_0_18px_rgba(13,242,201,0.5)] transition-all overflow-hidden select-none shrink-0 shadow-inner px-1">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(13,242,201,0.18)_0%,_transparent_70%)]" />
            {/* Cybernetic corner accents */}
            <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-emerald-400/70" />
            <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-emerald-400/70" />
            <div className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-emerald-400/70" />
            <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-emerald-400/70" />
            
            <span className="relative font-alien-display font-black text-[9.5px] tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-100 to-cyan-300 drop-shadow-[0_0_5px_rgba(13,242,201,0.7)] leading-none text-center">
              MARS
            </span>
            <span className="relative text-[6.5px] font-mono-code font-bold tracking-widest text-emerald-400/90 leading-none mt-1">
              ONE
            </span>
            
            {/* Quantum online indicator */}
            <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_#0df2c9] border border-[#05080f]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-alien-display font-bold text-lg sm:text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-200 to-teal-300">
                MARS ONE
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-code font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                火星一号 v2.6
              </span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-wide font-mono-code">
              {alienMode ? '⏣ ☍ ⎈ 火星一号硬件与通信控制矩阵' : '火星一号 · 火星科技 Web 硬件调试与通信工坊'}
            </p>
          </div>
        </div>

        {/* Nav Tabs */}
        <div className="hidden md:flex items-center gap-1 bg-[#09101d] p-1 rounded-lg border border-emerald-500/20">
          <button
            id="nav-tab-all"
            onClick={() => {
              setActiveTab('all');
              playAlienBeep(600, 'sine', 0.04);
            }}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            {alienMode ? '◈ 核心控制矩阵' : '全部工具'}
          </button>
          <button
            id="nav-tab-usbee"
            onClick={() => {
              setActiveTab('usbee');
              playAlienBeep(650, 'sine', 0.04);
            }}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'usbee'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Usb className="w-3.5 h-3.5 text-emerald-400" />
            <span>USB 调试工具</span>
          </button>
          <button
            id="nav-tab-serialink"
            onClick={() => {
              setActiveTab('serialink');
              playAlienBeep(700, 'sine', 0.04);
            }}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'serialink'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Cable className="w-3.5 h-3.5 text-cyan-400" />
            <span>串口调试工具</span>
          </button>
          <button
            id="nav-tab-ch552t"
            onClick={() => {
              setActiveTab('ch552t');
              playAlienBeep(750, 'sine', 0.04);
            }}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'ch552t'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-teal-400" />
            <span>CH552T-TOOLS</span>
          </button>
        </div>

        {/* Alien Glyphs toggle & Quick Action */}
        <div className="flex items-center gap-2">
          <button
            id="alien-glyphs-btn"
            onClick={handleAlienModeToggle}
            title="切换火星量子符文 / 标准字符模式"
            className={`px-3 py-1.5 rounded-lg text-xs font-mono-code flex items-center gap-1.5 border transition-all ${
              alienMode
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 alien-glow-sm'
                : 'bg-slate-900 border-slate-700/60 text-slate-300 hover:border-emerald-500/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{alienMode ? '火星符文 ON' : '符文模式'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
