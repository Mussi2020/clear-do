import React, { useRef, useState } from 'react';
import { Download, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { TaskItemData, DateFilterRange } from '../../types';
import { filterTasksForExport, generateCSVContent, downloadCSVFile, ExportOptions } from '../../utils/exportUtils';
import { parseCsvToTasks } from '../../utils/csvUtils';
import { getTodayStr } from '../../utils/dateUtils';

interface ExportViewProps {
  items: TaskItemData[];
  onImportItems?: (importedItems: TaskItemData[]) => void;
}

export const ExportView: React.FC<ExportViewProps> = ({ items, onImportItems }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(previewItems, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FlowTask_Backup_${getTodayStr()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        try {
          const parsed = parseCsvToTasks(content);
          if (parsed.length > 0) {
            if (onImportItems) {
              onImportItems(parsed);
            }
            setImportStatus({
              type: 'success',
              message: `成功解析并导入 ${parsed.length} 条任务数据（含需求方、处理人、备注等完整字段）。`,
            });
          } else {
            setImportStatus({
              type: 'error',
              message: '未能从文件中解析出有效的任务数据，请检查文件内容。',
            });
          }
        } catch (err) {
          setImportStatus({
            type: 'error',
            message: '文件解析失败，请检查 CSV/JSON 数据格式。',
          });
        }
      }
    };
    reader.readAsText(file, 'utf-8');
    if (e.target) e.target.value = '';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
          <span>数据备份与导入导出 (Data Import & Export)</span>
        </h1>
        <p className="text-xs text-slate-500">
          全面支持任务 CSV 格式的灵活导出与历史备份恢复导入。内置 UTF-8 BOM 兼容模式，保证 Excel 无乱码。
        </p>
      </div>

      {/* CSV Import Module Card */}
      <div className="bg-white p-6 rounded-xl border border-indigo-100 shadow-2xs space-y-4 bg-linear-to-r from-indigo-50/30 to-white">
        <div className="flex items-center justify-between border-b border-indigo-100/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">导入 CSV 数据 (CSV Import)</h2>
              <p className="text-[11px] text-slate-500">
                支持导入本地 CSV 报表。即使字段存在缺失，系统将自动补齐并向下兼容恢复。
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>选择 CSV 或 JSON 备份导入</span>
          </button>
        </div>

        {importStatus && (
          <div
            className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
              importStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {importStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{importStatus.message}</span>
          </div>
        )}
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

          {/* Export Action Trigger Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              onClick={handleExportCSV}
              disabled={previewItems.length === 0}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>导出 UTF-8 CSV 报表 ({previewItems.length} 条)</span>
            </button>

            <button
              onClick={handleExportJSON}
              disabled={previewItems.length === 0}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              title="全量数据备份，跨设备迁移首选"
            >
              <Download className="w-4 h-4" />
              <span>导出 JSON 100% 完整备份文件</span>
            </button>
          </div>
        </div>

        {/* Live Data Preview Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-800">
              数据导出一览 Preview ({previewItems.length} 项)
            </h2>
            <span className="text-xs text-slate-400">已包含需求方、处理人及备注等完整属性</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="text-[11px] uppercase bg-slate-50 text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2">类型</th>
                  <th className="px-3 py-2">标题名称</th>
                  <th className="px-3 py-2">需求方</th>
                  <th className="px-3 py-2">处理人</th>
                  <th className="px-3 py-2">备注说明</th>
                  <th className="px-3 py-2">来源</th>
                  <th className="px-3 py-2">优先级</th>
                  <th className="px-3 py-2">状态</th>
                  <th className="px-3 py-2">顺延</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewItems.slice(0, 10).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-medium text-slate-500 shrink-0">
                      {item.type === 'project' ? '📁 Project' : '✅ Task'}
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-slate-800 max-w-[160px] truncate">
                      {item.title}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 max-w-[100px] truncate">
                      {item.requester || '-'}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 max-w-[100px] truncate">
                      {item.handler || '-'}
                    </td>
                    <td className="px-3 py-2.5 text-slate-500 max-w-[140px] truncate">
                      {item.description || '-'}
                    </td>
                    <td className="px-3 py-2.5">{item.source}</td>
                    <td className="px-3 py-2.5">{item.priority}</td>
                    <td className="px-3 py-2.5">{item.status}</td>
                    <td className="px-3 py-2.5 font-bold text-amber-600">
                      {item.rollover_count > 0 ? `${item.rollover_count}次` : '0'}
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
