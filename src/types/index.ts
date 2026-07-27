export type TaskType = 'project' | 'task';

export type TaskSource = 'Teams' | 'Email' | 'Ticket' | 'Meeting' | 'Other';

export type TaskPriority = 'High' | 'Medium' | 'Low';

export type TaskStatus = 'Todo' | 'In Progress' | 'Done' | 'Cancelled';

export interface RolloverLog {
  id: string;
  from_date: string;
  to_date: string;
  date_rolled: string; // ISO string when rollover was triggered
  reason?: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  size: number;
  type: string; // mime type or file extension e.g. 'image/png', 'pdf', 'docx'
  url: string; // Data URL or object URL
  uploadedAt: string; // ISO date string
}

export interface TaskItemData {
  id: string;
  type: TaskType;
  parent_id: string | null; // Null for root projects / standalone tasks; Project ID for subtasks
  title: string;
  description?: string;
  source: TaskSource;
  priority: TaskPriority;
  created_at: string; // YYYY-MM-DD
  planned_date: string; // YYYY-MM-DD
  completed_at: string | null; // YYYY-MM-DD or ISO string
  status: TaskStatus;
  rollover_count: number;
  rollover_history: RolloverLog[];
  tags?: string[];
  attachments?: TaskAttachment[];
  requester?: string; // 需求人/部门
  handler?: string;   // 传递人员/部门
}

export type ViewMode = 'today' | 'projects' | 'reports' | 'export' | 'rollover';

export type DateFilterRange = 'today' | 'this_week' | 'this_month' | 'this_quarter' | 'this_year' | 'all' | 'custom';

export type LanguageCode = 'zh' | 'en';

export type FontFamilyType = 'sans' | 'serif' | 'mono' | 'inter';

export type FontSizeScale = 'compact' | 'normal' | 'large';

export type ThemeColorName = 'red' | 'indigo' | 'slate' | 'emerald';

export type MonitorWidgetType = 
  | 'today' 
  | 'last_month' 
  | 'this_month' 
  | 'open_by_priority' 
  | 'task_rolled';

export interface SettingsState {
  language: LanguageCode;
  fontFamily: FontFamilyType;
  fontSize: FontSizeScale;
  themeColor: ThemeColorName;
  autoRolloverEnabled: boolean;
  rolloverTime: string;
  monitorVisible: boolean;
  monitorWidth: number;
  activeWidgets: MonitorWidgetType[];
}

export interface ReportStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  completionRate: number;
  totalRollovers: number;
  rolledOverTasksCount: number;
  sourceBreakdown: Record<TaskSource, number>;
  priorityBreakdown: Record<TaskPriority, number>;
}
