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
  CheckSquare,
  Type
} from 'lucide-react';
import { ViewMode, TaskItemData } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  items: TaskItemData[];
  onOpenQuickAdd: () => void;
  onOpenTimeMachine: () => void;
  onOpenFontSettings?: () => void;
  onResetData: () => void;
  todayRolledCount: number;
  width?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  items,
  onOpenQuickAdd,
  onOpenTimeMachine,
  onOpenFontSettings,
  onResetData,
  todayRolledCount,
  width = 240,
}) => {
  const activeTasks = items.filter(i => i.type === 'task' && i.status !== 'Done' && i.status !== 'Cancelled');
  const projects = items.filter(i => i.type === 'project');
  const totalRolledTasks = items.filter(i => i.type === 'task' && i.rollover_count > 0 && i.status !== 'Done').length;

  const navItems = [
    {
      id: 'today' as ViewMode,
      label: 'Open Task',
      icon: Calendar,
      badge: activeTasks.length > 0 ? activeTasks.length : null,
      badgeColor: 'bg-indigo-100 text-indigo-700 font-bold',
    },
    {
      id: 'projects' as ViewMode,
      label: 'All Projects',
      icon: FolderKanban,
      badge: projects.length > 0 ? projects.length : null,
      badgeColor: 'bg-slate-100 text-slate-700 font-medium',
    },
    {
      id: 'rollover' as ViewMode,
      label: 'Rolled Tasks',
      icon: AlertTriangle,
      badge: totalRolledTasks > 0 ? totalRolledTasks : null,
      badgeColor: 'bg-amber-100 text-amber-800 font-bold',
    },
    {
      id: 'reports' as ViewMode,
      label: 'Work Reports',
      icon: BarChart3,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'export' as ViewMode,
      label: 'Export CSV',
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
      <div className="p-5 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-xs">
            C
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-slate-900 leading-none">
              Clear Do
            </h1>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={onOpenQuickAdd}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg shadow-sm transition-all duration-150 cursor-pointer group"
        >
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
          <span>New Task</span>
          <kbd className="ml-auto text-[10px] font-mono bg-indigo-700/80 text-indigo-100 px-1.5 py-0.5 rounded">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors cursor-pointer ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
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
        <div className="pt-6">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">
            Active Projects ({projects.length})
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
                    <span className="truncate group-hover:text-slate-900">{proj.title}</span>
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

      {/* Auto Rollover Banner & Simulator */}
      <div className="p-3 m-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-700 font-medium">
          <span className="flex items-center gap-1.5 text-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            自动顺延引擎
          </span>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            Active
          </span>
        </div>

        {todayRolledCount > 0 ? (
          <p className="text-[11px] text-amber-800 leading-tight">
            ⚡ 今日有 <strong className="font-bold">{todayRolledCount}</strong> 项未完成任务已自动顺延。
          </p>
        ) : (
          <p className="text-[11px] text-slate-500 leading-relaxed">
            零点或启动时，自动将昨日未完成具体任务平滑顺延至今日。
          </p>
        )}

        <button
          onClick={onOpenTimeMachine}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 py-1.5 rounded-md transition-colors cursor-pointer shadow-2xs"
        >
          <History className="w-3.5 h-3.5 text-indigo-600" />
          <span>模拟跨天顺延 (时光机)</span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <button
          onClick={onOpenFontSettings}
          className="text-slate-600 hover:text-indigo-600 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer px-2 py-1 hover:bg-slate-100 rounded-md"
          title="字体与字号设置"
        >
          <Type className="w-3.5 h-3.5 text-indigo-600" />
          <span>字体/字号</span>
        </button>

        <button
          onClick={onResetData}
          className="text-slate-400 hover:text-slate-600 hover:underline text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>重置演示</span>
        </button>
      </div>
    </aside>
  );
};
