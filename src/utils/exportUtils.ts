import { DateFilterRange, TaskItemData } from '../types';
import { getDateRangeBoundaries, getTodayStr } from './dateUtils';

export interface ExportOptions {
  dateRange: DateFilterRange;
  customStartDate?: string;
  customEndDate?: string;
  includeProjects: boolean;
  includeTasks: boolean;
  onlyCompleted: boolean;
  filterSource?: string;
}

/**
 * Filter items according to user export choices
 */
export function filterTasksForExport(
  items: TaskItemData[],
  options: ExportOptions
): TaskItemData[] {
  const [startBoundary, endBoundary] = getDateRangeBoundaries(
    options.dateRange,
    options.customStartDate,
    options.customEndDate
  );

  return items.filter(item => {
    // Type filter
    if (item.type === 'project' && !options.includeProjects) return false;
    if (item.type === 'task' && !options.includeTasks) return false;

    // Source filter
    if (options.filterSource && options.filterSource !== 'all' && item.source !== options.filterSource) {
      return false;
    }

    // Completion status filter
    if (options.onlyCompleted && item.status !== 'Done') {
      return false;
    }

    // Date range filter
    // For completed tasks, we check completed_at or planned_date
    const checkDate = item.completed_at || item.planned_date || item.created_at;
    if (options.dateRange !== 'all') {
      if (checkDate < startBoundary || checkDate > endBoundary) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Generate CSV String with UTF-8 BOM byte marker (\uFEFF)
 * Formats hierarchy (Project -> Subtask) clearly
 */
export function generateCSVContent(
  items: TaskItemData[],
  allOriginalItems: TaskItemData[]
): string {
  // Header row - Comprehensive & Excel friendly with all fields
  const headers = [
    '条目ID',
    '类型',
    '标题内容',
    '需求方',
    '传递/接口人',
    '备注说明',
    '来源',
    '优先级',
    '状态',
    '归属项目/父级名称',
    '父级ID',
    '创建日期',
    '计划日期',
    '完成日期',
    '顺延次数',
    '是否曾顺延'
  ];

  // Helper map for project titles
  const projectMap = new Map<string, string>();
  allOriginalItems.forEach(i => {
    if (i.type === 'project') {
      projectMap.set(i.id, i.title);
    }
  });

  // Sort items so Projects come before their subtasks, and standalone tasks follow
  const sorted = [...items].sort((a, b) => {
    if (a.type === 'project' && b.type === 'task') return -1;
    if (a.type === 'task' && b.type === 'project') return 1;
    if (a.parent_id === b.parent_id) return a.created_at.localeCompare(b.created_at);
    return (a.parent_id || '').localeCompare(b.parent_id || '');
  });

  const rows = sorted.map(item => {
    const parentName = item.parent_id ? (projectMap.get(item.parent_id) || item.parent_id) : '无';
    const typeLabel = item.type === 'project' ? '项目 (Project)' : (item.parent_id ? '子任务 (Sub-task)' : '独立任务 (Task)');
    const isRolled = item.rollover_count > 0 ? '是' : '否';

    const cleanField = (str: string | number | null | undefined) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""'); // Escape double quotes
      return `"${s}"`;
    };

    return [
      cleanField(item.id),
      cleanField(typeLabel),
      cleanField(item.title),
      cleanField(item.requester || '-'),
      cleanField(item.handler || '-'),
      cleanField(item.description || '-'),
      cleanField(item.source),
      cleanField(item.priority),
      cleanField(item.status),
      cleanField(parentName),
      cleanField(item.parent_id || '-'),
      cleanField(item.created_at),
      cleanField(item.planned_date),
      cleanField(item.completed_at || '-'),
      cleanField(item.rollover_count || 0),
      cleanField(isRolled)
    ].join(',');
  });

  // Prefix with \uFEFF for UTF-8 BOM so Microsoft Excel correctly reads Chinese characters
  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

/**
 * Trigger browser file download
 */
export function downloadCSVFile(filename: string, csvData: string) {
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
