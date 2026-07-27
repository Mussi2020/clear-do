import React, { useState } from 'react';
import { Settings, X, Palette, Languages, Sparkles, Check, History } from 'lucide-react';
import { SettingsState, FontFamilyType, FontSizeScale, ThemeColorName } from '../../types';
import { t } from '../../utils/i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsState;
  onUpdateSettings: (newSettings: Partial<SettingsState>) => void;
  onRunRolloverNow: () => void;
  onOpenTimeMachine?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onRunRolloverNow,
  onOpenTimeMachine,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                {t(settings.language, 'settingsTitle')}
              </h3>
              <p className="text-[11px] text-slate-400">
                管理语言、显示样式、顺延引擎及 CSV 恢复
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Language Selection */}
          <div className="space-y-2">
            <label className="text-slate-800 font-bold flex items-center gap-2 text-sm">
              <Languages className="w-4 h-4 text-indigo-600" />
              <span>{t(settings.language, 'language')}</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onUpdateSettings({ language: 'zh' })}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  settings.language === 'zh'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div>
                  <div className="font-bold">简体中文</div>
                  <div className="text-[10px] text-slate-400">Simplified Chinese</div>
                </div>
                {settings.language === 'zh' && <Check className="w-4 h-4 text-indigo-600" />}
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ language: 'en' })}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  settings.language === 'en'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div>
                  <div className="font-bold">English</div>
                  <div className="text-[10px] text-slate-400">English Interface</div>
                </div>
                {settings.language === 'en' && <Check className="w-4 h-4 text-indigo-600" />}
              </button>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* UI Personalization */}
          <div className="space-y-3">
            <label className="text-slate-800 font-bold flex items-center gap-2 text-sm">
              <Palette className="w-4 h-4 text-indigo-600" />
              <span>{t(settings.language, 'uiPersonalization')}</span>
            </label>

            {/* Font Family */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                {t(settings.language, 'fontFamily')}
              </label>
              <select
                value={settings.fontFamily}
                onChange={(e) => onUpdateSettings({ fontFamily: e.target.value as FontFamilyType })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs cursor-pointer font-medium"
              >
                <option value="sans">系统无衬线 (Sans-serif Default)</option>
                <option value="inter">Modern Plus Jakarta / Inter</option>
                <option value="serif">优雅衬线 (Serif Classic)</option>
                <option value="mono">等宽极客 (Monospace Code)</option>
              </select>
            </div>

            {/* Font Size & Density */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                {t(settings.language, 'fontSize')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['compact', 'normal', 'large'] as FontSizeScale[]).map((scale) => (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => onUpdateSettings({ fontSize: scale })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      settings.fontSize === scale
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {scale === 'compact' ? '紧凑 (Compact)' : scale === 'normal' ? '标准 (Normal)' : '大号 (Large)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Color */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                {t(settings.language, 'themeColor')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'red', name: '绯红 (Red)', class: 'bg-red-600 text-white' },
                  { id: 'indigo', name: '靛蓝 (Indigo)', class: 'bg-indigo-600 text-white' },
                  { id: 'slate', name: '石墨 (Slate)', class: 'bg-slate-700 text-white' },
                  { id: 'emerald', name: '翡翠 (Emerald)', class: 'bg-emerald-600 text-white' },
                ].map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => onUpdateSettings({ themeColor: color.id as ThemeColorName })}
                    className={`py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${color.class} ${
                      settings.themeColor === color.id ? 'ring-2 ring-offset-2 ring-slate-400' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Auto-Rollover Engine (Transferred module from image_af4480.png) */}
          <div className="space-y-3">
            <label className="text-slate-800 font-bold flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Auto-Rollover Engine (自动顺延引擎)</span>
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-normal">启用状态:</span>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ autoRolloverEnabled: !settings.autoRolloverEnabled })}
                  className={`w-10 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                    settings.autoRolloverEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
                      settings.autoRolloverEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </label>

            {/* Auto-Rollover Engine Card from image_af4480.png */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="font-extrabold text-slate-800 text-sm">Auto-Rollover Engine</span>
                </div>
                <span className={`text-[11px] px-2 py-0.5 font-bold rounded-md border ${
                  settings.autoRolloverEnabled
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  {settings.autoRolloverEnabled ? 'Active' : 'Disabled'}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                零点或启动时，自动将昨日未完成任务平滑顺延至今日。
              </p>

              <div className="pt-1 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onRunRolloverNow();
                    setImportStatus('已成功触发顺延算法与轨迹记录');
                  }}
                  className="flex-1 py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>立即计算顺延</span>
                </button>

                {onOpenTimeMachine && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenTimeMachine();
                    }}
                    className="flex-1 py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-indigo-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  >
                    <History className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Simulate Rollover (Time Machine)</span>
                  </button>
                )}
              </div>
            </div>

            {importStatus && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{importStatus}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
