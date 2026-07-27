import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Edit3, 
  MoreHorizontal,
  History,
  Folder,
  Paperclip,
  ChevronDown,
  ChevronUp,
  User,
  Share2
} from 'lucide-react';
import { TaskItemData, TaskStatus, TaskAttachment, TaskSource, TaskPriority } from '../types';
import { daysBetween, getTodayStr } from '../utils/dateUtils';
import { AttachmentSection } from './Attachments/AttachmentSection';
import { AttachmentPreviewModal } from './Modals/AttachmentPreviewModal';
import { LinkifiedText } from './LinkifiedText';

interface TaskItemProps {
  task: TaskItemData;
  parentProjectName?: string;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: TaskItemData) => void;
  onOpenHistory?: (task: TaskItemData) => void;
  onUpdateTask?: (updated: TaskItemData) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  parentProjectName,
  onUpdateStatus,
  onDeleteTask,
  onEditTask,
  onOpenHistory,
  onUpdateTask,
}) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<TaskAttachment | null>(null);

  const attachments = task.attachments || [];
  const attachmentCount = attachments.length;

  const sourceMacaronStyles: Record<string, string> = {
    Teams: 'bg-[#E0E7FF] text-[#4338CA]',
    Email: 'bg-[#DBEAFE] text-[#1E40AF]',
    Ticket: 'bg-[#DCFCE7] text-[#166534]',
    Meeting: 'bg-[#F3E8FF] text-[#6B21A8]',
    Other: 'bg-slate-100 text-slate-700',
  };

  const priorityDots: Record<string, string> = {
    High: 'bg-red-500',
    Medium: 'bg-amber-500',
    Low: 'bg-slate-400',
  };

  const isDone = task.status === 'Done';
  const isCancelled = task.status === 'Cancelled';

  const createdDateStr = task.created_at ? task.created_at.split('T')[0] : getTodayStr();
  const todayStr = getTodayStr();
  const durationDays = daysBetween(createdDateStr, todayStr);

  const renderRolloverBadge = (count: number) => {
    if (count <= 0) return null;
    return (
      <div className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded flex items-center gap-1 shrink-0 shadow-2xs">
        <AlertTriangle className="w-3 h-3 text-amber-600" />
        <span>Rolled {count}d</span>
      </div>
    );
  };

  return (
    <div className={`group bg-white border border-slate-200/90 rounded-lg py-2 px-3 flex items-start gap-2.5 hover:border-indigo-300 hover:shadow-2xs transition-all ${
      isDone ? 'opacity-60 grayscale-[0.2] bg-slate-50/50' : isCancelled ? 'opacity-40' : ''
    }`}>
      {/* Checkbox */}
      <button
        onClick={() => {
          const nextStatus: TaskStatus = isDone ? 'Todo' : 'Done';
          onUpdateStatus(task.id, nextStatus);
        }}
        className="mt-0.5 cursor-pointer shrink-0 text-slate-300 hover:text-indigo-600 transition-colors"
        title={`Status: ${task.status} (Click to toggle)`}
      >
        {isDone ? (
          <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white">
            <CheckCircle2 className="w-3 h-3" />
          </div>
        ) : task.status === 'In Progress' ? (
          <div className="w-4 h-4 border-2 border-amber-500 bg-amber-50 rounded-full shrink-0 animate-pulse" />
        ) : (
          <div className="w-4 h-4 border-2 border-slate-300 rounded-full shrink-0 hover:border-indigo-500" />
        )}
      </button>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        {/* Line 1: Task Title & Parent Project */}
        <div className="flex items-center gap-2 flex-wrap leading-tight">
          <span
            onClick={() => onEditTask(task)}
            className={`font-semibold text-sm break-words cursor-pointer hover:text-indigo-600 transition-colors ${
              isDone ? 'line-through text-slate-400' : 'text-slate-800'
            }`}
            title="点击查看/编辑任务详情与备注"
          >
            {task.title}
          </span>

          {parentProjectName && (
            <span className="flex items-center gap-0.5 font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded text-[10px]">
              <Folder className="w-2.5 h-2.5 text-slate-400" />
              <span>{parentProjectName}</span>
            </span>
          )}
        </div>

        {/* Line 2: Date (No "创建于:"), Source Dropdown, Priority Dropdown, Duration, Attachments, Requester/Handler */}
        <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-2 leading-none">
          {/* Direct Date (e.g. 2026-07-27) */}
          <span className="font-medium text-slate-500">{createdDateStr}</span>

          <span>•</span>

          {/* Source Quick Select Dropdown */}
          <div className="relative inline-flex items-center bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-1.5 py-0.2 rounded">
            <select
              value={task.source}
              onChange={(e) => {
                e.stopPropagation();
                const newSource = e.target.value as TaskSource;
                if (onUpdateTask) {
                  onUpdateTask({ ...task, source: newSource });
                }
              }}
              className={`bg-transparent focus:outline-none cursor-pointer text-[9px] font-extrabold uppercase tracking-wider ${
                sourceMacaronStyles[task.source] || sourceMacaronStyles.Other
              }`}
              title="点击更改来源"
            >
              <option value="Teams">TEAMS</option>
              <option value="Email">EMAIL</option>
              <option value="Ticket">TICKET</option>
              <option value="Meeting">MEETING</option>
              <option value="Other">OTHER</option>
            </select>
          </div>

          {/* Priority Quick Select Dropdown */}
          <div className="relative inline-flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-1.5 py-0.2 rounded text-[10px] font-medium text-slate-700">
            <span className={`w-1.5 h-1.5 rounded-full ${priorityDots[task.priority] || priorityDots.Medium}`} />
            <select
              value={task.priority}
              onChange={(e) => {
                e.stopPropagation();
                const newPriority = e.target.value as TaskPriority;
                if (onUpdateTask) {
                  onUpdateTask({ ...task, priority: newPriority });
                }
              }}
              className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-700 text-[10px]"
              title="点击快速更改优先级"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <span>•</span>

          {/* Duration */}
          <span className="font-medium text-indigo-600/90">持续 {durationDays} 天</span>

          {task.completed_at && (
            <span className="text-emerald-600 font-medium">• 已完结: {task.completed_at}</span>
          )}

          {/* Attachment Badge / Toggle Button */}
          <button
            onClick={() => setShowAttachments(!showAttachments)}
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
              attachmentCount > 0
                ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
            }`}
            title={attachmentCount > 0 ? `查看 ${attachmentCount} 个附件` : "添加/管理附件"}
          >
            <Paperclip className="w-2.5 h-2.5" />
            <span>{attachmentCount > 0 ? `${attachmentCount} 附件` : '附件'}</span>
            {attachmentCount > 0 && (
              showAttachments ? <ChevronUp className="w-2.5 h-2.5 ml-0.5" /> : <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
            )}
          </button>

          {/* Requester & Handler Badges */}
          {(task.requester || task.handler) && (
            <span className="inline-flex items-center gap-1.5 px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px]">
              {task.requester && (
                <span className="flex items-center gap-0.5" title="需求人/部门">
                  <User className="w-2.5 h-2.5 text-indigo-500" />
                  <span>{task.requester}</span>
                </span>
              )}
              {task.requester && task.handler && <span>/</span>}
              {task.handler && (
                <span className="flex items-center gap-0.5" title="传递人/部门">
                  <Share2 className="w-2.5 h-2.5 text-amber-500" />
                  <span>{task.handler}</span>
                </span>
              )}
            </span>
          )}
        </div>

        {/* Expandable Attachment Panel */}
        {showAttachments && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 animate-in fade-in duration-150">
            <AttachmentSection
              attachments={attachments}
              compact={true}
              readOnly={!onUpdateTask}
              onChange={(newAtts) => {
                if (onUpdateTask) {
                  onUpdateTask({
                    ...task,
                    attachments: newAtts,
                  });
                }
              }}
              onPreview={setPreviewAttachment}
            />
          </div>
        )}
      </div>

      <AttachmentPreviewModal
        attachment={previewAttachment}
        isOpen={!!previewAttachment}
        onClose={() => setPreviewAttachment(null)}
      />

      {/* Rollover Warning Badge */}
      {renderRolloverBadge(task.rollover_count)}

      {/* Hover Action Buttons */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 mt-0.5">
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
            title="Change status"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showStatusMenu && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 text-xs">
              <button
                onClick={() => {
                  onUpdateStatus(task.id, 'Todo');
                  setShowStatusMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 cursor-pointer font-medium"
              >
                未开始 (Todo)
              </button>
              <button
                onClick={() => {
                  onUpdateStatus(task.id, 'In Progress');
                  setShowStatusMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-amber-600 cursor-pointer font-medium"
              >
                进行中 (In Progress)
              </button>
              <button
                onClick={() => {
                  onUpdateStatus(task.id, 'Done');
                  setShowStatusMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-emerald-600 cursor-pointer font-medium"
              >
                已完成 (Done)
              </button>
              <button
                onClick={() => {
                  onUpdateStatus(task.id, 'Cancelled');
                  setShowStatusMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-400 cursor-pointer font-medium"
              >
                已取消 (Cancelled)
              </button>
            </div>
          )}
        </div>

        {task.rollover_count > 0 && onOpenHistory && (
          <button
            onClick={() => onOpenHistory(task)}
            className="p-1 text-amber-500 hover:text-amber-700 cursor-pointer"
            title="View Rollover History Log"
          >
            <History className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => onEditTask(task)}
          className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
          title="Edit Task"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        <button
          onClick={() => onDeleteTask(task.id)}
          className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
          title="Delete Task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
