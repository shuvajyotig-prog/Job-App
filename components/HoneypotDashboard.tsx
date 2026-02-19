import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Shield, ShieldCheck, ShieldOff, Phone, PhoneIncoming,
  Clock, Activity, Terminal, CheckCircle2, AlertTriangle,
  Wifi, WifiOff, Settings, X, Eye, Zap, ChevronRight, Radio,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type DashboardState = 'idle' | 'threat' | 'captured';

interface ThreatInfo {
  phoneNumber: string;
  startedAt: Date;
  transcript: TranscriptLine[];
}

interface CapturedInfo {
  phoneNumber: string;
  upiId: string;
  startedAt: Date;
  capturedAt: Date;
  transcript: TranscriptLine[];
}

interface TranscriptLine {
  role: 'scammer' | 'agent';
  text: string;
  ts: Date;
}

interface RetellCallStartedEvent {
  event: 'call_started';
  call_id: string;
  from_number: string;
}

interface RetellToolCallEvent {
  event: 'tool_call';
  function_name: string;
  arguments: Record<string, string>;
}

type RetellEvent = RetellCallStartedEvent | RetellToolCallEvent | { event: string; [key: string]: unknown };

// ─── Constants ────────────────────────────────────────────────────────────────

const DEMO_PHONE = '+91 98765 43210';
const DEMO_UPI   = 'scam.king@okicici';

