import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Filter, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Inbox,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { TaskItemData, TaskStatus, TaskSource, TaskPriority } from '../../types';
import { TaskItem } from '../TaskItem';
import { ProjectAccordion } from '../ProjectAccordion';
import { QuickAddInput } from '../QuickAddInput';
import { getTodayStr, formatDateHuman } from '../../utils/dateUtils';

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
  filterViewMode = 'today'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [isProjectGroupExpanded, setIsProjectGroupExpanded] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'today' | 'all' | 'completed'>(
    filterViewMode === 'rollover' ? 'all' : 'today'
  );

  const todayStr = getTodayStr();

  const formatDDMMYYYY = (dateStr: string) => {
    if (!dateStr || !dateStr.includes('-')) return dateStr;
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const projects = items.filter((i) => i.type === 'project');

  // Filter items
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

    if (activeTab === 'today') {
      if (item.status === 'Done' && item.completed_at !== todayStr) {
        return false;
      }
      return item.planned_date === todayStr || item.type === 'project';
    } else if (activeTab === 'completed') {
      return item.status === 'Done';
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
    <div className="space-y-5 pb-12">
      {/* Header & Integrated Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Date or Rollover Header */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {filterViewMode === 'rollover' ? 'Rolled Tasks (顺延警示)' : formatDDMMYYYY(todayStr)}
            </h1>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 bg-slate-100 rounded-md font-medium text-slate-600">
                已完成: <strong className="text-emerald-600">{completedTasks}</strong> / {totalTasks}
              </span>
              {rolledTasksCount > 0 && (
                <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-md font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Rolled: {rolledTasksCount}</span>
                </span>
              )}
            </div>
          </div>

          {/* Right: Integrated Filters & Search */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* 任务日期: 下拉菜单 */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded text-slate-700 font-medium">
              <span className="text-slate-400 font-normal">任务日期:</span>
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as 'today' | 'all' | 'completed')}
                className="bg-transparent focus:outline-none cursor-pointer font-bold text-indigo-700"
              >
                <option value="today">今天</option>
                <option value="all">全部</option>
                <option value="completed">归档</option>
              </select>
            </div>

            {/* 来源: 下拉菜单 */}
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded focus:outline-none cursor-pointer font-medium"
            >
              <option value="all">来源: 全部</option>
              <option value="Teams">Teams</option>
              <option value="Email">Email</option>
              <option value="Ticket">Ticket</option>
              <option value="Meeting">Meeting</option>
              <option value="Other">Other</option>
            </select>

            {/* 优先级: 下拉菜单 */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded focus:outline-none cursor-pointer font-medium"
            >
              <option value="all">优先级: 全部</option>
              <option value="High">高优先级</option>
              <option value="Medium">中优先级</option>
              <option value="Low">低优先级</option>
            </select>

            {/* 搜索框 */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索任务..."
                className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Auto Rollover Touch Notification Banner */}
      {todayRolledCount > 0 && filterViewMode !== 'rollover' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              昨日有 <strong className="font-bold">{todayRolledCount}</strong> 项未完成任务已自动将计划执行日期更正为今天，并累加顺延计数。
            </span>
          </div>
          <button
            onClick={onTriggerRolloverCheck}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded text-xs transition-colors cursor-pointer shrink-0"
          >
            校验顺延
          </button>
        </div>
      )}

      {/* Quick Add Bar */}
      {filterViewMode !== 'rollover' && (
        <QuickAddInput
          onAddItem={onAddItem}
          existingProjects={projects}
        />
      )}

      {/* 1. Standalone Tasks (改名为 Task，在 Project 上方) */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <span>Task</span>
          <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[10px] font-mono">
            {standaloneTasks.length}
          </span>
        </div>

        {standaloneTasks.length === 0 ? (
          <div className="p-6 bg-white border border-slate-200/80 rounded-lg text-center space-y-1">
            <Inbox className="w-6 h-6 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-400 font-medium">当前列表无符合条件的任务</p>
          </div>
        ) : (
          <div className="space-y-1.5">
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
      </div>

      {/* 2. Projects Accordion View (在 Task 下方) */}
      {filterViewMode !== 'rollover' && projects.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>Project</span>
              <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[10px] font-mono">
                {projects.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsProjectGroupExpanded(!isProjectGroupExpanded)}
              className="text-xs text-slate-500 hover:text-indigo-600 font-medium flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {isProjectGroupExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-indigo-600" />
                  <span>折叠项目组</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />
                  <span>展开项目组</span>
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
