
import React from 'react';
import { ChatSession, AIMode } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: (mode: AIMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sessions, activeSessionId, onSelectSession, onNewChat }) => {
  return (
    <div className="w-72 h-screen flex flex-col bg-[#050B18] border-r border-slate-800/50 p-4 transition-all duration-300">
      <div className="flex flex-col items-center gap-2 mb-10 px-2 pt-4">
        <div className="w-16 h-16 rounded-full overflow-hidden logo-halo bg-white/5 flex items-center justify-center p-1">
          <img 
            src="https://images.squarespace-cdn.com/content/v1/6604107844089e504c35e364/1103c004-7128-44e2-97be-21db33f26cf9/KA+logo+02+PNG.png" 
            alt="Kanglei AI Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <div className="text-center mt-2">
          <h1 className="brand-font text-xl font-bold tracking-[0.2em] text-white text-glow">KANGLEI</h1>
          <p className="text-[9px] text-cyan-400 uppercase tracking-[0.3em] font-bold opacity-80">Artificial Intelligence</p>
          <p className="text-[8px] text-slate-500 mt-1 italic">Founded by Rakesh Irom from Manipur</p>
        </div>
      </div>

      <button 
        onClick={() => onNewChat(AIMode.CHAT)}
        className="w-full mb-6 py-3 px-4 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 rounded-xl text-sm font-semibold text-blue-400 transition-all flex items-center justify-center gap-2 group active-scale"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        NEW CONVERSATION
      </button>

      <div className="flex-1 overflow-y-auto space-y-2">
        <p className="text-[10px] font-bold text-slate-500 px-3 mb-3 uppercase tracking-widest">History</p>
        {sessions.length === 0 ? (
          <div className="px-3 py-6 text-xs text-slate-600 italic text-center bg-slate-900/20 rounded-xl border border-dashed border-slate-800">
            Your intelligence history will appear here.
          </div>
        ) : (
          sessions.map(session => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-medium transition-all truncate border active-scale ${
                activeSessionId === session.id 
                ? 'bg-slate-900 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(0,242,255,0.1)]' 
                : 'text-slate-400 border-transparent hover:bg-slate-900/50 hover:text-slate-200'
              }`}
            >
              {session.title}
            </button>
          ))
        )}
      </div>

      <div className="mt-auto pt-4 space-y-2">
        {/* App Install Visual Prompt */}
        <div className="p-3 bg-cyan-600/5 border border-cyan-500/20 rounded-2xl mb-2">
           <div className="flex items-center gap-2 mb-1">
              <svg className="w-3 h-3 text-cyan-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z" /></svg>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">App Mode</span>
           </div>
           <p className="text-[9px] text-slate-500 leading-tight">Add to Home Screen for a native app experience.</p>
        </div>

        <div className="flex items-center gap-3 px-3 py-3 bg-slate-900/30 rounded-2xl border border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-900/20">
            RI
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate tracking-tight text-slate-200">Rakesh Irom</p>
            <p className="text-[10px] text-cyan-500/70 uppercase font-bold tracking-tighter">Founder & Innovator</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
