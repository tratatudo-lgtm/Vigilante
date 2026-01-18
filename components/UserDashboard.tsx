import React from 'react';
import { Ticket } from '../types';
import { translations } from '../services/localization';
import { 
  Trophy, 
  Target, 
  Zap, 
  Activity, 
  CheckCircle2, 
  Clock,
  ArrowUpRight
} from 'lucide-react';

interface UserDashboardProps {
  tickets: Ticket[];
  lang: 'pt' | 'en';
}

const UserDashboard: React.FC<UserDashboardProps> = ({ tickets, lang }) => {
  const t = translations[lang];
  const impactScore = (tickets.length * 25) + (tickets.filter(t => t.severity === 'Critical').length * 75);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Hero Stats (Material You Colors) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group active-press transition-all">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
          <Trophy size={40} className="mb-6 opacity-80" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-1">Cidadania Score</p>
          <h3 className="text-5xl font-black mb-6">{impactScore} XP</h3>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-widest">Nível 05</div>
            <ArrowUpRight size={14} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-[1.8rem] flex items-center justify-center">
              <Zap size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.stats_total}</p>
              <h3 className="text-4xl font-black dark:text-white">{tickets.length}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-[1.8rem] flex items-center justify-center">
              <Target size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.stats_impact}</p>
              <h3 className="text-4xl font-black dark:text-white">+{impactScore / 10}%</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pulse Map Widget */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800">
          <h4 className="text-sm font-black dark:text-white uppercase tracking-tight mb-8 flex items-center gap-3">
            <Activity className="text-indigo-600" size={18} />
            Pulso de Atividade Semanal
          </h4>
          <div className="h-40 flex items-end gap-3 px-2">
            {[45, 60, 30, 85, 40, 95, 50].map((v, i) => (
              <div key={i} className="flex-grow group relative">
                <div 
                  className="bg-slate-100 dark:bg-slate-800 rounded-2xl w-full transition-all group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40" 
                  style={{ height: '100%' }}
                ></div>
                <div 
                  className="absolute bottom-0 left-0 w-full bg-indigo-600 rounded-2xl transition-all shadow-lg group-hover:scale-x-110" 
                  style={{ height: `${v}%` }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <span>Seg</span>
            <span>Dom</span>
          </div>
        </div>

        {/* Recent Milestones Widget */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800">
          <h4 className="text-sm font-black dark:text-white uppercase tracking-tight mb-8 flex items-center gap-3">
            <CheckCircle2 className="text-indigo-600" size={18} />
            Recent Milestones
          </h4>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[1.8rem] border border-slate-100 dark:border-slate-800 transition-all active-press">
              <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-green-500 shadow-sm">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-xs font-black dark:text-white uppercase tracking-tight">Primeiro Relatório Crítico</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">+100 XP Obtidos</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[1.8rem] border border-slate-100 dark:border-slate-800 opacity-50">
              <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-300">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs font-black dark:text-white uppercase tracking-tight">Guardião do Setor</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Faltam 3 Registos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;