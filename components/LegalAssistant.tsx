import React, { useState, useRef } from 'react';
import { Ticket } from '../types.ts';
import { generateLegalDefense } from '../services/openRouterService.ts';
import { translations } from '../services/localization.ts';
import { Gavel, Loader2, FileText, CheckCircle2, Upload, AlertTriangle, X, Paperclip } from 'lucide-react';

interface LegalAssistantProps {
  tickets: Ticket[];
  lang: string;
}

const MAX_PDF_SIZE = 500 * 1024;

const LegalAssistant: React.FC<LegalAssistantProps> = ({ tickets, lang }) => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [defenseText, setDefenseText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const t = translations[lang as keyof typeof translations];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError(t.pdf_type_error);
      return;
    }
    if (file.size > MAX_PDF_SIZE) {
      setError(t.pdf_size_error);
      return;
    }
    setPdfFile(file);
  };

  const handleGenerate = async () => {
    if (!selectedTicket) return;
    setLoading(true);
    setError(null);
    try {
      const extraContext = pdfFile ? `Documento PDF anexado: ${pdfFile.name}.` : "";
      const text = await generateLegalDefense({ ...selectedTicket, extraContext }, lang);
      setDefenseText(text);
    } catch (err) {
      setError("Erro de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl">
            <Gavel size={24} />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight dark:text-white">{t.legal_assistant}</h3>
        </div>

        {!defenseText ? (
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">1. Selecione o incidente:</label>
              <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto no-scrollbar">
                {tickets.map(ticket => (
                  <button 
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-5 rounded-2xl border-2 transition-all text-left ${selectedTicket?.id === ticket.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-50 dark:border-slate-800'}`}
                  >
                    <p className="text-xs font-bold dark:text-white line-clamp-1">{ticket.aiSummary || ticket.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">2. Anexo Notificação (Opcional):</label>
              <div className="relative">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
                {!pdfFile ? (
                  <button onClick={() => fileInputRef.current?.click()} className="w-full p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center gap-2">
                    <Upload size={20} className="text-slate-400" />
                    <p className="text-[10px] font-black uppercase text-slate-500">{t.upload_pdf}</p>
                  </button>
                ) : (
                  <div className="p-4 bg-green-50 dark:bg-green-900/10 border-2 border-green-500/30 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Paperclip size={16} className="text-green-600" />
                      <span className="text-xs font-bold text-green-700 truncate max-w-[150px]">{pdfFile.name}</span>
                    </div>
                    <button onClick={() => setPdfFile(null)}><X size={14} /></button>
                  </div>
                )}
              </div>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold uppercase">{error}</div>}

            <button 
              disabled={!selectedTicket || loading} 
              onClick={handleGenerate}
              className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-3 active-press transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
              {loading ? t.generating : t.generate_defense}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 max-h-[400px] overflow-y-auto">
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{defenseText}</p>
            </div>
            <button onClick={() => setDefenseText(null)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs">Nova Defesa</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalAssistant;