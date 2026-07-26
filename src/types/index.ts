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
}

export type ViewMode = 'today' | 'projects' | 'reports' | 'export' | 'rollover';

export type DateFilterRange = 'this_week' | 'this_month' | 'this_quarter' | 'this_year' | 'all' | 'custom';

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
