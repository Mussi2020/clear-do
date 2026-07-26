import React, { useState, useRef } from 'react';
import { 
  Paperclip, 
  Upload, 
  Trash2, 
  Eye, 
  Download, 
  FileText, 
  FileImage, 
  FileSpreadsheet, 
  FileArchive, 
  FileCode, 
  File,
  Plus
} from 'lucide-react';
import { TaskAttachment } from '../../types';

interface AttachmentSectionProps {
  attachments: TaskAttachment[];
  onChange?: (newAttachments: TaskAttachment[]) => void;
  onPreview?: (attachment: TaskAttachment) => void;
  readOnly?: boolean;
  compact?: boolean;
  title?: string;
}

export const AttachmentSection: React.FC<AttachmentSectionProps> = ({
  attachments = [],
  onChange,
  onPreview,
  readOnly = false,
  compact = false,
  title = "相关附件",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string, name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)) {
      return <FileImage className="w-4 h-4 text-purple-600" />;
    }
    if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext) || type.includes('pdf') || type.includes('text')) {
      return <FileText className="w-4 h-4 text-sky-600" />;
    }
    if (['xls', 'xlsx', 'csv'].includes(ext) || type.includes('sheet') || type.includes('csv')) {
      return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || type.includes('zip') || type.includes('compressed')) {
      return <FileArchive className="w-4 h-4 text-amber-600" />;
    }
    if (['js', 'ts', 'tsx', 'jsx', 'json', 'html', 'css', 'py'].includes(ext)) {
      return <FileCode className="w-4 h-4 text-indigo-600" />;
    }
    return <File className="w-4 h-4 text-slate-500" />;
  };

  const processFiles = (files: FileList | File[]) => {
    if (!onChange) return;

    const fileArray = Array.from(files);
    const newItems: Promise<TaskAttachment>[] = fileArray.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            url: (e.target?.result as string) || '',
            uploadedAt: new Date().toISOString(),
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newItems).then((processed) => {
      onChange([...attachments, ...processed]);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = ''; // Reset input
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!readOnly && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChange) {
      onChange(attachments.filter((a) => a.id !== id));
    }
  };

  if (compact) {
    return (
      <div className="space-y-2 text-xs">
        {/* Compact List View */}
        <div className="flex flex-wrap items-center gap-2">
          {attachments.map((att) => {
            const isImage = att.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(att.name);
            return (
              <div
                key={att.id}
                onClick={() => onPreview && onPreview(att)}
                className="group flex items-center gap-2 px-2.5 py-1 bg-slate-50 hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-200 rounded-lg text-slate-700 hover:text-indigo-900 transition-all cursor-pointer text-xs"
              >
                {isImage ? (
                  <img src={att.url} alt={att.name} className="w-4 h-4 object-cover rounded shrink-0" />
                ) : (
                  getFileIcon(att.type, att.name)
                )}
                <span className="max-w-[130px] truncate font-medium">{att.name}</span>
                <span className="text-[10px] text-slate-400 shrink-0">{formatSize(att.size)}</span>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0 ml-1">
                  {onPreview && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreview(att);
                      }}
                      className="p-0.5 text-slate-400 hover:text-indigo-600 rounded cursor-pointer"
                      title="预览"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                  )}
                  <a
                    href={att.url}
                    download={att.name}
                    onClick={(e) => e.stopPropagation()}
                    className="p-0.5 text-slate-400 hover:text-indigo-600 rounded cursor-pointer"
                    title="下载"
                  >
                    <Download className="w-3 h-3" />
                  </a>
                  {!readOnly && onChange && (
                    <button
                      type="button"
                      onClick={(e) => handleDelete(att.id, e)}
                      className="p-0.5 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                      title="删除附件"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {!readOnly && onChange && (
            <label className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 border-dashed rounded-lg text-xs font-semibold cursor-pointer transition-colors">
              <Plus className="w-3.5 h-3.5" />
              <span>添加附件</span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {title && (
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
            <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
            <span>{title} ({attachments.length})</span>
          </label>

          {!readOnly && onChange && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-indigo-600 hover:text-indigo-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3 h-3" />
              <span>上传新文件</span>
            </button>
          )}
        </div>
      )}

      {/* Attachment Grid Cards */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {attachments.map((att) => {
            const isImage = att.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(att.name);
            return (
              <div
                key={att.id}
                onClick={() => onPreview && onPreview(att)}
                className="group relative p-2.5 bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-300 rounded-xl flex items-center gap-3 transition-all shadow-2xs hover:shadow-xs cursor-pointer overflow-hidden"
              >
                {/* Thumbnail / Icon */}
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                  {isImage ? (
                    <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                  ) : (
                    getFileIcon(att.type, att.name)
                  )}
                </div>

                {/* File Details */}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate" title={att.name}>
                    {att.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {formatSize(att.size)} • {new Date(att.uploadedAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0">
                  {onPreview && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreview(att);
                      }}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded cursor-pointer hover:bg-slate-100"
                      title="预览"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <a
                    href={att.url}
                    download={att.name}
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded cursor-pointer hover:bg-slate-100"
                    title="下载"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  {!readOnly && onChange && (
                    <button
                      type="button"
                      onClick={(e) => handleDelete(att.id, e)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer hover:bg-slate-100"
                      title="删除附件"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      {!readOnly && onChange && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-4 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/80'
              : 'border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <Upload className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
          <p className="text-xs font-semibold text-slate-700">
            点击上传或拖拽文件到此处
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            支持图片、PDF、Word、Excel、ZIP 等相关附件
          </p>
        </div>
      )}
    </div>
  );
};
