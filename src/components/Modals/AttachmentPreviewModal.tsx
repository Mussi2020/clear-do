import React from 'react';
import { X, Download, FileText, ExternalLink, Paperclip } from 'lucide-react';
import { TaskAttachment } from '../../types';

interface AttachmentPreviewModalProps {
  attachment: TaskAttachment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AttachmentPreviewModal: React.FC<AttachmentPreviewModalProps> = ({
  attachment,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !attachment) return null;

  const isImage = attachment.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(attachment.name);
  const isPdf = attachment.type.includes('pdf') || attachment.name.endsWith('.pdf');

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Paperclip className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-slate-800 truncate" title={attachment.name}>
                {attachment.name}
              </h3>
              <p className="text-[11px] text-slate-500">
                {formatSize(attachment.size)} • 上传于 {new Date(attachment.uploadedAt).toLocaleString('zh-CN')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={attachment.url}
              download={attachment.name}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载文件</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 flex items-center justify-center bg-slate-100/50 min-h-[250px]">
          {isImage ? (
            <div className="flex flex-col items-center justify-center space-y-2">
              <img
                src={attachment.url}
                alt={attachment.name}
                className="max-h-[50vh] max-w-full object-contain rounded-xl border border-slate-200 shadow-md bg-white"
              />
            </div>
          ) : isPdf ? (
            <div className="text-center space-y-4 py-8">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-red-100">
                <FileText className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-slate-700">PDF 文档已就绪</p>
              <div className="flex gap-2 justify-center">
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  新窗口打开预览
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-3 py-8">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-indigo-100">
                <Paperclip className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-slate-700">非图片类常规附件</p>
              <p className="text-xs text-slate-500 max-w-md">
                该文件可直接下载并在本地打开查看（如 Word, Excel, ZIP 等格式）。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
