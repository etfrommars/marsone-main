import { Terminal, Shield, ExternalLink, Radio, Usb, Cable } from 'lucide-react';
import { playAlienBeep } from '../utils/audioSynthesizer';

interface FooterProps {
  onScrollToDecoder: () => void;
}

export default function Footer({ onScrollToDecoder }: FooterProps) {
  return (
    <footer className="w-full border-t border-emerald-500/20 bg-[#05080f] py-12 px-4 sm:px-6 relative z-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-emerald-500/10 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-emerald-500/20 border border-emerald-400 flex items-center justify-center">
                <Terminal className="w-4 h-4 text-emerald-300" />
              </div>
              <span className="font-alien-display font-bold text-base text-slate-100 tracking-wider">
                XENOWEB TOOLS // MARS-ONE
              </span>
            </div>
            <p className="text-xs font-mono-code text-slate-400 max-w-lg">
              外星文明主题 Web 硬件与通信调试工坊。免安装驱动，原生支持 WebUSB 数据包监听、Web Serial 串口控制台与 Web 红外微秒光脉冲解码。
            </p>
          </div>

          {/* Quick Direct Links */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono-code">
            <a
              href="https://usbee.marsone.ccwu.cc/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playAlienBeep(600, 'sine', 0.04)}
              className="flex items-center gap-1 text-slate-300 hover:text-emerald-300 transition-colors"
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
              className="flex items-center gap-1 text-slate-300 hover:text-cyan-300 transition-colors"
            >
              <Cable className="w-3.5 h-3.5 text-cyan-400" />
              <span>串口调试工具 (SeriaLink)</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>

            <button
              onClick={() => {
                onScrollToDecoder();
                playAlienBeep(700, 'sine', 0.04);
              }}
              className="flex items-center gap-1 text-slate-300 hover:text-teal-300 transition-colors"
            >
              <Radio className="w-3.5 h-3.5 text-teal-400" />
              <span>红外数据解码器 (XenoIR)</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono-code text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>SUB-ORBITAL SECURE LINK // 异星量子通道已加密 // ALL PROTOCOLS VERIFIED</span>
          </div>
          <div>
            COSMIC TIME: <span className="text-slate-400">STARDATE 2026.09 // MARS-ONE COLONY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
