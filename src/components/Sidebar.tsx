import React from 'react';
import { 
  Calendar, 
  FolderKanban, 
  BarChart3, 
  Download, 
  RotateCcw, 
  Sparkles, 
  Plus, 
  AlertTriangle,
  History,
  Settings,
  BarChart2
} from 'lucide-react';
import { ViewMode, TaskItemData, LanguageCode } from '../types';
import { Logo } from './Logo';
import { t } from '../utils/i18n';

interface SidebarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  items: TaskItemData[];
  onOpenNewTask: () => void;
  onOpenTimeMachine: () => void;
  onOpenSettings: () => void;
  onToggleMonitor: () => void;
  onResetData: () => void;
  todayRolledCount: number;
  monitorVisible?: boolean;
  language?: LanguageCode;
  width?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  items,
  onOpenNewTask,
  onOpenTimeMachine,
  onOpenSettings,
  onToggleMonitor,
  onResetData,
  todayRolledCount,
  monitorVisible = true,
  language = 'zh',
  width = 240,
}) => {
  const activeTasks = items.filter(i => i.type === 'task' && i.status !== 'Done' && i.status !== 'Cancelled');
  const projects = items.filter(i => i.type === 'project');
  const totalRolledTasks = items.filter(i => i.type === 'task' && i.rollover_count > 0 && i.status !== 'Done').length;

  const navItems = [
    {
      id: 'today' as ViewMode,
      label: t(language, 'openTask'),
      icon: Calendar,
      badge: activeTasks.length > 0 ? activeTasks.length : null,
      badgeColor: 'bg-indigo-100 text-indigo-700 font-bold',
    },
    {
      id: 'projects' as ViewMode,
      label: t(language, 'allProjects'),
      icon: FolderKanban,
      badge: projects.length > 0 ? projects.length : null,
      badgeColor: 'bg-slate-100 text-slate-700 font-medium',
    },
    {
      id: 'rollover' as ViewMode,
      label: t(language, 'rolledTasks'),
      icon: AlertTriangle,
      badge: totalRolledTasks > 0 ? totalRolledTasks : null,
      badgeColor: 'bg-amber-100 text-amber-800 font-bold',
    },
    {
      id: 'reports' as ViewMode,
      label: t(language, 'workReports'),
      icon: BarChart3,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'export' as ViewMode,
      label: t(language, 'exportCsv'),
      icon: Download,
      badge: null,
      badgeColor: '',
    },
  ];

  return (
    <aside 
      style={{ width: `${width}px` }}
      className="bg-white border-r border-slate-200 flex flex-col h-screen shrink-0 select-none transition-all duration-75"
    >
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <Logo size={32} />
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-slate-900 leading-none">
              Clear Do
            </h1>
            <span className="text-[10px] text-red-600 font-bold tracking-wider uppercase">V2 PRO</span>
          </div>
        </div>

        <button
          onClick={onToggleMonitor}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            monitorVisible
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
          }`}
          title="切换/展开 Monitor 看板"
        >
          <BarChart2 className="w-4 h-4" />
        </button>
      </div>

      {/* Primary Action Button (+ New Task) */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={onOpenNewTask}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 px-4 rounded-xl shadow-sm transition-all duration-150 cursor-pointer group"
        >
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
          <span>{t(language, 'newTask')}</span>
          <kbd className="ml-auto text-[10px] font-mono bg-indigo-700/80 text-indigo-100 px-1.5 py-0.5 rounded">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
          {t(language, 'navigation')}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Active Projects Quick List */}
        <div className="pt-5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">
            {t(language, 'activeProjects')} ({projects.length})
          </div>
          <div className="space-y-0.5">
            {projects.slice(0, 5).map((proj) => {
              const subTasks = items.filter((i) => i.type === 'task' && i.parent_id === proj.id);
              const doneSub = subTasks.filter((s) => s.status === 'Done').length;
              return (
                <div
                  key={proj.id}
                  onClick={() => onSelectView('projects')}
                  className="flex items-center justify-between px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-md cursor-pointer group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <span className="truncate group-hover:text-slate-900 font-medium">{proj.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                    {doneSub}/{subTasks.length}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer Info & Settings Trigger */}
      <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <button
          onClick={onOpenSettings}
          className="text-slate-700 hover:text-indigo-600 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer px-2.5 py-1.5 hover:bg-slate-100 rounded-lg"
          title="打开系统设置"
        >
          <Settings className="w-4 h-4 text-indigo-600" />
          <span>{t(language, 'settings')}</span>
        </button>

        <button
          onClick={onResetData}
          className="text-slate-400 hover:text-slate-600 hover:underline text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{t(language, 'resetDemo')}</span>
        </button>
      </div>
    </aside>
  );
};
