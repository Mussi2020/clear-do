import React, { useState, useEffect } from 'react';
import { X, Check, Trash2 } from 'lucide-react';
import { TaskItemData, TaskPriority, TaskSource, TaskStatus, TaskAttachment } from '../../types';
import { AttachmentSection } from '../Attachments/AttachmentSection';
import { AttachmentPreviewModal } from './AttachmentPreviewModal';

interface EditTaskModalProps {
  isOpen: boolean;
  task: TaskItemData | null;
  projects: TaskItemData[];
  onClose: () => void;
  onSave: (updatedTask: TaskItemData) => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  task,
  projects,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [source, setSource] = useState<TaskSource>('Teams');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('Todo');
  const [parentId, setParentId] = useState<string | null>(null);
  const [plannedDate, setPlannedDate] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [previewAttachment, setPreviewAttachment] = useState<TaskAttachment | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setSource(task.source);
      setPriority(task.priority);
      setStatus(task.status);
      setParentId(task.parent_id);
      setPlannedDate(task.planned_date);
      setDescription(task.description || '');
      setAttachments(task.attachments || []);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      ...task,
      title: title.trim(),
      source,
      priority,
      status,
      parent_id: parentId,
      planned_date: plannedDate,
      description: description.trim() || undefined,
      attachments,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-800">
            {task.type === 'project' ? '编辑项目信息' : '编辑具体任务详情'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">标题名称</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">来源来源</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as TaskSource)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
              >
                <option value="Teams">Teams</option>
                <option value="Email">Email</option>
                <option value="Ticket">Ticket</option>
                <option value="Meeting">Meeting</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">优先级 Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
              >
                <option value="High">高 (High)</option>
                <option value="Medium">中 (Medium)</option>
                <option value="Low">低 (Low)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">任务状态 Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
              >
                <option value="Todo">未开始 (Todo)</option>
                <option value="In Progress">进行中 (In Progress)</option>
                <option value="Done">已完成 (Done)</option>
                <option value="Cancelled">已取消 (Cancelled)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">计划执行日期</label>
              <input
                type="date"
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          {task.type === 'task' && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">挂载父项目 (Parent Project)</label>
              <select
                value={parentId || ''}
                onChange={(e) => setParentId(e.target.value || null)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
              >
                <option value="">独立任务 (无父级项目)</option>
                {projects.filter(p => p.type === 'project').map((p) => (
                  <option key={p.id} value={p.id}>
                    📁 {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1">详细备注说明</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="填写该任务背景、备注信息或工单链接..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
            />
          </div>

          {/* Attachments Upload & Management Section */}
          <div className="pt-2">
            <AttachmentSection
              attachments={attachments}
              onChange={setAttachments}
              onPreview={setPreviewAttachment}
              title={task.type === 'project' ? "项目相关附件" : "任务相关附件"}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer shadow-2xs"
            >
              保存修改
            </button>
          </div>
        </form>

        <AttachmentPreviewModal
          attachment={previewAttachment}
          isOpen={!!previewAttachment}
          onClose={() => setPreviewAttachment(null)}
        />
      </div>
    </div>
  );
};
