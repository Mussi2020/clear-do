import { TaskItemData, TaskPriority, TaskSource, TaskType } from '../types';
import { getTodayStr } from './dateUtils';

export interface ParsedCommand {
  type: TaskType;
  title: string;
  source: TaskSource;
  priority: TaskPriority;
  parentId: string | null;
  parentTitle?: string;
  plannedDate: string;
  matchedTokens: {
    isProject: boolean;
    projectName?: string;
    source?: TaskSource;
    priority?: TaskPriority;
    plannedDate?: string;
  };
}

/**
 * Parses a input text string containing syntax tokens like:
 * - /p or /project (Creates a Project)
 * - @ProjectName (Links to existing parent project)
 * - !Teams, !Email, !Ticket, !Meeting, !Other (Source)
 * - #High, #Medium, #Low, #高, #中, #低 (Priority)
 * - ^today, ^tomorrow, ^2026-07-28 (Planned Date)
 */
export function parseQuickAddInput(
  rawInput: string,
  existingProjects: TaskItemData[] = []
): ParsedCommand {
  let text = rawInput.trim();
  let type: TaskType = 'task';
  let source: TaskSource = 'Other';
  let priority: TaskPriority = 'Medium';
  let parentId: string | null = null;
  let parentTitle: string | undefined = undefined;
  let plannedDate: string = getTodayStr();

  const matchedTokens: ParsedCommand['matchedTokens'] = {
    isProject: false,
  };

  // 1. Check for /p or /project directive
  if (text.startsWith('/p ') || text === '/p' || text.startsWith('/project ') || text === '/project') {
    type = 'project';
    matchedTokens.isProject = true;
    text = text.replace(/^\/(p|project)(\s+|$)/i, '');
  }

  // 2. Extract Source tag (!Teams, !WeCom, !PhoneChat, !Email, !Ticket, !Meeting, !Other, etc.)
  const sourceRegex = /!(Teams|WeCom|PhoneChat|Phone|Chat|Email|Ticket|Meeting|Other|企业微信|企微|电话|聊天|邮件|工单|会议|其他)/i;
  const sourceMatch = text.match(sourceRegex);
  if (sourceMatch) {
    const rawSrc = sourceMatch[1].toLowerCase();
    if (rawSrc.includes('teams')) source = 'Teams';
    else if (rawSrc.includes('wecom') || rawSrc.includes('企业微信') || rawSrc.includes('企微')) source = 'WeCom';
    else if (rawSrc.includes('phone') || rawSrc.includes('chat') || rawSrc.includes('电话') || rawSrc.includes('聊天')) source = 'PhoneChat';
    else if (rawSrc.includes('email') || rawSrc.includes('邮件')) source = 'Email';
    else if (rawSrc.includes('ticket') || rawSrc.includes('工单')) source = 'Ticket';
    else if (rawSrc.includes('meeting') || rawSrc.includes('会议')) source = 'Meeting';
    else source = 'Other';

    matchedTokens.source = source;
    text = text.replace(sourceMatch[0], '');
  }

  // 3. Extract Priority tag (#High, #Medium, #Low, #高, #中, #低)
  const priorityRegex = /#(High|Medium|Low|高|中|低)/i;
  const priorityMatch = text.match(priorityRegex);
  if (priorityMatch) {
    const rawPrio = priorityMatch[1].toLowerCase();
    if (rawPrio === 'high' || rawPrio === '高') priority = 'High';
    else if (rawPrio === 'low' || rawPrio === '低') priority = 'Low';
    else priority = 'Medium';

    matchedTokens.priority = priority;
    text = text.replace(priorityMatch[0], '');
  }

  // 4. Extract Planned Date tag (^today, ^tomorrow, ^YYYY-MM-DD)
  const dateRegex = /\^(today|tomorrow|明天|今天|\d{4}-\d{2}-\d{2})/i;
  const dateMatch = text.match(dateRegex);
  if (dateMatch) {
    const rawDate = dateMatch[1].toLowerCase();
    if (rawDate === 'today' || rawDate === '今天') {
      plannedDate = getTodayStr();
    } else if (rawDate === 'tomorrow' || rawDate === '明天') {
      plannedDate = getTodayStr(1);
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      plannedDate = rawDate;
    }
    matchedTokens.plannedDate = plannedDate;
    text = text.replace(dateMatch[0], '');
  }

  // 5. Extract Parent Project tag (@ProjectName or @ProjectTitle)
  const projectRegex = /@([^\s!#^]+)/;
  const projectMatch = text.match(projectRegex);
  if (projectMatch && type !== 'project') {
    const queryName = projectMatch[1].trim().toLowerCase();
    // Search existing projects
    const targetProject = existingProjects.find(
      p => p.type === 'project' && (p.title.toLowerCase().includes(queryName) || p.id === queryName)
    );

    if (targetProject) {
      parentId = targetProject.id;
      parentTitle = targetProject.title;
      matchedTokens.projectName = targetProject.title;
    } else {
      matchedTokens.projectName = projectMatch[1]; // unlinked target name
    }

    text = text.replace(projectMatch[0], '');
  }

  // Clean up extra double spaces
  const cleanTitle = text.replace(/\s+/g, ' ').trim();

  return {
    type,
    title: cleanTitle || (type === 'project' ? '未命名新项目' : '新具体任务'),
    source,
    priority,
    parentId,
    parentTitle,
    plannedDate,
    matchedTokens,
  };
}
