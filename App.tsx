import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User } from 'firebase/auth';
import { jsPDF } from 'jspdf';
import { 
  auth, 
  loginWithGoogle, 
  logout, 
  subscribeToTickets 
} from './services/firebase';
import { Ticket, Location, UserSettings, Radar } from './types';
import { translations } from './services/localization';
import { officialRadars } from './services/radars';
import { generateRadarAlert } from './services/geminiService';
import MapView from './components/MapView';
import ReportForm from './components/ReportForm';
import SettingsMenu from './components/SettingsMenu';
import UserDashboard from './components/UserDashboard';
import LegalAssistant from './components/LegalAssistant';
import VigilanteChat from './components/VigilanteChat';
import { 
  Shield, 
  LogOut, 
  LogIn, 
  Map as MapIcon, 
  AlertCircle,
  Clock,
  User as UserIcon,
  Globe,
  Settings,
  FileDown,
  Plus,
  X,
  LayoutGrid,
  ChevronRight,
  Gavel,
  MessageCircle,
  Zap
} from 'lucide-react';

// Função utilitária para calcular distância entre dois pontos em metros
const getDistance = (p1: Location, p2: Location) => {
  const R = 6371e3; // Raio da Terra em metros
  const φ1 = p1.lat * Math.PI / 180;
  const φ2 = p2.lat * Math.PI / 180;
  const Δφ = (p2.lat - p1.lat) * Math.PI / 180;
  const Δλ = (p2.lng - p1.lng) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [viewMode, setViewMode] = useState<'dashboard' | 'map' | 'list' | 'my-reports' | 'settings' | 'ai-hub' | 'legal' | 'assistant'>('map');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [selectedLoc, setSelectedLoc] = useState<Location | null>(null);
  const [userLocation, setUserLocation] = useState<Location>({ lat: 38.7436, lng: -9.1602 });
  const [permissionError, setPermissionError] = useState<boolean>(false);
  
  // Ref para controlar quais radares já alertaram nesta sessão/passagem
  const alertedRadarsRef = useRef<Set<string>>(new Set());
  const lastAlertLocationRef = useRef<Location | null>(null);

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('vigilante_settings');
    return saved ? JSON.parse(saved) : {
      voiceAlertsEnabled: true,
      autoReportEnabled: false,
      theme: 'light',
      language: 'pt',
      gdprAccepted: true,
      showRadars: true
    };
  });

  const t = translations[settings.language as keyof typeof translations];

  useEffect(() => {
    localStorage.setItem('vigilante_settings', JSON.stringify(settings));
    if (settings.theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [settings]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;
    let unsubscribeTickets: (() => void) | undefined;
    setPermissionError(false);

    const onError = (err: any) => {
      if (err.code === 'permission-denied') setPermissionError(true);
    };

    try {
      unsubscribeTickets = subscribeToTickets(
        setTickets, 
        onError, 
        (viewMode === 'my-reports' || viewMode === 'legal') ? user?.uid : undefined
      );
    } catch (e) { console.error(e); }

    return () => unsubscribeTickets?.();
  }, [viewMode, user, loading]);

  // Monitorização em Tempo Real com Alertas de Radar
  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(newLoc);

        // Lógica de Alertas de Radar (500 metros)
        if (settings.voiceAlertsEnabled && settings.showRadars) {
          officialRadars.forEach(radar => {
            const distance = getDistance(newLoc, radar.location);
            
            // Se estiver a menos de 500m e ainda não alertou este radar nesta "sessão de aproximação"
            if (distance <= 500 && !alertedRadarsRef.current.has(radar.id)) {
              generateRadarAlert(radar.speedLimit, settings.language as any);
              alertedRadarsRef.current.add(radar.id);
              lastAlertLocationRef.current = newLoc;
            }

            // Reset do radar: se o utilizador se afastar mais de 1200m do radar alertado, removemos do Set para permitir novo alerta se voltar
            if (distance > 1200 && alertedRadarsRef.current.has(radar.id)) {
              alertedRadarsRef.current.delete(radar.id);
            }
          });
        }
      },
      (err) => console.warn("Erro de geolocalização:", err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [settings.voiceAlertsEnabled, settings.showRadars, settings.language]);

  const handleLogout = async () => {
    await logout();
    setIsLogoutConfirmOpen(false);
    setViewMode('map');
  };

  const generatePDF = (ticket: Ticket) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('VIGILANTE AI - RELATÓRIO OFICIAL', 20, 30);
    doc.setFontSize(12);
    doc.text(`ID: ${ticket.id}`, 20, 40);
    doc.text(`Categoria: ${ticket.category}`, 25, 50);
    doc.text(`Severidade: ${ticket.severity}`, 25, 60);
    doc.text(`Descrição: ${ticket.description}`, 25, 75);
    doc.text(`Sumário IA: ${ticket.aiSummary || 'N/A'}`, 25, 120);
    doc.save(`Vigilante_Report_${ticket.id}.pdf`);
  };

  if (loading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950">
      <div className="w-16 h-16 border-4 border-indigo-100 dark:border-slate-800 rounded-full"></div>
      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute"></div>
      <p className="mt-6 text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Sincronizando Sistema</p>
    </div>
  );

  return (
    <div className={`h-screen w-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden ${settings.theme === 'dark' ? 'dark' : ''}`}>
      
      {/* Header Dinâmico */}
      <header className="h-16 md:h-20 glass border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-6 z-50 safe-top">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-lg active-press">
            <Shield size={22} />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-black text-sm uppercase tracking-tighter dark:text-white">Vigilante AI</h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Status: Ativo</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden md:flex items-center gap-4 mr-4">
              <div className="text-right">
                <p className="text-xs font-black dark:text-white uppercase leading-none">{settings.usernameOverride || user.displayName?.split(' ')[0]}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Agente Ativo</p>
              </div>
              <img src={user.photoURL || ''} className="w-10 h-10 rounded-2xl border-2 border-white dark:border-slate-800 shadow-md" alt="Avatar" />
            </div>
          )}
          <button 
            onClick={() => setViewMode('settings')}
            className={`p-3 rounded-2xl active-press transition-all ${viewMode === 'settings' ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400'}`}
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="flex-grow flex relative overflow-hidden">
        
        {/* Sidebar Desktop */}
        <aside className="hidden md:flex w-24 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col items-center py-10 gap-8 z-40">
           {[
             { id: 'map', icon: MapIcon },
             { id: 'dashboard', icon: LayoutGrid },
             { id: 'list', icon: Globe },
             { id: 'ai-hub', icon: Zap },
             { id: 'my-reports', icon: UserIcon }
           ].map((m) => (
             <button 
              key={m.id}
              onClick={() => setViewMode(m.id as any)}
              className={`p-4 rounded-[1.5rem] active-press transition-all ${viewMode === m.id ? 'bg-indigo-600 text-white shadow-xl scale-110' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
             >
               <m.icon size={24} />
             </button>
           ))}
           <button onClick={() => setIsLogoutConfirmOpen(true)} className="mt-auto p-4 text-slate-300 hover:text-red-500 active-press">
             <LogOut size={24} />
           </button>
        </aside>

        {/* Área de Conteúdo */}
        <section className="flex-grow h-full overflow-y-auto no-scrollbar scroll-smooth bg-slate-50 dark:bg-slate-950 pb-24 md:pb-6">
          
          {viewMode === 'settings' ? (
            <div className="p-6 md:p-12 max-w-2xl mx-auto">
              <SettingsMenu 
                settings={settings} 
                onUpdateSettings={(s) => setSettings(p => ({...p, ...s}))}
                onExportData={() => alert(t.gdpr_export)}
                onDeleteAccount={() => alert(t.gdpr_delete_warn)}
                onLogoutRequest={() => setIsLogoutConfirmOpen(true)}
              />
            </div>
          ) : viewMode === 'ai-hub' ? (
            <div className="p-6 md:p-12 max-w-2xl mx-auto space-y-10">
               <div className="text-center space-y-4">
                  <h2 className="text-4xl font-black uppercase tracking-tight dark:text-white">{t.ai_tools}</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tecnologia avançada para a sua segurança</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button 
                    onClick={() => setViewMode('legal')}
                    className="p-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl hover:scale-105 transition-all group active-press"
                  >
                     <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                        <Gavel size={32} />
                     </div>
                     <h3 className="text-xl font-black uppercase tracking-tight dark:text-white mb-2">{t.legal_assistant}</h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Gerar requerimentos oficiais de defesa jurídica</p>
                  </button>
                  <button 
                    onClick={() => setViewMode('assistant')}
                    className="p-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl hover:scale-105 transition-all group active-press"
                  >
                     <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-3xl flex items-center justify-center mb-6 group-hover:-rotate-12 transition-transform">
                        <MessageCircle size={32} />
                     </div>
                     <h3 className="text-xl font-black uppercase tracking-tight dark:text-white mb-2">{t.vigilante_chat}</h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Tire dúvidas sobre trânsito e legislação</p>
                  </button>
               </div>
            </div>
          ) : viewMode === 'legal' ? (
            <LegalAssistant tickets={tickets.filter(tk => tk.userId === user?.uid)} lang={settings.language} />
          ) : viewMode === 'assistant' ? (
            <div className="h-full">
               <VigilanteChat lang={settings.language} />
            </div>
          ) : permissionError ? (
            <div className="h-full flex items-center justify-center p-8">
              <div className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] shadow-2xl text-center max-w-sm border border-red-50 dark:border-red-900/10">
                <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle size={40} className="text-red-500" />
                </div>
                <h3 className="text-xl font-black uppercase dark:text-white mb-2">Acesso Negado</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">Não tens permissões suficientes para visualizar estes dados. Por favor, inicia sessão.</p>
                {!user && (
                  <button onClick={loginWithGoogle} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg active-press">Entrar</button>
                )}
              </div>
            </div>
          ) : viewMode === 'map' ? (
            <div className="h-full w-full p-0">
              <div className="h-full bg-white dark:bg-slate-900 overflow-hidden relative">
                <MapView tickets={tickets} center={userLocation} selectedLocation={selectedLoc} onLocationSelect={setSelectedLoc} lang={settings.language as any} showRadars={settings.showRadars} />
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                  <div className="bg-slate-900/90 dark:bg-indigo-600/90 glass px-6 py-2.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl border border-white/20">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Sector Ativo: {tickets.length} Incidências
                  </div>
                </div>
              </div>
            </div>
          ) : viewMode === 'dashboard' ? (
            <div className="p-6 md:p-12">
              <UserDashboard tickets={tickets.filter(t => t.userId === user?.uid)} lang={settings.language as any} />
            </div>
          ) : (
            <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-8">
               <div className="flex items-center justify-between">
                 <h2 className="text-4xl font-black uppercase tracking-tight dark:text-white">{viewMode === 'list' ? t.community : t.myReports}</h2>
                 <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">
                    {tickets.length} Registos
                 </div>
               </div>
               
               {tickets.length === 0 ? (
                 <div className="py-40 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                   <Clock size={48} className="mx-auto text-slate-300 mb-6" />
                   <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Sem atividade recente</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 gap-6">
                   {tickets.map(tk => (
                     <div key={tk.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col md:flex-row gap-8 group">
                        {tk.imageUrl && (
                          <div className="w-full md:w-56 h-56 rounded-[2rem] overflow-hidden flex-shrink-0 bg-slate-50 dark:bg-slate-800">
                             <img src={tk.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Evidência" />
                          </div>
                        )}
                        <div className="flex-grow py-2">
                           <div className="flex items-center gap-3 mb-4">
                              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-500">{tk.category}</span>
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${tk.severity === 'Critical' ? 'bg-red-500 text-white' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'}`}>
                                {tk.severity}
                              </span>
                           </div>
                           <h4 className="text-2xl font-black dark:text-white mb-3 uppercase tracking-tight leading-tight">{tk.aiSummary || tk.description}</h4>
                           <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-8 leading-relaxed font-medium">{tk.description}</p>
                           <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                 <UserIcon size={12} className="text-indigo-600" />
                                 {tk.userName}
                              </div>
                              <button onClick={() => generatePDF(tk)} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl text-[10px] font-black uppercase active-press transition-all">
                                 <FileDown size={14} /> Report PDF
                              </button>
                           </div>
                        </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          )}
        </section>

        {/* FAB Centralizado */}
        {user && !['settings', 'assistant', 'legal'].includes(viewMode) && (
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-16 h-16 bg-indigo-600 text-white rounded-3xl shadow-[0_20px_50px_rgba(99,102,241,0.5)] flex items-center justify-center active-press z-[60] hover:scale-110 hover:rotate-6 transition-all duration-300 border-4 border-white dark:border-slate-900"
          >
            <Plus size={32} strokeWidth={3} />
          </button>
        )}
      </main>

      {/* Navegação Inferior */}
      <nav className="md:hidden h-20 glass border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-around px-4 sticky bottom-0 z-50 safe-bottom">
        {[
          { id: 'map', icon: MapIcon, label: 'Mapa' },
          { id: 'dashboard', icon: LayoutGrid, label: 'Dash' },
          { id: 'list', icon: Globe, label: 'Feed' },
          { id: 'ai-hub', icon: Zap, label: 'Pro' },
          { id: 'my-reports', icon: UserIcon, label: 'Meus' }
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => { setViewMode(item.id as any); setIsReportModalOpen(false); }}
            className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all active-press ${viewMode === item.id ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <div className={`p-1.5 rounded-xl ${viewMode === item.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
              <item.icon size={22} strokeWidth={viewMode === item.id ? 2.5 : 2} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsReportModalOpen(false)}></div>
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up md:animate-in md:zoom-in-95 duration-400">
             <div className="p-8">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
                      <Shield size={20} />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight dark:text-white">Novo Relatório</h3>
                  </div>
                  <button onClick={() => setIsReportModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                    <X size={24} />
                  </button>
               </div>
               
               <ReportForm 
                location={selectedLoc} 
                onSuccess={() => { setSelectedLoc(null); setIsReportModalOpen(false); setViewMode('list'); }}
                onRequestLocation={() => { setIsReportModalOpen(false); setViewMode('map'); }}
                voiceAlertsEnabled={settings.voiceAlertsEnabled}
                lang={settings.language as any}
               />
             </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Logout */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300"></div>
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden p-10 text-center animate-in zoom-in-95 duration-300">
             <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <LogOut size={32} />
             </div>
             <h3 className="text-2xl font-black uppercase tracking-tight dark:text-white mb-4">{t.logout_confirm_title}</h3>
             <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-10">{t.logout_confirm_msg}</p>
             
             <div className="flex flex-col gap-3">
               <button 
                onClick={handleLogout}
                className="w-full py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-red-200 dark:shadow-none transition-all active-press"
               >
                 {t.confirm_yes}
               </button>
               <button 
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="w-full py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all active-press"
               >
                 {t.confirm_no}
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
