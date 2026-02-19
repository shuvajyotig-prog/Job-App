import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { createCoachChat } from '../services/gemini';
import { Chat, GenerateContentResponse } from "@google/genai";
import { Send, Mic, Loader2, Bot, User, StopCircle } from 'lucide-react';
import { blobToBase64 } from '../utils/audioUtils';

interface CoachTabProps {
  userProfile: UserProfile;
}

export const CoachTab: React.FC<CoachTabProps> = ({ userProfile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hey ${userProfile.name.split(' ')[0]}! 👋 I'm your personal career coach. I've analyzed your profile and I'm ready to help. Want to work on your resume, prep for an interview, or just chat about your career path?`,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Initialize chat session
    const chat = createCoachChat(userProfile);
    setChatSession(chat);
  }, [userProfile]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !chatSession) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const result = await chatSession.sendMessageStream({ message: userMsg.text });
      
      let fullResponse = "";
      const modelMsgId = (Date.now() + 1).toString();
      
      // Add placeholder for streaming
      setMessages(prev => [...prev, {
          id: modelMsgId,
          role: 'model',
          text: '',
          timestamp: new Date()
      }]);

      for await (const chunk of result) {
          const c = chunk as GenerateContentResponse;
          const text = c.text || "";
          fullResponse += text;
          
          setMessages(prev => prev.map(msg => 
              msg.id === modelMsgId ? { ...msg, text: fullResponse } : msg
          ));
      }
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "Sorry, I'm having trouble connecting right now. Try again?",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = handleStopRecording;
      recorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error("Mic error", e);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleStopRecording = async () => {
    if (!chatSession || audioChunksRef.current.length === 0) return;

    const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const base64Audio = await blobToBase64(blob);

    // Add audio message placeholder to UI
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: "🎤 Voice Message",
      timestamp: new Date(),
      isAudio: true
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
       // Send multimodal message
       // Fix: Pass parts array directly to message property, not nested in an object
       const result = await chatSession.sendMessageStream({
         message: [
             { inlineData: { mimeType: 'audio/webm', data: base64Audio } },
             { text: "Please respond to this voice message." }
         ]
       });

       let fullResponse = "";
       const modelMsgId = (Date.now() + 1).toString();
      
       setMessages(prev => [...prev, {
          id: modelMsgId,
          role: 'model',
          text: '',
          timestamp: new Date()
       }]);

       for await (const chunk of result) {
          const c = chunk as GenerateContentResponse;
          const text = c.text || "";
          fullResponse += text;
          
          setMessages(prev => prev.map(msg => 
              msg.id === modelMsgId ? { ...msg, text: fullResponse } : msg
          ));
       }

    } catch (e) {
       console.error("Audio chat error", e);
    } finally {
       setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#efeae2] relative overflow-hidden">
        {/* WhatsApp-style Background Pattern Overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
             style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}>
        </div>

        {/* Chat Header */}
        <div className="bg-white border-b border-slate-200 p-4 flex items-center gap-4 shadow-sm z-10 sticky top-0">
           <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Bot size={24} />
           </div>
           <div>
              <h2 className="font-bold text-slate-900">GigCoach AI</h2>
              <div className="flex items-center gap-1.5">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                 <span className="text-xs text-slate-500 font-medium">Online</span>
              </div>
           </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar z-0 pb-24">
           {messages.map((msg) => {
             const isUser = msg.role === 'user';
             return (
               <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm relative ${
                      isUser 
                      ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-none' 
                      : 'bg-white text-slate-900 rounded-tl-none'
                    }`}
                  >
                     {/* Triangle tail */}
                     <div className={`absolute top-0 w-0 h-0 border-[8px] border-transparent ${
                         isUser 
                         ? 'right-[-8px] border-t-[#d9fdd3] border-l-[#d9fdd3]' 
                         : 'left-[-8px] border-t-white border-r-white'
                     }`}></div>

                     {msg.isAudio ? (
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                           <Mic size={18} /> Voice Message
                        </div>
                     ) : (
                        <div className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">
                           {msg.text}
                        </div>
                     )}
                     <div className={`text-[10px] mt-1 text-right ${isUser ? 'text-green-800/60' : 'text-slate-400'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </div>
                  </div>
               </div>
             );
           })}
           
           {isTyping && (
             <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                </div>
             </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-[#f0f2f5] p-3 md:p-4 border-t border-slate-200 z-10 sticky bottom-0">
           <div className="max-w-4xl mx-auto flex items-end gap-2">
              <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center px-4 py-2">
                 <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="w-full max-h-32 bg-transparent border-none focus:ring-0 resize-none py-2 text-slate-900 placeholder:text-slate-400 custom-scrollbar"
                    rows={1}
                 />
              </div>
              
              {inputText.trim() ? (
                <button 
                  onClick={handleSendMessage}
                  className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors transform active:scale-95 flex-shrink-0"
                >
                   <Send size={20} className="ml-0.5" />
                </button>
              ) : (
                <button 
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all transform active:scale-95 flex-shrink-0 ${
                    isRecording 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                   {isRecording ? <StopCircle size={24} /> : <Mic size={24} />}
                </button>
              )}
           </div>
           {isRecording && (
              <div className="text-center text-xs text-red-500 font-bold mt-2 animate-pulse">
                 Recording... Tap to send
              </div>
           )}
        </div>
    </div>
  );
};
