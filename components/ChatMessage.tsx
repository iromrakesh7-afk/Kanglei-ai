
import React, { useState } from 'react';
import { Message } from '../types';
import { speakText, playAudio } from '../services/geminiService';

interface ChatMessageProps {
  message: Message;
  onSuggestionClick?: (text: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSuggestionClick }) => {
  const isUser = message.role === 'user';
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = async () => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      const audioBase64 = await speakText(message.content);
      if (audioBase64) {
        const source = await playAudio(audioBase64);
        source.onended = () => setIsSpeaking(false);
      } else {
        setIsSpeaking(false);
      }
    } catch (e) {
      console.error("Audio playback error", e);
      setIsSpeaking(false);
    }
  };

  return (
    <div className={`flex w-full mb-10 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex max-w-[90%] sm:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-4`}>
        <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-lg ${
          isUser ? 'bg-cyan-600 shadow-cyan-900/20' : 'bg-slate-900 border border-slate-700 overflow-hidden logo-halo'
        }`}>
          {isUser ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          ) : (
            <img 
              src="https://images.squarespace-cdn.com/content/v1/6604107844089e504c35e364/1103c004-7128-44e2-97be-21db33f26cf9/KA+logo+02+PNG.png" 
              alt="Kanglei AI"
              className="w-full h-full object-contain p-0.5"
            />
          )}
        </div>
        
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`relative px-5 py-4 rounded-3xl text-sm leading-relaxed shadow-xl group ${
            isUser 
            ? 'bg-gradient-to-br from-blue-700 to-blue-800 text-white rounded-tr-none' 
            : 'bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-200 rounded-tl-none'
          }`}>
            {/* User Attachments Preview */}
            {isUser && message.attachments && message.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {message.attachments.map((att, i) => (
                  <div key={i} className="bg-white/10 p-1.5 rounded-lg border border-white/20 flex items-center gap-2">
                    {att.mimeType.startsWith('image/') ? (
                      <img src={att.url} className="w-8 h-8 rounded object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-[10px] font-bold">DOC</div>
                    )}
                    <span className="text-[10px] max-w-[80px] truncate">{att.name}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="whitespace-pre-wrap">{message.content}</div>
            
            {!isUser && (
              <button 
                onClick={handleSpeak}
                disabled={isSpeaking}
                className={`absolute -right-12 top-0 p-2 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all ${isSpeaking ? 'animate-pulse text-cyan-400' : 'text-slate-400 opacity-0 group-hover:opacity-100'}`}
              >
                {isSpeaking ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                )}
              </button>
            )}

            {message.imageUrl && (
              <div className="mt-5 rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl ring-1 ring-white/5">
                <img src={message.imageUrl} alt="Generated Content" className="max-w-full h-auto block hover:scale-[1.02] transition-transform duration-500" />
              </div>
            )}
            
            {message.groundingUrls && message.groundingUrls.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-800/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-3 bg-cyan-500 rounded-full"></div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Kanglei Insights Engine</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {message.groundingUrls.map((link, idx) => (
                    <a 
                      key={idx} 
                      href={link.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 hover:border-cyan-500/50 border border-transparent rounded-lg text-[10px] text-cyan-400 flex items-center gap-2 transition-all shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      </svg>
                      {link.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Perplexity style suggestions */}
          {!isUser && message.suggestions && message.suggestions.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {message.suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => onSuggestionClick?.(s)}
                  className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-900/40 text-[11px] text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <span className="text-[10px] text-slate-600 mt-2 px-2 font-medium tracking-wide">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
