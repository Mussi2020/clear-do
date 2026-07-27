import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Tag, Flag, Layers, Paperclip, User, Share2, FileText } from 'lucide-react';
import { TaskItemData, TaskPriority, TaskSource, TaskType, TaskAttachment, LanguageCode } from '../../types';
import { AttachmentSection } from '../Attachments/AttachmentSection';
import { AttachmentPreviewModal } from './AttachmentPreviewModal';
import { LinkifiedText } from '../LinkifiedText';
import { getTodayStr } from '../../utils/dateUtils';
import { t } from '../../utils/i18n';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newTaskData: Omit<TaskItemData, 'id' | 'created_at' | 'completed_at' | 'status' | 'rollover_count' | 'rollover_history'>) => void;
  existingProjects: TaskItemData[];
  language?: LanguageCode;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingProjects,
  language = 'zh',
}) => {
  const [type, setType] = useState<TaskType>('task');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState<TaskSource>('Teams');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [parentId, setParentId] = useState<string | null>(null);
  const [requester, setRequester] = useState('');
  const [handler, setHandler] = useState('');
  const [plannedDate, setPlannedDate] = useState(getTodayStr());
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [previewAttachment, setPreviewAttachment] = useState<TaskAttachment | null>(null);

  useEffect(() => {
    if (isOpen) {
      setType('task');
      setTitle('');
      setDescription('');
      setSource('Teams');
      setPriority('Medium');
      setParentId(null);
      setRequester('');
      setHandler('');
      setPlannedDate(getTodayStr());
      setAttachments([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      type,
      title: title.trim(),
      description: description.trim() || undefined,
      source,
      priority,
      parent_id: type === 'project' ? null : parentId,
      requester: requester.trim() || undefined,
      handler: handler.trim() || undefined,
      planned_date: plannedDate || getTodayStr(),
      attachments,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                {t(language, 'createNewTask')}
              </h3>
              <p className="text-[11px] text-slate-400">
                配置完整的任务/项目属性、团队关系及关联附件
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          <form id="new-task-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Task vs Project Type Toggle */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">{t(language, 'type')}</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType('task')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    type === 'task'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ✅ {t(language, 'standaloneTask')} (Task)
                </button>
                <button
                  type="button"
                  onClick={() => setType('project')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    type === 'project'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📁 {t(language, 'project')} (Project)
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {t(language, 'taskTitle')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={type === 'project' ? '输入项目名称 (如: Q3 系统重构)...' : '输入具体任务内容...'}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-800 placeholder-slate-400"
                autoFocus
                required
              />
            </div>

            {/* Parent Project selection (if type === 'task') */}
            {type === 'task' && (
              <div>
                <label className="block text-slate-700 font-semibold mb-1">{t(language, 'parentProject')}</label>
                <select
                  value={parentId || ''}
                  onChange={(e) => setParentId(e.target.value || null)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer font-medium text-slate-700"
                >
                  <option value="">{t(language, 'noParentProject')}</option>
                  {existingProjects
                    .filter((p) => p.type === 'project')
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        📁 {p.title}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Source & Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">{t(language, 'source')}</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as TaskSource)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs cursor-pointer font-medium text-slate-700"
                >
                  <option value="Teams">Teams</option>
                  <option value="Email">Email 邮件</option>
                  <option value="Ticket">Ticket 工单</option>
                  <option value="Meeting">Meeting 会议</option>
                  <option value="Other">Other 其他</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">{t(language, 'priority')}</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs cursor-pointer font-medium text-slate-700"
                >
                  <option value="High">高 (High)</option>
                  <option value="Medium">中 (Medium)</option>
                  <option value="Low">低 (Low)</option>
                </select>
              </div>
            </div>

            {/* Requester & Handler Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-indigo-500" />
                  <span>{t(language, 'requesterLabel')}</span>
                </label>
                <input
                  type="text"
                  value={requester}
                  onChange={(e) => setRequester(e.target.value)}
                  placeholder={t(language, 'requesterPlaceholder')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                  <Share2 className="w-3 h-3 text-indigo-500" />
                  <span>{t(language, 'handlerLabel')}</span>
                </label>
                <input
                  type="text"
                  value={handler}
                  onChange={(e) => setHandler(e.target.value)}
                  placeholder={t(language, 'handlerPlaceholder')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Planned Date */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">{t(language, 'plannedDate')}</label>
              <input
                type="date"
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>

            {/* Notes / Description */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">{t(language, 'notesDescription')}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="例如: 参考相关文档 https://example.com/doc 或会议纪要..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              {description && (
                <div className="mt-1.5 p-2 bg-slate-50 border border-slate-200/80 rounded-lg text-[11px] text-slate-600">
                  <span className="text-[10px] text-slate-400 font-medium block mb-0.5">链接预览:</span>
                  <LinkifiedText text={description} />
                </div>
              )}
            </div>

            {/* Attachments Section */}
            <div className="pt-1">
              <AttachmentSection
                attachments={attachments}
                onChange={setAttachments}
                onPreview={setPreviewAttachment}
                title="关联附件文件"
              />
            </div>
          </form>
        </div>

        <AttachmentPreviewModal
          attachment={previewAttachment}
          isOpen={!!previewAttachment}
          onClose={() => setPreviewAttachment(null)}
        />

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            {t(language, 'cancel')}
          </button>
          <button
            type="submit"
            form="new-task-form"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            {t(language, 'save')}
          </button>
        </div>
      </div>
    </div>
  );
};
