import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  User,
  Workspace,
  Goal,
  Task,
  Note,
  ActivityEvent,
  WeeklyReview,
  NotificationItem,
  ActiveTab,
  TaskStatus,
} from '../types';
import {
  StorageService,
  calculateGoalProgress,
  calculateGoalHealth,
  calculateUserStreak,
  getBlockersAndRisks,
} from '../services/storage';
import { isSupabaseConfigured, supabase } from '../services/supabase';
import { SupabaseDb, type WorkspaceMemberInfo } from '../services/supabaseDb';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'celebrate';
}

interface AppContextType {
  signOut: () => Promise<void>;
  loadingData: boolean;
  refreshData: () => Promise<void>;

  // Navigation & Shell
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  quickCreateOpen: boolean;
  setQuickCreateOpen: (open: boolean) => void;
  quickCreateDefaultType: 'task' | 'personal_goal' | 'group_goal' | 'note';
  openQuickCreate: (type?: 'task' | 'personal_goal' | 'group_goal' | 'note') => void;

  // Selected details modal
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  selectedGoalId: string | null;
  setSelectedGoalId: (id: string | null) => void;
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;

  // Users & Workspaces
  users: User[];
  currentUser: User;
  setCurrentUser: (userId: string) => void;
  updateUserProfile: (name: string, avatar: string, title?: string, bio?: string) => Promise<void>;
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  setActiveWorkspace: (workspaceId: string) => void;
  workspaceMembers: WorkspaceMemberInfo[];
  createWorkspace: (name: string, description?: string) => Promise<string>;
  createInvitation: (hours?: number, uses?: number) => Promise<string>;
  joinWorkspace: (code: string) => Promise<boolean>;

  // Board Customization & Onboarding
  boardBackground: string;
  setBoardBackground: (bgId: string) => Promise<void>;
  onboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => Promise<void>;
  restartOnboarding: () => void;

  // Discord-style Team Member Panel & Profile Modal
  selectedMemberForProfile: User | null;
  setSelectedMemberForProfile: (member: User | null) => void;
  membersPanelOpen: boolean;
  setMembersPanelOpen: (open: boolean) => void;
  toggleMembersPanel: () => void;

  // Data
  goals: Goal[];
  tasks: Task[];
  notes: Note[];
  activities: ActivityEvent[];
  notifications: NotificationItem[];
  weeklyReviews: WeeklyReview[];

  // Mutators
  createGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => Goal;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  toggleMilestone: (goalId: string, milestoneId: string) => Promise<void>;

  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (id: string, newStatus?: TaskStatus) => Promise<void>;
  claimTask: (taskId: string) => Promise<void>;
  toggleChecklistItem: (taskId: string, itemId: string) => Promise<void>;

  createNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Note;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  createWeeklyReview: (review: Omit<WeeklyReview, 'id' | 'createdAt'>) => Promise<void>;

  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Feedback & Toasts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'celebrate') => void;
  dismissToast: (id: string) => void;
  triggerCelebration: () => void;

  // Derived selectors
  streakDays: number;
  blockersSummary: ReturnType<typeof getBlockersAndRisks>;
  getGoalProgress: (goal: Goal) => number;
  getGoalHealthState: (goal: Goal) => ReturnType<typeof calculateGoalHealth>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{
  children: React.ReactNode;
  initialUser: User;
  signOut: () => Promise<void>;
}> = ({ children, initialUser, signOut }) => {
  StorageService.setStorageUserId(initialUser.id);

  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState<boolean>(false);
  const [quickCreateDefaultType, setQuickCreateDefaultType] = useState<
    'task' | 'personal_goal' | 'group_goal' | 'note'
  >('task');

  // Modal inspection
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Core entities
  const [users, setUsers] = useState<User[]>([initialUser]);
  const [currentUserId, setCurrentUserIdState] = useState<string>(initialUser.id);
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => StorageService.getWorkspaces());
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string>(() =>
    StorageService.getActiveWorkspaceId()
  );
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMemberInfo[]>([]);

  const [goals, setGoals] = useState<Goal[]>(() => StorageService.getGoals());
  const [tasks, setTasks] = useState<Task[]>(() => StorageService.getTasks());
  const [notes, setNotes] = useState<Note[]>(() => StorageService.getNotes());
  const [activities, setActivities] = useState<ActivityEvent[]>(() =>
    StorageService.getActivities()
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    StorageService.getNotifications()
  );
  const [weeklyReviews, setWeeklyReviews] = useState<WeeklyReview[]>(() =>
    StorageService.getWeeklyReviews()
  );

  // Board Background & Onboarding states
  const [boardBackground, setBoardBackgroundState] = useState<string>(() => {
    return StorageService.getString('board_bg', 'default') || 'default';
  });

  const [onboardingCompleted, setOnboardingCompletedState] = useState<boolean>(() => {
    return Boolean(
      initialUser.onboardingCompleted ||
      StorageService.getBoolean('onboarding_done', false)
    );
  });

  // Discord-style Team Member Drawer & Selected Member for Profile
  const [selectedMemberForProfile, setSelectedMemberForProfile] = useState<User | null>(null);
  const [membersPanelOpen, setMembersPanelOpen] = useState<boolean>(false);

  const toggleMembersPanel = useCallback(() => {
    setMembersPanelOpen((prev) => !prev);
  }, []);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: 'success' | 'info' | 'warning' | 'celebrate' = 'info') => {
      const id = 'toast-' + Date.now() + Math.random().toString(36).substring(2, 6);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const triggerCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#1E3A2F', '#10B981', '#F59E0B', '#EADBC8'],
      });
    } catch {
      // Graceful fallback
    }
  }, []);

  // Sync to local fallback storage
  useEffect(() => {
    StorageService.saveUsers(users.filter((u) => u.id === initialUser.id));
  }, [users, initialUser.id]);

  useEffect(() => {
    StorageService.saveWorkspaces(workspaces);
  }, [workspaces]);

  useEffect(() => {
    StorageService.saveGoals(goals);
  }, [goals]);

  useEffect(() => {
    StorageService.saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    StorageService.saveNotes(notes);
  }, [notes]);

  useEffect(() => {
    StorageService.saveActivities(activities);
  }, [activities]);

  useEffect(() => {
    StorageService.saveNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    StorageService.saveWeeklyReviews(weeklyReviews);
  }, [weeklyReviews]);

  // Load cloud data from Supabase
  const loadCloudData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoadingData(false);
      return;
    }

    try {
      setLoadingData(true);

      // 1. Ensure user has a workspace
      await SupabaseDb.ensureUserWorkspace();

      // 2. Fetch workspaces
      const wsList = await SupabaseDb.fetchWorkspaces();
      if (wsList.length > 0) {
        setWorkspaces(wsList);
        const currentActive = activeWorkspaceId && wsList.some((w) => w.id === activeWorkspaceId)
          ? activeWorkspaceId
          : wsList[0].id;
        setActiveWorkspaceIdState(currentActive);
        StorageService.setActiveWorkspaceId(currentActive);

        // 3. Fetch workspace members
        const members = await SupabaseDb.fetchWorkspaceMembers(currentActive);
        setWorkspaceMembers(members);

        const memberProfiles = members.map((m) => m.profile).filter((p): p is User => Boolean(p));
        if (!memberProfiles.some((p) => p.id === initialUser.id)) {
          memberProfiles.unshift(initialUser);
        }
        setUsers(memberProfiles);

        // 4. Fetch Goals, Tasks, Notes, Activities, Weekly Reviews
        const [cloudGoals, cloudTasks, cloudNotes, cloudActs, cloudReviews] = await Promise.all([
          SupabaseDb.fetchGoals(currentActive, initialUser.id),
          SupabaseDb.fetchTasks(currentActive, initialUser.id),
          SupabaseDb.fetchNotes(currentActive, initialUser.id),
          SupabaseDb.fetchActivities(currentActive),
          SupabaseDb.fetchWeeklyReviews(currentActive),
        ]);

        setGoals(cloudGoals);
        setTasks(cloudTasks);
        setNotes(cloudNotes);
        setActivities(cloudActs);
        setWeeklyReviews(cloudReviews);
      }
    } catch (err) {
      console.error('[Momentum] Error loading cloud data:', err);
      showToast('Could not sync with Supabase cloud. Using cached data.', 'warning');
    } finally {
      setLoadingData(false);
    }
  }, [activeWorkspaceId, initialUser, showToast]);

  // Initial load
  useEffect(() => {
    loadCloudData();
  }, [loadCloudData]);

  // Realtime Subscriptions
  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !activeWorkspaceId) return;

    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
    }

    const channel = supabase
      .channel(`momentum-ws-${activeWorkspaceId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'goals' },
        async () => {
          const freshGoals = await SupabaseDb.fetchGoals(activeWorkspaceId, initialUser.id);
          setGoals(freshGoals);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        async () => {
          const freshTasks = await SupabaseDb.fetchTasks(activeWorkspaceId, initialUser.id);
          setTasks(freshTasks);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes' },
        async () => {
          const freshNotes = await SupabaseDb.fetchNotes(activeWorkspaceId, initialUser.id);
          setNotes(freshNotes);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_events', filter: `workspace_id=eq.${activeWorkspaceId}` },
        async () => {
          const freshActs = await SupabaseDb.fetchActivities(activeWorkspaceId);
          setActivities(freshActs);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workspace_members', filter: `workspace_id=eq.${activeWorkspaceId}` },
        async () => {
          const freshMembers = await SupabaseDb.fetchWorkspaceMembers(activeWorkspaceId);
          setWorkspaceMembers(freshMembers);
          const memberProfiles = freshMembers
            .map((m) => m.profile)
            .filter((p): p is User => Boolean(p));
          if (!memberProfiles.some((p) => p.id === initialUser.id)) {
            memberProfiles.unshift(initialUser);
          }
          setUsers(memberProfiles);
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeWorkspaceId, initialUser]);

  // Keyboard shortcut for Cmd/Ctrl+K search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Current User & Workspace resolvers
  const currentUser = useMemo(() => {
    return users.find((u) => u.id === currentUserId) || initialUser;
  }, [users, currentUserId, initialUser]);

  const activeWorkspace = useMemo(() => {
    return (
      workspaces.find((w) => w.id === activeWorkspaceId) ||
      workspaces[0] || {
        id: `personal-${currentUserId}`,
        name: 'Personal Space',
        slug: 'personal',
        description: 'Your private productivity space',
        icon: 'Sparkles',
        color: '#1E3A2F',
        members: [currentUserId],
      }
    );
  }, [workspaces, activeWorkspaceId, currentUserId]);

  const setCurrentUser = useCallback((userId: string) => {
    setCurrentUserIdState(userId);
    StorageService.setCurrentUserId(userId);
  }, []);

  const updateUserProfile = useCallback(
    async (name: string, avatar: string, title?: string, bio?: string) => {
      const cleanName = name.trim() || 'Momentum Member';
      const cleanAvatar = avatar.trim() || 'lion';
      const cleanTitle = title?.trim() || currentUser.title || 'Contributor';
      const cleanBio = bio !== undefined ? bio.trim() : currentUser.bio || '';

      const updatedUser: User = {
        ...currentUser,
        name: cleanName,
        avatar: cleanAvatar,
        title: cleanTitle,
        bio: cleanBio,
      };

      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
      StorageService.saveUsers([updatedUser]);

      if (isSupabaseConfigured) {
        try {
          await SupabaseDb.updateProfile(currentUser.id, {
            name: cleanName,
            avatar: cleanAvatar,
            title: cleanTitle,
            bio: cleanBio,
          });
          await supabase.auth.updateUser({
            data: { full_name: cleanName, avatar_url: cleanAvatar },
          });
          showToast('Profile and animal avatar updated!', 'success');
        } catch (err) {
          console.error('[Supabase] Error updating profile:', err);
          showToast('Updated locally, but cloud sync failed.', 'warning');
        }
      } else {
        showToast('Profile and animal avatar updated!', 'success');
      }
    },
    [currentUser, showToast]
  );

  const setBoardBackground = useCallback(
    async (bgId: string) => {
      setBoardBackgroundState(bgId);
      StorageService.setString('board_bg', bgId);
      if (isSupabaseConfigured && activeWorkspace.id) {
        await SupabaseDb.updateWorkspaceBoard(activeWorkspace.id, bgId);
      }
      showToast('Board background updated!', 'success');
    },
    [activeWorkspace.id, showToast]
  );

  const setOnboardingCompleted = useCallback(
    async (completed: boolean) => {
      setOnboardingCompletedState(completed);
      StorageService.setBoolean('onboarding_done', completed);
      if (isSupabaseConfigured && currentUser.id) {
        await SupabaseDb.updateOnboardingStatus(currentUser.id, completed);
      }
    },
    [currentUser.id]
  );

  const restartOnboarding = useCallback(() => {
    setOnboardingCompletedState(false);
    StorageService.setBoolean('onboarding_done', false);
    showToast('Restarting guided tour…', 'info');
  }, [showToast]);

  const setActiveWorkspace = useCallback((workspaceId: string) => {
    setActiveWorkspaceIdState(workspaceId);
    StorageService.setActiveWorkspaceId(workspaceId);
  }, []);

  const openQuickCreate = useCallback(
    (type: 'task' | 'personal_goal' | 'group_goal' | 'note' = 'task') => {
      setQuickCreateDefaultType(type);
      setQuickCreateOpen(true);
    },
    []
  );

  // WORKSPACE MUTATORS
  const createWorkspace = useCallback(
    async (name: string, description = ''): Promise<string> => {
      if (isSupabaseConfigured) {
        try {
          const newWsId = await SupabaseDb.createWorkspace(name, description);
          await loadCloudData();
          setActiveWorkspaceIdState(newWsId);
          showToast(`Workspace "${name}" created!`, 'success');
          return newWsId;
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed to create workspace';
          showToast(msg, 'warning');
          throw err;
        }
      } else {
        const id = 'ws-' + Date.now();
        const newWs: Workspace = {
          id,
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          description,
          icon: 'Sparkles',
          color: '#1E3A2F',
          members: [currentUser.id],
        };
        setWorkspaces((prev) => [...prev, newWs]);
        setActiveWorkspaceIdState(id);
        showToast(`Workspace "${name}" created (local mode)`, 'success');
        return id;
      }
    },
    [currentUser.id, loadCloudData, showToast]
  );

  const createInvitation = useCallback(
    async (hours = 72, uses = 10): Promise<string> => {
      if (!isSupabaseConfigured) {
        return 'DEMO-INVITE-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      }
      return await SupabaseDb.createInvitation(activeWorkspace.id, hours, uses);
    },
    [activeWorkspace.id]
  );

  const joinWorkspace = useCallback(
    async (code: string): Promise<boolean> => {
      if (!code.trim()) {
        showToast('Please enter an invitation code', 'warning');
        return false;
      }
      if (isSupabaseConfigured) {
        try {
          const joinedWsId = await SupabaseDb.joinWorkspace(code);
          await loadCloudData();
          setActiveWorkspaceIdState(joinedWsId);
          showToast('Successfully joined workspace!', 'celebrate');
          triggerCelebration();
          return true;
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Invalid or expired invitation code';
          showToast(msg, 'warning');
          return false;
        }
      } else {
        showToast('Connect Supabase to join shared team workspaces', 'info');
        return false;
      }
    },
    [loadCloudData, showToast, triggerCelebration]
  );

  // Log activity helper
  const recordActivity = useCallback(
    async (
      type: ActivityEvent['type'],
      description: string,
      entityId?: string,
      entityType?: ActivityEvent['entityType']
    ) => {
      const newActivity: ActivityEvent = {
        id: 'act-' + Date.now(),
        workspaceId: activeWorkspace.id,
        userId: currentUserId,
        type,
        description,
        timestamp: new Date().toISOString(),
        entityId,
        entityType,
      };

      setActivities((prev) => [newActivity, ...prev]);

      if (isSupabaseConfigured) {
        try {
          await SupabaseDb.createActivity({
            workspaceId: activeWorkspace.id,
            userId: currentUserId,
            type,
            description,
            entityId,
            entityType,
          });
        } catch (err) {
          console.warn('[Activity] Failed to persist activity:', err);
        }
      }
    },
    [activeWorkspace.id, currentUserId]
  );

  // GOALS ACTIONS
  const createGoal = useCallback(
    (goalInput: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Goal => {
      const now = new Date().toISOString();
      const tempId = 'goal-' + Date.now();
      const localGoal: Goal = {
        ...goalInput,
        id: tempId,
        createdAt: now,
        updatedAt: now,
      };

      setGoals((prev) => [localGoal, ...prev]);
      recordActivity('goal_created', `created ${localGoal.type} goal "${localGoal.title}"`, localGoal.id, 'goal');
      showToast(`Goal "${localGoal.title}" created`, 'success');

      if (isSupabaseConfigured) {
        SupabaseDb.createGoal(goalInput)
          .then((created) => {
            setGoals((prev) => prev.map((g) => (g.id === tempId ? created : g)));
          })
          .catch((err) => {
            console.error('[Supabase] createGoal failed:', err);
            showToast('Saved locally; cloud sync failed', 'warning');
          });
      }

      return localGoal;
    },
    [recordActivity, showToast]
  );

  const updateGoal = useCallback(
    async (id: string, updates: Partial<Goal>) => {
      setGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g))
      );

      if (isSupabaseConfigured) {
        try {
          await SupabaseDb.updateGoal(id, updates);
        } catch (err) {
          console.error('[Supabase] updateGoal failed:', err);
          showToast('Could not update goal in cloud', 'warning');
        }
      }
    },
    [showToast]
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      const goalToDelete = goals.find((g) => g.id === id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      if (goalToDelete) {
        showToast(`Goal "${goalToDelete.title}" removed`, 'info');
      }

      if (isSupabaseConfigured) {
        try {
          await SupabaseDb.deleteGoal(id);
        } catch (err) {
          console.error('[Supabase] deleteGoal failed:', err);
          showToast('Could not delete goal from cloud', 'warning');
        }
      }
    },
    [goals, showToast]
  );

  const toggleMilestone = useCallback(
    async (goalId: string, milestoneId: string) => {
      const targetGoal = goals.find((g) => g.id === goalId);
      if (!targetGoal) return;

      const updatedMilestones = targetGoal.milestones.map((m) => {
        if (m.id === milestoneId) {
          const nextCompleted = !m.completed;
          return {
            ...m,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return m;
      });

      await updateGoal(goalId, { milestones: updatedMilestones });

      const toggled = updatedMilestones.find((m) => m.id === milestoneId);
      if (toggled?.completed) {
        triggerCelebration();
        recordActivity('milestone_reached', `completed milestone "${toggled.title}" in goal "${targetGoal.title}"`, goalId, 'milestone');
        showToast(`Milestone completed: ${toggled.title}`, 'celebrate');
      }
    },
    [goals, recordActivity, showToast, triggerCelebration, updateGoal]
  );

  // TASKS ACTIONS
  const createTask = useCallback(
    (taskInput: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task => {
      const now = new Date().toISOString();
      const tempId = 'task-' + Date.now();
      const localTask: Task = {
        ...taskInput,
        id: tempId,
        createdAt: now,
        updatedAt: now,
      };

      setTasks((prev) => [localTask, ...prev]);
      recordActivity('task_created', `created task "${localTask.title}"`, localTask.id, 'task');
      showToast(`Task "${localTask.title}" created`, 'success');

      if (isSupabaseConfigured) {
        SupabaseDb.createTask(taskInput)
          .then((created) => {
            setTasks((prev) => prev.map((t) => (t.id === tempId ? created : t)));
          })
          .catch((err) => {
            console.error('[Supabase] createTask failed:', err);
            showToast('Saved locally; cloud sync failed', 'warning');
          });
      }

      return localTask;
    },
    [recordActivity, showToast]
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
      );

      if (isSupabaseConfigured) {
        try {
          await SupabaseDb.updateTask(id, updates);
        } catch (err) {
          console.error('[Supabase] updateTask failed:', err);
          showToast('Could not update task in cloud', 'warning');
        }
      }
    },
    [showToast]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const taskToDelete = tasks.find((t) => t.id === id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      if (taskToDelete) {
        showToast(`Task "${taskToDelete.title}" deleted`, 'info');
      }

      if (isSupabaseConfigured) {
        try {
          await SupabaseDb.deleteTask(id);
        } catch (err) {
          console.error('[Supabase] deleteTask failed:', err);
          showToast('Could not delete task from cloud', 'warning');
        }
      }
    },
    [tasks, showToast]
  );

  const toggleTaskStatus = useCallback(
    async (id: string, newStatus?: TaskStatus) => {
      const currentTask = tasks.find((t) => t.id === id);
      if (!currentTask) return;

      const targetStatus: TaskStatus =
        newStatus || (currentTask.status === 'done' ? 'todo' : 'done');

      await updateTask(id, { status: targetStatus });

      if (targetStatus === 'done') {
        triggerCelebration();
        recordActivity('task_completed', `finished task "${currentTask.title}"`, currentTask.id, 'task');
        showToast(`Done: "${currentTask.title}"`, 'celebrate');
      } else {
        recordActivity('task_status_changed', `moved task "${currentTask.title}" to ${targetStatus}`, currentTask.id, 'task');
      }
    },
    [recordActivity, showToast, tasks, triggerCelebration, updateTask]
  );

  const claimTask = useCallback(
    async (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      await updateTask(taskId, { assigneeId: currentUser.id });
      recordActivity('task_claimed', `claimed task "${task.title}"`, task.id, 'task');
      showToast(`You claimed "${task.title}"`, 'success');
    },
    [currentUser.id, recordActivity, showToast, tasks, updateTask]
  );

  const toggleChecklistItem = useCallback(
    async (taskId: string, itemId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const updatedChecklist = task.checklist.map((item) => {
        if (item.id === itemId) {
          return { ...item, completed: !item.completed };
        }
        return item;
      });

      await updateTask(taskId, { checklist: updatedChecklist });
    },
    [tasks, updateTask]
  );

  // NOTES ACTIONS
  const createNote = useCallback(
    (noteInput: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note => {
      const now = new Date().toISOString();
      const tempId = 'note-' + Date.now();
      const localNote: Note = {
        ...noteInput,
        id: tempId,
        createdAt: now,
        updatedAt: now,
      };

      setNotes((prev) => [localNote, ...prev]);
      recordActivity('note_created', `created note "${localNote.title}"`, localNote.id, 'note');
      showToast(`Note "${localNote.title}" saved`, 'success');

      if (isSupabaseConfigured) {
        SupabaseDb.createNote(noteInput)
          .then((created) => {
            setNotes((prev) => prev.map((n) => (n.id === tempId ? created : n)));
          })
          .catch((err) => {
            console.error('[Supabase] createNote failed:', err);
            showToast('Saved locally; cloud sync failed', 'warning');
          });
      }

      return localNote;
    },
    [recordActivity, showToast]
  );

  const updateNote = useCallback(
    async (id: string, updates: Partial<Note>) => {
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n))
      );

      if (isSupabaseConfigured) {
        try {
          await SupabaseDb.updateNote(id, updates);
        } catch (err) {
          console.error('[Supabase] updateNote failed:', err);
          showToast('Could not update note in cloud', 'warning');
        }
      }
    },
    [showToast]
  );

  const deleteNote = useCallback(
    async (id: string) => {
      const noteToDelete = notes.find((n) => n.id === id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (noteToDelete) {
        showToast(`Note "${noteToDelete.title}" deleted`, 'info');
      }

      if (isSupabaseConfigured) {
        try {
          await SupabaseDb.deleteNote(id);
        } catch (err) {
          console.error('[Supabase] deleteNote failed:', err);
          showToast('Could not delete note from cloud', 'warning');
        }
      }
    },
    [notes, showToast]
  );

  // WEEKLY REVIEW ACTION
  const createWeeklyReview = useCallback(
    async (reviewInput: Omit<WeeklyReview, 'id' | 'createdAt'>) => {
      const now = new Date().toISOString();
      const localReview: WeeklyReview = {
        ...reviewInput,
        id: 'review-' + Date.now(),
        createdAt: now,
      };

      setWeeklyReviews((prev) => [localReview, ...prev]);
      triggerCelebration();
      showToast('Weekly reset submitted! Great work this week.', 'celebrate');

      if (isSupabaseConfigured) {
        try {
          await SupabaseDb.createWeeklyReview(reviewInput);
        } catch (err) {
          console.error('[Supabase] createWeeklyReview failed:', err);
        }
      }
    },
    [showToast, triggerCelebration]
  );

  // NOTIFICATIONS
  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'info');
  }, [showToast]);

  // DERIVED METRICS
  const streakDays = useMemo(() => {
    return calculateUserStreak(activities, currentUser.id);
  }, [activities, currentUser.id]);

  const blockersSummary = useMemo(() => {
    return getBlockersAndRisks(tasks, goals, activeWorkspace.id);
  }, [tasks, goals, activeWorkspace.id]);

  const getGoalProgress = useCallback(
    (goal: Goal) => {
      return calculateGoalProgress(goal, tasks);
    },
    [tasks]
  );

  const getGoalHealthState = useCallback(
    (goal: Goal) => {
      return calculateGoalHealth(goal, tasks);
    },
    [tasks]
  );

  return (
    <AppContext.Provider
      value={{
        signOut,
        loadingData,
        refreshData: loadCloudData,
        activeTab,
        setActiveTab,
        sidebarOpen,
        setSidebarOpen,
        searchOpen,
        setSearchOpen,
        quickCreateOpen,
        setQuickCreateOpen,
        quickCreateDefaultType,
        openQuickCreate,
        selectedTaskId,
        setSelectedTaskId,
        selectedGoalId,
        setSelectedGoalId,
        selectedNoteId,
        setSelectedNoteId,
        users,
        currentUser,
        setCurrentUser,
        updateUserProfile,
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        workspaceMembers,
        createWorkspace,
        createInvitation,
        joinWorkspace,
        boardBackground,
        setBoardBackground,
        onboardingCompleted,
        setOnboardingCompleted,
        restartOnboarding,
        selectedMemberForProfile,
        setSelectedMemberForProfile,
        membersPanelOpen,
        setMembersPanelOpen,
        toggleMembersPanel,
        goals,
        tasks,
        notes,
        activities,
        notifications,
        weeklyReviews,
        createGoal,
        updateGoal,
        deleteGoal,
        toggleMilestone,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        claimTask,
        toggleChecklistItem,
        createNote,
        updateNote,
        deleteNote,
        createWeeklyReview,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        toasts,
        showToast,
        dismissToast,
        triggerCelebration,
        streakDays,
        blockersSummary,
        getGoalProgress,
        getGoalHealthState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
