import React, { useState, useRef, useEffect } from 'react';
import { askVigilanteAssistant } from '../services/openRouterService';
import { translations } from '../services/localization';
import { MessageCircle, Send, User, Shield, Loader2 } from 'lucide-react';

interface VigilanteChatProps {
  lang: string;
}

const VigilanteChat: React.FC<VigilanteChatProps> = ({ lang }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = translations[lang as keyof typeof translations];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await askVigilanteAssistant(userMsg, lang);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col h-full overflow-hidden">
        
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Shield size={24} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase dark:text-white tracking-tight">Vigilante</h3>
            <p className="text-[9px] font-black text-green-500 uppercase tracking-widest">Assistente Especializado Online</p>
          </div>
        </div>

        <div ref={scrollRef} className="flex-grow p-6 overflow-y-auto no-scrollbar space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <MessageCircle size={48} className="text-slate-300 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.chat_placeholder}</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-3xl text-xs font-medium ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-800 dark:text-white rounded-tl-none border border-slate-100 dark:border-slate-700'}`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-3xl rounded-tl-none animate-pulse">
                <Loader2 size={16} className="animate-spin text-slate-400" />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-50 dark:border-slate-800">
          <div className="relative flex items-center">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.chat_placeholder}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 p-4 pr-16 rounded-2xl outline-none focus:border-indigo-500 dark:text-white text-xs font-bold transition-all"
            />
            <button 
              onClick={handleSend}
              className="absolute right-2 p-3 bg-indigo-600 text-white rounded-xl shadow-lg active-press transition-all"
            >
              <Send size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VigilanteChat;
