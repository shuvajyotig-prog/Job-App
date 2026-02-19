import React, { useState } from 'react';
import { useConversation } from '@elevenlabs/react';
import { Shield, ShieldCheck, Mic, MicOff, X, AlertTriangle } from 'lucide-react';

const AGENT_ID = 'agent_4301kht6s4mcfbg82k0nrxkkpknd';

export const FraudHoneypotAgent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const conversation = useConversation({
    onConnect: () => console.log('Fraud Honeypot Agent connected'),
    onDisconnect: () => { console.log('Fraud Honeypot Agent disconnected'); setMicError(null); },
    onMessage: (message) => console.log('Message:', message),
    onError: (error) => console.error('Fraud Honeypot Agent error:', error),
    onModeChange: (mode) => console.log('Mode:', mode),
  });

  const startConversation = async () => {
    setMicError(null);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: AGENT_ID,
        connectionType: 'webrtc',
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setMicError('Microphone access denied. Please allow microphone access to use this feature.');
    }
  };

  const endConversation = async () => {
    await conversation.endSession();
  };

  const isConnected = conversation.status === 'connected';
  const isConnecting = conversation.status === 'connecting';

  return (
    <div className="fixed bottom-24 md:bottom-8 left-6 z-50 flex flex-col items-start gap-2">

      {/* Expanded Panel */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 w-72 animate-in fade-in slide-in-from-bottom-4 mb-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="text-amber-500" size={20} />
              <span className="font-semibold text-slate-800 text-sm">Fraud Honeypot Agent</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Close panel"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-xs text-slate-500 mb-4">
            Talk to our AI agent to verify job listings and detect potential scams before you apply.
          </p>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                isConnected
                  ? 'bg-green-500'
                  : isConnecting
                  ? 'bg-yellow-500 animate-pulse'
                  : 'bg-slate-300'
              }`}
            />
            <span className="text-xs text-slate-600">
              {isConnecting
                ? 'Connecting...'
                : isConnected
                ? `Agent is ${conversation.isSpeaking ? 'speaking' : 'listening'}`
                : 'Not connected'}
            </span>
          </div>

          {/* Mic Error */}
          {micError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
              <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={14} />
              <p className="text-xs text-red-700">{micError}</p>
            </div>
          )}

          {/* Action Button */}
          {isConnected ? (
            <button
              onClick={endConversation}
              className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors"
            >
              <MicOff size={16} />
              End Conversation
            </button>
          ) : (
            <button
              onClick={startConversation}
              disabled={isConnecting}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 disabled:cursor-not-allowed text-white py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors"
            >
              <Mic size={16} />
              {isConnecting ? 'Connecting...' : 'Start Conversation'}
            </button>
          )}
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Fraud Honeypot Agent"
        className={`relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 ${
          isConnected
            ? 'bg-amber-500 hover:bg-amber-600 ring-4 ring-amber-100'
            : 'bg-amber-500 hover:bg-amber-600'
        }`}
      >
        {isConnected && conversation.isSpeaking ? (
          <ShieldCheck className="text-white" size={28} />
        ) : (
          <Shield className="text-white" size={28} />
        )}

        {/* Active indicator dot */}
        {isConnected && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        )}
      </button>
    </div>
  );
};
