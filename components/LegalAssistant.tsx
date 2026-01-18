import React, { useState, useRef } from 'react';
import { Ticket } from '../types';
import { generateLegalDefense } from '../services/openRouterService';
import { translations } from '../services/localization';
import { Gavel, Loader2, FileText, CheckCircle2, Upload, AlertTriangle, X, Paperclip } from 'lucide-react';

interface LegalAssistantProps {
  tickets: Ticket[];
  lang: string;
}

const MAX_PDF_SIZE = 500 * 1024; // 500KB em bytes

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
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > MAX_PDF_SIZE) {
      setError(t.pdf_size_error);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setPdfFile(file);
  };

  const handleGenerate = async () => {
    if (!selectedTicket) return;
    setLoading(true);
    setError(null);
    try {
      const extraContext = pdfFile ? `Documento de notificação anexado: ${pdfFile.name}. Analise os factos com base no auto de notícia.` : "";
      const text = await generateLegalDefense({ ...selectedTicket, extraContext }, lang);
      setDefenseText(text);
    } catch (err) {
      console.error(err);
      setError("Falha ao processar requerimento. Verifique a ligação.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setDefenseText(null);
    setSelectedTicket(null);
    setPdfFile(null);
    setError(null);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl">
            <Gavel size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight dark:text-white">{t.legal_assistant}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocolo de Defesa Ativo</p>
          </div>
        </div>

        {!defenseText ? (
          <div className="space-y-8">
            {/* Step 1: Select Incident */}
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">1. Selecione o incidente:</label>
              <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto no-scrollbar">
                {tickets.length === 0 ? (
                  <div className="p-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Sem registos no seu perfil</p>
                  </div>
                ) : (
                  tickets.map(ticket => (
                    <button 
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-5 rounded-2xl border-2 transition-all text-left flex items-center justify-between ${selectedTicket?.id === ticket.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-200'}`}
                    >
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-full text-[8px] font-black uppercase text-slate-500">{ticket.category}</span>
                          <span className="text-[8px] font-bold text-slate-400">{new Date(ticket.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs font-bold dark:text-white line-clamp-1">{ticket.aiSummary || ticket.description}</p>
                      </div>
                      {selectedTicket?.id === ticket.id && <CheckCircle2 size={16} className="text-indigo-600 ml-4 flex-shrink-0" />}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Step 2: Attach PDF */}
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">2. Anexo Obrigatório (Opcional):</label>
              <div className="relative">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf" 
                  className="hidden" 
                />
                {!pdfFile ? (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active-press"
                  >
                    <Upload size={24} className="text-slate-400" />
                    <div className="text-center">
                      <p className="text-xs font-bold dark:text-white uppercase">{t.upload_pdf}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">PDF Máx: 500KB</p>
                    </div>
                  </button>
                ) : (
                  <div className="w-full p-5 bg-green-50 dark:bg-green-900/10 border-2 border-green-500/30 rounded-3xl flex items-center justify-between animate-in zoom-in-95">
                    <div className="flex items-center gap-3">
                      <Paperclip size={18} className="text-green-600" />
                      <div>
                        <p className="text-xs font-bold text-green-700 dark:text-green-400 line-clamp-1">{pdfFile.name}</p>
                        <p className="text-[9px] font-black text-green-600/60 uppercase">{(pdfFile.size / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>
                    <button onClick={() => setPdfFile(null)} className="p-2 text-green-700/50 hover:text-green-700">
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-600 animate-in slide-in-from-top-2">
                <AlertTriangle size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
              </div>
            )}

            <button 
              disabled={!selectedTicket || loading}
              onClick={handleGenerate}
              className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-3 disabled:bg-slate-200 dark:disabled:bg-slate-800 active-press transition-all"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
              {loading ? t.generating : t.generate_defense}
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in zoom-in-95 duration-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle2 size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">{t.defense_ready}</span>
              </div>
              <button 
                onClick={() => {
                  const blob = new Blob([defenseText], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Defesa_Vigilante_${selectedTicket?.id?.substring(0,6)}.txt`;
                  a.click();
                }}
                className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
              >
                Download TXT
              </button>
            </div>
            
            <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-800 max-h-[500px] overflow-y-auto no-scrollbar custom-serif shadow-inner">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{defenseText}</p>
            </div>

            <button 
              onClick={reset}
              className="w-full py-5 bg-slate-900 dark:bg-indigo-950 text-white rounded-2xl font-black uppercase text-xs tracking-widest active-press"
            >
              Nova Contestação
            </button>
          </div>
        )}
      </div>

      <div className="text-center p-4">
        <p className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em]">Protocolo Jurídico Vigilante v1.2</p>
      </div>
    </div>
  );
};

export default LegalAssistant;