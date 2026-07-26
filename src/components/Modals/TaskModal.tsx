import React, { useState, useEffect } from 'react';
import { X, Edit3, Tag, Flag, Calendar, Layers, Clock, History } from 'lucide-react';
import { TaskItemData, TaskPriority, TaskSource, TaskStatus, TaskType, TaskAttachment } from '../../types';
import { AttachmentSection } from '../Attachments/AttachmentSection';
import { AttachmentPreviewModal } from './AttachmentPreviewModal';

interface TaskModalProps {
  task: TaskItemData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: TaskItemData) => void;
  existingProjects: TaskItemData[];
}

export const TaskModal: React.FC<TaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
  existingProjects,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState<TaskSource>('Teams');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('Todo');
  const [parentId, setParentId] = useState<string | null>(null);
  const [plannedDate, setPlannedDate] = useState('');
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [previewAttachment, setPreviewAttachment] = useState<TaskAttachment | null>(null);
  const [showHistoryTab, setShowHistoryTab] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setSource(task.source);
      setPriority(task.priority);
      setStatus(task.status);
      setParentId(task.parent_id);
      setPlannedDate(task.planned_date);
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
      description: description.trim() || undefined,
      source,
      priority,
      status,
      parent_id: parentId,
      planned_date: plannedDate,
      attachments,
      completed_at: status === 'Done' ? (task.completed_at || new Date().toISOString().split('T')[0]) : null,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">
              编辑{task.type === 'project' ? '项目' : '具体任务'}属性
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        {task.rollover_count > 0 && (
          <div className="px-6 pt-3 flex gap-2 border-b border-slate-100 text-xs font-semibold">
            <button
              onClick={() => setShowHistoryTab(false)}
              className={`pb-2 transition-colors cursor-pointer border-b-2 ${
                !showHistoryTab
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              基本属性编辑
            </button>
            <button
              onClick={() => setShowHistoryTab(true)}
              className={`pb-2 transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
                showHistoryTab
                  ? 'border-amber-600 text-amber-600 font-bold'
                  : 'border-transparent text-amber-600/70 hover:text-amber-700'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>顺延历史轨迹 ({task.rollover_count} 次)</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {showHistoryTab ? (
            <div className="space-y-3">
              <p className="text-slate-500">
                本任务因跨天未完成，由智能顺延引擎自动追踪记录的历史轨迹：
              </p>
              <div className="space-y-2">
                {task.rollover_history.map((log, idx) => (
                  <div key={log.id || idx} className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between font-semibold text-amber-900">
                      <span>第 {idx + 1} 次顺延</span>
                      <span className="text-[10px] text-amber-700">{new Date(log.date_rolled).toLocaleString('zh-CN')}</span>
                    </div>
                    <div className="text-slate-600">
                      从 <strong className="text-slate-800">{log.from_date}</strong> 顺延至 <strong className="text-indigo-600">{log.to_date}</strong>
                    </div>
                    {log.reason && <p className="text-[10px] text-slate-400 italic">原因: {log.reason}</p>}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <form id="edit-task-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">标题 / 内容</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">备注说明 (可选)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="添加任务细节、相关单号或 Teams 会议纪要..."
                />
              </div>

              {/* Parent Project selection */}
              {task.type === 'task' && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">归属项目 (Parent Project)</label>
                  <select
                    value={parentId || ''}
                    onChange={(e) => setParentId(e.target.value || null)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                  >
                    <option value="">无（作为 Standalone 独立任务）</option>
                    {existingProjects
                      .filter((p) => p.type === 'project' && p.id !== task.id)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          📁 {p.title}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Source & Priority Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">来源标签 (Source)</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as TaskSource)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs cursor-pointer"
                  >
                    <option value="Teams">Teams</option>
                    <option value="Email">Email 邮件</option>
                    <option value="Ticket">Ticket 工单</option>
                    <option value="Meeting">Meeting 会议</option>
                    <option value="Other">Other 其他</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">优先级 (Priority)</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs cursor-pointer"
                  >
                    <option value="High">高 (High)</option>
                    <option value="Medium">中 (Medium)</option>
                    <option value="Low">低 (Low)</option>
                  </select>
                </div>
              </div>

              {/* Status & Planned Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">状态 (Status)</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs cursor-pointer"
                  >
                    <option value="Todo">未开始 (Todo)</option>
                    <option value="In Progress">进行中 (In Progress)</option>
                    <option value="Done">已完成 (Done)</option>
                    <option value="Cancelled">已取消 (Cancelled)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">计划执行日期</label>
                  <input
                    type="date"
                    value={plannedDate}
                    onChange={(e) => setPlannedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              {/* Attachments Section */}
              <div className="pt-2">
                <AttachmentSection
                  attachments={attachments}
                  onChange={setAttachments}
                  onPreview={setPreviewAttachment}
                  title={task.type === 'project' ? "项目相关附件" : "任务相关附件"}
                />
              </div>
            </form>
          )}
        </div>

        <AttachmentPreviewModal
          attachment={previewAttachment}
          isOpen={!!previewAttachment}
          onClose={() => setPreviewAttachment(null)}
        />

        {/* Modal Footer */}
        {!showHistoryTab && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              form="edit-task-form"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              保存修改
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
