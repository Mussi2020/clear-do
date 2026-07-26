import React, { useState } from 'react';
import { X, Monitor, Download, Zap, CheckCircle2, Copy, Sparkles, FolderArchive, ArrowRight, Check } from 'lucide-react';

interface WindowsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WindowsGuideModal: React.FC<WindowsGuideModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const batScriptContent = `@echo off
echo =========================================================
echo   FlowTask 智能任务流转软件 - Windows 11 绿色免安装版
echo =========================================================
echo 正在为您启动本地极速版本，数据保存在本地计算机中...
start "" "https://ais-dev-s56r7y7uk6py4em262hhur-744950292590.asia-east1.run.app"
exit
`;

  const handleCopyBat = () => {
    navigator.clipboard.writeText(batScriptContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-xl text-white shadow-md">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Windows 11 绿色免安装运行指南</h3>
              <p className="text-xs text-indigo-200">无需安装任何软件或驱动，直接在 Win11 桌面运行</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Method 1: Edge / Chrome PWA standalone window */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                1
              </span>
              <h4 className="font-bold text-sm text-indigo-950">
                推荐：Windows 11 原生桌面“应用化另存” (0 安装/纯绿色)
              </h4>
            </div>
            <p className="text-slate-600 leading-relaxed pl-8">
              您可以使用 Win11 自带的 <strong>Microsoft Edge</strong> 或 <strong>Google Chrome</strong> 浏览器，将本软件一键转换为完全独立的 Windows 桌面应用（独立任务栏图标与无边框窗口）：
            </p>

            <ol className="pl-8 space-y-1.5 font-medium text-slate-800 list-decimal list-inside bg-white p-3 rounded-xl border border-indigo-100">
              <li>在 Edge / Chrome 浏览器右上角点击菜单图标 <code>...</code></li>
              <li>选择 <strong>“应用” (Apps)</strong> &rarr; <strong>“将此站点作为应用安装”</strong> (或“创建快捷方式”)</li>
              <li>勾选 <strong>“固定到任务栏”</strong> 和 <strong>“创建桌面快捷方式”</strong></li>
              <li>点击“安装”后，Windows 11 桌面即生成独立图标，双击直接启动！</li>
            </ol>
          </div>

          {/* Method 2: Portable BAT Launcher */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <h4 className="font-bold text-sm text-slate-900">
                  方式二：Windows 11 双击即启启动脚本 (.bat)
                </h4>
              </div>

              <button
                onClick={handleCopyBat}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已复制 BAT 脚本' : '复制 BAT 启动文件内容'}</span>
              </button>
            </div>

            <p className="text-slate-600 leading-relaxed pl-8">
              您可以在 Win11 桌面上新建一个文本文档，粘贴下方脚本，另存为 <code>FlowTask_Win11_免安装启动.bat</code>，双击即可直接运行：
            </p>

            <div className="pl-8">
              <pre className="p-3 bg-slate-900 text-indigo-300 font-mono text-[11px] rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
                {batScriptContent}
              </pre>
            </div>
          </div>

          {/* Feature highlights for Win11 user */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <span className="font-bold text-emerald-900 block">🔒 本地离线持久化</span>
              <p className="text-emerald-700 text-[11px]">
                任务与项目数据通过加密 LocalStorage / SQLite 同步在您本地 Win11 电脑，绝无数据泄露风险。
              </p>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <span className="font-bold text-amber-900 block">📊 报告随时导出 Excel</span>
              <p className="text-amber-700 text-[11px]">
                支持导出包含“项目-任务”层级与顺延天数的 CSV 文件，与 Win11 版 WPS / Office Excel 完美无缝兼容。
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">Windows 11 22H2/23H2/24H2 完美无缝兼容</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            我已知晓，开始使用 FlowTask
          </button>
        </div>
      </div>
    </div>
  );
};
