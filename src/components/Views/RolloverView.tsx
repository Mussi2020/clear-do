import React from 'react';
import { AlertTriangle, Clock, History, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { TaskItemData, TaskStatus } from '../../types';
import { TaskItem } from '../TaskItem';

interface RolloverViewProps {
  items: TaskItemData[];
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: TaskItemData) => void;
  onOpenHistory: (task: TaskItemData) => void;
}

export const RolloverView: React.FC<RolloverViewProps> = ({
  items,
  onUpdateStatus,
  onDeleteItem,
  onEditItem,
  onOpenHistory,
}) => {
  const rolledTasks = items
    .filter((i) => i.type === 'task' && i.rollover_count > 0)
    .sort((a, b) => b.rollover_count - a.rollover_count);

  const pendingRolledTasks = rolledTasks.filter((t) => t.status !== 'Done' && t.status !== 'Cancelled');
  const doneRolledTasks = rolledTasks.filter((t) => t.status === 'Done');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-slate-900 text-amber-100 p-6 rounded-3xl border border-amber-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />
          <span>Smart Rollover Warning System</span>
        </div>
        <h2 className="text-xl font-bold text-white">顺延拖延警示中心 (Rollover Dashboard)</h2>
        <p className="text-xs text-amber-200 max-w-2xl leading-relaxed">
          此处集中监控所有发生过“跨天自动顺延”的任务。拖延次数越多，颜色警示越深，帮助您精准识别工作瓶颈并及时调整计划。
        </p>

        <div className="pt-3 border-t border-amber-800/80 flex flex-wrap gap-6 text-xs text-amber-200">
          <div>
            <span>待解决顺延项: </span>
            <strong className="text-amber-100 font-extrabold text-sm">{pendingRolledTasks.length}</strong> 项
          </div>
          <div>
            <span>曾经顺延但已完成: </span>
            <strong className="text-emerald-400 font-extrabold text-sm">{doneRolledTasks.length}</strong> 项
          </div>
        </div>
      </div>

      {/* Pending Rolled Tasks */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          当前未完成的顺延任务 ({pendingRolledTasks.length})
        </h3>

        {pendingRolledTasks.length === 0 ? (
          <div className="py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-xs text-slate-600 font-semibold">太棒了！当前没有任何积压顺延的任务</p>
            <p className="text-[11px] text-slate-400">所有计划均在推进中或按时完成</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {pendingRolledTasks.map((task) => {
              const parentProj = items.find((p) => p.id === task.parent_id);
              return (
                <TaskItem
                  key={task.id}
                  task={task}
                  parentProjectName={parentProj?.title}
                  onUpdateStatus={onUpdateStatus}
                  onDeleteTask={onDeleteItem}
                  onEditTask={onEditItem}
                  onOpenHistory={onOpenHistory}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Previously Rolled but Now Done Tasks */}
      {doneRolledTasks.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            曾经顺延、最终攻克完成的任务 ({doneRolledTasks.length})
          </h3>

          <div className="space-y-2.5 opacity-80">
            {doneRolledTasks.map((task) => {
              const parentProj = items.find((p) => p.id === task.parent_id);
              return (
                <TaskItem
                  key={task.id}
                  task={task}
                  parentProjectName={parentProj?.title}
                  onUpdateStatus={onUpdateStatus}
                  onDeleteTask={onDeleteItem}
                  onEditTask={onEditItem}
                  onOpenHistory={onOpenHistory}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
