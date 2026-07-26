import { TaskItemData, TaskStatus } from '../types';
import { getTodayStr } from './dateUtils';

const STORAGE_KEY = 'flowtask_items_v2';
const LAST_CHECK_KEY = 'flowtask_last_rollover_date';

// Seed initial realistic data for instant demonstration
const INITIAL_SEED_DATA: TaskItemData[] = [
  {
    id: 'proj-101',
    type: 'project',
    parent_id: null,
    title: '🚀 Q3 跨平台 API 架构重构',
    description: '针对后端 Microservices 架构与前端对接接口进行规范整理',
    source: 'Teams',
    priority: 'High',
    created_at: getTodayStr(-5),
    planned_date: getTodayStr(2),
    completed_at: null,
    status: 'In Progress',
    rollover_count: 0,
    rollover_history: [],
    tags: ['架构', '核心'],
    attachments: [
      {
        id: 'att-seed-1',
        name: 'API_Architecture_v2.pdf',
        size: 1420000,
        type: 'application/pdf',
        url: 'data:application/pdf;base64,JVBERi0xLjQKJ...',
        uploadedAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: 'att-seed-2',
        name: 'Microservice_Topology.png',
        size: 580000,
        type: 'image/png',
        url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=60',
        uploadedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ]
  },
  {
    id: 'task-1001',
    type: 'task',
    parent_id: 'proj-101',
    title: '梳理 Teams 组内反馈的 API 鉴权机制缺陷',
    description: '整理来自 Teams 架构讨论群的 4 个 Token 刷新漏洞',
    source: 'Teams',
    priority: 'High',
    created_at: getTodayStr(-3),
    planned_date: getTodayStr(), // Today
    completed_at: null,
    status: 'In Progress',
    rollover_count: 2, // Rolled over twice already!
    rollover_history: [
      {
        id: 'roll-1',
        from_date: getTodayStr(-2),
        to_date: getTodayStr(-1),
        date_rolled: new Date(Date.now() - 86400000).toISOString(),
        reason: '跨天未完成自动顺延'
      },
      {
        id: 'roll-2',
        from_date: getTodayStr(-1),
        to_date: getTodayStr(),
        date_rolled: new Date().toISOString(),
        reason: '跨天未完成自动顺延'
      }
    ],
    attachments: [
      {
        id: 'att-seed-3',
        name: 'Teams_Auth_Bug_Screenshot.png',
        size: 340000,
        type: 'image/png',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
        uploadedAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 'task-1002',
    type: 'task',
    parent_id: 'proj-101',
    title: '撰写 OpenAPI 3.0 文档草案',
    description: '导出 Swagger Spec 并与客户端团队确认接口字段定义',
    source: 'Ticket',
    priority: 'Medium',
    created_at: getTodayStr(-4),
    planned_date: getTodayStr(-1), // Completed yesterday
    completed_at: getTodayStr(-1),
    status: 'Done',
    rollover_count: 0,
    rollover_history: []
  },
  {
    id: 'task-1003',
    type: 'task',
    parent_id: 'proj-101',
    title: '与 DevOps 团队对接 CI/CD 自动部署脚本',
    description: '搭建测试环境 Runner 自动测试套件',
    source: 'Meeting',
    priority: 'Medium',
    created_at: getTodayStr(-1),
    planned_date: getTodayStr(),
    completed_at: null,
    status: 'Todo',
    rollover_count: 0,
    rollover_history: []
  },
  {
    id: 'proj-102',
    type: 'project',
    parent_id: null,
    title: '✉️ 客户邮件工单响应与服务升级',
    description: '针对企业级 VIP 客户工单流程建立快速响应机制',
    source: 'Email',
    priority: 'Medium',
    created_at: getTodayStr(-10),
    planned_date: getTodayStr(5),
    completed_at: null,
    status: 'In Progress',
    rollover_count: 0,
    rollover_history: []
  },
  {
    id: 'task-1004',
    type: 'task',
    parent_id: 'proj-102',
    title: '回复 VIP 客户关切邮件 (Ticket #8841)',
    description: '就昨晚系统短时抖动进行原因说明并回复邮件',
    source: 'Email',
    priority: 'High',
    created_at: getTodayStr(-2),
    planned_date: getTodayStr(),
    completed_at: null,
    status: 'Todo',
    rollover_count: 1, // Rolled over once
    rollover_history: [
      {
        id: 'roll-3',
        from_date: getTodayStr(-1),
        to_date: getTodayStr(),
        date_rolled: new Date().toISOString(),
        reason: '跨天未完成自动顺延'
      }
    ]
  },
  {
    id: 'task-1005',
    type: 'task',
    parent_id: null, // Standalone Task
    title: '准备周五跨部门例会汇报 PPT',
    description: '列出本周 OKR 进展与跨部门依赖风险项',
    source: 'Meeting',
    priority: 'Medium',
    created_at: getTodayStr(-1),
    planned_date: getTodayStr(),
    completed_at: null,
    status: 'Todo',
    rollover_count: 0,
    rollover_history: []
  },
  {
    id: 'task-1006',
    type: 'task',
    parent_id: null, // Standalone Task
    title: '审核 Jira 工单 #339 缺陷修复测试报告',
    description: '前端页面适配极窄屏幕下的排版样式 Bug',
    source: 'Ticket',
    priority: 'Low',
    created_at: getTodayStr(-2),
    planned_date: getTodayStr(-1),
    completed_at: getTodayStr(-1),
    status: 'Done',
    rollover_count: 0,
    rollover_history: []
  }
];

export function getStoredItems(): TaskItemData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_DATA));
      return INITIAL_SEED_DATA;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored task items:', e);
    return INITIAL_SEED_DATA;
  }
}

