import React, { useState } from 'react';
import { FolderKanban, FolderPlus, Plus, Paperclip, Edit3 } from 'lucide-react';
import { TaskItemData, TaskPriority, TaskSource, TaskStatus, TaskAttachment } from '../../types';
import { TaskItem } from '../TaskItem';
import { getTodayStr } from '../../utils/dateUtils';
import { AttachmentSection } from '../Attachments/AttachmentSection';
import { AttachmentPreviewModal } from '../Modals/AttachmentPreviewModal';

interface ProjectsViewProps {
  items: TaskItemData[];
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: TaskItemData) => void;
  onAddItem: (newItem: {
    type: 'project' | 'task';
    title: string;
    source: TaskSource;
    priority: TaskPriority;
    parentId: string | null;
    plannedDate: string;
  }) => void;
  onOpenHistory: (task: TaskItemData) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  items,
  onUpdateStatus,
  onDeleteItem,
  onEditItem,
  onAddItem,
  onOpenHistory,
}) => {
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectSource, setNewProjectSource] = useState<TaskSource>('Teams');
  const [newProjectPriority, setNewProjectPriority] = useState<TaskPriority>('High');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<TaskAttachment | null>(null);

  const projects = items.filter((i) => i.type === 'project');

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;

    onAddItem({
      type: 'project',
      title: newProjectTitle.trim(),
      source: newProjectSource,
      priority: newProjectPriority,
      parentId: null,
      plannedDate: getTodayStr(),
    });

    setNewProjectTitle('');
  };

  const activeProject = selectedProjectId
    ? projects.find((p) => p.id === selectedProjectId)
    : projects[0];

  const activeSubTasks = activeProject
    ? items.filter((i) => i.type === 'task' && i.parent_id === activeProject.id)
    : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-indigo-600" />
            <span>All Projects & Subtasks</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            统一项目集视角，管理项目 (Project) 与旗下挂载的全部 Sub-tasks 关联节点。
          </p>
        </div>

        {/* Create Project Form */}
        <form onSubmit={handleCreateProject} className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={newProjectTitle}
            onChange={(e) => setNewProjectTitle(e.target.value)}
            placeholder="创建新项目标题，如: Q3 跨平台 API 重构..."
            className="flex-1 min-w-[240px] text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
          />

          <select
            value={newProjectSource}
            onChange={(e) => setNewProjectSource(e.target.value as TaskSource)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg cursor-pointer"
          >
            <option value="Teams">Teams</option>
            <option value="Email">Email</option>
            <option value="Ticket">Ticket</option>
            <option value="Meeting">Meeting</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={newProjectPriority}
            onChange={(e) => setNewProjectPriority(e.target.value as TaskPriority)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg cursor-pointer"
          >
            <option value="High">高优先级</option>
            <option value="Medium">中优先级</option>
            <option value="Low">低优先级</option>
          </select>

          <button
            type="submit"
            disabled={!newProjectTitle.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs"
          >
            <FolderPlus className="w-4 h-4" />
            <span>创建项目</span>
          </button>
        </form>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects List */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Project List ({projects.length})
          </div>

          <div className="space-y-2">
            {projects.map((proj) => {
              const subTasks = items.filter((i) => i.type === 'task' && i.parent_id === proj.id);
              const doneCount = subTasks.filter((t) => t.status === 'Done').length;
              const isSelected = (activeProject?.id === proj.id);

              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-sm text-slate-800 leading-snug">
                      {proj.title}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-bold uppercase">
                      {proj.source}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>进度: {doneCount}/{subTasks.length}</span>
                    <span>{subTasks.length > 0 ? Math.round((doneCount / subTasks.length) * 100) : 0}%</span>
                  </div>

                  <div className="w-full h-1 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all"
                      style={{
                        width: `${
                          subTasks.length > 0 ? Math.round((doneCount / subTasks.length) * 100) : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Project Subtasks Workspace */}
        <div className="lg:col-span-2 space-y-4">
          {activeProject ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                    Selected Project
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                    {activeProject.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Created: {activeProject.created_at} • Source: {activeProject.source}
                  </p>
                </div>

                <button
                  onClick={() => {
                    onAddItem({
                      type: 'task',
                      title: `[${activeProject.title}] 新具体任务`,
                      source: activeProject.source,
                      priority: 'Medium',
                      parentId: activeProject.id,
                      plannedDate: getTodayStr(),
                    });
                  }}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>添加关联子任务</span>
                </button>
              </div>

              {/* Project Attachments Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <AttachmentSection
                  attachments={activeProject.attachments || []}
                  onChange={(newAtts) => {
                    onEditItem({
                      ...activeProject,
                      attachments: newAtts,
                    });
                  }}
                  onPreview={setPreviewAttachment}
                  title="📁 本项目相关附件与资料"
                />
              </div>

              {/* Subtask List */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Associated Subtasks ({activeSubTasks.length})
                </div>

                {activeSubTasks.length === 0 ? (
                  <div className="py-12 border border-dashed border-slate-200 rounded-lg text-center space-y-2">
                    <p className="text-xs text-slate-500">该项目暂无具体子任务</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeSubTasks.map((sub) => (
                      <TaskItem
                        key={sub.id}
                        task={sub}
                        parentProjectName={activeProject.title}
                        onUpdateStatus={onUpdateStatus}
                        onDeleteTask={onDeleteItem}
                        onEditTask={onEditItem}
                        onOpenHistory={onOpenHistory}
                        onUpdateTask={onEditItem}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-16 bg-white border border-slate-200 rounded-xl text-center text-slate-400 text-xs">
              请选择或创建一个项目以查看详情
            </div>
          )}
        </div>
      </div>

      <AttachmentPreviewModal
        attachment={previewAttachment}
        isOpen={!!previewAttachment}
        onClose={() => setPreviewAttachment(null)}
      />
    </div>
  );
};
