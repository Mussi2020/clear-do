import React, { useState } from 'react';
import { History, X, Sparkles, FastForward, Check } from 'lucide-react';
import { getTodayStr } from '../../utils/dateUtils';

interface TimeMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateDays: (daysAhead: number) => void;
  onResetToCurrentRealDate: () => void;
  simulatedDateStr: string;
}

export const TimeMachineModal: React.FC<TimeMachineModalProps> = ({
  isOpen,
  onClose,
  onSimulateDays,
  onResetToCurrentRealDate,
  simulatedDateStr,
}) => {
  const [customDays, setCustomDays] = useState('1');

  if (!isOpen) return null;

  const handleSimulate = (days: number) => {
    onSimulateDays(days);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">时光机: 跨天顺延模拟引擎</h3>
              <p className="text-[11px] text-indigo-200">模拟时间流动，验证未完成任务自动顺延</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">系统真实日期:</span>
              <span className="font-mono font-bold">{getTodayStr()}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200">
              <span className="text-indigo-600 font-bold">当前模拟全局日期:</span>
              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {simulatedDateStr}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-700">快速穿越天数 (触发自动顺延校验):</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleSimulate(1)}
                className="py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-200 transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>+1 天 (明天)</span>
              </button>
              <button
                onClick={() => handleSimulate(2)}
                className="py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-200 transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>+2 天</span>
              </button>
              <button
                onClick={() => handleSimulate(7)}
                className="py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-200 transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>+7 天 (一周)</span>
              </button>
            </div>
          </div>

          {/* Reset button */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                onResetToCurrentRealDate();
                onClose();
              }}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              重置为现实真实日期 ({getTodayStr()})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
