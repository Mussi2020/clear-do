import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Filter, 
  PieChart, 
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  Pie, 
  PieChart as RePieChart 
} from 'recharts';
import { TaskItemData, DateFilterRange, TaskSource, TaskPriority } from '../../types';
import { getDateRangeBoundaries } from '../../utils/dateUtils';

interface ReportsViewProps {
  items: TaskItemData[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ items }) => {
  const [dateRange, setDateRange] = useState<DateFilterRange>('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const [startBoundary, endBoundary] = getDateRangeBoundaries(dateRange, customStart, customEnd);

  // Filter tasks by date range
  const filteredTasks = items.filter((item) => {
    if (item.type !== 'task') return false; // Focus report analytics on concrete tasks
    const taskDate = item.completed_at || item.planned_date || item.created_at;
    if (dateRange !== 'all') {
      if (taskDate < startBoundary || taskDate > endBoundary) {
        return false;
      }
    }
    return true;
  });

  const totalCount = filteredTasks.length;
  const completedCount = filteredTasks.filter((t) => t.status === 'Done').length;
  const inProgressCount = filteredTasks.filter((t) => t.status === 'In Progress').length;
  const todoCount = filteredTasks.filter((t) => t.status === 'Todo').length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const totalRolloverEvents = filteredTasks.reduce((acc, curr) => acc + curr.rollover_count, 0);
  const tasksRolledCount = filteredTasks.filter((t) => t.rollover_count > 0).length;

  // Source breakdown data for Recharts
  const sourceCounts: Record<string, number> = {
    Teams: 0,
    Email: 0,
    Ticket: 0,
    Meeting: 0,
    Other: 0,
  };
  filteredTasks.forEach((t) => {
    if (sourceCounts[t.source] !== undefined) {
      sourceCounts[t.source]++;
    } else {
      sourceCounts.Other++;
    }
  });

  const sourceChartData = Object.keys(sourceCounts).map((key) => ({
    name: key,
    count: sourceCounts[key],
  }));

  const sourceColors = ['#6366F1', '#3B82F6', '#10B981', '#A855F7', '#64748B'];

  // Priority breakdown
  const priorityCounts = { High: 0, Medium: 0, Low: 0 };
  filteredTasks.forEach((t) => {
    if (t.priority in priorityCounts) {
      priorityCounts[t.priority as TaskPriority]++;
    }
  });

  const priorityChartData = [
    { name: '高优先级 (High)', count: priorityCounts.High, color: '#EF4444' },
    { name: '中优先级 (Medium)', count: priorityCounts.Medium, color: '#F59E0B' },
    { name: '低优先级 (Low)', count: priorityCounts.Low, color: '#64748B' },
  ];

  // Rollover severity distribution
  const rolloverDist = {
    none: filteredTasks.filter((t) => t.rollover_count === 0).length,
    once: filteredTasks.filter((t) => t.rollover_count === 1).length,
    twoThree: filteredTasks.filter((t) => t.rollover_count >= 2 && t.rollover_count <= 3).length,
    severe: filteredTasks.filter((t) => t.rollover_count > 3).length,
  };

  const rolloverDistData = [
    { name: '无顺延 (准时执行)', count: rolloverDist.none, color: '#10B981' },
    { name: '顺延 1 天', count: rolloverDist.once, color: '#F59E0B' },
    { name: '顺延 2-3 天', count: rolloverDist.twoThree, color: '#F97316' },
    { name: '严重滞后 (4天+)', count: rolloverDist.severe, color: '#EF4444' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Date Range Filter */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              <span>Work Reports & Multi-dim Analytics</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              多维度聚合算法：涵盖任务按时完成率、来源分布 (Teams/Email/Ticket)、拖延滞后顺延率分析。
            </p>
          </div>

          {/* Date Filter Range Select */}
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200 text-xs">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateFilterRange)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="this_week">本周 (This Week)</option>
              <option value="this_month">本月 (This Month)</option>
              <option value="this_quarter">本季度 (This Quarter)</option>
              <option value="this_year">本年度 (This Year)</option>
              <option value="all">全部历史 (All Time)</option>
            </select>
          </div>
        </div>

        {/* Date Boundaries Indicator */}
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>统计区间: {startBoundary} ~ {endBoundary}</span>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            总具体任务数
          </span>
          <div className="text-3xl font-bold text-slate-900">{totalCount} <span className="text-sm font-normal text-slate-500">项</span></div>
          <p className="text-xs text-slate-400">进行中: {inProgressCount} • 待办: {todoCount}</p>
        </div>

        {/* Completion Rate Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            任务按时完成率
          </span>
          <div className="text-3xl font-bold text-emerald-600">{completionRate}%</div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        {/* Total Rollover Events */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            自动顺延总人天数
          </span>
          <div className="text-3xl font-bold text-amber-600">{totalRolloverEvents} <span className="text-sm font-normal text-slate-500">次</span></div>
          <p className="text-xs text-amber-700">累计造成延迟的顺延动作总数</p>
        </div>

        {/* Rolled Tasks Ratio */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            受顺延波及任务数
          </span>
          <div className="text-3xl font-bold text-indigo-600">{tasksRolledCount} <span className="text-sm font-normal text-slate-500">项</span></div>
          <p className="text-xs text-slate-400">占比总体任务的 {totalCount > 0 ? Math.round((tasksRolledCount / totalCount) * 100) : 0}%</p>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Breakdown Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-800">任务多源分布 (Source Breakdown)</h3>
            <p className="text-xs text-slate-400">统计 Teams、Email、Ticket、Meeting 等来源的任务比重</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', border: 'none', color: '#FFF', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {sourceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={sourceColors[index % sourceColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rollover Severity Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-800">跨天顺延分布 (Rollover Health)</h3>
            <p className="text-xs text-slate-400">评估团队与个人对未完成任务的拖延积压健康度</p>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={rolloverDistData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {rolloverDistData.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', border: 'none', color: '#FFF', fontSize: '12px' }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2">
            {rolloverDistData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-slate-600">{d.name}: <strong>{d.count}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
