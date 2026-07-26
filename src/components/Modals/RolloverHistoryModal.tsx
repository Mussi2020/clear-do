import React from 'react';
import { History, X, AlertTriangle, ArrowRight, Calendar, Clock } from 'lucide-react';
import { TaskItemData } from '../../types';

interface RolloverHistoryModalProps {
  isOpen: boolean;
  task: TaskItemData | null;
  onClose: () => void;
}

export const RolloverHistoryModal: React.FC<RolloverHistoryModalProps> = ({
  isOpen,
  task,
  onClose,
}) => {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 bg-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" />
            <h3 className="font-bold text-base">自动顺延历史日志 Trace Log</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[10px] uppercase font-bold text-slate-400">Target Task</span>
            <h4 className="font-bold text-sm text-slate-800">{task.title}</h4>
            <div className="flex items-center gap-2 mt-1 text-slate-500 text-[11px]">
              <span>创建日期: {task.created_at}</span>
              <span>•</span>
              <span className="text-amber-700 font-bold">已顺延 {task.rollover_count} 次</span>
            </div>
          </div>

          <div className="space-y-3">
            <span className="font-bold text-slate-700 block">顺延变更轨迹 (Timespan Logs):</span>

            {task.rollover_history.length === 0 ? (
              <p className="text-slate-400 text-center py-4">无历史顺延记录</p>
            ) : (
              <div className="relative pl-4 space-y-3 border-l-2 border-amber-200">
                {task.rollover_history.map((log, index) => (
                  <div key={index} className="relative group">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-100" />
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>顺延执行触发时间: {log.rolled_at}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-slate-700 font-bold">
                        <span>{log.from_date}</span>
                        <ArrowRight className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="text-indigo-600">{log.to_date}</span>
                      </div>
                      {log.reason && (
                        <p className="text-[11px] text-slate-500">{log.reason}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 text-right">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
