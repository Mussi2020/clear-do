import { TaskItemData, TaskPriority, TaskSource, TaskStatus, TaskType } from '../types';
import { getTodayStr } from './dateUtils';

/**
 * Escapes a cell value for CSV formatting
 */
function escapeCsvCell(str: string | number | undefined | null): string {
  if (str === null || str === undefined) return '""';
  const val = String(str).replace(/"/g, '""');
  return `"${val}"`;
}

/**
 * Exports tasks array into a well-formatted CSV string with header
 */
export function exportTasksToCsv(items: TaskItemData[]): string {
  const headers = [
    'ID',
    'Type',
    'Title',
    'Description/Notes',
    'Source',
    'Priority',
    'Status',
    'Parent ID',
    'Requester',
    'Handler',
    'Created At',
    'Planned Date',
    'Completed At',
    'Rollover Count',
  ];

  const rows = items.map((item) => [
    escapeCsvCell(item.id),
    escapeCsvCell(item.type),
    escapeCsvCell(item.title),
    escapeCsvCell(item.description || ''),
    escapeCsvCell(item.source),
    escapeCsvCell(item.priority),
    escapeCsvCell(item.status),
    escapeCsvCell(item.parent_id || ''),
    escapeCsvCell(item.requester || ''),
    escapeCsvCell(item.handler || ''),
    escapeCsvCell(item.created_at),
    escapeCsvCell(item.planned_date),
    escapeCsvCell(item.completed_at || ''),
    escapeCsvCell(item.rollover_count || 0),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Backward compatible CSV parser.
 * Reads CSV rows and handles missing columns seamlessly, assigning safe defaults.
 */
export function parseCsvToTasks(csvText: string): TaskItemData[] {
  if (!csvText || !csvText.trim()) return [];

  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  // Parse header row
  const headerLine = lines[0];
  const headers = parseCsvLine(headerLine).map((h) => h.toLowerCase().trim());

  const tasks: TaskItemData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const columns = parseCsvLine(rawLine);
    if (columns.length === 0) continue;

    // Helper map column by header name or index fallback
    const getCol = (name: string, fallbackIdx: number): string => {
      const idx = headers.findIndex((h) => h.includes(name.toLowerCase()));
      if (idx >= 0 && idx < columns.length) {
        return columns[idx].trim();
      }
      if (fallbackIdx < columns.length) {
        return columns[fallbackIdx].trim();
      }
      return '';
    };

    const id = getCol('id', 0) || `import_${Date.now()}_${i}`;
    const typeStr = getCol('type', 1).toLowerCase();
    const type: TaskType = typeStr.includes('project') ? 'project' : 'task';
    const title = getCol('title', 2) || getCol('name', 2) || `Imported Task ${i}`;
    const description = getCol('description', 3) || getCol('notes', 3) || getCol('note', 3) || undefined;
    
    const sourceStr = getCol('source', 4);
    const source: TaskSource = ['Teams', 'Email', 'Ticket', 'Meeting', 'Other'].includes(sourceStr)
      ? (sourceStr as TaskSource)
      : 'Other';

    const priorityStr = getCol('priority', 5);
    const priority: TaskPriority = ['High', 'Medium', 'Low'].includes(priorityStr)
      ? (priorityStr as TaskPriority)
      : 'Medium';

    const statusStr = getCol('status', 6);
    let status: TaskStatus = 'Todo';
    if (statusStr.includes('Done') || statusStr.includes('已完成') || statusStr.includes('Completed')) {
      status = 'Done';
    } else if (statusStr.includes('Progress') || statusStr.includes('进行中')) {
      status = 'In Progress';
    } else if (statusStr.includes('Cancel') || statusStr.includes('取消')) {
      status = 'Cancelled';
    }

    const parentId = getCol('parent', 7) || null;
    const requester = getCol('requester', 8) || getCol('需求', 8) || undefined;
    const handler = getCol('handler', 9) || getCol('传递', 9) || getCol('assignee', 9) || undefined;
    const createdAt = getCol('created', 10) || getTodayStr();
    const plannedDate = getCol('planned', 11) || getTodayStr();
    const completedAt = getCol('completed', 12) || (status === 'Done' ? getTodayStr() : null);
    const rolloverCount = parseInt(getCol('rollover', 13), 10) || 0;

    tasks.push({
      id,
      type,
      title,
      description,
      source,
      priority,
      status,
      parent_id: parentId,
      requester,
      handler,
      created_at: createdAt,
      planned_date: plannedDate,
      completed_at: completedAt,
      rollover_count: rolloverCount,
      rollover_history: [],
      attachments: [],
    });
  }

  return tasks;
}

/**
 * Custom line parser for comma-separated values supporting quotes
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur);
  return result;
}
