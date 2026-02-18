import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Wand2, AlertCircle } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { blobToBase64 } from '../utils/audioUtils';
import { SearchFilters, VoiceSearchParams } from '../types';

interface VoiceWidgetProps {
  onSearch: (params: VoiceSearchParams) => void;
}

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const VoiceWidget: React.FC<VoiceWidgetProps> = ({ onSearch }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Visualization Setup
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const updateVolume = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        setVolume(Math.min(1, avg / 50));
        rafIdRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      // Recorder Setup
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = handleRecordingStop;
      recorder.start();
      setIsRecording(true);

    } catch (error) {
      console.error("Error starting recording:", error);
      setError("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      setVolume(0);
    }
  };

  const handleRecordingStop = async () => {
    setIsProcessing(true);
    
    // Cleanup streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    try {
      if (audioChunksRef.current.length === 0) {
        throw new Error("No audio recorded");
      }

      const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
      const blob = new Blob(audioChunksRef.current, { type: mimeType });
      const base64Audio = await blobToBase64(blob);

      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest', // Robust model for multimodal
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Audio
              }
            },
            {
              text: `You are a job search assistant. Listen to the user's request and extract search parameters into a JSON object.
              
              Rules:
              - 'query': The main job title or keywords (e.g., "Junior Developer", "Marketing Manager").
              - 'location': Any city, state, or country mentioned.
              - 'remote': Set to true if "remote", "work from home", or "wfh" is mentioned.
              - 'minSalary': Convert mentions like "100k" to 100000.
              - 'jobTypes': Array of strings like "Full-time", "Contract", "Part-time" if mentioned.
              - 'experienceLevel': "Entry Level", "Mid Level", "Senior" if mentioned.
              
              If the audio is unclear, try to guess the intent or return an empty query.
              `
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              query: { type: Type.STRING },
              location: { type: Type.STRING },
              remote: { type: Type.BOOLEAN },
              minSalary: { type: Type.NUMBER },
              jobTypes: { type: Type.ARRAY, items: { type: Type.STRING } },
              experienceLevel: { type: Type.STRING }
            },
            required: ["query"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      
      const params: VoiceSearchParams = {
        query: result.query || '',
        location: result.location || '',
        filters: {
          remote: result.remote || false,
          minSalary: result.minSalary || 0,
          jobTypes: result.jobTypes || [],
          experienceLevel: result.experienceLevel || ''
        }
      };

      onSearch(params);

    } catch (error) {
      console.error("Error processing voice search:", error);
      setError("Failed to process audio");
      // Auto-hide error after 3s
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="fixed bottom-24 md:bottom-8 right-6 z-50 flex flex-col items-end gap-2">
      
      {/* Processing State */}
      {isProcessing && (
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-xl border border-blue-100 animate-in fade-in slide-in-from-bottom-4 mb-2">
          <Loader2 className="animate-spin text-blue-600" size={20} />
          <span className="text-sm font-semibold text-slate-700">Analyzing request...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-xl shadow-lg border border-red-100 animate-in fade-in slide-in-from-right-4 mb-2">
           <AlertCircle className="text-red-500" size={16} />
           <span className="text-sm font-medium text-red-700">{error}</span>
        </div>
      )}

      {/* Recording State Label with Tap to Stop */}
      {isRecording && (
        <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-red-100 text-sm font-semibold text-slate-700 transition-all animate-in fade-in slide-in-from-right-4 mr-2">
           <div className="flex flex-col items-end">
               <span className="flex items-center gap-2">
                 <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  Listening...
               </span>
               <span className="text-xs text-slate-500 mt-1">Tap icon to stop</span>
           </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Tooltip (only when idle) */}
        {!isRecording && !isProcessing && !error && (
          <div className="bg-white px-3 py-1.5 rounded-lg shadow-md border border-slate-100 text-sm font-medium text-slate-700 whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity mr-2 hidden md:block">
             Voice Search
          </div>
        )}

        <button
          onClick={toggleRecording}
          disabled={isProcessing}
          className={`relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 z-10 ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 ring-4 ring-red-100' 
              : error 
                ? 'bg-red-50 hover:bg-red-100 text-red-500 ring-2 ring-red-200'
                : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {/* Volume Visualizer Ring */}
          {isRecording && (
            <span 
              className="absolute inset-0 rounded-full bg-red-400 opacity-30 transition-transform duration-75"
              style={{ 
                transform: `scale(${1 + volume * 1.0})`,
              }}
            />
          )}

          <div className="relative z-10 text-white">
            {isProcessing ? (
               <Wand2 className="animate-pulse" size={24} /> 
            ) : isRecording ? (
               <Square fill="currentColor" size={24} />
            ) : error ? (
               <Mic size={28} className="text-red-500" />
            ) : (
               <Mic size={28} />
            )}
          </div>
        </button>
      </div>
    </div>
  );
};
