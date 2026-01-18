import React, { useState } from 'react';
import { UserSettings } from '../types';
import { translations } from '../services/localization';
import { 
  Shield, 
  Moon, 
  Sun, 
  Monitor, 
  User, 
  Languages, 
  Lock, 
  Trash2, 
  Download,
  LogOut,
  Check,
  Edit3,
  Type,
  FileText,
  Save,
  ChevronRight,
  Eye
} from 'lucide-react';
import { auth } from '../services/firebase';

interface SettingsMenuProps {
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onExportData: () => void;
  onDeleteAccount: () => void;
  onLogoutRequest: () => void;
}

const flags = {
  pt: 'https://flagcdn.com/w80/pt.png',
  en: 'https://flagcdn.com/w80/gb.png',
  es: 'https://flagcdn.com/w80/es.png',
  fr: 'https://flagcdn.com/w80/fr.png',
  de: 'https://flagcdn.com/w80/de.png'
};

const SettingsMenu: React.FC<SettingsMenuProps> = ({ settings, onUpdateSettings, onExportData, onDeleteAccount, onLogoutRequest }) => {
  const user = auth.currentUser;
  const t = translations[settings.language];
  
  const [tempUsername, setTempUsername] = useState(settings.usernameOverride || user?.displayName || '');
  const [tempBio, setTempBio] = useState(settings.bio || '');
  const [isLangOpen, setIsLangOpen] = useState(false);

  const handleSaveProfile = () => {
    onUpdateSettings({ 
      usernameOverride: tempUsername, 
      bio: tempBio 
    });
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 🪟 JANELA: Perfil do Agente */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
            <User className="text-indigo-600" size={20} />
            {t.settings_account}
          </h3>
          <button onClick={onLogoutRequest} className="p-2 text-slate-400 hover:text-red-500 active-press transition-all">
            <LogOut size={20} />
          </button>
        </div>
        
        <div className="p-8 space-y-8">
          <div className="flex items-center gap-6 mb-4">
            <div className="relative group">
              <img 
                src={user?.photoURL || `https://ui-avatars.com/api/?name=${tempUsername}&background=6366f1&color=fff`} 
                className="w-24 h-24 rounded-[2rem] border-4 border-white dark:border-slate-800 shadow-2xl transition-transform group-hover:scale-105" 
                alt="Profile" 
              />
              <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-xl shadow-lg">
                <Edit3 size={14} />
              </div>
            </div>
            <div className="flex-grow">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Status de Rede</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Encriptado & Ativo</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                <Type size={12} /> {t.username_label}
              </label>
              <input 
                type="text" 
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                placeholder="Ex: Agente_007"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 p-5 rounded-2xl outline-none focus:border-indigo-500 dark:text-white font-bold transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                <FileText size={12} /> {t.bio_label}
              </label>
              <textarea 
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
                placeholder="Uma breve descrição da sua missão..."
                className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 p-5 rounded-2xl outline-none focus:border-indigo-500 dark:text-white font-medium transition-all h-24 resize-none"
              />
            </div>
          </div>

          <button 
            onClick={handleSaveProfile}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-3 transition-all active-press"
          >
            <Save size={18} /> {t.save_changes}
          </button>
        </div>
      </div>

      {/* 🪟 JANELA: Idiomas (Colapsável) */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <button 
          onClick={() => setIsLangOpen(!isLangOpen)}
          className="w-full p-8 flex items-center justify-between group active-press"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl">
              <Languages size={22} />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.settings_lang}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ativo: {translations[settings.language].settings_lang.split(' ')[0]}</p>
            </div>
          </div>
          <ChevronRight size={24} className={`text-slate-300 transition-transform duration-300 ${isLangOpen ? 'rotate-90' : ''}`} />
        </button>

        {isLangOpen && (
          <div className="p-8 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            {[
              { id: 'pt', label: 'Português', flag: flags.pt },
              { id: 'en', label: 'English', flag: flags.en },
              { id: 'es', label: 'Español', flag: flags.es },
              { id: 'fr', label: 'Français', flag: flags.fr },
              { id: 'de', label: 'Deutsch', flag: flags.de }
            ].map(l => (
              <button
                key={l.id}
                onClick={() => onUpdateSettings({ language: l.id as any })}
                className={`relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all active-press ${settings.language === l.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-200 dark:hover:border-slate-700'}`}
              >
                <img src={l.flag} alt={l.label} className="w-10 h-7 object-cover rounded shadow-md border border-white/20" />
                <span className="text-xs font-black uppercase tracking-widest flex-grow text-left">{l.label}</span>
                {settings.language === l.id && <Check size={16} strokeWidth={4} />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 🪟 JANELA: Sistema & Tema */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-8">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-3">
          <Shield className="text-indigo-600" size={16} />
          {t.settings_system}
        </h3>
        
        <div className="space-y-6">
          {/* Voice Alerts Toggle */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {t.settings_voice}
              </label>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Anúncios por IA</p>
            </div>
            <button 
              onClick={() => onUpdateSettings({ voiceAlertsEnabled: !settings.voiceAlertsEnabled })}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all active-press ${settings.voiceAlertsEnabled ? 'bg-indigo-600 shadow-lg' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-all shadow-sm ${settings.voiceAlertsEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Show Radars Toggle */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <Eye size={14} className="text-red-500" />
                {t.show_radars}
              </label>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Portugal & Espanha</p>
            </div>
            <button 
              onClick={() => onUpdateSettings({ showRadars: !settings.showRadars })}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all active-press ${settings.showRadars ? 'bg-red-500 shadow-lg' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-all shadow-sm ${settings.showRadars ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Theme Selector */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'light', icon: Sun, label: 'Luz' },
              { id: 'dark', icon: Moon, label: 'Noite' },
              { id: 'system', icon: Monitor, label: 'Auto' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => onUpdateSettings({ theme: m.id as any })}
                className={`flex flex-col items-center justify-center p-5 rounded-3xl border-2 transition-all active-press ${settings.theme === m.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 shadow-sm' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
              >
                <m.icon size={20} className="mb-2" />
                <span className="text-[9px] font-black uppercase tracking-widest">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🪟 JANELA: Privacidade / GDPR */}
      <div className="bg-slate-900 dark:bg-indigo-950/20 rounded-[2.5rem] border border-slate-800 p-10 space-y-8 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-800 text-indigo-400 rounded-2xl">
            <Lock size={22} />
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">{t.gdpr_title}</h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocolo de Proteção Ativo</p>
          </div>
        </div>
        
        <p className="text-xs text-slate-400 leading-relaxed font-medium">{t.gdpr_desc}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={onExportData} className="flex items-center justify-center gap-3 py-5 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active-press transition-all hover:bg-slate-100">
            <Download size={16} /> {t.gdpr_export}
          </button>
          <button onClick={onDeleteAccount} className="flex items-center justify-center gap-3 py-5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest active-press transition-all hover:bg-red-500/20">
            <Trash2 size={16} /> {t.gdpr_delete}
          </button>
        </div>
      </div>

      <div className="text-center pt-8">
        <p className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.5em] flex items-center justify-center gap-4">
          <span>VIGILANTE AI</span>
          <span className="w-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full"></span>
          <span>v2.8.5.PRO</span>
          <span className="w-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full"></span>
          <span>EU-SECURE</span>
        </p>
      </div>
    </div>
  );
};

export default SettingsMenu;