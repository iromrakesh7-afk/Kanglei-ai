
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import { AIMode, Message, ChatSession, Attachment } from './types';
import { generateResponse, generateTitle } from './services/geminiService';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AIMode>(AIMode.CHAT);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [sessions, isLoading]);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      const newAtt: Attachment = {
        name: file.name,
        mimeType: file.type,
        data: base64,
        url: URL.createObjectURL(file)
      };
      setAttachments(prev => [...prev, newAtt]);
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (textOverride?: string, e?: React.FormEvent) => {
    e?.preventDefault();
    const finalInput = textOverride || input;
    if (!finalInput.trim() && attachments.length === 0 || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: finalInput,
      timestamp: Date.now(),
      mode: mode,
      attachments: attachments
    };

    let currentSessionId = activeSessionId;
    let updatedSessions = [...sessions];

    if (!activeSessionId) {
      const newId = Date.now().toString();
      currentSessionId = newId;
      const newSession: ChatSession = {
        id: newId,
        title: 'New Investigation',
        messages: [userMessage]
      };
      updatedSessions = [newSession, ...sessions];
      setSessions(updatedSessions);
      setActiveSessionId(newId);
    } else {
      updatedSessions = sessions.map(s => 
        s.id === activeSessionId 
        ? { ...s, messages: [...s.messages, userMessage] } 
        : s
      );
      setSessions(updatedSessions);
    }

    setInput('');
    setAttachments([]);
    setIsLoading(true);

    try {
      const currentSession = updatedSessions.find(s => s.id === currentSessionId)!;
      const history = currentSession.messages.slice(0, -1).map(m => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        parts: m.attachments?.length 
          ? [{ text: m.content }, ...m.attachments.map(a => ({ inlineData: { mimeType: a.mimeType, data: a.data } }))]
          : [{ text: m.content }]
      }));

      const response = await generateResponse(finalInput, mode, history, userMessage.attachments);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
        mode: mode,
        imageUrl: response.imageUrl,
        groundingUrls: response.groundingUrls,
        suggestions: response.suggestions
      };

      setSessions(prev => {
        const newSessions = prev.map(s => 
          s.id === currentSessionId 
          ? { ...s, messages: [...s.messages, assistantMessage] } 
          : s
        );
        
        if (currentSession.messages.length === 1) {
          generateTitle(finalInput).then(title => {
            setSessions(titles => titles.map(s => s.id === currentSessionId ? { ...s, title } : s));
          });
        }
        
        return newSessions;
      });

    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Kanglei Intelligence Core encountered a multi-modal processing error. Please retry.",
        timestamp: Date.now(),
        mode: mode
      };
      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, errorMessage] } : s));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = useCallback((initialMode: AIMode) => {
    setActiveSessionId('');
    setMode(initialMode);
    setInput('');
    setAttachments([]);
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#020617] text-slate-100 overflow-hidden">
      <Sidebar 
        sessions={sessions} 
        activeSessionId={activeSessionId} 
        onSelectSession={setActiveSessionId}
        onNewChat={handleNewChat}
      />

      <main className="flex-1 flex flex-col relative bg-[radial-gradient(circle_at_center,rgba(11,30,59,0.4)_0%,transparent_100%)]">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-slate-950/60 backdrop-blur-xl z-10">
          <div className="flex items-center gap-6">
            <div className="flex bg-slate-900/80 rounded-2xl p-1.5 border border-white/5 shadow-inner">
              {[AIMode.CHAT, AIMode.SEARCH, AIMode.IMAGE].map((m) => (
                <button 
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-5 py-2 text-[10px] font-bold tracking-widest rounded-xl transition-all uppercase ${mode === m ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/30' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {m === AIMode.CHAT ? 'Intelligence Pro' : m === AIMode.SEARCH ? 'Discovery' : 'Visualizer'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] text-cyan-500 font-bold tracking-widest uppercase">Encryption Active</span>
              <span className="text-[9px] text-slate-500 font-medium tracking-tighter">Manipur Tech Hub - Node 01</span>
            </div>
            <div className="w-1 h-8 bg-slate-800 rounded-full"></div>
            <div className="text-xs text-slate-400 font-mono font-bold tracking-tighter">
              KANG-AI v3.5
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-12 space-y-6"
        >
          {!activeSession ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-32 h-32 mb-10 relative animate-float">
                <div className="absolute inset-0 bg-cyan-500/10 blur-[60px] rounded-full"></div>
                <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full"></div>
                <div className="relative z-10 w-full h-full logo-halo rounded-full bg-slate-950 p-4">
                  <img 
                    src="https://images.squarespace-cdn.com/content/v1/6604107844089e504c35e364/1103c004-7128-44e2-97be-21db33f26cf9/KA+logo+02+PNG.png" 
                    alt="Kanglei AI"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              
              <h2 className="brand-font text-5xl font-bold mb-6 bg-gradient-to-b from-white via-slate-100 to-slate-500 bg-clip-text text-transparent tracking-tight">
                Beyond Intelligence.
              </h2>
              <p className="text-slate-400 max-w-2xl mb-12 leading-relaxed text-sm font-medium tracking-wide">
                Experience the world's first AI system that combines the reasoning of Claude with the real-time search of Perplexity. Founded by <span className="text-cyan-400 font-bold">Rakesh Irom</span>.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl w-full">
                {[
                  { title: "Reasoning", icon: "🧠", prompt: "Explain complex reasoning like O1-preview.", m: AIMode.CHAT },
                  { title: "Deep Research", icon: "🌐", prompt: "Summarize the current news about Manipur development.", m: AIMode.SEARCH },
                  { title: "Multi-Modal", icon: "📁", prompt: "Upload an image or PDF for analysis.", m: AIMode.CHAT },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setMode(item.m);
                      setInput(item.prompt);
                    }}
                    className="group p-6 bg-slate-900/40 border border-slate-800 rounded-3xl text-left hover:border-cyan-500/40 transition-all hover:bg-slate-900 shadow-xl shadow-black/20"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <h3 className="text-sm font-bold mb-2 text-white group-hover:text-cyan-400 transition-colors uppercase tracking-widest">{item.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full pt-4 pb-32">
              <div className="flex flex-col gap-2 items-center mb-12 opacity-40">
                <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-cyan-500">Kanglei Neural Network: Connected</p>
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
              </div>
              {activeSession.messages.map(msg => (
                <ChatMessage 
                  key={msg.id} 
                  message={msg} 
                  onSuggestionClick={(txt) => handleSendMessage(txt)}
                />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-10 animate-pulse">
                  <div className="flex gap-4 items-start">
                    <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center logo-halo">
                      <img 
                        src="https://images.squarespace-cdn.com/content/v1/6604107844089e504c35e364/1103c004-7128-44e2-97be-21db33f26cf9/KA+logo+02+PNG.png" 
                        alt="Kanglei AI"
                        className="w-full h-full object-contain p-0.5"
                      />
                    </div>
                    <div className="px-5 py-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl rounded-tl-none">
                      <div className="flex flex-col gap-3">
                        <div className="flex gap-2 items-center">
                          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
                          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.4s]"></div>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono tracking-tighter">Analyzing context & sources...</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 sm:p-10 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent">
          <form 
            onSubmit={(e) => handleSendMessage(undefined, e)}
            className="max-w-4xl mx-auto relative group"
          >
            {/* Attachment Preview Bar */}
            {attachments.length > 0 && (
              <div className="flex gap-2 mb-3 animate-in slide-in-from-bottom-2 duration-300">
                {attachments.map((att, i) => (
                  <div key={i} className="relative group/att">
                    <div className="p-2 pr-8 bg-slate-900 border border-slate-800 rounded-xl text-xs flex items-center gap-2">
                      {att.mimeType.startsWith('image/') ? (
                        <img src={att.url} className="w-6 h-6 rounded" />
                      ) : (
                        <svg className="w-6 h-6 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                      )}
                      <span className="truncate max-w-[120px]">{att.name}</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeAttachment(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-lg"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 rounded-[30px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000"></div>
            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[28px] shadow-2xl overflow-hidden flex items-end p-2 px-3 transition-all focus-within:border-cyan-500/50">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileUpload}
                accept="image/*,application/pdf,text/*" 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  mode === AIMode.CHAT ? "Ask Kanglei anything (Upload files enabled)..." :
                  mode === AIMode.SEARCH ? "Discover the world with grounded search..." :
                  "Command Kanglei to generate high-res art..."
                }
                className="w-full bg-transparent border-none focus:ring-0 text-[15px] py-3.5 px-2 resize-none max-h-48 overflow-y-auto font-medium placeholder-slate-600"
                rows={1}
              />
              <button
                type="submit"
                disabled={(!input.trim() && attachments.length === 0) || isLoading}
                className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 disabled:grayscale text-white p-3.5 rounded-2xl transition-all shadow-xl shadow-cyan-900/20 mb-1"
              >
                {isLoading ? (
                   <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="flex justify-between mt-4 px-2">
              <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Global Intelligence Core: Manipur Hub</span>
              <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Vision by Rakesh Irom</span>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default App;
