import React, { useState } from 'react';
import { Download, FileSpreadsheet, CheckCircle2, Filter, Calendar } from 'lucide-react';
import { TaskItemData, DateFilterRange, TaskSource } from '../../types';
import { filterTasksForExport, generateCSVContent, downloadCSVFile, ExportOptions } from '../../utils/exportUtils';
import { getTodayStr } from '../../utils/dateUtils';

interface ExportViewProps {
  items: TaskItemData[];
}

export const ExportView: React.FC<ExportViewProps> = ({ items }) => {
  const [options, setOptions] = useState<ExportOptions>({
    dateRange: 'all',
    customStartDate: '',
    customEndDate: '',
    includeProjects: true,
    includeTasks: true,
    onlyCompleted: false,
    filterSource: 'all',
  });

  const previewItems = filterTasksForExport(items, options);

  const handleExportCSV = () => {
    const csvContent = generateCSVContent(previewItems, items);
    const filename = `FlowTask_Report_${getTodayStr()}_${options.dateRange}.csv`;
    downloadCSVFile(filename, csvContent);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Download className="w-6 h-6 text-indigo-600" />
          <span>Export Work Reports (CSV/Excel)</span>
        </h1>
        <p className="text-xs text-slate-500">
          支持自定义时间范围、来源筛选、父子层级导出。带 UTF-8 BOM 编码，完美兼容 Microsoft Excel 中文展示。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Configuration Controls Panel */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-5">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
            导出选项设置
          </h2>

          {/* Date Range Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">时间范围 Filter</label>
            <select
              value={options.dateRange}
              onChange={(e) => setOptions({ ...options, dateRange: e.target.value as DateFilterRange })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">全部历史 (All Time)</option>
              <option value="this_week">本周 (This Week)</option>
              <option value="this_month">本月 (This Month)</option>
              <option value="this_quarter">本季度 (This Quarter)</option>
              <option value="this_year">本年度 (This Year)</option>
              <option value="custom">自定义日期区间</option>
            </select>
          </div>

          {/* Custom Date Boundary Inputs */}
          {options.dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] text-slate-400">开始日期</label>
                <input
                  type="date"
                  value={options.customStartDate}
                  onChange={(e) => setOptions({ ...options, customStartDate: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">结束日期</label>
                <input
                  type="date"
                  value={options.customEndDate}
                  onChange={(e) => setOptions({ ...options, customEndDate: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Source Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">来源 Tag 筛选</label>
            <select
              value={options.filterSource}
              onChange={(e) => setOptions({ ...options, filterSource: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">全部来源 (Teams/Email/Ticket...)</option>
              <option value="Teams">仅 Teams</option>
              <option value="Email">仅 Email (邮件)</option>
              <option value="Ticket">仅 Ticket (工单)</option>
              <option value="Meeting">仅 Meeting (会议)</option>
              <option value="Other">其他来源</option>
            </select>
          </div>

          {/* Type Toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={options.includeProjects}
                onChange={(e) => setOptions({ ...options, includeProjects: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>包含 Project (父项目节点)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={options.includeTasks}
                onChange={(e) => setOptions({ ...options, includeTasks: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>包含 Sub-tasks & Standalone Tasks</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={options.onlyCompleted}
                onChange={(e) => setOptions({ ...options, onlyCompleted: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>仅导出已完成 (Done) 的条目</span>
            </label>
          </div>

          {/* Export Action Trigger Button */}
          <button
            onClick={handleExportCSV}
            disabled={previewItems.length === 0}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>导出 UTF-8 CSV 报表文件 ({previewItems.length} 条)</span>
          </button>
        </div>

        {/* Live Data Preview Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-800">
              数据导出一览 Preview ({previewItems.length} 项)
            </h2>
            <span className="text-xs text-slate-400">已自动嵌入中文 BOM 标识</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="text-[11px] uppercase bg-slate-50 text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2">类型</th>
                  <th className="px-3 py-2">标题名称</th>
                  <th className="px-3 py-2">来源</th>
                  <th className="px-3 py-2">优先级</th>
                  <th className="px-3 py-2">状态</th>
                  <th className="px-3 py-2">顺延次数</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewItems.slice(0, 10).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-medium text-slate-500">
                      {item.type === 'project' ? '📁 Project' : '✅ Task'}
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-slate-800 max-w-[200px] truncate">
                      {item.title}
                    </td>
                    <td className="px-3 py-2.5">{item.source}</td>
                    <td className="px-3 py-2.5">{item.priority}</td>
                    <td className="px-3 py-2.5">{item.status}</td>
                    <td className="px-3 py-2.5 font-bold text-amber-600">
                      {item.rollover_count > 0 ? `${item.rollover_count} 次` : '0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {previewItems.length > 10 && (
              <p className="text-[11px] text-slate-400 text-center py-2">
                ... 及其余 {previewItems.length - 10} 项条目
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