const DEMO_TRANSCRIPT: TranscriptLine[] = [
  { role: 'scammer', text: 'Hello, is this Mrs. Sharma?', ts: new Date() },
  { role: 'agent',   text: 'Yes, yes, who is this? My hearing is not so good…', ts: new Date() },
  { role: 'scammer', text: 'This is FedEx customs. A parcel in your name contains illegal items.', ts: new Date() },
  { role: 'agent',   text: 'Oh my God! What parcel? I did not order anything!', ts: new Date() },
  { role: 'scammer', text: 'You must pay ₹10,000 to release it. Open your GPay now.', ts: new Date() },
  { role: 'agent',   text: 'Oh wait… let me find my glasses, I cannot see the screen…', ts: new Date() },
  { role: 'scammer', text: 'Hurry! Send to this UPI: scam.king@okicici', ts: new Date() },
  { role: 'agent',   text: 'Got it. Preparing transfer…', ts: new Date() },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const SystemTime: React.FC = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono text-xs tracking-widest opacity-70">
      {time.toLocaleTimeString('en-IN', { hour12: false })}
    </span>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const TranscriptLog: React.FC<{ lines: TranscriptLine[]; state: DashboardState }> = ({ lines, state }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines.length]);

  const borderColor  = state === 'threat' ? 'border-red-800/60'   : 'border-green-700/60';
  const headerColor  = state === 'threat' ? 'text-red-400'         : 'text-green-400';
  const scrollbarColor = state === 'threat' ? 'scrollbar-red' : 'scrollbar-green';

  return (
    <div className={`border ${borderColor} rounded-lg overflow-hidden`}>
      <div className={`flex items-center gap-2 px-3 py-1.5 border-b ${borderColor} bg-black/40`}>
        <Terminal size={12} className={headerColor} />
        <span className={`text-xs font-mono font-bold ${headerColor} tracking-widest`}>LIVE TRANSCRIPT</span>
      </div>
      <div className={`h-40 overflow-y-auto p-3 space-y-1.5 font-mono text-xs bg-black/30 ${scrollbarColor}`}>
        {lines.map((line, i) => (
          <div key={i} className="flex gap-2 leading-relaxed">
            <span className={`shrink-0 font-bold ${line.role === 'scammer' ? 'text-red-400' : 'text-emerald-400'}`}>
              {line.role === 'scammer' ? '[SCAMMER]' : '[AGENT  ]'}
            </span>
            <span className="text-slate-300">{line.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

const PulsingRing: React.FC<{ color: string }> = ({ color }) => (
  <span className={`absolute inset-0 rounded-full ${color} opacity-20 animate-ping`} />
);

// ─── Settings Panel ───────────────────────────────────────────────────────────

interface SettingsPanel {
  wsUrl: string;
  demoPhone: string;
  demoUpi: string;
}

const SettingsOverlay: React.FC<{
  settings: SettingsPanel;
  onSave: (s: SettingsPanel) => void;
  onClose: () => void;
}> = ({ settings, onSave, onClose }) => {
  const [local, setLocal] = useState(settings);
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <span className="font-mono font-bold text-white tracking-widest text-sm">⚙ SENTINEL CONFIG</span>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5">RETELL WEBSOCKET URL</label>
            <input
              value={local.wsUrl}
              onChange={e => setLocal(p => ({ ...p, wsUrl: e.target.value }))}
              placeholder="wss://api.retellai.com/..."
              className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            />
            <p className="text-xs text-zinc-600 mt-1">Leave empty to use manual/demo mode (keyboard shortcuts).</p>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5">DEMO PHONE NUMBER</label>
            <input
              value={local.demoPhone}
              onChange={e => setLocal(p => ({ ...p, demoPhone: e.target.value }))}
              placeholder="+91 98765 43210"
              className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5">DEMO UPI ID (CAPTURED)</label>
            <input
              value={local.demoUpi}
              onChange={e => setLocal(p => ({ ...p, demoUpi: e.target.value }))}
              placeholder="scam.king@okicici"
              className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div className="bg-zinc-800/60 rounded-lg p-3 text-xs font-mono text-zinc-500 space-y-1">
            <div><span className="text-zinc-300">SPACE</span> — advance state (idle→threat→captured)</div>
            <div><span className="text-zinc-300">R</span>     — reset to idle</div>
            <div><span className="text-zinc-300">T</span>     — force threat state</div>
            <div><span className="text-zinc-300">C</span>     — force captured state</div>
          </div>
        </div>

        <button
          onClick={() => { onSave(local); onClose(); }}
          className="mt-5 w-full bg-zinc-100 text-black font-mono font-bold text-sm py-2.5 rounded-lg hover:bg-white transition-colors"
        >
          SAVE CONFIG
        </button>
      </div>
    </div>
  );
};

// ─── States ───────────────────────────────────────────────────────────────────

const IdleScreen: React.FC<{ wsConnected: boolean }> = ({ wsConnected }) => {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center flex-1 select-none">
      {/* Animated Shield */}
      <div className="relative mb-10">
        <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping scale-150" />
        <div className="absolute inset-0 rounded-full bg-emerald-500/5 animate-pulse scale-200" />
        <div className="relative w-36 h-36 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.15)]">
          <Shield size={64} className="text-emerald-500 opacity-80" strokeWidth={1.5} />
        </div>
      </div>

      {/* Status */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="font-mono text-emerald-400 text-sm tracking-[0.3em] font-bold">SYSTEM ONLINE</span>
        </div>
        <h1 className="font-mono text-3xl md:text-5xl font-black text-white tracking-[0.15em] uppercase">
          Active Sentinel
        </h1>
        <p className="font-mono text-zinc-500 text-sm tracking-widest">
          Monitoring telephony network{dots}
        </p>
      </div>

      {/* Connection Status */}
      <div className="mt-16 flex items-center gap-2 text-xs font-mono">
        {wsConnected ? (
          <><Wifi size={12} className="text-emerald-500" /><span className="text-emerald-600">RETELL WS CONNECTED</span></>
        ) : (
          <><WifiOff size={12} className="text-zinc-600" /><span className="text-zinc-600">MANUAL MODE — PRESS SPACE TO SIMULATE CALL</span></>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const ThreatScreen: React.FC<{
  info: ThreatInfo;
  elapsed: number;
}> = ({ info, elapsed }) => {
  const [visibleLines, setVisibleLines] = useState(0);

  // Reveal transcript lines progressively
  useEffect(() => {
    if (visibleLines >= info.transcript.length) return;
    const delay = visibleLines === 0 ? 800 : 1800;
    const t = setTimeout(() => setVisibleLines(v => v + 1), delay);
    return () => clearTimeout(t);
  }, [visibleLines, info.transcript.length]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden select-none">
      {/* Banner */}
      <div className="bg-red-600/20 border-b border-red-600/40 px-6 py-3 flex items-center gap-3 animate-pulse">
        <AlertTriangle size={20} className="text-red-400" fill="currentColor" />
        <span className="font-mono font-black text-red-400 tracking-[0.4em] text-sm md:text-base">
          THREAT DETECTED — HOSTILE CALLER IDENTIFIED
        </span>
      </div>

      <div className="flex flex-col md:flex-row flex-1 gap-6 p-6 md:p-10 overflow-hidden">

        {/* Left Column — Call Info */}
        <div className="flex flex-col gap-6 md:w-72 lg:w-80 shrink-0">

          {/* Phone Number Card */}
          <div className="bg-black/50 border border-red-800/60 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-transparent pointer-events-none" />
            <div className="flex items-center gap-2 mb-3">
              <PhoneIncoming size={14} className="text-red-400 animate-pulse" />
              <span className="text-xs font-mono text-red-500 tracking-widest">INCOMING CALL</span>
            </div>
            <div className="font-mono font-black text-2xl md:text-3xl text-white tracking-wider break-all">
              {info.phoneNumber}
            </div>
          </div>

          {/* Timer */}
          <div className="bg-black/50 border border-red-800/40 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-red-400" />
              <span className="text-xs font-mono text-red-500 tracking-widest">CALL DURATION</span>
            </div>
            <div className="font-mono font-black text-3xl text-red-300 tabular-nums">
              {formatDuration(elapsed)}
            </div>
          </div>

          {/* AI Status */}
          <div className="bg-black/50 border border-emerald-800/50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={14} className="text-emerald-400" />
              <span className="text-xs font-mono text-emerald-500 tracking-widest">AI AGENT STATUS</span>
            </div>
            <div className="space-y-2 font-mono text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                GRANDMA PERSONA ACTIVE
              </div>
              <div className="text-zinc-600">MODEL: GPT-4o / ElevenLabs</div>
              <div className="text-zinc-600">STRATEGY: STALL & CAPTURE</div>
            </div>
          </div>
        </div>

        {/* Right Column — Transcript */}
        <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-hidden">
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-red-400" />
            <span className="font-mono text-xs text-red-500 tracking-widest font-bold">REAL-TIME INTERCEPT</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {info.transcript.slice(0, visibleLines).map((line, i) => (
              <div
                key={i}
                className={`flex gap-3 items-start font-mono text-sm animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                  line.role === 'scammer' ? 'justify-start' : 'justify-end'
                }`}
              >
                {line.role === 'scammer' && (
                  <div className="shrink-0 w-20 text-right text-xs text-red-500 font-bold pt-1">SCAMMER</div>
                )}
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-xl text-sm ${
                    line.role === 'scammer'
                      ? 'bg-red-950/60 border border-red-800/50 text-red-200'
                      : 'bg-emerald-950/60 border border-emerald-800/50 text-emerald-200'
                  }`}
                >
                  {line.text}
                </div>
                {line.role === 'agent' && (
                  <div className="shrink-0 w-20 text-xs text-emerald-500 font-bold pt-1">AGENT 👵</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const CapturedScreen: React.FC<{ info: CapturedInfo }> = ({ info }) => {
  const duration = Math.floor((info.capturedAt.getTime() - info.startedAt.getTime()) / 1000);

  return (
    <div className="flex flex-col flex-1 items-center justify-center text-center p-6 select-none overflow-hidden">

      {/* Glow Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 rounded-full bg-emerald-500/5 animate-ping" style={{ animationDuration: '2s' }} />
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full bg-emerald-500/8 animate-ping" style={{ animationDuration: '1.5s' }} />
      </div>

      {/* Icon */}
      <div className="relative mb-8">
        <ShieldCheck size={80} className="text-emerald-400" strokeWidth={1.5} />
        <CheckCircle2 size={28} className="absolute -bottom-2 -right-2 text-emerald-300 bg-black rounded-full" />
      </div>

      {/* Label */}
      <div className="font-mono text-emerald-500 text-xs tracking-[0.6em] font-bold mb-3 animate-in fade-in duration-500">
        TARGET NEUTRALIZED
      </div>

      {/* Headline */}
      <h1 className="font-mono font-black text-4xl md:text-6xl lg:text-7xl text-white tracking-tight mb-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
        IDENTITY CAPTURED
      </h1>

      {/* UPI ID — the star of the show */}
      <div className="mt-6 mb-8 bg-black/60 border-2 border-emerald-500/60 rounded-2xl px-8 py-5 shadow-[0_0_60px_rgba(16,185,129,0.3)] animate-in fade-in zoom-in-95 duration-1000">
        <div className="text-xs font-mono text-emerald-600 tracking-widest mb-3">PAYMENT IDENTITY</div>
        <div className="font-mono font-black text-3xl md:text-5xl lg:text-6xl text-emerald-300 tracking-wider break-all">
          {info.upiId}
        </div>
      </div>

      {/* Evidence Row */}
      <div className="flex flex-wrap justify-center gap-4 text-xs font-mono animate-in fade-in duration-1500">
        <div className="bg-black/50 border border-emerald-900/60 rounded-lg px-4 py-2 text-zinc-400 flex items-center gap-2">
          <Phone size={12} className="text-emerald-600" />
          <span>{info.phoneNumber}</span>
        </div>
        <div className="bg-black/50 border border-emerald-900/60 rounded-lg px-4 py-2 text-zinc-400 flex items-center gap-2">
          <Clock size={12} className="text-emerald-600" />
          <span>CALL: {formatDuration(duration)}</span>
        </div>
        <div className="bg-black/50 border border-emerald-900/60 rounded-lg px-4 py-2 text-zinc-400 flex items-center gap-2">
          <Zap size={12} className="text-emerald-600" />
          <span>EVIDENCE SECURED</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 text-zinc-700 font-mono text-xs tracking-widest">
        FRAUD HONEYPOT SYSTEM — TRUECALLER SENTINEL
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export const HoneypotDashboard: React.FC = () => {
  const [dashState, setDashState]     = useState<DashboardState>('idle');
  const [threatInfo, setThreatInfo]   = useState<ThreatInfo | null>(null);
  const [capturedInfo, setCapturedInfo] = useState<CapturedInfo | null>(null);
  const [elapsed, setElapsed]         = useState(0);
  const [wsConnected, setWsConnected] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings]       = useState<SettingsPanel>({
    wsUrl: '',
    demoPhone: DEMO_PHONE,
    demoUpi:   DEMO_UPI,
  });

  const wsRef       = useRef<WebSocket | null>(null);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<Date | null>(null);

  // ── Timer ──────────────────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    startedAtRef.current = new Date();
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed(e => e + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // ── State Transitions ──────────────────────────────────────────────────────
  const goThreat = useCallback((phoneNumber: string, transcript = DEMO_TRANSCRIPT) => {
    stopTimer();
    const info: ThreatInfo = { phoneNumber, startedAt: new Date(), transcript };
    setThreatInfo(info);
    setCapturedInfo(null);
    setDashState('threat');
    startTimer();
  }, [startTimer, stopTimer]);

  const goCaptured = useCallback((upiId: string) => {
    stopTimer();
    const phone = threatInfo?.phoneNumber ?? settings.demoPhone;
    const start = startedAtRef.current ?? threatInfo?.startedAt ?? new Date();
    const transcript = threatInfo?.transcript ?? DEMO_TRANSCRIPT;
    const info: CapturedInfo = {
      phoneNumber: phone,
      upiId,
      startedAt: start,
      capturedAt: new Date(),
      transcript,
    };
    setCapturedInfo(info);
    setDashState('captured');
  }, [threatInfo, settings.demoPhone, stopTimer]);

  const goIdle = useCallback(() => {
    stopTimer();
    setThreatInfo(null);
    setCapturedInfo(null);
    setElapsed(0);
    setDashState('idle');
  }, [stopTimer]);

  // ── Keyboard Controls ──────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showSettings) return;

      if (e.code === 'Space' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (dashState === 'idle')    goThreat(settings.demoPhone);
        else if (dashState === 'threat') goCaptured(settings.demoUpi);
      }
      if (e.key === 'r' || e.key === 'R') goIdle();
      if (e.key === 't' || e.key === 'T') goThreat(settings.demoPhone);
      if (e.key === 'c' || e.key === 'C') goCaptured(settings.demoUpi);
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dashState, goThreat, goCaptured, goIdle, settings, showSettings]);

  // ── WebSocket Connection ───────────────────────────────────────────────────
  useEffect(() => {
    if (!settings.wsUrl) return;

    const connect = () => {
      try {
        const ws = new WebSocket(settings.wsUrl);
        wsRef.current = ws;

        ws.onopen = () => setWsConnected(true);
        ws.onclose = () => { setWsConnected(false); wsRef.current = null; };
        ws.onerror = () => { setWsConnected(false); };

        ws.onmessage = (event) => {
          try {
            const data: RetellEvent = JSON.parse(event.data);

            if (data.event === 'call_started') {
              const e = data as RetellCallStartedEvent;
              goThreat(e.from_number || settings.demoPhone);
            } else if (data.event === 'tool_call') {
              const e = data as RetellToolCallEvent;
              if (
                e.function_name === 'capture_scammer_details' ||
                e.function_name === 'report_scammer'
              ) {
                const upi = e.arguments?.upi_id || e.arguments?.payment_id || settings.demoUpi;
                goCaptured(upi);
              }
            }
          } catch {
            // ignore malformed messages
          }
        };
      } catch {
        setWsConnected(false);
      }
    };

    connect();
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [settings.wsUrl, goThreat, goCaptured, settings.demoPhone, settings.demoUpi]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => () => stopTimer(), [stopTimer]);

  // ── Background & accent colours per state ─────────────────────────────────
  const bg = {
    idle:     'bg-[#06060a]',
    threat:   'bg-[#0f0202]',
    captured: 'bg-[#020f04]',
  }[dashState];

  const glow = {
    idle:     'shadow-[inset_0_0_200px_rgba(16,185,129,0.04)]',
    threat:   'shadow-[inset_0_0_200px_rgba(220,38,38,0.12)]',
    captured: 'shadow-[inset_0_0_200px_rgba(16,185,129,0.15)]',
  }[dashState];

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className={`flex flex-col flex-1 h-full w-full ${bg} ${glow} text-white transition-colors duration-700 relative overflow-hidden`}
      style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace" }}
    >
      {/* Settings Overlay */}
      {showSettings && (
        <SettingsOverlay
          settings={settings}
          onSave={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* ── Header Bar ── */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/60 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                dashState === 'idle'     ? 'bg-emerald-500' :
                dashState === 'threat'   ? 'bg-red-500 animate-pulse' :
                                           'bg-emerald-400'
              }`}
            />
            <span className="text-[10px] font-mono text-zinc-500 tracking-[0.3em] uppercase">
              {dashState === 'idle'     ? 'STANDBY' :
               dashState === 'threat'  ? 'ACTIVE INTERCEPT' :
                                          'CASE CLOSED'}
            </span>
          </div>
          <span className="hidden sm:block text-zinc-700 font-mono text-[10px] tracking-widest">
            TRUECALLER FRAUD HONEYPOT SYSTEM v1.0
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Keyboard hint */}
          {dashState !== 'captured' && (
            <div className="hidden md:flex items-center gap-1.5 text-[10px] font-mono text-zinc-700">
              <kbd className="border border-zinc-700 rounded px-1.5 py-0.5 text-zinc-500">SPACE</kbd>
              <span>advance</span>
              <kbd className="border border-zinc-700 rounded px-1.5 py-0.5 text-zinc-500">R</kbd>
              <span>reset</span>
            </div>
          )}

          <SystemTime />

          {/* WS status */}
          <div className="flex items-center gap-1.5">
            {wsConnected
              ? <Wifi size={12} className="text-emerald-600" />
              : <WifiOff size={12} className="text-zinc-700" />}
          </div>

          <button
            onClick={() => setShowSettings(true)}
            className="text-zinc-600 hover:text-zinc-300 transition-colors"
            aria-label="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      {dashState === 'idle' && <IdleScreen wsConnected={wsConnected} />}

      {dashState === 'threat' && threatInfo && (
        <ThreatScreen info={threatInfo} elapsed={elapsed} />
      )}

      {dashState === 'captured' && capturedInfo && (
        <CapturedScreen info={capturedInfo} />
      )}

      {/* ── Footer Shortcut Bar ── */}
      <footer className="flex items-center justify-center gap-3 px-5 py-2 border-t border-zinc-900/80 shrink-0">
        {dashState !== 'threat' && dashState !== 'captured' && (
          <button
            onClick={() => goThreat(settings.demoPhone)}
            className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-600 hover:text-red-400 transition-colors px-3 py-1.5 rounded border border-zinc-800 hover:border-red-800"
          >
            <PhoneIncoming size={10} />
            SIMULATE CALL
          </button>
        )}
        {dashState === 'threat' && (
          <button
            onClick={() => goCaptured(settings.demoUpi)}
            className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-600 hover:text-emerald-400 transition-colors px-3 py-1.5 rounded border border-zinc-800 hover:border-emerald-800"
          >
            <Zap size={10} />
            TRIGGER CAPTURE
          </button>
        )}
        {(dashState === 'threat' || dashState === 'captured') && (
          <button
            onClick={goIdle}
            className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-600 hover:text-white transition-colors px-3 py-1.5 rounded border border-zinc-800 hover:border-zinc-500"
          >
            <Radio size={10} />
            RESET
          </button>
        )}
        {dashState === 'captured' && (
          <button
            onClick={() => goThreat(settings.demoPhone)}
            className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-600 hover:text-red-400 transition-colors px-3 py-1.5 rounded border border-zinc-800 hover:border-red-800"
          >
            <ChevronRight size={10} />
            NEW CALL
          </button>
        )}
      </footer>
    </div>
  );
};
