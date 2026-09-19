import { Terminal, Shield, ExternalLink, Usb, Cable, Cpu } from 'lucide-react';
import { playAlienBeep } from '../utils/audioSynthesizer';

export default function Footer() {
  return (
    <footer className="w-full border-t border-emerald-500/20 bg-[#05080f] py-12 px-4 sm:px-6 relative z-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-emerald-500/10 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[#061e1a] via-[#071722] to-[#040e16] border border-emerald-400/60 flex items-center justify-center alien-glow-sm select-none shrink-0 overflow-hidden shadow-inner">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(13,242,201,0.18)_0%,_transparent_70%)]" />
                {/* Subtle corner accents */}
                <div className="absolute top-1 left-1 w-1 h-1 border-t border-l border-emerald-400/70" />
                <div className="absolute top-1 right-1 w-1 h-1 border-t border-r border-emerald-400/70" />
                <div className="absolute bottom-1 left-1 w-1 h-1 border-b border-l border-emerald-400/70" />
                <div className="absolute bottom-1 right-1 w-1 h-1 border-b border-r border-emerald-400/70" />

                <span className="relative font-alien-display font-black text-[6.5px] tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-100 to-cyan-300 drop-shadow-[0_0_4px_rgba(13,242,201,0.7)] leading-none text-center">
                  MARS
                </span>
              </div>
              <span className="font-alien-display font-bold text-base text-slate-100 tracking-wider">
                MARS ONE // 火星一号
              </span>
            </div>
            <p className="text-xs font-mono-code text-slate-400 max-w-lg">
              火星一号 (MARS ONE) 火星科技 Web 硬件与通信调试工坊。免安装驱动，原生支持 WebUSB 数据包监听、Web Serial 串口通讯与 CH552T 多功能 USB 转接调试控制台。
            </p>
          </div>

          {/* Quick Direct Links */}
          <div className="flex flex-wrap items-center gap-6 text-xs font-mono-code">
            <a
              href="https://usbee.marsone.ccwu.cc/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playAlienBeep(600, 'sine', 0.04)}
              className="flex items-center gap-1.5 text-slate-300 hover:text-emerald-300 transition-colors"
            >
              <Usb className="w-3.5 h-3.5 text-emerald-400" />
              <span>USB 调试工具 (USBee)</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>

            <a
              href="https://serialink.marsone.ccwu.cc/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playAlienBeep(650, 'sine', 0.04)}
              className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-300 transition-colors"
            >
              <Cable className="w-3.5 h-3.5 text-cyan-400" />
              <span>串口调试工具 (SeriaLink)</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>

            <a
              href="https://ch552t-tools.marsone.ccwu.cc/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playAlienBeep(700, 'sine', 0.04)}
              className="flex items-center gap-1.5 text-slate-300 hover:text-teal-300 transition-colors"
            >
              <Cpu className="w-3.5 h-3.5 text-teal-400" />
              <span>CH552T-TOOLS</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono-code text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>SUB-ORBITAL SECURE LINK // 火星一号量子通道已加密 // ALL PROTOCOLS VERIFIED</span>
          </div>
          <div>
            COSMIC TIME: <span className="text-slate-400">STARDATE 2026.09 // MARS-ONE COLONY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
