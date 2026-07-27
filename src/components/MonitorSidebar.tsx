import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, ChevronRight, BarChart2, PieChart as PieIcon, RefreshCw, LayoutGrid } from 'lucide-react';
import { TaskItemData, MonitorWidgetType, SettingsState, LanguageCode } from '../types';
import { getTodayStr } from '../utils/dateUtils';
import { t } from '../utils/i18n';

interface MonitorSidebarProps {
  items: TaskItemData[];
  settings: SettingsState;
  onUpdateSettings: (newSettings: Partial<SettingsState>) => void;
  onClose: () => void;
}

export const MonitorSidebar: React.FC<MonitorSidebarProps> = ({
  items,
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const activeWidgets = settings.activeWidgets || [
    'today',
    'last_month',
    'this_month',
    'open_by_priority',
    'task_rolled',
  ];

  // Drag handler for resizing monitor panel width
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 220 && newWidth <= 520) {
        onUpdateSettings({ monitorWidth: newWidth });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onUpdateSettings]);

  // Calculations
  const todayStr = getTodayStr();
  const tasks = items.filter((i) => i.type === 'task');

  // Today
  const createdTodayCount = tasks.filter((i) => i.created_at === todayStr).length;
  const closedTodayCount = tasks.filter((i) => i.status === 'Done' && i.completed_at === todayStr).length;

  // This month & Last month
  const todayObj = new Date();
  const currentYear = todayObj.getFullYear();
  const currentMonth = todayObj.getMonth() + 1; // 1-12
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;

  const thisMonthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  const lastMonthPrefix = `${lastMonthYear}-${String(lastMonth).padStart(2, '0')}`;

  const createdThisMonth = tasks.filter((i) => i.created_at && i.created_at.startsWith(thisMonthPrefix)).length;
  const closedThisMonth = tasks.filter((i) => i.status === 'Done' && i.completed_at && i.completed_at.startsWith(thisMonthPrefix)).length;

  const createdLastMonth = tasks.filter((i) => i.created_at && i.created_at.startsWith(lastMonthPrefix)).length;
  const closedLastMonth = tasks.filter((i) => i.status === 'Done' && i.completed_at && i.completed_at.startsWith(lastMonthPrefix)).length;

  // Open task by priority
  const openTasks = tasks.filter((i) => i.status !== 'Done' && i.status !== 'Cancelled');
  const highPriority = openTasks.filter((i) => i.priority === 'High').length;
  const mediumPriority = openTasks.filter((i) => i.priority === 'Medium').length;
  const lowPriority = openTasks.filter((i) => i.priority === 'Low').length;
  const totalOpen = openTasks.length || 1;

  // Rolled stats
  const rolledTasks = tasks.filter((i) => i.rollover_count > 0);
  const numRolled = rolledTasks.length;
  const totalDaysRolled = rolledTasks.reduce((acc, t) => acc + (t.rollover_count || 0), 0);

  const removeWidget = (widget: MonitorWidgetType) => {
    onUpdateSettings({
      activeWidgets: activeWidgets.filter((w) => w !== widget),
    });
  };

  const addWidget = (widget: MonitorWidgetType) => {
    if (!activeWidgets.includes(widget)) {
      onUpdateSettings({
        activeWidgets: [...activeWidgets, widget],
      });
    }
    setShowAddMenu(false);
  };

  const availableToAdd: { id: MonitorWidgetType; label: string }[] = (
    [
      { id: 'today' as MonitorWidgetType, label: 'Task Today' },
      { id: 'last_month' as MonitorWidgetType, label: 'Task last month' },
      { id: 'this_month' as MonitorWidgetType, label: 'Task this month' },
      { id: 'open_by_priority' as MonitorWidgetType, label: 'Open Task by priority' },
      { id: 'task_rolled' as MonitorWidgetType, label: 'Task rolled' },
    ] as { id: MonitorWidgetType; label: string }[]
  ).filter((w) => !activeWidgets.includes(w.id));

  // Max value calculation for bar scales
  const maxToday = Math.max(createdTodayCount, closedTodayCount, 1);
  const maxLastMonth = Math.max(createdLastMonth, closedLastMonth, 1);
  const maxThisMonth = Math.max(createdThisMonth, closedThisMonth, 1);
  const maxRolled = Math.max(numRolled, totalDaysRolled, 1);

  return (
    <aside
      ref={sidebarRef}
      style={{ width: `${settings.monitorWidth || 300}px` }}
      className="bg-[#EAEAEA] border-l border-slate-300 flex flex-col h-screen shrink-0 relative select-none z-20 text-slate-900 overflow-hidden font-sans"
    >
      {/* Resizable Drag Handle Border */}
      <div
        onMouseDown={() => setIsDragging(true)}
        className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-red-500/50 transition-colors z-30"
        title="拖拽可调节侧边 Monitor 宽度"
      />

      {/* Header Bar */}
      <div className="p-3 bg-[#E0E0E0] border-b border-slate-300 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-1.5">
          <BarChart2 className="w-4 h-4 text-[#800020]" />
          <span className="font-extrabold text-xs tracking-tight text-[#4A0012]">
            {t(settings.language, 'monitorTitle')}
          </span>
        </div>

        <div className="flex items-center gap-1.5 relative">
          {availableToAdd.length > 0 && (
            <div>
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3 text-[#800020]" />
                <span>+ 模块</span>
              </button>

              {showAddMenu && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded shadow-lg border border-slate-300 py-1 z-50 text-xs">
                  {availableToAdd.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => addWidget(item.id)}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-800 font-medium cursor-pointer"
                    >
                      + {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-300 rounded text-slate-600 cursor-pointer"
            title="关闭 Monitor 看板"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Widgets Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs">
        {activeWidgets.map((widgetKey) => {
          if (widgetKey === 'today') {
            return (
              <div key="today" className="bg-[#DCDCDC] p-2.5 rounded border border-slate-300/80 shadow-2xs relative group">
                <button
                  onClick={() => removeWidget('today')}
                  className="absolute right-1 top-1 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <h4 className="font-extrabold text-sm text-[#3B0211] mb-2 tracking-tight">
                  Task Today
                </h4>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-14 text-[10px] text-slate-600 text-right shrink-0">Created</span>
                    <div className="flex-1 bg-slate-200 h-5 relative flex items-center overflow-hidden">
                      <div
                        className="bg-[#D00000] h-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(8, (createdTodayCount / maxToday) * 100))}%` }}
                      />
                      <span className="absolute right-2 text-white font-bold text-[10px]">
                        {createdTodayCount}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-14 text-[10px] text-slate-600 text-right shrink-0">Closed</span>
                    <div className="flex-1 bg-slate-200 h-5 relative flex items-center overflow-hidden">
                      <div
                        className="bg-[#CC0000] h-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(8, (closedTodayCount / maxToday) * 100))}%` }}
                      />
                      <span className="absolute right-2 text-white font-bold text-[10px]">
                        {closedTodayCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          if (widgetKey === 'last_month') {
            return (
              <div key="last_month" className="bg-[#DCDCDC] p-2.5 rounded border border-slate-300/80 shadow-2xs relative group">
                <button
                  onClick={() => removeWidget('last_month')}
                  className="absolute right-1 top-1 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <h4 className="font-extrabold text-sm text-[#3B0211] mb-2 tracking-tight">
                  Task <span className="font-normal text-xs text-slate-600">last month</span>
                </h4>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-14 text-[10px] text-slate-600 text-right shrink-0">Created</span>
                    <div className="flex-1 bg-slate-200 h-5 relative flex items-center overflow-hidden">
                      <div
                        className="bg-[#CC0000] h-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(8, (createdLastMonth / maxLastMonth) * 100))}%` }}
                      />
                      <span className="absolute right-2 text-white font-bold text-[10px]">
                        {createdLastMonth}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-14 text-[10px] text-slate-600 text-right shrink-0">Closed</span>
                    <div className="flex-1 bg-slate-200 h-5 relative flex items-center overflow-hidden">
                      <div
                        className="bg-[#CC0000] h-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(8, (closedLastMonth / maxLastMonth) * 100))}%` }}
                      />
                      <span className="absolute right-2 text-white font-bold text-[10px]">
                        {closedLastMonth}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          if (widgetKey === 'this_month') {
            return (
              <div key="this_month" className="bg-[#DCDCDC] p-2.5 rounded border border-slate-300/80 shadow-2xs relative group">
                <button
                  onClick={() => removeWidget('this_month')}
                  className="absolute right-1 top-1 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <h4 className="font-extrabold text-sm text-[#3B0211] mb-2 tracking-tight">
                  Task <span className="font-normal text-xs text-slate-600">this month</span>
                </h4>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-14 text-[10px] text-slate-600 text-right shrink-0">Created</span>
                    <div className="flex-1 bg-slate-200 h-5 relative flex items-center overflow-hidden">
                      <div
                        className="bg-[#CC0000] h-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(8, (createdThisMonth / maxThisMonth) * 100))}%` }}
                      />
                      <span className="absolute right-2 text-white font-bold text-[10px]">
                        {createdThisMonth}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-14 text-[10px] text-slate-600 text-right shrink-0">Closed</span>
                    <div className="flex-1 bg-slate-200 h-5 relative flex items-center overflow-hidden">
                      <div
                        className="bg-[#CC0000] h-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(8, (closedThisMonth / maxThisMonth) * 100))}%` }}
                      />
                      <span className="absolute right-2 text-white font-bold text-[10px]">
                        {closedThisMonth}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          if (widgetKey === 'open_by_priority') {
            return (
              <div key="open_by_priority" className="bg-[#F5F5F5] border-2 border-red-600 p-3 rounded relative group shadow-xs">
                <button
                  onClick={() => removeWidget('open_by_priority')}
                  className="absolute right-1 top-1 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <h4 className="font-extrabold text-sm text-[#3B0211] mb-2 tracking-tight">
                  Open <span className="text-[#3B0211]">Task</span> <span className="font-normal text-xs text-slate-600">by priority</span>
                </h4>

                {/* Donut Chart SVG */}
                <div className="flex justify-center my-3">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#CCCCCC"
                      strokeWidth="5"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#777777"
                      strokeWidth="5"
                      strokeDasharray={`${(highPriority / totalOpen) * 100}, 100`}
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#B91C1C"
                      strokeWidth="5"
                      strokeDasharray={`${(mediumPriority / totalOpen) * 100}, 100`}
                      strokeDashoffset={`-${(highPriority / totalOpen) * 100}`}
                    />
                  </svg>
                </div>

                {/* Legend List */}
                <div className="space-y-1 text-xs font-medium text-slate-800 border-t border-slate-200 pt-2">
                  <div className="flex items-center justify-between p-1 bg-red-100 rounded border border-red-200">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-black rounded-2xs inline-block" />
                      <span>1: Very High / High</span>
                    </span>
                    <span className="font-bold">{highPriority}</span>
                  </div>

                  <div className="flex items-center justify-between p-1 hover:bg-slate-100 rounded">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#555] rounded-2xs inline-block" />
                      <span>2: High</span>
                    </span>
                    <span className="font-bold">0</span>
                  </div>

                  <div className="flex items-center justify-between p-1 hover:bg-slate-100 rounded">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#888] rounded-2xs inline-block" />
                      <span>3: Medium</span>
                    </span>
                    <span className="font-bold">{mediumPriority}</span>
                  </div>

                  <div className="flex items-center justify-between p-1 hover:bg-slate-100 rounded">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-slate-300 border border-slate-400 rounded-2xs inline-block" />
                      <span>4: Low</span>
                    </span>
                    <span className="font-bold">{lowPriority}</span>
                  </div>
                </div>
              </div>
            );
          }

          if (widgetKey === 'task_rolled') {
            return (
              <div key="task_rolled" className="bg-[#DCDCDC] p-2.5 rounded border border-slate-300/80 shadow-2xs relative group">
                <button
                  onClick={() => removeWidget('task_rolled')}
                  className="absolute right-1 top-1 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <h4 className="font-extrabold text-sm text-[#3B0211] mb-2 tracking-tight">
                  Task <span className="font-normal text-xs text-slate-600">rolled</span>
                </h4>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-20 text-[10px] text-slate-600 text-right shrink-0"># of rolled</span>
                    <div className="flex-1 bg-slate-200 h-5 relative flex items-center overflow-hidden">
                      <div
                        className="bg-[#CC0000] h-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(8, (numRolled / maxRolled) * 100))}%` }}
                      />
                      <span className="absolute right-2 text-white font-bold text-[10px]">
                        {numRolled}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-20 text-[10px] text-slate-600 text-right shrink-0">days of rolled</span>
                    <div className="flex-1 bg-slate-200 h-5 relative flex items-center overflow-hidden">
                      <div
                        className="bg-[#CC0000] h-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(8, (totalDaysRolled / maxRolled) * 100))}%` }}
                      />
                      <span className="absolute right-2 text-white font-bold text-[10px]">
                        {totalDaysRolled}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    </aside>
  );
};
