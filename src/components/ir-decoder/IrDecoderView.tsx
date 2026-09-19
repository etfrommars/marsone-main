import { useState, useEffect, useRef } from 'react';
import { 
  Radio, Play, Copy, Check, Sparkles, Code2, 
  Send, Cpu, Eye, FileText, AlertCircle, RefreshCw, Zap
} from 'lucide-react';
import { 
  decodeIR, 
  parseInputToPulses, 
  pulsesToProntoHex, 
  generateExportCode, 
  IR_PRESETS 
} from '../../utils/irDecoder';
import { playAlienBeep, playDecodeSuccessSound, playPulseTransmissionSound } from '../../utils/audioSynthesizer';
import IrWaveformCanvas from './IrWaveformCanvas';

export default function IrDecoderView() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('xeno-beacon');
  const [inputTab, setInputTab] = useState<'preset' | 'raw' | 'pronto' | 'live' | 'generator'>('preset');

  // Active Pulses and Decoded Result
  const [currentPulses, setCurrentPulses] = useState<number[]>(IR_PRESETS[0].rawPulses);
  const [rawInputText, setRawInputText] = useState<string>(IR_PRESETS[0].rawPulses.join(', '));
  const [prontoInputText, setProntoInputText] = useState<string>('');
  
  // Custom Generator Inputs
  const [genProtocol, setGenProtocol] = useState<'NEC' | 'SONY'>('NEC');
  const [genAddressHex, setGenAddressHex] = useState<string>('00');
  const [genCommandHex, setGenCommandHex] = useState<string>('12');

  // Decoded state
  const [decodedResult, setDecodedResult] = useState(() => decodeIR(IR_PRESETS[0].rawPulses));
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Optical Screen Flash Simulation
  const [isFlashing, setIsFlashing] = useState(false);

  // Live Audio/Mic capture simulation
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const micAnimRef = useRef<number | null>(null);

  // Update decoding whenever currentPulses change
  useEffect(() => {
    const res = decodeIR(currentPulses);
    setDecodedResult(res);
  }, [currentPulses]);

  // Handle Preset Selection
  const handleSelectPreset = (id: string) => {
    const preset = IR_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setSelectedPresetId(id);
    setCurrentPulses(preset.rawPulses);
    setRawInputText(preset.rawPulses.join(', '));
    setProntoInputText(pulsesToProntoHex(preset.rawPulses, preset.frequencyKhz));
    playDecodeSuccessSound();
  };

  // Handle Raw Text Parse
  const handleParseRaw = () => {
    const parsed = parseInputToPulses(rawInputText);
    if (parsed.pulses.length > 0) {
      setCurrentPulses(parsed.pulses);
      playDecodeSuccessSound();
    } else {
      playAlienBeep(300, 'sawtooth', 0.15);
    }
  };

  // Handle Pronto Parse
  const handleParsePronto = () => {
    const parsed = parseInputToPulses(prontoInputText);
    if (parsed.pulses.length > 0) {
      setCurrentPulses(parsed.pulses);
      setRawInputText(parsed.pulses.join(', '));
      playDecodeSuccessSound();
    } else {
      playAlienBeep(300, 'sawtooth', 0.15);
    }
  };

  // Handle Custom Generator
  const handleGenerateSignal = () => {
    const addr = parseInt(genAddressHex, 16) || 0;
    const cmd = parseInt(genCommandHex, 16) || 0;

    if (genProtocol === 'NEC') {
      const addrByte = addr & 0xff;
      const addrInv = (~addrByte) & 0xff;
      const cmdByte = cmd & 0xff;
      const cmdInv = (~cmdByte) & 0xff;

      const bytes = [addrByte, addrInv, cmdByte, cmdInv];
      const pulses: number[] = [9000, 4500];

      bytes.forEach((b) => {
        for (let i = 0; i < 8; i++) {
          const bit = (b >> i) & 1;
          pulses.push(560);
          pulses.push(bit === 1 ? 1690 : 560);
        }
      });
      pulses.push(560); // Stop bit

      setCurrentPulses(pulses);
      setRawInputText(pulses.join(', '));
      playDecodeSuccessSound();
    } else {
      // Sony SIRC 12-bit: 7-bit command + 5-bit address
      const pulses: number[] = [2400, 600];
      for (let i = 0; i < 7; i++) {
        const bit = (cmd >> i) & 1;
        pulses.push(bit === 1 ? 1200 : 600);
        pulses.push(600);
      }
      for (let i = 0; i < 5; i++) {
        const bit = (addr >> i) & 1;
        pulses.push(bit === 1 ? 1200 : 600);
        pulses.push(600);
      }

      setCurrentPulses(pulses);
      setRawInputText(pulses.join(', '));
      playDecodeSuccessSound();
    }
  };

  // Screen Flash Transmission
  const triggerScreenFlash = () => {
    setIsFlashing(true);
    playPulseTransmissionSound(currentPulses.length);
    let count = 0;
    const interval = setInterval(() => {
      count++;
      if (count >= 10) {
        clearInterval(interval);
        setIsFlashing(false);
      }
    }, 60);
  };

  // Live Microphone / Optical Audio Sensor Listener
  const toggleMicListener = async () => {
    if (isListeningMic) {
      // Stop
      if (micAnimRef.current) cancelAnimationFrame(micAnimRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      setIsListeningMic(false);
      setMicVolume(0);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const actx = new AudioContextClass();
      audioContextRef.current = actx;

      const source = actx.createMediaStreamSource(stream);
      const analyser = actx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      setIsListeningMic(true);
      playAlienBeep(1000, 'sine', 0.1);

      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));

        micAnimRef.current = requestAnimationFrame(checkVolume);
      };
      checkVolume();
    } catch {
      alert('未检测到可用麦克风或用户取消了音频权限。已切换为内置高灵敏度信号捕获模式。');
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    playAlienBeep(920, 'sine', 0.04);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const codeExports = generateExportCode(decodedResult, currentPulses);

  return (
    <div id="xenoir-decoder" className="w-full space-y-6">
      {/* Optical Flash Emulation Overlay */}
      {isFlashing && (
        <div className="fixed inset-0 z-50 bg-white/90 pointer-events-none transition-opacity duration-75 flex items-center justify-center">
          <div className="bg-black/80 px-6 py-3 rounded-full text-emerald-300 font-mono-code text-sm border border-emerald-400 alien-glow">
            ⏣ 光学红外频闪发射中 (EMITTING OPTICAL BURST)...
          </div>
        </div>
      )}

      {/* Title & Status Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#070c16] p-5 rounded-2xl border border-emerald-500/30 alien-glow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent border border-emerald-400/40 flex items-center justify-center alien-glow-sm shrink-0">
            <Radio className="w-6 h-6 text-emerald-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="font-alien-display font-bold text-xl text-slate-100 tracking-wide">
                XENO-IR // 异星光脉冲红外解码矩阵
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono-code bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                WEB OPTICAL DECODER
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono-code bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                载波: {decodedResult.frequencyKhz} kHz
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono-code">
              微秒级脉冲波形示波分析、反码校验、Pronto Hex 转换与光电发射模拟。
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="optical-flash-btn"
            onClick={triggerScreenFlash}
            title="通过屏幕白光频闪模拟发射光脉冲信号"
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-400 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>光脉冲发射模拟</span>
          </button>
          <button
            id="sound-carrier-btn"
            onClick={() => playPulseTransmissionSound(currentPulses.length)}
            title="播放调制载波声波 (Acoustic Carrier)"
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Play className="w-3.5 h-3.5 text-cyan-400" />
            <span>载波声频试听</span>
          </button>
        </div>
      </div>

      {/* Signal Input Tabs */}
      <div className="bg-[#080e18] p-5 rounded-2xl border border-emerald-500/20 space-y-4">
        {/* Input Selector Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-emerald-500/15 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono-code">
            <button
              id="input-tab-preset"
              onClick={() => {
                setInputTab('preset');
                playAlienBeep(650, 'sine', 0.04);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                inputTab === 'preset'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>预设信号库</span>
            </button>

            <button
              id="input-tab-raw"
              onClick={() => {
                setInputTab('raw');
                playAlienBeep(650, 'sine', 0.04);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                inputTab === 'raw'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>RAW 微秒脉冲输入</span>
            </button>

            <button
              id="input-tab-pronto"
              onClick={() => {
                setInputTab('pronto');
                playAlienBeep(650, 'sine', 0.04);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                inputTab === 'pronto'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>Pronto Hex 工业编码</span>
            </button>

            <button
              id="input-tab-live"
              onClick={() => {
                setInputTab('live');
                playAlienBeep(650, 'sine', 0.04);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                inputTab === 'live'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>Web 麦克风/光敏捕获</span>
              {isListeningMic && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
            </button>

            <button
              id="input-tab-generator"
              onClick={() => {
                setInputTab('generator');
                playAlienBeep(650, 'sine', 0.04);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                inputTab === 'generator'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
              <span>自定义信号发生器</span>
            </button>
          </div>

          <div className="text-[11px] font-mono-code text-slate-400">
            脉冲序列: <span className="text-emerald-300 font-bold">{currentPulses.length}</span> 拍
          </div>
        </div>

        {/* Tab 1: Presets */}
        {inputTab === 'preset' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {IR_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-400 alien-glow-sm'
                      : 'bg-[#060b13] border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-200 flex items-center gap-1.5">
                      {preset.category === 'alien' ? '◈' : '◉'} {preset.name}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono-code uppercase ${
                        preset.category === 'alien'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {preset.protocol}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {preset.description}
                  </p>
                  <div className="mt-2 text-[10px] font-mono-code text-emerald-400/80 flex items-center justify-between">
                    <span>{preset.rawPulses.length} 脉冲</span>
                    <span>{preset.frequencyKhz} kHz</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: RAW Pulses Text Input */}
        {inputTab === 'raw' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-300">
              支持输入微秒时间数组（如 <code className="text-emerald-400">[9000, 4500, 560, 560...]</code> 或空格/逗号分隔的脉冲）。
            </p>
            <textarea
              id="raw-pulse-textarea"
              rows={4}
              value={rawInputText}
              onChange={(e) => setRawInputText(e.target.value)}
              placeholder="9000, 4500, 560, 560, 560, 1690..."
              className="w-full bg-[#05080f] border border-slate-700/80 rounded-xl p-3 text-xs font-mono-code text-slate-200 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/50"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono-code">
                提示: 偶数索引为 Mark(高电平)，奇数索引为 Space(低电平)
              </span>
              <button
                id="parse-raw-btn"
                onClick={handleParseRaw}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>立即解析脉冲波形</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Pronto Hex Input */}
        {inputTab === 'pronto' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-300">
              Pronto Hex 是工业控制与高端遥控通用的 4 位 16 进制字串（如以 <code className="text-purple-400">0000 006D ...</code> 开头）。
            </p>
            <textarea
              id="pronto-hex-textarea"
              rows={4}
              value={prontoInputText}
              onChange={(e) => setProntoInputText(e.target.value)}
              placeholder="0000 006D 0022 0002 0157 00AC 0015 0015 0015 0040 ..."
              className="w-full bg-[#05080f] border border-slate-700/80 rounded-xl p-3 text-xs font-mono-code text-slate-200 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400/50"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono-code">
                自动解析载波周期系数与 burst 周期对
              </span>
              <button
                id="parse-pronto-btn"
                onClick={handleParsePronto}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-purple-500 text-white hover:bg-purple-400 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>解码 Pronto 信号</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Live Microphone / Optical Audio Sensor */}
        {inputTab === 'live' && (
          <div className="p-4 rounded-xl bg-[#060b13] border border-amber-500/30 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-amber-300 flex items-center gap-2">
                  <Radio className="w-4 h-4" />
                  Web 麦克风 / 光敏音频输入实时脉冲捕获
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  许多硬件黑客使用 3.5mm 音频接口直接连接红外接收二极管 (IR Photodiode) 或解调模块。通过浏览器原生 Web Audio API，即可实时监听光脉冲振幅跳变。
                </p>
              </div>

              <button
                id="toggle-mic-btn"
                onClick={toggleMicListener}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-2 ${
                  isListeningMic
                    ? 'bg-rose-500 text-white hover:bg-rose-400'
                    : 'bg-amber-500 text-black hover:bg-amber-400'
                }`}
              >
                {isListeningMic ? '停止声学传感器监听' : '开启音频光敏监听'}
              </button>
            </div>

            {/* Live Volume / Peak Meter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono-code text-slate-400">
                <span>实时声学/光电流振幅:</span>
                <span className="text-amber-300 font-bold">{micVolume} %</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 transition-all duration-75"
                  style={{ width: `${micVolume}%` }}
                />
              </div>
            </div>

            {/* Simulation trigger */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs font-mono-code">
              <span className="text-slate-400">未接入硬件传感器？可直接注入模拟高灵敏捕获流：</span>
              <button
                id="inject-simulated-packet-btn"
                onClick={() => {
                  handleSelectPreset('earth-tv-power');
                }}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:text-emerald-300 hover:bg-slate-700 transition-colors"
              >
                注入测试数据包
              </button>
            </div>
          </div>
        )}

        {/* Tab 5: Custom Signal Generator */}
        {inputTab === 'generator' && (
          <div className="p-4 rounded-xl bg-[#060b13] border border-teal-500/30 space-y-4">
            <h4 className="text-sm font-semibold text-teal-300 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              自定义物理层红外脉冲发生器
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-mono-code">调制协议</label>
                <select
                  id="generator-protocol-select"
                  value={genProtocol}
                  onChange={(e) => setGenProtocol(e.target.value as 'NEC' | 'SONY')}
                  className="w-full bg-[#05080f] border border-slate-700 rounded-lg p-2 text-xs font-mono-code text-slate-200 focus:border-emerald-400 focus:outline-none"
                >
                  <option value="NEC">NEC 32-bit (38 kHz, 9ms Header)</option>
                  <option value="SONY">Sony SIRC 12-bit (40 kHz, 2.4ms Header)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-mono-code">设备地址码 (Hex)</label>
                <input
                  id="generator-address-input"
                  type="text"
                  maxLength={4}
                  value={genAddressHex}
                  onChange={(e) => setGenAddressHex(e.target.value.replace(/[^0-9a-fA-F]/g, ''))}
                  placeholder="00"
                  className="w-full bg-[#05080f] border border-slate-700 rounded-lg p-2 text-xs font-mono-code text-slate-200 focus:border-emerald-400 focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-mono-code">操作指令码 (Hex)</label>
                <input
                  id="generator-command-input"
                  type="text"
                  maxLength={2}
                  value={genCommandHex}
                  onChange={(e) => setGenCommandHex(e.target.value.replace(/[^0-9a-fA-F]/g, ''))}
                  placeholder="12"
                  className="w-full bg-[#05080f] border border-slate-700 rounded-lg p-2 text-xs font-mono-code text-slate-200 focus:border-emerald-400 focus:outline-none uppercase"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                id="generate-signal-btn"
                onClick={handleGenerateSignal}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-teal-500 to-emerald-500 text-black hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>计算微秒脉冲并渲染波形</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Waveform Oscilloscope Canvas */}
      <IrWaveformCanvas pulses={currentPulses} decodedResult={decodedResult} />

      {/* Decoded Telemetry Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Protocol & Decoded Hex/Binary Breakdown */}
        <div className="lg:col-span-2 bg-[#080e18] p-5 rounded-2xl border border-emerald-500/20 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-500/15 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-sm text-slate-100 font-mono-code">
                TELEMETRY PARSER // 协议遥测解码矩阵
              </h3>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-mono-code font-bold ${
                decodedResult.integrityValid
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {decodedResult.integrityValid ? '✓ 完整性校验有效 (VALID)' : '⚠ 未校验 (RAW/INVALID)'}
            </span>
          </div>

          {/* Core Decoded Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-code">
            <div className="bg-[#05080f] p-3 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400">解析协议</div>
              <div className="text-sm font-bold text-emerald-400 mt-1 truncate" title={decodedResult.protocolName}>
                {decodedResult.protocol}
              </div>
            </div>

            <div className="bg-[#05080f] p-3 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400">地址码 (Address)</div>
              <div className="text-sm font-bold text-cyan-300 mt-1">
                {decodedResult.address !== undefined ? `0x${decodedResult.address.toString(16).padStart(2, '0').toUpperCase()}` : 'N/A'}
                <span className="text-xs text-slate-500 ml-1.5 font-normal">
                  ({decodedResult.address !== undefined ? decodedResult.address : '-'})
                </span>
              </div>
            </div>

            <div className="bg-[#05080f] p-3 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400">指令码 (Command)</div>
              <div className="text-sm font-bold text-emerald-300 mt-1">
                {decodedResult.command !== undefined ? `0x${decodedResult.command.toString(16).padStart(2, '0').toUpperCase()}` : 'N/A'}
                <span className="text-xs text-slate-500 ml-1.5 font-normal">
                  ({decodedResult.command !== undefined ? decodedResult.command : '-'})
                </span>
              </div>
            </div>

            <div className="bg-[#05080f] p-3 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400">载波频率</div>
              <div className="text-sm font-bold text-purple-300 mt-1">
                {decodedResult.frequencyKhz} kHz
              </div>
            </div>
          </div>

          {/* Details & Integrity Notes */}
          <div className="p-3 rounded-xl bg-[#060b13] border border-slate-800 text-xs text-slate-300 font-mono-code flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-200">协议分析结论:</div>
              <div className="text-slate-400 mt-0.5">{decodedResult.details}</div>
            </div>
          </div>

          {/* Raw Bit Stream Display */}
          {decodedResult.rawBits && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono-code text-slate-400">
                <span>位流时序检视 (Bit Stream // LSB First):</span>
                <span>{decodedResult.rawBits.length} Bits</span>
              </div>
              <div className="p-3 rounded-xl bg-[#05080f] border border-slate-800 font-mono-code text-xs text-slate-200 tracking-widest break-all overflow-x-auto flex flex-wrap gap-1">
                {decodedResult.rawBits.split('').map((b, idx) => (
                  <span
                    key={idx}
                    title={`Bit #${idx}: ${b}`}
                    className={`px-1.5 py-0.5 rounded text-[11px] ${
                      idx < 8
                        ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-700/50'
                        : idx < 16
                        ? 'bg-sky-950/60 text-sky-300 border border-sky-700/50'
                        : idx < 24
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/50'
                        : 'bg-purple-950/60 text-purple-300 border border-purple-700/50'
                    }`}
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Alien Civilization Subspace Box (When Extraterrestrial Pulse is active) */}
          {decodedResult.alienTelemetry && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-emerald-950/30 to-[#070d17] border border-emerald-400/40 alien-glow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-alien-display font-bold text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  异星深空遥测报文 (MARTIAN TELEMETRY STREAM)
                </span>
                <span className="text-[10px] font-mono-code text-purple-300 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/40">
                  {decodedResult.alienTelemetry.quantumChecksum}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono-code text-slate-300">
                <div>发信源: <span className="text-emerald-300">{decodedResult.alienTelemetry.origin}</span></div>
                <div>引力坐标: <span className="text-cyan-300">{decodedResult.alienTelemetry.coordinates}</span></div>
                <div>通量能级: <span className="text-amber-300">{decodedResult.alienTelemetry.energyLevel}</span></div>
                <div>解密字符: <span className="text-purple-300 font-bold tracking-wider">{decodedResult.alienTelemetry.alienGlyphs}</span></div>
              </div>

              <div className="p-2.5 rounded bg-black/50 border border-emerald-500/20 text-xs font-mono-code text-emerald-300">
                &gt; {decodedResult.alienTelemetry.decodedMessage}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Code Export & Hardware Code Snippets */}
        <div className="bg-[#080e18] p-5 rounded-2xl border border-emerald-500/20 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-emerald-500/15 pb-3">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <h3 className="font-semibold text-sm text-slate-100 font-mono-code">
                CODE EXPORT // 嵌入式代码生成
              </h3>
            </div>

            <div className="space-y-3 mt-4">
              {/* Arduino C++ Export */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono-code text-slate-400">
                  <span>Arduino / ESP32 C++</span>
                  <button
                    id="copy-arduino-btn"
                    onClick={() => copyToClipboard(codeExports.arduinoCpp, 'arduino')}
                    className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300"
                  >
                    {copiedKey === 'arduino' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'arduino' ? '已复制' : '复制代码'}</span>
                  </button>
                </div>
                <pre className="p-2.5 rounded-xl bg-[#05080f] border border-slate-800 text-[11px] font-mono-code text-slate-300 max-h-32 overflow-y-auto">
                  {codeExports.arduinoCpp}
                </pre>
              </div>

              {/* Flipper Zero IR File */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono-code text-slate-400">
                  <span>Flipper Zero (.ir 格式)</span>
                  <button
                    id="copy-flipper-btn"
                    onClick={() => copyToClipboard(codeExports.flipperZero, 'flipper')}
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
                  >
                    {copiedKey === 'flipper' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'flipper' ? '已复制' : '复制 .ir'}</span>
                  </button>
                </div>
                <pre className="p-2.5 rounded-xl bg-[#05080f] border border-slate-800 text-[11px] font-mono-code text-slate-300 max-h-24 overflow-y-auto">
                  {codeExports.flipperZero}
                </pre>
              </div>

              {/* Pronto Hex string */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono-code text-slate-400">
                  <span>Pronto Hex 字串</span>
                  <button
                    id="copy-pronto-btn"
                    onClick={() => copyToClipboard(pulsesToProntoHex(currentPulses, decodedResult.frequencyKhz), 'pronto')}
                    className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300"
                  >
                    {copiedKey === 'pronto' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'pronto' ? '已复制' : '复制 Hex'}</span>
                  </button>
                </div>
                <div className="p-2 rounded-xl bg-[#05080f] border border-slate-800 text-[10px] font-mono-code text-slate-300 truncate">
                  {pulsesToProntoHex(currentPulses, decodedResult.frequencyKhz)}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] font-mono-code text-slate-500">
            * 提示: 代码均基于标准微秒定时阵列生成，可直接烧录至 ESP32/ESP8266/Arduino 固件中。
          </div>
        </div>
      </div>
    </div>
  );
}
