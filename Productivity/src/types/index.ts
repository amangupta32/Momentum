export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done';

export type GoalType = 'personal' | 'group';

export type GoalVisibility = 'private' | 'workspace';

export type GoalHealth = 'on_track' | 'at_risk' | 'blocked' | 'completed';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'Founder' | 'Engineer' | 'Designer' | 'Product' | 'Marketing' | 'Growth' | 'Member';
  title: string;
  bio: string;
  streakDays: number;
  onboardingCompleted?: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  members: string[]; // User IDs
  ownerId?: string;
  boardBackground?: string;
  isPersonal?: boolean;
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface GoalMilestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: GoalType;
  ownerId: string;
  workspaceId: string;
  visibility: GoalVisibility;
  category: 'Engineering' | 'Product' | 'Growth' | 'Learning' | 'Fitness' | 'Operations';
  priority: Priority;
  startDate: string;
  dueDate: string;
  milestones: GoalMilestone[];
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  creatorId: string;
  assigneeId?: string | null;
  workspaceId: string;
  linkedGoalId?: string | null;
  dueDate: string;
  labels: string[];
  checklist: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
  isTodayFocus?: boolean;
  isPrivate?: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  workspaceId: string;
  authorId: string;
  linkedGoalId?: string | null;
  linkedTaskId?: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
}

export interface ActivityEvent {
  id: string;
  workspaceId: string;
  userId: string;
  type: 
    | 'task_created' 
    | 'task_completed' 
    | 'task_claimed' 
    | 'task_status_changed' 
    | 'goal_created' 
    | 'goal_updated' 
    | 'milestone_reached' 
    | 'note_created';
  description: string;
  timestamp: string;
  entityId?: string;
  entityType?: 'task' | 'goal' | 'milestone' | 'note';
}

export interface WeeklyReview {
  id: string;
  workspaceId: string;
  userId: string;
  weekStartDate: string;
  completedTaskIds: string[];
  unfinishedTaskIds: string[];
  blockers: string;
  nextWeekPriorities: string[];
  reflection: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'task' | 'goal' | 'milestone' | 'system';
  linkTab?: string;
}

export type ActiveTab = 
  | 'home' 
  | 'my_goals' 
  | 'group_goals' 
  | 'task_board' 
  | 'commitment_wall'
  | 'blocker_radar'
  | 'notes' 
  | 'team' 
  | 'activity' 
  | 'weekly_review' 
  | 'settings';
