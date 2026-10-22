import { supabase, isSupabaseConfigured } from './supabase';
import {
  User,
  Workspace,
  Goal,
  Task,
  Note,
  ActivityEvent,
  WeeklyReview,
  Priority,
  TaskStatus,
} from '../types';

export interface WorkspaceMemberInfo {
  workspaceId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  profile?: User;
}

// ==========================================
// MAPPERS
// ==========================================

export function toAppUser(profile: {
  id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string | null;
  title?: string;
  role?: string;
  bio?: string;
  streak_days?: number;
}, fallbackEmail = ''): User {
  const name = profile.full_name || 'Momentum Member';
  return {
    id: profile.id,
    name,
    email: profile.email || fallbackEmail,
    avatar:
      profile.avatar_url ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || profile.id)}`,
    role: (profile.role as User['role']) || 'Member',
    title: profile.title || 'Contributor',
    bio: profile.bio || '',
    streakDays: profile.streak_days || 0,
  };
}

export function toAppWorkspace(
  db: { id: string; name: string; description?: string; icon?: string; color?: string },
  memberIds: string[] = []
): Workspace {
  return {
    id: db.id,
    name: db.name,
    slug: db.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    description: db.description || '',
    icon: db.icon || 'Sparkles',
    color: db.color || '#1E3A2F',
    members: memberIds,
  };
}

export function toAppGoal(db: {
  id: string;
  workspace_id?: string;
  owner_id: string;
  title: string;
  description?: string;
  goal_type?: string;
  visibility?: string;
  status?: string;
  priority?: string;
  category?: string;
  start_date?: string;
  due_date?: string;
  milestones?: unknown;
  archived?: boolean;
  created_at: string;
  updated_at: string;
}): Goal {
  return {
    id: db.id,
    title: db.title,
    description: db.description || '',
    type: db.goal_type === 'group' ? 'group' : 'personal',
    ownerId: db.owner_id,
    workspaceId: db.workspace_id || '',
    visibility: db.visibility === 'workspace' ? 'workspace' : 'private',
    category: (db.category as Goal['category']) || 'Product',
    priority: (db.priority as Priority) || 'medium',
    startDate: db.start_date || db.created_at.split('T')[0],
    dueDate: db.due_date || '',
    milestones: Array.isArray(db.milestones) ? db.milestones : [],
    createdAt: db.created_at,
    updatedAt: db.updated_at,
    archived: Boolean(db.archived || db.status === 'archived'),
  };
}

export function toAppTask(db: {
  id: string;
  workspace_id?: string;
  goal_id?: string | null;
  creator_id: string;
  assignee_id?: string | null;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  labels?: string[];
  checklist?: unknown;
  is_private?: boolean;
  is_today_focus?: boolean;
  created_at: string;
  updated_at: string;
}): Task {
  return {
    id: db.id,
    title: db.title,
    description: db.description || '',
    status: (db.status as TaskStatus) || 'todo',
    priority: (db.priority as Priority) || 'medium',
    creatorId: db.creator_id,
    assigneeId: db.assignee_id || null,
    workspaceId: db.workspace_id || '',
    linkedGoalId: db.goal_id || null,
    dueDate: db.due_date || '',
    labels: Array.isArray(db.labels) ? db.labels : [],
    checklist: Array.isArray(db.checklist) ? db.checklist : [],
    isTodayFocus: Boolean(db.is_today_focus),
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

export function toAppNote(db: {
  id: string;
  workspace_id?: string;
  owner_id: string;
  title?: string;
  content?: string;
  visibility?: string;
  is_pinned?: boolean;
  tags?: string[];
  linked_goal_id?: string | null;
  linked_task_id?: string | null;
  created_at: string;
  updated_at: string;
}): Note {
  return {
    id: db.id,
    title: db.title || 'Untitled note',
    content: db.content || '',
    workspaceId: db.workspace_id || '',
    authorId: db.owner_id,
    linkedGoalId: db.linked_goal_id || null,
    linkedTaskId: db.linked_task_id || null,
    tags: Array.isArray(db.tags) ? db.tags : [],
    isPinned: Boolean(db.is_pinned),
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

export function toAppActivity(db: {
  id: string;
  workspace_id: string;
  user_id: string;
  event_type: string;
  description: string;
  entity_id?: string | null;
  entity_type?: string | null;
  created_at: string;
}): ActivityEvent {
  return {
    id: db.id,
    workspaceId: db.workspace_id,
    userId: db.user_id,
    type: db.event_type as ActivityEvent['type'],
    description: db.description,
    timestamp: db.created_at,
    entityId: db.entity_id || undefined,
    entityType: (db.entity_type as ActivityEvent['entityType']) || undefined,
  };
}

export function toAppWeeklyReview(db: {
  id: string;
  workspace_id: string;
  user_id: string;
  week_start_date: string;
  completed_task_ids?: unknown;
  unfinished_task_ids?: unknown;
  blockers?: string;
  next_week_priorities?: unknown;
  reflection?: string;
  created_at: string;
}): WeeklyReview {
  return {
    id: db.id,
    workspaceId: db.workspace_id,
    userId: db.user_id,
    weekStartDate: db.week_start_date,
    completedTaskIds: Array.isArray(db.completed_task_ids) ? db.completed_task_ids : [],
    unfinishedTaskIds: Array.isArray(db.unfinished_task_ids) ? db.unfinished_task_ids : [],
    blockers: db.blockers || '',
    nextWeekPriorities: Array.isArray(db.next_week_priorities) ? db.next_week_priorities : [],
    reflection: db.reflection || '',
    createdAt: db.created_at,
  };
}

// ==========================================
// SUPABASE DATABASE OPERATIONS
// ==========================================

export const SupabaseDb = {
  // WORKSPACES
  async ensureUserWorkspace(): Promise<string | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase.rpc('ensure_user_workspace');
    if (error) {
      console.error('[Supabase] Failed to ensure user workspace:', error);
      return null;
    }
    return data as string;
  },

  async fetchWorkspaces(): Promise<Workspace[]> {
    if (!isSupabaseConfigured) return [];
    
    // Get all workspaces user belongs to
    const { data: memberRows, error: memberErr } = await supabase
      .from('workspace_members')
      .select('workspace_id, role, workspaces (id, name, description, icon, color, owner_id)');

    if (memberErr || !memberRows) {
      console.warn('[Supabase] fetchWorkspaces member query:', memberErr);
      return [];
    }

    const uniqueWorkspaces = new Map<string, Workspace>();
    for (const row of memberRows) {
      const rawWs = Array.isArray(row.workspaces) ? row.workspaces[0] : row.workspaces;
      const ws = (rawWs as unknown) as { id: string; name: string; description?: string; icon?: string; color?: string } | null;
      if (ws && !uniqueWorkspaces.has(ws.id)) {
        uniqueWorkspaces.set(ws.id, toAppWorkspace(ws, []));
      }
    }

    return Array.from(uniqueWorkspaces.values());
  },

  async fetchWorkspaceMembers(workspaceId: string): Promise<WorkspaceMemberInfo[]> {
    if (!isSupabaseConfigured || !workspaceId) return [];

    const { data, error } = await supabase
      .from('workspace_members')
      .select('workspace_id, user_id, role, joined_at, profiles (id, full_name, email, avatar_url, title, role, bio, streak_days)')
      .eq('workspace_id', workspaceId);

    if (error || !data) {
      console.warn('[Supabase] fetchWorkspaceMembers failed:', error);
      return [];
    }

    return data.map((row) => {
      const rawProf = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      const prof = (rawProf as unknown) as {
        id: string;
        full_name?: string;
        email?: string;
        avatar_url?: string | null;
        title?: string;
        role?: string;
        bio?: string;
        streak_days?: number;
      } | null;

      return {
        workspaceId: row.workspace_id,
        userId: row.user_id,
        role: row.role as 'owner' | 'admin' | 'member',
        joinedAt: row.joined_at,
        profile: prof ? toAppUser(prof) : undefined,
      };
    });
  },

  async createWorkspace(name: string, description = ''): Promise<string> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase.rpc('create_workspace', {
      workspace_name: name.trim(),
      workspace_description: description.trim(),
    });
    if (error) throw error;
    return data as string;
  },

  async createInvitation(workspaceId: string, hours = 72, uses = 10): Promise<string> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase.rpc('create_workspace_invitation', {
      target_workspace: workspaceId,
      validity_hours: hours,
      allowed_uses: uses,
    });
    if (error) throw error;
    return data as string;
  },

  async joinWorkspace(invitationCode: string): Promise<string> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase.rpc('join_workspace', {
      invitation_code: invitationCode.trim(),
    });
    if (error) throw error;
    return data as string;
  },

  // PROFILES
  async fetchProfiles(userIds: string[]): Promise<User[]> {
    if (!isSupabaseConfigured || userIds.length === 0) return [];
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url, title, role, bio, streak_days')
      .in('id', userIds);

    if (error || !data) return [];
    return data.map((p) => toAppUser(p));
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<void> {
    if (!isSupabaseConfigured) return;
    const dbPayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.name !== undefined) dbPayload.full_name = updates.name;
    if (updates.email !== undefined) dbPayload.email = updates.email;
    if (updates.avatar !== undefined) dbPayload.avatar_url = updates.avatar;
    if (updates.title !== undefined) dbPayload.title = updates.title;
    if (updates.bio !== undefined) dbPayload.bio = updates.bio;
    if (updates.role !== undefined) dbPayload.role = updates.role;
    if (updates.streakDays !== undefined) dbPayload.streak_days = updates.streakDays;

    const { error } = await supabase
      .from('profiles')
      .update(dbPayload)
      .eq('id', userId);

    if (error) throw error;
  },

  // GOALS
  async fetchGoals(workspaceId: string, currentUserId: string): Promise<Goal[]> {
    if (!isSupabaseConfigured) return [];
    
    // Select workspace goals OR personal goals belonging to current user
    let query = supabase.from('goals').select('*');
    if (workspaceId) {
      query = query.or(`workspace_id.eq.${workspaceId},owner_id.eq.${currentUserId}`);
    } else {
      query = query.eq('owner_id', currentUserId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error || !data) {
      console.warn('[Supabase] fetchGoals error:', error);
      return [];
    }
    return data.map(toAppGoal);
  },

  async createGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    const now = new Date().toISOString();
    const payload = {
      title: goal.title,
      description: goal.description || '',
      goal_type: goal.type,
      owner_id: goal.ownerId,
      workspace_id: goal.workspaceId || null,
      visibility: goal.visibility,
      category: goal.category,
      priority: goal.priority,
      start_date: goal.startDate || now.split('T')[0],
      due_date: goal.dueDate || null,
      milestones: goal.milestones || [],
      archived: Boolean(goal.archived),
    };

    const { data, error } = await supabase.from('goals').insert(payload).select().single();
    if (error) throw error;
    return toAppGoal(data);
  },

  async updateGoal(id: string, updates: Partial<Goal>): Promise<void> {
    if (!isSupabaseConfigured) return;
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.type !== undefined) payload.goal_type = updates.type;
    if (updates.visibility !== undefined) payload.visibility = updates.visibility;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.dueDate !== undefined) payload.due_date = updates.dueDate || null;
    if (updates.startDate !== undefined) payload.start_date = updates.startDate || null;
    if (updates.milestones !== undefined) payload.milestones = updates.milestones;
    if (updates.archived !== undefined) {
      payload.archived = updates.archived;
      if (updates.archived) payload.status = 'archived';
    }

    const { error } = await supabase.from('goals').update(payload).eq('id', id);
    if (error) throw error;
  },

  async deleteGoal(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) throw error;
  },

  // TASKS
  async fetchTasks(workspaceId: string, currentUserId: string): Promise<Task[]> {
    if (!isSupabaseConfigured) return [];
    let query = supabase.from('tasks').select('*');
    if (workspaceId) {
      query = query.or(`workspace_id.eq.${workspaceId},creator_id.eq.${currentUserId},assignee_id.eq.${currentUserId}`);
    } else {
      query = query.or(`creator_id.eq.${currentUserId},assignee_id.eq.${currentUserId}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error || !data) {
      console.warn('[Supabase] fetchTasks error:', error);
      return [];
    }
    return data.map(toAppTask);
  },

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    const payload = {
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      creator_id: task.creatorId,
      assignee_id: task.assigneeId || null,
      workspace_id: task.workspaceId || null,
      goal_id: task.linkedGoalId || null,
      due_date: task.dueDate || null,
      labels: task.labels || [],
      checklist: task.checklist || [],
      is_today_focus: Boolean(task.isTodayFocus),
    };

    const { data, error } = await supabase.from('tasks').insert(payload).select().single();
    if (error) throw error;
    return toAppTask(data);
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    if (!isSupabaseConfigured) return;
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.assigneeId !== undefined) payload.assignee_id = updates.assigneeId || null;
    if (updates.linkedGoalId !== undefined) payload.goal_id = updates.linkedGoalId || null;
    if (updates.dueDate !== undefined) payload.due_date = updates.dueDate || null;
    if (updates.labels !== undefined) payload.labels = updates.labels;
    if (updates.checklist !== undefined) payload.checklist = updates.checklist;
    if (updates.isTodayFocus !== undefined) payload.is_today_focus = updates.isTodayFocus;

    const { error } = await supabase.from('tasks').update(payload).eq('id', id);
    if (error) throw error;
  },

  async deleteTask(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  },

  // NOTES
  async fetchNotes(workspaceId: string, currentUserId: string): Promise<Note[]> {
    if (!isSupabaseConfigured) return [];
    let query = supabase.from('notes').select('*');
    if (workspaceId) {
      query = query.or(`workspace_id.eq.${workspaceId},owner_id.eq.${currentUserId}`);
    } else {
      query = query.eq('owner_id', currentUserId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error || !data) {
      console.warn('[Supabase] fetchNotes error:', error);
      return [];
    }
    return data.map(toAppNote);
  },

  async createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    const payload = {
      title: note.title,
      content: note.content || '',
      workspace_id: note.workspaceId || null,
      owner_id: note.authorId,
      linked_goal_id: note.linkedGoalId || null,
      linked_task_id: note.linkedTaskId || null,
      tags: note.tags || [],
      is_pinned: Boolean(note.isPinned),
      visibility: 'workspace',
    };

    const { data, error } = await supabase.from('notes').insert(payload).select().single();
    if (error) throw error;
    return toAppNote(data);
  },

  async updateNote(id: string, updates: Partial<Note>): Promise<void> {
    if (!isSupabaseConfigured) return;
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.content !== undefined) payload.content = updates.content;
    if (updates.tags !== undefined) payload.tags = updates.tags;
    if (updates.isPinned !== undefined) payload.is_pinned = updates.isPinned;
    if (updates.linkedGoalId !== undefined) payload.linked_goal_id = updates.linkedGoalId || null;
    if (updates.linkedTaskId !== undefined) payload.linked_task_id = updates.linkedTaskId || null;

    const { error } = await supabase.from('notes').update(payload).eq('id', id);
    if (error) throw error;
  },

  async deleteNote(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) throw error;
  },

  // ACTIVITIES
  async fetchActivities(workspaceId: string): Promise<ActivityEvent[]> {
    if (!isSupabaseConfigured || !workspaceId) return [];
    const { data, error } = await supabase
      .from('activity_events')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) return [];
    return data.map(toAppActivity);
  },

  async createActivity(activity: Omit<ActivityEvent, 'id' | 'timestamp'>): Promise<ActivityEvent> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    const payload = {
      workspace_id: activity.workspaceId,
      user_id: activity.userId,
      event_type: activity.type,
      description: activity.description,
      entity_id: activity.entityId || null,
      entity_type: activity.entityType || null,
    };

    const { data, error } = await supabase.from('activity_events').insert(payload).select().single();
    if (error) throw error;
    return toAppActivity(data);
  },

  // WEEKLY REVIEWS
  async fetchWeeklyReviews(workspaceId: string): Promise<WeeklyReview[]> {
    if (!isSupabaseConfigured || !workspaceId) return [];
    const { data, error } = await supabase
      .from('weekly_reviews')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(toAppWeeklyReview);
  },

  async createWeeklyReview(review: Omit<WeeklyReview, 'id' | 'createdAt'>): Promise<WeeklyReview> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    const payload = {
      workspace_id: review.workspaceId,
      user_id: review.userId,
      week_start_date: review.weekStartDate,
      completed_task_ids: review.completedTaskIds || [],
      unfinished_task_ids: review.unfinishedTaskIds || [],
      blockers: review.blockers || '',
      next_week_priorities: review.nextWeekPriorities || [],
      reflection: review.reflection || '',
    };

    const { data, error } = await supabase.from('weekly_reviews').insert(payload).select().single();
    if (error) throw error;
    return toAppWeeklyReview(data);
  },
};
