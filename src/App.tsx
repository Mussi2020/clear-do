import React, { useState, useEffect, useRef } from 'react';
import { ViewMode, TaskItemData, TaskStatus, TaskSource, TaskPriority, TaskAttachment, SettingsState } from './types';
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
import { MonitorSidebar } from './components/MonitorSidebar';

import { NewTaskModal } from './components/Modals/NewTaskModal';
import { TaskModal } from './components/Modals/TaskModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { TimeMachineModal } from './components/Modals/TimeMachineModal';
import { WindowsGuideModal } from './components/Modals/WindowsGuideModal';
import { parseCsvToTasks, exportTasksToCsv } from './utils/csvUtils';
import { Sparkles, X, BarChart3, ChevronLeft } from 'lucide-react';

const SYNC_CHANNEL_NAME = 'clear_do_v2_sync_channel';

export function App() {
  const [items, setItems] = useState<TaskItemData[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>('today');
  
  // Date simulation offset (for Time Machine simulator)
  const [dayOffset, setDayOffset] = useState<number>(0);

  // Today rolled notification counter
  const [todayRolledCount, setTodayRolledCount] = useState<number>(0);

  // System Settings state
  const [settings, setSettings] = useState<SettingsState>(() => {
    const saved = localStorage.getItem('clear_do_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    return {
      language: 'zh',
      fontFamily: 'system',
      fontSize: 'base',
      density: 'compact',
      monitorWidth: 300,
      activeWidgets: ['today', 'last_month', 'this_month', 'open_by_priority', 'task_rolled'],
    };
  });

  // Resizable Sidebar State
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem('clear_do_sidebar_width');
    return saved ? parseInt(saved, 10) : 240;
  });
  const [isResizingSidebar, setIsResizingSidebar] = useState<boolean>(false);

  // Monitor Sidebar Toggle & Filter States
  const [monitorVisible, setMonitorVisible] = useState<boolean>(true);
  const [monitorPriorityFilter, setMonitorPriorityFilter] = useState<string | null>(null);
  const [monitorClosedFilter, setMonitorClosedFilter] = useState<string | null>(null);

  // Modals state
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isTimeMachineOpen, setIsTimeMachineOpen] = useState(false);
  const [isWindowsGuideOpen, setIsWindowsGuideOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItemData | null>(null);

  // Global toast banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Save Settings
  useEffect(() => {
    localStorage.setItem('clear_do_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('clear_do_sidebar_width', sidebarWidth.toString());
  }, [sidebarWidth]);

  // Sidebar drag width handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingSidebar) return;
      const newWidth = Math.min(Math.max(e.clientX, 180), 450);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
    };

    if (isResizingSidebar) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingSidebar]);

  // Multi-instance Synchronization (BroadcastChannel + LocalStorage event)
  useEffect(() => {
    try {
      const bc = new BroadcastChannel(SYNC_CHANNEL_NAME);
      broadcastChannelRef.current = bc;

      bc.onmessage = (event) => {
        if (event.data && event.data.type === 'SYNC_TASKS') {
          setItems(event.data.payload);
          setToastMessage('🔄 发现其他窗口更新，已实时同步数据！');
          setTimeout(() => setToastMessage(null), 3000);
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported in iframe', e);
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'clear_do_tasks_v2' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setItems(parsed);
        } catch (err) {
          console.error('Storage sync error', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Keyboard shortcut Ctrl+K to open New Task Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsNewTaskModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Persist items & broadcast sync to other open tabs
  const updateItemsAndPersist = (newItems: TaskItemData[], notifySync = true) => {
    setItems(newItems);
    saveStoredItems(newItems);

    if (notifySync && broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'SYNC_TASKS',
        payload: newItems,
      });
    }
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

  // Add Item from NewTaskModal
  const handleAddItem = (newItemData: any) => {
    const itemType = newItemData.type || 'task';
    const newItem: TaskItemData = {
      id: `${itemType}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: itemType,
      parent_id: newItemData.parent_id ?? newItemData.parentId ?? null,
      title: newItemData.title || '新任务',
      source: newItemData.source || 'Teams',
      priority: newItemData.priority || 'Medium',
      requester: newItemData.requester,
      handler: newItemData.handler,
      description: newItemData.description,
      created_at: effectiveTodayStr,
      planned_date: newItemData.planned_date ?? newItemData.plannedDate ?? effectiveTodayStr,
      completed_at: null,
      status: 'Todo',
      rollover_count: 0,
      rollover_history: [],
      attachments: newItemData.attachments || [],
    };

    updateItemsAndPersist([newItem, ...items]);
    setToastMessage(`🎉 已成功创建${itemType === 'project' ? '项目' : '任务'}: "${newItem.title}"`);
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

  // CSV Export Trigger
  const handleExportCsv = () => {
    const csvContent = exportTasksToCsv(items);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ClearDo_Tasks_Backup_${effectiveTodayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage('✅ CSV 数据包导出成功！');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // CSV Import Handler
  const handleImportCsvText = (csvText: string) => {
    const importedTasks = parseCsvToTasks(csvText);
    if (importedTasks.length === 0) {
      setToastMessage('⚠️ CSV 解析未发现有效任务，请检查列名称');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    // Merge without duplicates by ID
    const existingIds = new Set(items.map((i) => i.id));
    const newAdditions = importedTasks.filter((t) => !existingIds.has(t.id));
    const merged = [...newAdditions, ...items];

    updateItemsAndPersist(merged);
    setToastMessage(`🎉 成功导入 ${importedTasks.length} 条历史 Task 项！`);
    setTimeout(() => setToastMessage(null), 4000);
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
    switch (settings.fontFamily) {
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      case 'sans': return 'font-sans tracking-tight';
      default: return 'font-sans';
    }
  };

  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'sm': return 'text-[13px]';
      case 'lg': return 'text-[15px]';
      case 'xl': return 'text-[16px]';
      default: return 'text-[14px]';
    }
  };

  return (
    <div className={`flex h-screen bg-[#F8FAFC] text-slate-800 antialiased overflow-hidden select-none ${getFontFamilyClass()} ${getFontSizeClass()}`}>
      {/* Left Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        items={items}
        onOpenNewTask={() => setIsNewTaskModalOpen(true)}
        onOpenTimeMachine={() => setIsTimeMachineOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onToggleMonitor={() => setMonitorVisible(!monitorVisible)}
        onResetData={handleResetDemoData}
        todayRolledCount={todayRolledCount}
        monitorVisible={monitorVisible}
        language={settings.language}
        width={sidebarWidth}
      />

      {/* Resizable Divider Handle */}
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          setIsResizingSidebar(true);
        }}
        className={`w-1.5 hover:w-2 hover:bg-indigo-500/50 cursor-col-resize shrink-0 transition-all z-30 select-none group relative ${
          isResizingSidebar ? 'bg-indigo-600 w-2' : 'bg-transparent border-r border-slate-200'
        }`}
        title="拖拽调节侧边栏宽度"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto min-w-0">
        {/* Global Toast */}
        {toastMessage && (
          <div className="mx-6 mt-4 p-3 bg-slate-900 text-white rounded-2xl shadow-lg border border-slate-800 flex items-center justify-between text-xs animate-fadeIn shrink-0 z-40">
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
        <div className={`flex-1 ${settings.density === 'compact' ? 'p-4' : 'p-6'}`}>
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
              language={settings.language}
              externalPriorityFilter={monitorPriorityFilter}
              externalClosedFilter={monitorClosedFilter}
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
            <ExportView
              items={items}
              onImportItems={(imported) => {
                // Merge/replace imported tasks and run auto-rollover check
                const rolloverResult = executeAutoRollover(imported, effectiveTodayStr);
                updateItemsAndPersist(rolloverResult.updatedItems);
                setToastMessage(`✅ 数据导入成功！已导入/融合 ${imported.length} 条数据 (含 ${rolloverResult.rolledCount} 项自动顺延任务)`);
                setTimeout(() => setToastMessage(null), 4000);
              }}
            />
          )}
        </div>
      </main>

      {/* Modular Monitor Sidebar on Right (Requirement 1) */}
      {monitorVisible ? (
        <MonitorSidebar
          items={items}
          settings={settings}
          onUpdateSettings={(newPartial) => setSettings({ ...settings, ...newPartial })}
          onClose={() => setMonitorVisible(false)}
          onSelectPriorityFilter={(p) => {
            setMonitorPriorityFilter(p === 'all' ? null : p);
            setCurrentView('today');
            setToastMessage(p === 'all' ? '已重置优先级筛选' : `🔍 已通过 Monitor 看板筛选 ${p} 优先级任务`);
            setTimeout(() => setToastMessage(null), 3000);
          }}
          onSelectDateFilter={(rangeKey) => {
            setMonitorClosedFilter(rangeKey);
            setCurrentView('today');
            setToastMessage(`🔍 已通过 Monitor 看板筛选时间维度: ${rangeKey}`);
            setTimeout(() => setToastMessage(null), 3000);
          }}
        />
      ) : (
        /* Floating Sticky Toggle Button on Right Edge when Sidebar is Closed */
        <button
          onClick={() => setMonitorVisible(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 bg-slate-900 hover:bg-indigo-700 text-white py-3 px-2 rounded-l-xl shadow-xl flex flex-col items-center gap-2 z-40 transition-all cursor-pointer border-l border-t border-b border-slate-700 group animate-pulse hover:animate-none"
          title="点击滑出侧边数据看板 (Monitor Sidebar)"
        >
          <BarChart3 className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-extrabold tracking-widest uppercase [writing-mode:vertical-lr] text-slate-200">
            看板
          </span>
          <ChevronLeft className="w-3.5 h-3.5 text-indigo-300" />
        </button>
      )}

      {/* Modals */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onAddTask={handleAddItem}
        existingProjects={items.filter((i) => i.type === 'project')}
        language={settings.language}
      />

      <TaskModal
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveEditedTask}
        existingProjects={items.filter((i) => i.type === 'project')}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={(newPartial) => setSettings({ ...settings, ...newPartial })}
        onRunRolloverNow={() => handleTriggerRolloverCheck()}
        onOpenTimeMachine={() => setIsTimeMachineOpen(true)}
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
    </div>
  );
}

export default App;
