import { useState } from 'react';
import { X, ExternalLink, RefreshCw, Maximize2, ShieldAlert } from 'lucide-react';
import { ToolItem } from '../types';
import { playAlienBeep } from '../utils/audioSynthesizer';

interface EmbeddedToolModalProps {
  tool: ToolItem | null;
  onClose: () => void;
}

export default function EmbeddedToolModal({ tool, onClose }: EmbeddedToolModalProps) {
  const [iframeKey, setIframeKey] = useState(0);

  if (!tool) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-6xl h-[90vh] bg-[#070c16] rounded-2xl border border-emerald-500/40 shadow-2xl flex flex-col overflow-hidden alien-glow">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#09101d] border-b border-emerald-500/20">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#0df2c9]" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-alien-display font-bold text-sm sm:text-base text-slate-100">
                  {tool.name}
                </h3>
                <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {tool.alienCodename}
                </span>
              </div>
              <p className="text-[11px] font-mono-code text-slate-400 truncate max-w-md">
                {tool.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="reload-tool-frame-btn"
              onClick={() => {
                setIframeKey((k) => k + 1);
                playAlienBeep(700, 'sine', 0.05);
              }}
              title="重新载入窗口"
              className="p-2 rounded-lg bg-slate-900 border border-slate-700/60 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <a
              id="external-window-btn"
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              title="在新标签页独立打开"
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 transition-colors text-xs font-mono-code flex items-center gap-1.5"
            >
              <span>新标签打开</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              id="close-tool-modal-btn"
              onClick={() => {
                onClose();
                playAlienBeep(500, 'sine', 0.05);
              }}
              className="p-2 rounded-lg bg-slate-900 border border-slate-700/60 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Security / Web Hardware API reminder bar */}
        <div className="bg-[#0b1424] px-4 py-2 border-b border-emerald-500/10 text-[11px] font-mono-code text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              硬件权限安全提示: WebUSB / Web Serial 需要浏览器硬件授予权限。如在内嵌预览中被沙箱拦截，请点击右上角「新标签打开」。
            </span>
          </div>
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline flex items-center gap-1 shrink-0 ml-2"
          >
            直达硬件终端 <Maximize2 className="w-3 h-3" />
          </a>
        </div>

        {/* Iframe View */}
        <div className="relative flex-1 w-full h-full bg-[#05080f]">
          <iframe
            key={iframeKey}
            src={tool.url}
            title={tool.name}
            className="w-full h-full border-none"
            allow="usb; serial; hid; microphone"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          />
        </div>
      </div>
    </div>
  );
}
