import React from 'react';
import { X, Type, Check, Sliders, Sparkles } from 'lucide-react';

export type FontFamilyOption = 'system' | 'sans' | 'serif' | 'mono';
export type FontSizeOption = 'sm' | 'base' | 'lg' | 'xl';
export type DensityOption = 'compact' | 'normal';

interface FontSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fontFamily: FontFamilyOption;
  onChangeFontFamily: (font: FontFamilyOption) => void;
  fontSize: FontSizeOption;
  onChangeFontSize: (size: FontSizeOption) => void;
  density: DensityOption;
  onChangeDensity: (density: DensityOption) => void;
}

export const FontSettingsModal: React.FC<FontSettingsModalProps> = ({
  isOpen,
  onClose,
  fontFamily,
  onChangeFontFamily,
  fontSize,
  onChangeFontSize,
  density,
  onChangeDensity,
}) => {
  if (!isOpen) return null;

  const fontFamilies: { id: FontFamilyOption; name: string; class: string; sample: string }[] = [
    { id: 'system', name: '系统默认 (System)', class: 'font-sans', sample: 'Clear Do 极简任务' },
    { id: 'sans', name: '无衬线现代 (Sans)', class: 'font-sans tracking-tight', sample: 'Clear Do 极简任务' },
    { id: 'serif', name: '经典衬线 (Serif)', class: 'font-serif', sample: 'Clear Do 极简任务' },
    { id: 'mono', name: '极客等宽 (Monospace)', class: 'font-mono', sample: 'Clear Do 极简任务' },
  ];

  const fontSizes: { id: FontSizeOption; name: string; px: string; desc: string }[] = [
    { id: 'sm', name: '小号 (Small)', px: '13px', desc: '单屏容纳更多任务' },
    { id: 'base', name: '标准 (Normal)', px: '14px', desc: '默认舒适排版' },
    { id: 'lg', name: '中大 (Large)', px: '16px', desc: '字迹清晰清晰' },
    { id: 'xl', name: '大字 (X-Large)', px: '18px', desc: '护眼大字排版' },
  ];

  const densities: { id: DensityOption; name: string; desc: string }[] = [
    { id: 'compact', name: '极致紧凑 (High Density)', desc: '压缩任务行高与边距，一屏浏览多条项目' },
    { id: 'normal', name: '标准边距 (Standard)', desc: '保留适度呼吸感与内边距' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Type className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">字体与排版设置</h3>
              <p className="text-[11px] text-slate-500">自定义全软件字体样式、文字字号及布局行高</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Font Family Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-indigo-600" />
              <span>字体系列 (Font Family)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {fontFamilies.map((f) => {
                const isSelected = fontFamily === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => onChangeFontFamily(f.id)}
                    className={`p-3 text-left rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-500/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800">{f.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                    <p className={`text-xs mt-1 text-slate-500 truncate ${f.class}`}>{f.sample}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font Size Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>基础字号大小 (Base Font Size)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {fontSizes.map((s) => {
                const isSelected = fontSize === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => onChangeFontSize(s.id)}
                    className={`p-2.5 text-left rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-500/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{s.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{s.px}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{s.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Density / Row Height Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              <span>行高密度 (Row Height Density)</span>
            </label>
            <div className="space-y-2">
              {densities.map((d) => {
                const isSelected = density === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => onChangeDensity(d.id)}
                    className={`w-full p-2.5 text-left rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-500/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800">{d.name}</div>
                      <div className="text-[10px] text-slate-500">{d.desc}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            完成设置
          </button>
        </div>
      </div>
    </div>
  );
};
