import React, { useState, useEffect } from 'react';
import { ViewMode, TaskItemData, TaskStatus, TaskSource, TaskPriority, TaskAttachment } from './types';
import { 
  getStoredItems, 
  saveStoredItems, 
  executeAutoRollover, 
  checkProjectStatusSync, 
  resetDemoData 
} from './utils/storage';
import { getTodayStr, addDaysToDateStr } from './utils/dateUtils';

import { Sidebar } from './components/Sidebar';
import { TodayView } from './components/Views/TodayView';
import { ProjectsView } from './components/Views/ProjectsView';
import { RolloverView } from './components/Views/RolloverView';
import { ReportsView } from './components/Views/ReportsView';
import { ExportView } from './components/Views/ExportView';

import { TaskModal } from './components/Modals/TaskModal';
import { TimeMachineModal } from './components/Modals/TimeMachineModal';
import { WindowsGuideModal } from './components/Modals/WindowsGuideModal';
import { FontSettingsModal, FontFamilyOption, FontSizeOption, DensityOption } from './components/Modals/FontSettingsModal';
import { QuickAddInput } from './components/QuickAddInput';
import { Sparkles, X } from 'lucide-react';

export function App() {
  const [items, setItems] = useState<TaskItemData[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>('today');
  
  // Date simulation offset (for Time Machine simulator)
  const [dayOffset, setDayOffset] = useState<number>(0);

  // Today rolled notification counter
  const [todayRolledCount, setTodayRolledCount] = useState<number>(0);

  // Typography & Density Preference state
  const [fontFamily, setFontFamily] = useState<FontFamilyOption>(() => {
    return (localStorage.getItem('clear_do_font_family') as FontFamilyOption) || 'system';
  });
  const [fontSize, setFontSize] = useState<FontSizeOption>(() => {
    return (localStorage.getItem('clear_do_font_size') as FontSizeOption) || 'base';
  });
  const [density, setDensity] = useState<DensityOption>(() => {
    return (localStorage.getItem('clear_do_density') as DensityOption) || 'compact';
  });

  // Resizable Sidebar State
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem('clear_do_sidebar_width');
    return saved ? parseInt(saved, 10) : 240;
  });
  const [isResizing, setIsResizing] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('clear_do_sidebar_width', sidebarWidth.toString());
  }, [sidebarWidth]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.min(Math.max(e.clientX, 180), 450);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Modals state
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [isTimeMachineOpen, setIsTimeMachineOpen] = useState(false);
  const [isWindowsGuideOpen, setIsWindowsGuideOpen] = useState(false);
  const [isFontSettingsOpen, setIsFontSettingsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItemData | null>(null);

  // Global toast banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('clear_do_font_family', fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    localStorage.setItem('clear_do_font_size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('clear_do_density', density);
  }, [density]);

  // Compute effective virtual today string based on real date + dayOffset
  const realTodayStr = getTodayStr();
  const effectiveTodayStr = addDaysToDateStr(realTodayStr, dayOffset);

  // Initialize data and run Auto-Rollover check on launch
  useEffect(() => {
    const loaded = getStoredItems();
    const rolloverResult = executeAutoRollover(loaded, effectiveTodayStr);

    setItems(rolloverResult.updatedItems);
    setTodayRolledCount(rolloverResult.rolledCount);

    if (rolloverResult.rolledCount > 0) {
      setToastMessage(`⚡ 智能顺延引擎: 自动将 ${rolloverResult.rolledCount} 项未完成任务更新至 ${effectiveTodayStr}！`);
    }
  }, [dayOffset]);

  // Persist items
  const updateItemsAndPersist = (newItems: TaskItemData[]) => {
    setItems(newItems);
    saveStoredItems(newItems);
  };

  // Trigger manual rollover check or simulator
  const handleTriggerRolloverCheck = (targetDate: string = effectiveTodayStr) => {
    const rolloverResult = executeAutoRollover(items, targetDate);
    setItems(rolloverResult.updatedItems);
    setTodayRolledCount(rolloverResult.rolledCount);

    if (rolloverResult.rolledCount > 0) {
      setToastMessage(`⚡ 顺延成功：已将 ${rolloverResult.rolledCount} 项未完成任务顺延至 ${targetDate}`);
    } else {
      setToastMessage(`所有未完成任务均已置于 ${targetDate} 计划中`);
    }

    setTimeout(() => setToastMessage(null), 4000);
  };

  // Status update
  const handleUpdateStatus = (id: string, newStatus: TaskStatus) => {
    const targetItem = items.find((i) => i.id === id);
    if (!targetItem) return;

    const today = effectiveTodayStr;
    const updated = items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status: newStatus,
          completed_at: newStatus === 'Done' ? (item.completed_at || today) : null,
        };
      }
      return item;
    });

    let finalItems = updated;
    if (targetItem.parent_id && newStatus === 'Done') {
      const syncInfo = checkProjectStatusSync(targetItem.parent_id, updated);
      if (syncInfo.allTasksDone && syncInfo.projectItem && syncInfo.projectItem.status !== 'Done') {
        finalItems = updated.map((item) => {
          if (item.id === targetItem.parent_id) {
            return {
              ...item,
              status: 'Done' as TaskStatus,
              completed_at: today,
            };
          }
          return item;
        });
        setToastMessage(`🎉 项目 "${syncInfo.projectItem.title}" 所有子任务均已完成，该项目状态自动同步为 Done！`);
        setTimeout(() => setToastMessage(null), 4000);
      }
    }

    updateItemsAndPersist(finalItems);
  };

  // Add Item
  const handleAddItem = (newItemData: {
    type: 'project' | 'task';
    title: string;
    source: TaskSource;
    priority: TaskPriority;
    parentId: string | null;
    plannedDate: string;
    attachments?: TaskAttachment[];
  }) => {
    const newItem: TaskItemData = {
      id: `${newItemData.type}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: newItemData.type,
      parent_id: newItemData.parentId,
      title: newItemData.title,
      source: newItemData.source,
      priority: newItemData.priority,
      created_at: effectiveTodayStr,
      planned_date: newItemData.plannedDate,
      completed_at: null,
      status: 'Todo',
      rollover_count: 0,
      rollover_history: [],
      attachments: newItemData.attachments || [],
    };

    updateItemsAndPersist([newItem, ...items]);
    setToastMessage(`已创建${newItemData.type === 'project' ? '项目' : '任务'}: "${newItemData.title}"`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Delete Item
  const handleDeleteItem = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;

    let filtered: TaskItemData[];
    if (target.type === 'project') {
      filtered = items.filter((i) => i.id !== id && i.parent_id !== id);
    } else {
      filtered = items.filter((i) => i.id !== id);
    }

    updateItemsAndPersist(filtered);
    setToastMessage(`已删除 "${target.title}"`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Edit Task Save
  const handleSaveEditedTask = (updatedTask: TaskItemData) => {
    const updated = items.map((i) => (i.id === updatedTask.id ? updatedTask : i));
    updateItemsAndPersist(updated);
    setEditingTask(null);
  };

  // Reset Demo Data
  const handleResetDemoData = () => {
    if (window.confirm('确定重置为演示数据集吗？')) {
      const initial = resetDemoData();
      setItems(initial);
      setTodayRolledCount(0);
      setDayOffset(0);
      setToastMessage('已成功恢复初始演示数据');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Font classes mapping
  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      case 'sans': return 'font-sans tracking-tight';
      default: return 'font-sans';
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm': return 'text-[13px]';
      case 'lg': return 'text-[15px]';
      case 'xl': return 'text-[16px]';
      default: return 'text-[14px]';
    }
  };

  return (
    <div className={`flex h-screen bg-[#F9FAFB] text-slate-800 antialiased overflow-hidden select-none ${getFontFamilyClass()} ${getFontSizeClass()}`}>
      {/* Left Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        items={items}
        onOpenQuickAdd={() => setIsQuickAddModalOpen(true)}
        onOpenTimeMachine={() => setIsTimeMachineOpen(true)}
        onOpenFontSettings={() => setIsFontSettingsOpen(true)}
        onResetData={handleResetDemoData}
        todayRolledCount={todayRolledCount}
        width={sidebarWidth}
      />

      {/* Resizable Divider Handle */}
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          setIsResizing(true);
        }}
        className={`w-1.5 hover:w-2 hover:bg-indigo-500/50 cursor-col-resize shrink-0 transition-all z-30 select-none group relative ${
          isResizing ? 'bg-indigo-600 w-2' : 'bg-transparent border-r border-slate-200'
        }`}
        title="拖拽调节侧边栏宽度"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto min-w-0">
        {/* Global Toast */}
        {toastMessage && (
          <div className="mx-6 mt-4 p-3 bg-slate-900 text-white rounded-2xl shadow-lg border border-slate-800 flex items-center justify-between text-xs animate-fadeIn shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* View Switcher Container */}
        <div className={`flex-1 ${density === 'compact' ? 'p-4' : 'p-6'}`}>
          {currentView === 'today' && (
            <TodayView
              items={items}
              onUpdateStatus={handleUpdateStatus}
              onDeleteItem={handleDeleteItem}
              onEditItem={setEditingTask}
              onAddItem={handleAddItem}
              onOpenHistory={setEditingTask}
              todayRolledCount={todayRolledCount}
              onTriggerRolloverCheck={() => handleTriggerRolloverCheck()}
            />
          )}

          {currentView === 'projects' && (
            <ProjectsView
              items={items}
              onUpdateStatus={handleUpdateStatus}
              onDeleteItem={handleDeleteItem}
              onEditItem={setEditingTask}
              onAddItem={handleAddItem}
              onOpenHistory={setEditingTask}
            />
          )}

          {currentView === 'rollover' && (
            <RolloverView
              items={items}
              onUpdateStatus={handleUpdateStatus}
              onDeleteItem={handleDeleteItem}
              onEditItem={setEditingTask}
              onOpenHistory={setEditingTask}
            />
          )}

          {currentView === 'reports' && (
            <ReportsView
              items={items}
              onNavigateToExport={() => setCurrentView('export')}
            />
          )}

          {currentView === 'export' && (
            <ExportView items={items} />
          )}
        </div>
      </main>

      {/* Modals */}
      {isQuickAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-xl">
            <QuickAddInput
              onAddItem={handleAddItem}
              existingProjects={items.filter((i) => i.type === 'project')}
              autoFocus
              onCloseModal={() => setIsQuickAddModalOpen(false)}
            />
          </div>
        </div>
      )}

      <TaskModal
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveEditedTask}
        existingProjects={items.filter((i) => i.type === 'project')}
      />

      <TimeMachineModal
        isOpen={isTimeMachineOpen}
        onClose={() => setIsTimeMachineOpen(false)}
        onSimulateNextDay={(simulatedDate) => {
          setDayOffset((prev) => prev + 1);
          handleTriggerRolloverCheck(simulatedDate);
        }}
      />

      <WindowsGuideModal
        isOpen={isWindowsGuideOpen}
        onClose={() => setIsWindowsGuideOpen(false)}
      />

      <FontSettingsModal
        isOpen={isFontSettingsOpen}
        onClose={() => setIsFontSettingsOpen(false)}
        fontFamily={fontFamily}
        onChangeFontFamily={setFontFamily}
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
        density={density}
        onChangeDensity={setDensity}
      />
    </div>
  );
}

export default App;
