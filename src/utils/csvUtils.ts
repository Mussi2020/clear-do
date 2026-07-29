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
 * Exports tasks array into a well-formatted CSV string with all fields
 */
export function exportTasksToCsv(items: TaskItemData[]): string {
  const headers = [
    'ID',
    'Type',
    'Title',
    'Requester',
    'Handler',
    'Description/Notes',
    'Source',
    'Priority',
    'Status',
    'Parent ID',
    'Created At',
    'Planned Date',
    'Completed At',
    'Rollover Count',
  ];

  const rows = items.map((item) => [
    escapeCsvCell(item.id),
    escapeCsvCell(item.type),
    escapeCsvCell(item.title),
    escapeCsvCell(item.requester || ''),
    escapeCsvCell(item.handler || ''),
    escapeCsvCell(item.description || ''),
    escapeCsvCell(item.source),
    escapeCsvCell(item.priority),
    escapeCsvCell(item.status),
    escapeCsvCell(item.parent_id || ''),
    escapeCsvCell(item.created_at),
    escapeCsvCell(item.planned_date),
    escapeCsvCell(item.completed_at || ''),
    escapeCsvCell(item.rollover_count || 0),
  ]);

  return ['\uFEFF' + headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Backward compatible CSV and JSON parser.
 * Reads CSV or JSON rows and handles missing/Chinese columns seamlessly, assigning safe defaults.
 */
export function parseCsvToTasks(rawText: string): TaskItemData[] {
  if (!rawText || !rawText.trim()) return [];

  const text = rawText.trim();

  // 1. Try parsing as JSON format first
  if (text.startsWith('[') || text.startsWith('{')) {
    try {
      const parsed = JSON.parse(text);
      const itemsArray = Array.isArray(parsed) ? parsed : (parsed.items || parsed.tasks || []);
      if (Array.isArray(itemsArray) && itemsArray.length > 0) {
        return itemsArray.map((item: any, idx: number) => ({
          id: String(item.id || `import_json_${Date.now()}_${idx}`),
          type: (item.type === 'project' || item.type?.includes?.('项目')) ? 'project' : 'task',
          title: String(item.title || item.name || item.标题内容 || item.标题 || `Imported Task ${idx + 1}`),
          description: item.description || item.notes || item.描述 || item.备注说明 || item.备注 || undefined,
          source: (['Teams', 'WeCom', 'PhoneChat', 'Email', 'Ticket', 'Meeting', 'Other'].includes(item.source)
            ? item.source
            : (item.source === '企业微信' || item.source === '企微' ? 'WeCom'
              : (item.source === '电话/聊天' || item.source === '电话，聊天' || item.source === '电话' || item.source === '聊天' ? 'PhoneChat' : 'Other'))) as TaskSource,
          priority: (['High', 'Medium', 'Low'].includes(item.priority) ? item.priority : 'Medium') as TaskPriority,
          status: (['Todo', 'In Progress', 'Done', 'Cancelled'].includes(item.status) ? item.status : (item.completed_at ? 'Done' : 'Todo')) as TaskStatus,
          parent_id: (item.parent_id && item.parent_id !== '无' && item.parent_id !== '无（独立条目）' && item.parent_id !== '-') ? String(item.parent_id) : null,
          requester: item.requester || item.需求方 || item.需求人 || undefined,
          handler: item.handler || item.接口人 || item.传递 || item.处理人 || undefined,
          created_at: normalizeDateStr(item.created_at || item.创建日期) || getTodayStr(),
          planned_date: normalizeDateStr(item.planned_date || item.计划日期) || getTodayStr(),
          completed_at: normalizeDateStr(item.completed_at || item.完成日期),
          rollover_count: typeof item.rollover_count === 'number' ? item.rollover_count : (typeof item.顺延次数 === 'number' ? item.顺延次数 : 0),
          rollover_history: Array.isArray(item.rollover_history) ? item.rollover_history : [],
          attachments: Array.isArray(item.attachments) ? item.attachments : [],
        }));
      }
    } catch (e) {
      // Not JSON, fallback to CSV parsing
    }
  }

  // 2. Parse as CSV
  // Remove UTF-8 BOM if present
  const cleanCsvText = text.replace(/^\uFEFF/, '');
  const lines = cleanCsvText
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

    // Helper map column by header name keywords or index fallback
    const getCol = (keywords: string[], fallbackIdx: number): string => {
      for (const kw of keywords) {
        const idx = headers.findIndex((h) => h.includes(kw.toLowerCase()));
        if (idx >= 0 && idx < columns.length) {
          return columns[idx].trim();
        }
      }
      if (fallbackIdx < columns.length) {
        return columns[fallbackIdx].trim();
      }
      return '';
    };

    const id = getCol(['id', '条目id', '编号'], 0) || `import_${Date.now()}_${i}`;
    const typeStr = getCol(['type', '类型'], 1).toLowerCase();
    const type: TaskType = (typeStr.includes('project') || typeStr.includes('项目')) ? 'project' : 'task';
    const title = getCol(['title', '标题', '标题内容', '名称', 'name'], 2) || `Imported Task ${i}`;

    const requester = getCol(['requester', '需求', '需求方', '需求人'], 3) || undefined;
    const handler = getCol(['handler', '传递', '接口人', '处理人', 'assignee', '执行人'], 4) || undefined;
    const description = getCol(['description', 'notes', 'note', '描述', '备注说明', '备注', '说明'], 5) || undefined;

    const sourceStr = getCol(['source', '来源'], 6);
    let source: TaskSource = 'Other';
    if (sourceStr.includes('Teams')) source = 'Teams';
    else if (sourceStr.includes('WeCom') || sourceStr.includes('企业微信') || sourceStr.includes('企微')) source = 'WeCom';
    else if (sourceStr.includes('Phone') || sourceStr.includes('Chat') || sourceStr.includes('电话') || sourceStr.includes('聊天')) source = 'PhoneChat';
    else if (sourceStr.includes('Email') || sourceStr.includes('邮件')) source = 'Email';
    else if (sourceStr.includes('Ticket') || sourceStr.includes('工单')) source = 'Ticket';
    else if (sourceStr.includes('Meeting') || sourceStr.includes('会议')) source = 'Meeting';

    const priorityStr = getCol(['priority', '优先级'], 7);
    let priority: TaskPriority = 'Medium';
    if (priorityStr.includes('High') || priorityStr.includes('高')) priority = 'High';
    else if (priorityStr.includes('Low') || priorityStr.includes('低')) priority = 'Low';
    else if (priorityStr.includes('Medium') || priorityStr.includes('中')) priority = 'Medium';

    const statusStr = getCol(['status', '状态'], 8);
    let status: TaskStatus = 'Todo';
    if (statusStr.includes('Done') || statusStr.includes('已完成') || statusStr.includes('完成') || statusStr.includes('Completed')) {
      status = 'Done';
    } else if (statusStr.includes('Progress') || statusStr.includes('进行中')) {
      status = 'In Progress';
    } else if (statusStr.includes('Cancel') || statusStr.includes('取消')) {
      status = 'Cancelled';
    }

    const rawParentId = getCol(['parent_id', '父级id', 'parent', '父级', '归属项目'], 10);
    const parentId = (rawParentId && !rawParentId.includes('无') && rawParentId !== '-') ? rawParentId : null;

    const createdAtRaw = getCol(['created', '创建日期', '创建时间'], 11);
    const plannedDateRaw = getCol(['planned', '计划日期', '计划时间'], 12);
    const completedAtRaw = getCol(['completed', '完成日期', '完成时间'], 13);

    const createdAt = normalizeDateStr(createdAtRaw) || getTodayStr();
    const plannedDate = normalizeDateStr(plannedDateRaw) || getTodayStr();
    let completedAt = normalizeDateStr(completedAtRaw);

    if (status === 'Done' && !completedAt) {
      completedAt = plannedDate || getTodayStr();
    }

    const rolloverRaw = getCol(['rollover', '顺延次数', '顺延'], 14);
    const rolloverCount = parseInt(rolloverRaw, 10) || 0;

    const cleanFieldVal = (v: string | undefined) => {
      if (!v || v === '-' || v === '无' || v === 'null' || v === 'undefined') return undefined;
      return v;
    };

    tasks.push({
      id,
      type,
      title,
      description: cleanFieldVal(description),
      source,
      priority,
      status,
      parent_id: parentId,
      requester: cleanFieldVal(requester),
      handler: cleanFieldVal(handler),
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
 * Normalizes date strings (e.g. 2026/7/28, 2026-07-28 10:00, ISO format) to YYYY-MM-DD
 */
function normalizeDateStr(dateStr: string | null | undefined): string | null {
  if (!dateStr || dateStr === '-' || dateStr === '无' || dateStr === 'null') return null;
  const match = dateStr.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (match) {
    const y = match[1];
    const m = match[2].padStart(2, '0');
    const d = match[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return null;
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
