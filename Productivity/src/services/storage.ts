import {
  User,
  Workspace,
  Goal,
  Task,
  Note,
  ActivityEvent,
  WeeklyReview,
  NotificationItem,
  GoalHealth,
} from '../types';
const STORAGE_PREFIX = 'momentum_v2_';
let activeStorageUserId = 'anonymous';
const storageKey = (key: string) => `${STORAGE_PREFIX}${activeStorageUserId}_${key}`;

function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(storageKey(key));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch (err) {
    console.warn(`[Momentum Storage] Corrupted data for "${key}", using fallback.`, err);
    return fallback;
  }
}

function safeSetItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(storageKey(key), JSON.stringify(value));
  } catch (err) {
    console.error(`[Momentum Storage] Failed to write "${key}" to localStorage.`, err);
  }
}

export const StorageService = {
  setStorageUserId(id: string): void { activeStorageUserId = id || 'anonymous'; },

  // Current active user & workspace
  getCurrentUserId(): string {
    const stored = localStorage.getItem(storageKey('current_user_id'));
    return stored || '';
  },
  setCurrentUserId(id: string): void {
    localStorage.setItem(storageKey('current_user_id'), id);
  },

  getActiveWorkspaceId(): string {
    const stored = localStorage.getItem(storageKey('active_workspace_id'));
    return stored || '';
  },
  setActiveWorkspaceId(id: string): void {
    localStorage.setItem(storageKey('active_workspace_id'), id);
  },

  // Collections
  getUsers(): User[] {
    return safeGetItem<User[]>('users', []);
  },
  saveUsers(users: User[]): void {
    safeSetItem('users', users);
  },

  getWorkspaces(): Workspace[] {
    return safeGetItem<Workspace[]>('workspaces', []);
  },
  saveWorkspaces(workspaces: Workspace[]): void {
    safeSetItem('workspaces', workspaces);
  },

  getGoals(): Goal[] {
    return safeGetItem<Goal[]>('goals', []);
  },
  saveGoals(goals: Goal[]): void {
    safeSetItem('goals', goals);
  },

  getTasks(): Task[] {
    return safeGetItem<Task[]>('tasks', []);
  },
  saveTasks(tasks: Task[]): void {
    safeSetItem('tasks', tasks);
  },

  getNotes(): Note[] {
    return safeGetItem<Note[]>('notes', []);
  },
  saveNotes(notes: Note[]): void {
    safeSetItem('notes', notes);
  },

  getActivities(): ActivityEvent[] {
    return safeGetItem<ActivityEvent[]>('activities', []);
  },
  saveActivities(activities: ActivityEvent[]): void {
    safeSetItem('activities', activities);
  },

  getNotifications(): NotificationItem[] {
    return safeGetItem<NotificationItem[]>('notifications', []);
  },
  saveNotifications(notifications: NotificationItem[]): void {
    safeSetItem('notifications', notifications);
  },

  getWeeklyReviews(): WeeklyReview[] {
    return safeGetItem<WeeklyReview[]>('weekly_reviews', []);
  },
  saveWeeklyReviews(reviews: WeeklyReview[]): void {
    safeSetItem('weekly_reviews', reviews);
  },


};

// ==========================================
// DERIVED COMPUTATIONS & LOGIC
// ==========================================

export function calculateGoalProgress(goal: Goal, allTasks: Task[]): number {
  const linkedTasks = allTasks.filter((t) => t.linkedGoalId === goal.id);
  const totalMilestones = goal.milestones.length;
  const completedMilestones = goal.milestones.filter((m) => m.completed).length;

  const totalTasks = linkedTasks.length;
  const completedTasks = linkedTasks.filter((t) => t.status === 'done').length;

  // If both exist, balance 50/50
  if (totalMilestones > 0 && totalTasks > 0) {
    const milestoneRatio = completedMilestones / totalMilestones;
    const taskRatio = completedTasks / totalTasks;
    return Math.round((milestoneRatio * 0.5 + taskRatio * 0.5) * 100);
  }

  // If only milestones exist
  if (totalMilestones > 0) {
    return Math.round((completedMilestones / totalMilestones) * 100);
  }

  // If only tasks exist
  if (totalTasks > 0) {
    return Math.round((completedTasks / totalTasks) * 100);
  }

  return 0;
}

export function calculateGoalHealth(goal: Goal, allTasks: Task[]): GoalHealth {
  const progress = calculateGoalProgress(goal, allTasks);
  if (progress === 100) return 'completed';

  const todayStr = new Date().toISOString().split('T')[0];
  const isGoalOverdue = goal.dueDate < todayStr;

  const linkedTasks = allTasks.filter((t) => t.linkedGoalId === goal.id);
  const overdueTasks = linkedTasks.filter(
    (t) => t.status !== 'done' && t.dueDate && t.dueDate < todayStr
  );

  if (isGoalOverdue && progress < 90) return 'blocked';
  if (overdueTasks.length >= 2 || (isGoalOverdue && progress < 100)) return 'at_risk';
  if (overdueTasks.length === 1) return 'at_risk';

  return 'on_track';
}

export function calculateUserStreak(activities: ActivityEvent[], userId: string): number {
  // Derive user streak from actual activities with type task_completed
  const completions = activities.filter(
    (a) => a.userId === userId && a.type === 'task_completed'
  );

  if (completions.length === 0) return 0;

  // Map dates
  const days = new Set(
    completions.map((c) => new Date(c.timestamp).toISOString().split('T')[0])
  );

  // Return base streak plus any new days
  return days.size;
}

export function getBlockersAndRisks(tasks: Task[], goals: Goal[], workspaceId: string) {
  const todayStr = new Date().toISOString().split('T')[0];
  const wsTasks = tasks.filter((t) => t.workspaceId === workspaceId);
  const wsGoals = goals.filter((g) => g.workspaceId === workspaceId && !g.archived);

  // Overdue tasks
  const overdueTasks = wsTasks.filter(
    (t) => t.status !== 'done' && t.dueDate && t.dueDate < todayStr
  );

  // Urgent pending tasks
  const urgentUnfinishedTasks = wsTasks.filter(
    (t) => t.status !== 'done' && t.priority === 'urgent' && !overdueTasks.some(o => o.id === t.id)
  );

  // At-risk or blocked goals
  const atRiskGoals = wsGoals.filter((g) => {
    const health = calculateGoalHealth(g, tasks);
    return health === 'at_risk' || health === 'blocked';
  });

  return {
    overdueTasks,
    urgentUnfinishedTasks,
    atRiskGoals,
    totalBlockers: overdueTasks.length + urgentUnfinishedTasks.length + atRiskGoals.length,
  };
}
