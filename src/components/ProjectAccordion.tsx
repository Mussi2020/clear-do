import React, { useState } from 'react';
import { 
  FolderKanban, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  CheckCircle2, 
  Edit3, 
  Trash2,
  Sparkles,
  Paperclip
} from 'lucide-react';
import { TaskItemData, TaskStatus, TaskAttachment } from '../types';
import { TaskItem } from './TaskItem';
import { AttachmentSection } from './Attachments/AttachmentSection';
import { AttachmentPreviewModal } from './Modals/AttachmentPreviewModal';

interface ProjectAccordionProps {
  project: TaskItemData;
  subTasks: TaskItemData[];
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  onDeleteProject: (projectId: string) => void;
  onEditProject: (project: TaskItemData) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: TaskItemData) => void;
  onQuickAddSubTask: (parentProjectId: string, parentTitle: string) => void;
  onOpenHistory?: (task: TaskItemData) => void;
  onUpdateTask?: (updated: TaskItemData) => void;
  defaultExpanded?: boolean;
}

export const ProjectAccordion: React.FC<ProjectAccordionProps> = ({
  project,
  subTasks,
  onUpdateStatus,
  onDeleteProject,
  onEditProject,
  onDeleteTask,
  onEditTask,
  onQuickAddSubTask,
  onOpenHistory,
  onUpdateTask,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showProjectAttachments, setShowProjectAttachments] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<TaskAttachment | null>(null);

  const projectAttachments = project.attachments || [];

  const completedSubTasks = subTasks.filter((t) => t.status === 'Done');
  const totalSubTasks = subTasks.length;
  const progressPercent = totalSubTasks > 0 ? Math.round((completedSubTasks.length / totalSubTasks) * 100) : 0;
  const allDone = totalSubTasks > 0 && completedSubTasks.length === totalSubTasks;
  const isProjectDone = project.status === 'Done';

  const sourceMacaronStyles: Record<string, string> = {
    Teams: 'bg-[#E0E7FF] text-[#4338CA]',
    Email: 'bg-[#DBEAFE] text-[#1E40AF]',
    Ticket: 'bg-[#DCFCE7] text-[#166534]',
    Meeting: 'bg-[#F3E8FF] text-[#6B21A8]',
    Other: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className={`bg-white rounded-lg border transition-all ${
      isProjectDone ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
    }`}>
      {/* Project Accordion Header */}
      <div className="py-2.5 px-3.5 flex items-center justify-between gap-2.5 select-none">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-indigo-600" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
            <FolderKanban className="w-3.5 h-3.5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 
                onClick={() => setIsExpanded(!isExpanded)}
                className={`text-sm font-bold tracking-tight cursor-pointer hover:text-indigo-600 transition-colors ${
                  isProjectDone ? 'line-through text-slate-400' : 'text-slate-800'
                }`}
              >
                Project: {project.title}
              </h3>

              <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded uppercase tracking-wider ${
                sourceMacaronStyles[project.source] || sourceMacaronStyles.Other
              }`}>
                {project.source}
              </span>

              <span className="px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase">
                {completedSubTasks.length}/{totalSubTasks} Subtasks
              </span>

              {/* Project Attachment Badge */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProjectAttachments(!showProjectAttachments);
                }}
                className={`flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold transition-colors cursor-pointer ${
                  projectAttachments.length > 0
                    ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800'
                }`}
                title="项目附件"
              >
                <Paperclip className="w-2.5 h-2.5" />
                <span>{projectAttachments.length > 0 ? `${projectAttachments.length} 项目附件` : '项目附件'}</span>
              </button>
            </div>
            {project.description && (
              <p className="text-[11px] text-slate-400 truncate mt-0.5">{project.description}</p>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onQuickAddSubTask(project.id, project.title)}
            className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md transition-colors cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>子任务</span>
          </button>

          <button
            onClick={() => onEditProject(project)}
            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            title="编辑项目"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteProject(project.id)}
            className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
            title="删除项目"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Project Attachments Drawer */}
      {showProjectAttachments && (
        <div className="mx-4 mb-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-in fade-in duration-150">
          <AttachmentSection
            attachments={projectAttachments}
            readOnly={!onUpdateTask}
            onChange={(newAtts) => {
              if (onUpdateTask) {
                onUpdateTask({
                  ...project,
                  attachments: newAtts,
                });
              }
            }}
            onPreview={setPreviewAttachment}
            title="📁 项目级资料与相关文档"
          />
        </div>
      )}

      {/* Auto Status Sync Prompt Banner */}
      {allDone && !isProjectDone && (
        <div className="mx-4 mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>所有子任务均已完成！将此 Project 标记为“已完成”？</span>
          </div>
          <button
            onClick={() => onUpdateStatus(project.id, 'Done')}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-2xs transition-colors cursor-pointer"
          >
            标记完成
          </button>
        </div>
      )}

      {/* Accordion Subtask Content */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-slate-100 pt-2 space-y-1.5">
          {subTasks.length === 0 ? (
            <div className="py-6 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
              <p className="text-xs text-slate-400 font-medium">该项目下暂无子任务</p>
              <button
                onClick={() => onQuickAddSubTask(project.id, project.title)}
                className="text-xs text-indigo-600 hover:underline font-bold mt-1 cursor-pointer"
              >
                + 点击新增子任务
              </button>
            </div>
          ) : (
            subTasks.map((subTask) => (
              <TaskItem
                key={subTask.id}
                task={subTask}
                parentProjectName={project.title}
                onUpdateStatus={onUpdateStatus}
                onDeleteTask={onDeleteTask}
                onEditTask={onEditTask}
                onOpenHistory={onOpenHistory}
                onUpdateTask={onUpdateTask}
              />
            ))
          )}
        </div>
      )}

      <AttachmentPreviewModal
        attachment={previewAttachment}
        isOpen={!!previewAttachment}
        onClose={() => setPreviewAttachment(null)}
      />
    </div>
  );
};