export const loadStoredItems = getStoredItems;

export function saveStoredItems(items: TaskItemData[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save task items:', e);
  }
}

export const saveItemsToStorage = saveStoredItems;

export interface RolloverExecutionResult {
  rolledCount: number;
  rolledTasks: TaskItemData[];
  updatedItems: TaskItemData[];
  effectiveDate: string;
  totalRolledThisCheck: number;
}

/**
 * CORE AUTO-ROLLOVER LOGIC:
 * Checks all tasks against effective date (defaults to today).
 * Any task with status Todo or In Progress whose planned_date is BEFORE targetDate
 * will have planned_date updated to targetDate, rollover_count incremented by 1,
 * and entry logged into rollover_history.
 */
export function executeAutoRollover(
  items: TaskItemData[],
  targetDate: string = getTodayStr()
): RolloverExecutionResult {
  let rolledCount = 0;
  const rolledTasks: TaskItemData[] = [];

  const updatedItems = items.map(item => {
    // Only 'task' type items undergo rollover, and only if not completed/cancelled
    if (
      item.type === 'task' &&
      (item.status === 'Todo' || item.status === 'In Progress') &&
      item.planned_date < targetDate
    ) {
      rolledCount++;
      const updatedTask: TaskItemData = {
        ...item,
        planned_date: targetDate,
        rollover_count: item.rollover_count + 1,
        rollover_history: [
          ...item.rollover_history,
          {
            id: `roll-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            from_date: item.planned_date,
            to_date: targetDate,
            date_rolled: new Date().toISOString(),
            reason: '跨天未完成系统自动顺延'
          }
        ]
      };
      rolledTasks.push(updatedTask);
      return updatedTask;
    }
    return item;
  });

  if (rolledCount > 0) {
    saveStoredItems(updatedItems);
  }

  localStorage.setItem(LAST_CHECK_KEY, targetDate);

  return {
    rolledCount,
    rolledTasks,
    updatedItems,
    effectiveDate: targetDate,
    totalRolledThisCheck: rolledCount
  };
}

/**
 * STATUS SYNC ENGINE:
 * Checks if all sub-tasks under a project are marked 'Done'.
 * Returns whether the parent project should automatically or interactively sync to 'Done'.
 */
export function checkProjectStatusSync(
  projectId: string,
  items: TaskItemData[]
): { allTasksDone: boolean; projectItem: TaskItemData | undefined; subTasks: TaskItemData[] } {
  const projectItem = items.find(i => i.id === projectId && i.type === 'project');
  const subTasks = items.filter(i => i.parent_id === projectId && i.type === 'task');

  if (!projectItem || subTasks.length === 0) {
    return { allTasksDone: false, projectItem, subTasks: [] };
  }

  const allTasksDone = subTasks.every(st => st.status === 'Done');
  return { allTasksDone, projectItem, subTasks };
}

/**
 * Reset demo data back to initial seed state
 */
export function resetDemoData(): TaskItemData[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_DATA));
  localStorage.setItem(LAST_CHECK_KEY, getTodayStr());
  return INITIAL_SEED_DATA;
}

export const resetToInitialSeedData = resetDemoData;
