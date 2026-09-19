import { ToolItem } from '../types';

export const TOOLS_LIST: ToolItem[] = [
  {
    id: 'usbee',
    name: 'USB 调试工具',
    nameEn: 'USBee WebUSB Protocol Terminal',
    subtitle: '基于 WebUSB API 的硬件数据包探测与通信控制台',
    url: 'https://usbee.marsone.ccwu.cc/',
    isExternal: true,
    icon: 'Usb',
    badge: 'WebUSB API',
    alienCodename: 'NODE-ALPHA // USBEE-QUANTUM',
    description: '无需安装任何驱动，在现代浏览器中直接探测、连接并调试底层 USB 硬件设备。支持 Control/Bulk/Interrupt 端点传输、自定义描述符读取与数据包十六进制 Hex 实时监测。',
    techStack: ['WebUSB API', 'Hex Analyzer', 'Direct Hardware Bridge'],
    protocol: 'USB 2.0 / USB 3.x / Type-C Direct Packet',
    status: 'ONLINE',
    features: [
      '免安装驱动直连 USB HID/CDC/定制设备',
      '自定义 Vendor ID / Product ID 过滤与探测',
      '支持 HEX、ASCII、原始字节双向收发',
      '端点 (Endpoints) 数据流高频监控与抓包'
    ],
  },
  {
    id: 'serialink',
    name: '串口调试工具',
    nameEn: 'SeriaLink Web Serial Console',
    subtitle: '基于 Web Serial API 的外星量子波特率串口通讯终端',
    url: 'https://serialink.marsone.ccwu.cc/',
    isExternal: true,
    icon: 'Cable',
    badge: 'Web Serial API',
    alienCodename: 'NODE-BETA // SERIALINK-RELAY',
    description: '浏览器原生对接各类 USB 转串口芯片（CH340、CP2102、FTDI、PL2303 等）。支持标准与非标波特率、数据位/停止位/校验位自由配置、实时时间戳及十六进制与文本双模视图。',
    techStack: ['Web Serial API', 'Baud Rate PLL', 'Stream RX/TX'],
    protocol: 'UART / RS-232 / RS-485 / TTL Serial',
    status: 'ONLINE',
    features: [
      '任意波特率自适应 (300 ~ 921600+ bps)',
      'DTR / RTS 硬件流控与重置脉冲触控',
      '带纳秒时间戳的 RX/TX 双向日志记录',
      '自动断帧、HEX 格式化与常用指令预置槽'
    ],
  },
  {
    id: 'xenoir',
    name: '红外数据解码器',
    nameEn: 'XenoIR Optical Decryptor Matrix',
    subtitle: '基于 Web 的光脉冲红外异星信号解码矩阵与时序示波器',
    url: '#xenoir-decoder',
    isExternal: false,
    icon: 'Radio',
    badge: 'Web Optical IR // Built-in',
    alienCodename: 'NODE-GAMMA // XENO-OPTICAL-03',
    description: '原生纯 Web 实现的红外物理层光脉冲捕获与解析系统。支持 NEC、Sony SIRC、RC-5、Pronto Hex 及火星子空间遥测协议。配备微秒级交互式脉冲示波器、反码完整性校验、代码生成与光标发射模拟。',
    techStack: ['Web Audio API', 'Waveform Canvas', 'Pronto Hex', 'Microsecond Timing'],
    protocol: 'NEC 32b / Sony SIRC / RC-5 / Pronto / Xeno Pulse',
    status: 'READY',
    features: [
      '微秒级交互式脉冲时序波形示波器 (Zoom & Measure)',
      '全协议反码完整性校验与地址/操作码位解析',
      '支持 Pronto Hex / RAW 时序一键双向转换',
      '导出 Arduino C++ / Flipper Zero / ESPHome 配置'
    ],
  },
];
