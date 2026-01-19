import React, { useState, useRef, useEffect } from 'react';
import { askVigilanteAssistant } from '../services/openRouterService.ts';
import { translations } from '../services/localization.ts';
import { MessageCircle, Send, Shield, Loader2 } from 'lucide-react';

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
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><Shield size={24} /></div>
          <div><h3 className="text-sm font-black uppercase dark:text-white">Vigilante</h3></div>
        </div>
        <div ref={scrollRef} className="flex-grow p-6 overflow-y-auto space-y-4 no-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-3xl text-xs ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 dark:text-white'}`}>{m.content}</div>
            </div>
          ))}
          {loading && <div className="flex justify-start"><Loader2 size={16} className="animate-spin" /></div>}
        </div>
        <div className="p-6 border-t border-slate-50 dark:border-slate-800">
          <div className="relative flex items-center">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={t.chat_placeholder} className="w-full bg-slate-50 dark:bg-slate-800 p-4 pr-16 rounded-2xl outline-none text-xs font-bold" />
            <button onClick={handleSend} className="absolute right-2 p-3 bg-indigo-600 text-white rounded-xl"><Send size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VigilanteChat;