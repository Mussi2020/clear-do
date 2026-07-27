import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  AlertTriangle, 
  Inbox,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { TaskItemData, TaskStatus, TaskSource, TaskPriority, DateFilterRange, LanguageCode } from '../../types';
import { TaskItem } from '../TaskItem';
import { ProjectAccordion } from '../ProjectAccordion';
import { getTodayStr, getDateRangeBoundaries } from '../../utils/dateUtils';
import { t } from '../../utils/i18n';

interface TodayViewProps {
  items: TaskItemData[];
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: TaskItemData) => void;
  onAddItem: (newItem: {
    type: 'project' | 'task';
    title: string;
    source: TaskSource;
    priority: TaskPriority;
    parentId: string | null;
    plannedDate: string;
  }) => void;
  onOpenHistory: (task: TaskItemData) => void;
  todayRolledCount: number;
  onTriggerRolloverCheck: () => void;
  filterViewMode?: 'today' | 'rollover';
  language?: LanguageCode;
}

export const TodayView: React.FC<TodayViewProps> = ({
  items,
  onUpdateStatus,
  onDeleteItem,
  onEditItem,
  onAddItem,
  onOpenHistory,
  todayRolledCount,
  onTriggerRolloverCheck,
  filterViewMode = 'today',
  language = 'zh',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [isProjectGroupExpanded, setIsProjectGroupExpanded] = useState<boolean>(true);
  const [isTaskGroupExpanded, setIsTaskGroupExpanded] = useState<boolean>(true);

  // Filter modes: 'active' (Default Open Tasks), or 'closed_today' | 'closed_week' | 'closed_month' | 'closed_quarter' | 'closed_year'
  const [closedQuickFilter, setClosedQuickFilter] = useState<'open' | 'closed_today' | 'closed_week' | 'closed_month' | 'closed_quarter' | 'closed_year'>('open');

  const todayStr = getTodayStr();

  const formatDDMMYYYY = (dateStr: string) => {
    if (!dateStr || !dateStr.includes('-')) return dateStr;
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const projects = items.filter((i) => i.type === 'project');

  // Filter items logic
  const filteredItems = items.filter((item) => {
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterSource !== 'all' && item.source !== filterSource) {
      return false;
    }
    if (filterPriority !== 'all' && item.priority !== filterPriority) {
      return false;
    }

    if (filterViewMode === 'rollover') {
      return item.type === 'task' && item.rollover_count > 0 && item.status !== 'Done';
    }

    // Top Quick Closed Filters
    if (closedQuickFilter !== 'open') {
      if (item.status !== 'Done') return false;
      const closedDate = item.completed_at || item.created_at;

      let rangeKey: DateFilterRange = 'today';
      if (closedQuickFilter === 'closed_today') rangeKey = 'today';
      if (closedQuickFilter === 'closed_week') rangeKey = 'this_week';
      if (closedQuickFilter === 'closed_month') rangeKey = 'this_month';
      if (closedQuickFilter === 'closed_quarter') rangeKey = 'this_quarter';
      if (closedQuickFilter === 'closed_year') rangeKey = 'this_year';

      const [start, end] = getDateRangeBoundaries(rangeKey);
      return closedDate >= start && closedDate <= end;
    }

    // Default 'open' view: show active tasks + projects
    if (item.type === 'task' && item.status === 'Done' && item.completed_at !== todayStr) {
      return false;
    }

    return true;
  });

  const standaloneTasks = filteredItems.filter(
    (i) => i.type === 'task' && i.parent_id === null
  );

  const totalTasks = items.filter((i) => i.type === 'task').length;
  const completedTasks = items.filter((i) => i.type === 'task' && i.status === 'Done').length;
  const rolledTasksCount = items.filter((i) => i.type === 'task' && i.rollover_count > 0 && i.status !== 'Done').length;

  return (
    <div className="space-y-5 pb-12 font-sans">
      {/* Header & Integrated Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Date or Rollover Header */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              {filterViewMode === 'rollover' ? 'Rolled Tasks (顺延任务)' : formatDDMMYYYY(todayStr)}
            </h1>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-bold text-slate-600">
                已完成: <strong className="text-emerald-600">{completedTasks}</strong> / {totalTasks}
              </span>
              {rolledTasksCount > 0 && (
                <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Rolled: {rolledTasksCount}</span>
                </span>
              )}
            </div>
          </div>

          {/* Right: Top Closed Quick Filter Dropdown Menu (Requirement 2) & Search */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Top Quick Filter Dropdown Menu */}
            <div className="relative inline-flex items-center">
              <select
                value={closedQuickFilter}
                onChange={(e) => setClosedQuickFilter(e.target.value as any)}
                className="bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-200/90 text-indigo-900 px-3 py-1.5 rounded-xl font-bold focus:outline-none cursor-pointer transition-colors shadow-2xs text-xs"
              >
                <option value="open">📋 处理中清单 (Active)</option>
                <option value="closed_today">✅ {t(language, 'closedToday')}</option>
                <option value="closed_week">📅 {t(language, 'closedThisWeek')}</option>
                <option value="closed_month">🗓️ {t(language, 'closedThisMonth')}</option>
                <option value="closed_quarter">📊 {t(language, 'closedThisQuarter')}</option>
                <option value="closed_year">🏆 {t(language, 'closedThisYear')}</option>
              </select>
            </div>

            {/* Source dropdown filter */}
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg focus:outline-none cursor-pointer font-bold"
            >
              <option value="all">来源: 全部</option>
              <option value="Teams">Teams</option>
              <option value="Email">Email</option>
              <option value="Ticket">Ticket</option>
              <option value="Meeting">Meeting</option>
              <option value="Other">Other</option>
            </select>

            {/* Priority dropdown filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg focus:outline-none cursor-pointer font-bold"
            >
              <option value="all">优先级: 全部</option>
              <option value="High">高优先级</option>
              <option value="Medium">中优先级</option>
              <option value="Low">低优先级</option>
            </select>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(language, 'searchPlaceholder')}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none font-medium text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Auto Rollover Banner */}
      {todayRolledCount > 0 && filterViewMode !== 'rollover' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              昨日有 <strong className="font-bold">{todayRolledCount}</strong> 项未完成任务已自动将计划执行日期更正为今天，并累加顺延计数。
            </span>
          </div>
          <button
            onClick={onTriggerRolloverCheck}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shrink-0"
          >
            校验顺延
          </button>
        </div>
      )}

      {/* 1. Standalone Tasks (with Fold/Collapse Toggle - Requirement 10) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span>{t(language, 'taskGroup')}</span>
            <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[10px] font-mono font-bold">
              {standaloneTasks.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsTaskGroupExpanded(!isTaskGroupExpanded)}
            className="text-xs text-slate-500 hover:text-indigo-600 font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {isTaskGroupExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t(language, 'collapseGroup')} Task 组</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t(language, 'expandGroup')} Task 组</span>
              </>
            )}
          </button>
        </div>

        {isTaskGroupExpanded && (
          <>
            {standaloneTasks.length === 0 ? (
              <div className="p-6 bg-white border border-slate-200/80 rounded-2xl text-center space-y-1">
                <Inbox className="w-6 h-6 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-400 font-medium">{t(language, 'noTasks')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {standaloneTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onUpdateStatus={onUpdateStatus}
                    onDeleteTask={onDeleteItem}
                    onEditTask={onEditItem}
                    onOpenHistory={onOpenHistory}
                    onUpdateTask={onEditItem}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* 2. Projects Accordion View */}
      {filterViewMode !== 'rollover' && projects.length > 0 && (
        <div className="space-y-2 pt-3">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>{t(language, 'projectGroup')}</span>
              <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[10px] font-mono font-bold">
                {projects.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsProjectGroupExpanded(!isProjectGroupExpanded)}
              className="text-xs text-slate-500 hover:text-indigo-600 font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {isProjectGroupExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{t(language, 'collapseGroup')} Project 组</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{t(language, 'expandGroup')} Project 组</span>
                </>
              )}
            </button>
          </div>

          {isProjectGroupExpanded && (
            <div className="space-y-2">
              {projects.map((proj) => {
                const subTasks = filteredItems.filter(
                  (i) => i.type === 'task' && i.parent_id === proj.id
                );
                return (
                  <ProjectAccordion
                    key={proj.id}
                    project={proj}
                    subTasks={subTasks}
                    onUpdateStatus={onUpdateStatus}
                    onDeleteProject={onDeleteItem}
                    onEditProject={onEditItem}
                    onDeleteTask={onDeleteItem}
                    onEditTask={onEditItem}
                    onQuickAddSubTask={(parentId, parentTitle) => {
                      onAddItem({
                        type: 'task',
                        title: `[${parentTitle}] 新子任务`,
                        source: proj.source,
                        priority: 'Medium',
                        parentId: parentId,
                        plannedDate: todayStr,
                      });
                    }}
                    onOpenHistory={onOpenHistory}
                    onUpdateTask={onEditItem}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
