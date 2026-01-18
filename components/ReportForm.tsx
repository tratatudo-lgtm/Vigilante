import React, { useState, useRef } from 'react';
import { analyzeReport, generateVoiceAlert } from '../services/geminiService';
import { createTicket, auth, uploadImage } from '../services/firebase';
import { Location, ReportCategory, Severity } from '../types';
import { translations } from '../services/localization';
// Added X and AlertCircle to imports
import { Camera, MapPin, Send, Loader2, Image as ImageIcon, CheckCircle2, X, AlertCircle } from 'lucide-react';

interface ReportFormProps {
  location: Location | null;
  onSuccess: () => void;
  onRequestLocation: () => void;
  voiceAlertsEnabled: boolean;
  lang: 'pt' | 'en';
}

const ReportForm: React.FC<ReportFormProps> = ({ location, onSuccess, onRequestLocation, voiceAlertsEnabled, lang }) => {
  const [description, setDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[lang];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !location) return;

    setIsProcessing(true);
    try {
      let imageUrl = undefined;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, auth.currentUser.uid);
      }

      const analysis = await analyzeReport(description, lang, imagePreview || undefined);

      await createTicket({
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Anonymous',
        description,
        category: analysis.category,
        severity: analysis.severity,
        location,
        imageUrl: imageUrl,
        aiSummary: analysis.summary
      });

      if (voiceAlertsEnabled) {
        generateVoiceAlert(analysis.category, analysis.severity, analysis.summary, lang);
      }

      onSuccess();
    } catch (error) {
      console.error(error);
      alert(lang === 'pt' ? "Erro ao enviar relatório." : "Error reporting issue.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">{t.description_placeholder}</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full h-32 p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-indigo-500 outline-none transition-all resize-none text-sm font-medium dark:text-white"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-6 rounded-[1.8rem] border-2 transition-all active-press ${imagePreview ? 'border-green-500 bg-green-50 dark:bg-green-900/10 text-green-600' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400'}`}
        >
          {imagePreview ? <CheckCircle2 size={24} /> : <Camera size={24} />}
          <span className="text-[9px] font-black uppercase tracking-widest mt-2">{imagePreview ? 'Foto Carregada' : t.add_photo}</span>
        </button>
        <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />

        <button
          type="button"
          onClick={onRequestLocation}
          className={`flex flex-col items-center justify-center p-6 rounded-[1.8rem] border-2 transition-all active-press ${location ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400'}`}
        >
          <MapPin size={24} />
          <span className="text-[9px] font-black uppercase tracking-widest mt-2">{location ? 'Local Definido' : t.select_location}</span>
        </button>
      </div>

      {imagePreview && (
        <div className="relative w-full aspect-video rounded-[1.8rem] overflow-hidden border-2 border-slate-100 dark:border-slate-800">
          <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
          <button 
            type="button" 
            onClick={() => { setImageFile(null); setImagePreview(null); }}
            className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full backdrop-blur-md active-press"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessing || !location || !description}
        className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-black uppercase text-xs tracking-[0.2em] rounded-[1.5rem] shadow-xl shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-3 transition-all active-press"
      >
        {isProcessing ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            {t.processing}
          </>
        ) : (
          <>
            <Send size={20} />
            {t.submit_report}
          </>
        )}
      </button>

      {!location && !isProcessing && (
        <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-900/20 py-3 rounded-xl border border-amber-100 dark:border-amber-900/30">
          <AlertCircle size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{t.location_required}</span>
        </div>
      )}
    </form>
  );
};

export default ReportForm;