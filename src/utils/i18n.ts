import { LanguageCode } from '../types';

export const translations = {
  zh: {
    appName: 'Clear Do',
    newTask: '新建任务',
    openTask: '处理中任务',
    allProjects: '所有项目',
    rolledTasks: '顺延任务',
    workReports: '工作报告',
    exportCsv: '导出 / 导入',
    settings: '系统设置',
    navigation: '导航菜单',
    activeProjects: '活跃项目',
    autoRolloverEngine: '自动顺延引擎',
    timeMachine: '模拟跨天顺延 (时光机)',
    resetDemo: '重置演示数据',

    // Today View & Filters
    closedToday: '今日关闭',
    closedThisWeek: '本周关闭',
    closedThisMonth: '本月关闭',
    closedThisQuarter: '本季度关闭',
    closedThisYear: '本年关闭',
    completed: '已完成',
    source: '来源',
    priority: '优先级',
    searchPlaceholder: '搜索任务...',
    taskGroup: 'Task 任务',
    projectGroup: 'Project 项目',
    collapseGroup: '折叠',
    expandGroup: '展开',
    noTasks: '当前列表无符合条件的任务',

    // Task Item
    durationDays: '持续 {days} 天',
    requesterLabel: '需求人/部门',
    handlerLabel: '传递人/部门',
    attachments: '附件',

    // New Task Modal
    createNewTask: '新建任务',
    taskTitle: '任务标题 / 内容',
    type: '类型',
    standaloneTask: '具体任务',
    project: '项目',
    parentProject: '归属项目',
    noParentProject: '无（作为独立任务）',
    requesterPlaceholder: '如: HR / 财务部 / 张三',
    handlerPlaceholder: '如: IT 运维 / 李四',
    plannedDate: '计划执行日期',
    notesDescription: '备注说明 (支持自动识别 URL 网页链接)',
    save: '保存',
    cancel: '取消',

    // Monitor Sidebar
    monitorTitle: '数据看板 Monitor',
    addWidget: '添加模块',
    removeWidget: '移除模块',
    created: '创建 (Created)',
    closed: '关闭 (Closed)',
    taskToday: 'Task Today',
    taskLastMonth: 'Task last month',
    taskThisMonth: 'Task this month',
    openTaskByPriority: 'Open Task by priority',
    taskRolled: 'Task rolled',
    numRolled: '# of rolled',
    daysRolled: 'days of rolled',

    // Settings
    settingsTitle: '系统设置 (Settings)',
    uiPersonalization: '界面与个性化',
    fontFamily: '界面字体',
    fontSize: '字号密度',
    themeColor: '主题强调色',
    language: '系统语言',
    advancedEngine: '高级顺延引擎配置',
    csvDataMgmt: 'CSV 数据管理与导入',
    importCsv: '导入历史 CSV 文件 (兼容旧版)',
    exportCsvAction: '导出完整 CSV 备份',
  },
  en: {
    appName: 'Clear Do',
    newTask: 'New Task',
    openTask: 'Open Tasks',
    allProjects: 'All Projects',
    rolledTasks: 'Rolled Tasks',
    workReports: 'Work Reports',
    exportCsv: 'Export / Import',
    settings: 'Settings',
    navigation: 'Navigation',
    activeProjects: 'Active Projects',
    autoRolloverEngine: 'Auto-Rollover Engine',
    timeMachine: 'Simulate Rollover (Time Machine)',
    resetDemo: 'Reset Demo Data',

    // Today View & Filters
    closedToday: 'Closed Today',
    closedThisWeek: 'Closed This Week',
    closedThisMonth: 'Closed This Month',
    closedThisQuarter: 'Closed This Quarter',
    closedThisYear: 'Closed This Year',
    completed: 'Completed',
    source: 'Source',
    priority: 'Priority',
    searchPlaceholder: 'Search tasks...',
    taskGroup: 'Task Group',
    projectGroup: 'Project Group',
    collapseGroup: 'Collapse',
    expandGroup: 'Expand',
    noTasks: 'No matching tasks found',

    // Task Item
    durationDays: 'Duration {days}d',
    requesterLabel: 'Requester/Dept',
    handlerLabel: 'Handler/Dept',
    attachments: 'Attachments',

    // New Task Modal
    createNewTask: 'Create New Task',
    taskTitle: 'Task Title / Content',
    type: 'Type',
    standaloneTask: 'Task',
    project: 'Project',
    parentProject: 'Parent Project',
    noParentProject: 'None (Standalone Task)',
    requesterPlaceholder: 'e.g. HR / Finance / John',
    handlerPlaceholder: 'e.g. IT Ops / Alex',
    plannedDate: 'Planned Date',
    notesDescription: 'Notes (Auto-detects URL links)',
    save: 'Save',
    cancel: 'Cancel',

    // Monitor Sidebar
    monitorTitle: 'Data Monitor',
    addWidget: 'Add Widget',
    removeWidget: 'Remove Widget',
    created: 'Created',
    closed: 'Closed',
    taskToday: 'Task Today',
    taskLastMonth: 'Task last month',
    taskThisMonth: 'Task this month',
    openTaskByPriority: 'Open Task by priority',
    taskRolled: 'Task rolled',
    numRolled: '# of rolled',
    daysRolled: 'days of rolled',

    // Settings
    settingsTitle: 'System Settings',
    uiPersonalization: 'UI & Personalization',
    fontFamily: 'Font Family',
    fontSize: 'Font Size & Density',
    themeColor: 'Accent Color',
    language: 'System Language',
    advancedEngine: 'Rollover Engine Setup',
    csvDataMgmt: 'CSV Data & Migration',
    importCsv: 'Import Historical CSV (Backward Compatible)',
    exportCsvAction: 'Export Full CSV Backup',
  },
};

export function t(lang: string | LanguageCode | undefined, key: keyof typeof translations['zh'], params?: Record<string, string | number>): string {
  const safeLang = (lang === 'en' ? 'en' : 'zh') as LanguageCode;
  const dict = translations[safeLang] || translations.zh;
  let str = dict[key] || translations.zh[key] || String(key);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      str = str.replace(`{${k}}`, String(v));
    });
  }
  return str;
}
