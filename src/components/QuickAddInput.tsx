import React, { useState, useRef, useEffect } from 'react';
import { Plus, Paperclip, X } from 'lucide-react';
import { TaskItemData, TaskPriority, TaskSource, TaskType, TaskAttachment } from '../types';
import { parseQuickAddInput } from '../utils/parser';

interface QuickAddInputProps {
  onAddItem: (newItem: {
    type: TaskType;
    title: string;
    source: TaskSource;
    priority: TaskPriority;
    parentId: string | null;
    plannedDate: string;
    attachments?: TaskAttachment[];
  }) => void;
  existingProjects: TaskItemData[];
  autoFocus?: boolean;
  onCloseModal?: () => void;
}

export const QuickAddInput: React.FC<QuickAddInputProps> = ({
  onAddItem,
  existingProjects,
  autoFocus = false,
  onCloseModal
}) => {
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const parsed = parseQuickAddInput(inputText, existingProjects);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const fileArray: File[] = Array.from(e.target.files);
    
    const newPromises: Promise<TaskAttachment>[] = fileArray.map((file: File) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          resolve({
            id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            url: (ev.target?.result as string) || '',
            uploadedAt: new Date().toISOString(),
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newPromises).then((results) => {
      setAttachments((prev) => [...prev, ...results]);
    });
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsed.title.trim()) return;

    onAddItem({
      type: parsed.type,
      title: parsed.title,
      source: parsed.source,
      priority: parsed.priority,
      parentId: parsed.parentId,
      plannedDate: parsed.plannedDate,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    setInputText('');
    setAttachments([]);
    if (onCloseModal) {
      onCloseModal();
    }
  };

  const appendToken = (token: string) => {
    setInputText((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${token}` : token;
    });
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Input Bar */}
        <div className="relative flex items-center">
          <div className="absolute left-4 font-mono text-slate-400 text-sm pointer-events-none font-bold">
            {parsed.type === 'project' ? '/p' : '/'}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="录入新任务... 可用 @项目名 !Teams !Email #High ^today (按回车 Enter 提交)"
            className="w-full pl-9 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                attachments.length > 0
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'
              }`}
              title="添加关联附件"
            >
              <Paperclip className="w-4 h-4" />
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </button>

            {/* 取消 / 关闭 按钮 */}
            {(onCloseModal || inputText.length > 0 || attachments.length > 0) && (
              <button
                type="button"
                onClick={() => {
                  setInputText('');
                  setAttachments([]);
                  if (onCloseModal) {
                    onCloseModal();
                  }
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1"
                title="取消 / 关闭"
              >
                <X className="w-3.5 h-3.5 text-slate-500" />
                <span>取消</span>
              </button>
            )}
          </div>
        </div>

        {/* Attached Files Chips Bar */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 px-1 py-1 bg-indigo-50/50 border border-indigo-100 rounded-lg text-xs">
            <span className="text-indigo-600 font-semibold text-[11px] flex items-center gap-1">
              <Paperclip className="w-3 h-3" /> 待随项目/任务上传附件 ({attachments.length}):
            </span>
            {attachments.map((att) => (
              <span key={att.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-indigo-200 text-indigo-900 rounded text-[11px]">
                <span className="truncate max-w-[120px] font-medium">{att.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))}
                  className="hover:text-red-600 cursor-pointer p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};
