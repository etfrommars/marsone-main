import { useEffect, useState } from 'react';
import { Radio, Usb, Cable, Volume2, VolumeX, Sparkles, Terminal, ShieldCheck, AlertTriangle } from 'lucide-react';
import { isSoundEnabled, toggleSound, playAlienBeep } from '../utils/audioSynthesizer';

interface NavbarProps {
  activeTab: 'all' | 'usbee' | 'serialink' | 'xenoir';
  setActiveTab: (tab: 'all' | 'usbee' | 'serialink' | 'xenoir') => void;
  alienMode: boolean;
  setAlienMode: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export default function Navbar({ activeTab, setActiveTab, alienMode, setAlienMode }: NavbarProps) {
  const [soundOn, setSoundOn] = useState(true);
  const [apiSupport, setApiSupport] = useState({
    usb: false,
    serial: false,
    audio: false,
  });

  useEffect(() => {
    setSoundOn(isSoundEnabled());
    setApiSupport({
      usb: typeof navigator !== 'undefined' && 'usb' in navigator,
      serial: typeof navigator !== 'undefined' && 'serial' in navigator,
      audio: typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window),
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
          <span>ORBITAL FREQ: <span className="text-cyan-300">38.20 kHz</span></span>
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
            title={soundOn ? '关闭外星音效反馈' : '开启外星音效反馈'}
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
          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[#060e18] border border-emerald-500/40 flex items-center justify-center alien-glow-sm group-hover:border-emerald-400 group-hover:shadow-[0_0_15px_rgba(13,242,201,0.4)] transition-all">
            <img 
              src="/alien-avatar.jpg" 
              alt="异星人头像" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/favicon.svg';
              }}
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#0df2c9] border border-[#05080f]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-alien-display font-bold text-lg sm:text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-200 to-teal-300">
                XENOWEB
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-code font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                MARS-ONE v2.6
              </span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-wide font-mono-code">
              {alienMode ? '⏣ ☍ ⎈ 异星硬件与脉冲控制矩阵' : '外星文明 Web 硬件与信号调试工坊'}
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
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            {alienMode ? '◈ 核心控制台' : '全部工具'}
          </button>
          <button
            id="nav-tab-usbee"
            onClick={() => {
              setActiveTab('usbee');
              playAlienBeep(650, 'sine', 0.04);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'usbee'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Usb className="w-3 h-3 text-emerald-400" />
            <span>USB 调试工具</span>
          </button>
          <button
            id="nav-tab-serialink"
            onClick={() => {
              setActiveTab('serialink');
              playAlienBeep(700, 'sine', 0.04);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'serialink'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Cable className="w-3 h-3 text-cyan-400" />
            <span>串口调试工具</span>
          </button>
          <button
            id="nav-tab-xenoir"
            onClick={() => {
              setActiveTab('xenoir');
              playAlienBeep(750, 'sine', 0.04);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'xenoir'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Radio className="w-3 h-3 text-teal-400 animate-pulse" />
            <span>红外数据解码器</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </button>
        </div>

        {/* Alien Glyphs toggle & Quick Action */}
        <div className="flex items-center gap-2">
          <button
            id="alien-glyphs-btn"
            onClick={handleAlienModeToggle}
            title="切换外星量子符文 / 地球字符模式"
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono-code flex items-center gap-1.5 border transition-all ${
              alienMode
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 alien-glow-sm'
                : 'bg-slate-900 border-slate-700/60 text-slate-300 hover:border-emerald-500/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{alienMode ? '异星符文 ON' : '符文模式'}</span>
          </button>

          <button
            id="launch-ir-quick-btn"
            onClick={() => {
              setActiveTab('xenoir');
              playAlienBeep(850, 'triangle', 0.08);
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 text-black hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(13,242,201,0.35)] flex items-center gap-1.5"
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">启动红外解码</span>
            <span className="xs:hidden">解码</span>
          </button>
        </div>
      </div>
    </header>
  );
}
