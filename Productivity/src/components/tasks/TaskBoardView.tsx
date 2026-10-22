import React, { useState } from 'react';
import {
  Kanban,
  List,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Clock,
  CheckSquare,
  UserCheck,
  FolderOpen,
  ChevronDown,
  Palette,
  Lock,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Task, TaskStatus, Priority } from '../../types';
import { AnimalAvatar } from '../avatars/AnimalAvatar';
import { BoardBackgroundPicker, getBoardTheme } from './BoardBackgroundPicker';

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'backlog', title: 'Backlog', color: 'bg-stone-400' },
  { id: 'todo', title: 'To Do', color: 'bg-blue-500' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-amber-500' },
  { id: 'in_review', title: 'In Review', color: 'bg-purple-500' },
  { id: 'done', title: 'Done', color: 'bg-emerald-500' },
];

export const TaskBoardView: React.FC = () => {
  const {
    tasks,
    goals,
    users,
    currentUser,
    activeWorkspace,
    openQuickCreate,
    setSelectedTaskId,
    toggleTaskStatus,
    claimTask,
    boardBackground,
    setBoardBackground,
  } = useApp();

  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'team' | 'personal'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [goalFilter, setGoalFilter] = useState<string>('all');
  const [backgroundPickerOpen, setBackgroundPickerOpen] = useState(false);

  const currentTheme = getBoardTheme(boardBackground);

  // Filter tasks in current workspace or user scope
  const workspaceTasks = tasks.filter((t) => {
    if (t.workspaceId === activeWorkspace.id) return true;
    if (t.creatorId === currentUser.id && t.isPrivate) return true;
    return false;
  });

  const filteredTasks = workspaceTasks.filter((t) => {
    // Scope filter (Team vs Personal)
    if (scopeFilter === 'team' && t.isPrivate) return false;
    if (scopeFilter === 'personal' && !t.isPrivate) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.labels.some((l) => l.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (assigneeFilter !== 'all') {
      if (assigneeFilter === 'unassigned') {
        if (t.assigneeId) return false;
      } else if (t.assigneeId !== assigneeFilter) {
        return false;
      }
    }
    if (goalFilter !== 'all' && t.linkedGoalId !== goalFilter) return false;

    return true;
  });

  const getPriorityStyle = (p: Priority) => {
    switch (p) {
      case 'urgent':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'high':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-[#F2EFE9] text-[#737C76] border-transparent';
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 space-y-5 transition-colors duration-300"
      style={currentTheme.boardStyle}
    >
      {/* Top Header & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E8E4DA]/80 bg-white/60 backdrop-blur-md p-4 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#737C76]">
            <span>Task Management</span>
            <span>•</span>
            <span className="text-[#1E3A2F] font-bold">{activeWorkspace.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1C221F] font-display mt-0.5">
            Workflow Task Board
          </h1>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Trello-Style Background Customization Button */}
          <button
            id="onboarding-customize-board"
            onClick={() => setBackgroundPickerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E4DA] bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-[#1C221F] transition-all shadow-2xs cursor-pointer"
            title="Customize Board Background (Trello style)"
          >
            <Palette size={14} className="text-[#1E3A2F]" />
            <span className="hidden sm:inline">Theme</span>
          </button>

          {/* Board vs List Toggle */}
          <div className="bg-[#EAE6DC]/80 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'board'
                  ? 'bg-white text-[#1E3A2F] shadow-xs font-semibold'
                  : 'text-[#5C6560] hover:text-[#1C221F]'
              }`}
            >
              <Kanban size={14} />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-[#1E3A2F] shadow-xs font-semibold'
                  : 'text-[#5C6560] hover:text-[#1C221F]'
              }`}
            >
              <List size={14} />
              <span>List</span>
            </button>
          </div>

          {/* Add Task Button with Onboarding ID */}
          <button
            id="onboarding-create-task"
            onClick={() => openQuickCreate('task')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1E3A2F] hover:bg-[#162A22] text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus size={15} />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-[#E8E4DA] shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <Search size={15} className="text-[#8E9892]" />
          <input
            type="text"
            placeholder="Search tasks, descriptions, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs text-[#1C221F] placeholder-[#8E9892] bg-transparent outline-none"
          />
        </div>

        {/* Scope Pill Toggle: All / Team Tasks / Personal Tasks */}
        <div className="bg-[#FAF8F5] p-1 rounded-xl border border-[#E8E4DA] flex items-center gap-1 text-xs">
          <button
            onClick={() => setScopeFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              scopeFilter === 'all'
                ? 'bg-[#1E3A2F] text-white shadow-2xs font-semibold'
                : 'text-[#5C6560] hover:text-[#1C221F]'
            }`}
          >
            All Tasks
          </button>
          <button
            onClick={() => setScopeFilter('team')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors ${
              scopeFilter === 'team'
                ? 'bg-[#1E3A2F] text-white shadow-2xs font-semibold'
                : 'text-[#5C6560] hover:text-[#1C221F]'
            }`}
          >
            <Users size={12} />
            <span>Team Tasks</span>
          </button>
          <button
            onClick={() => setScopeFilter('personal')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors ${
              scopeFilter === 'personal'
                ? 'bg-[#1E3A2F] text-white shadow-2xs font-semibold'
                : 'text-[#5C6560] hover:text-[#1C221F]'
            }`}
          >
            <Lock size={12} />
            <span>Personal Only</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-[#E8E4DA] bg-white text-xs text-[#5C6560] font-medium outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Assignee filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-[#E8E4DA] bg-white text-xs text-[#5C6560] font-medium outline-none"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} {u.id === currentUser.id ? '(You)' : ''}
              </option>
            ))}
          </select>

          {/* Goal filter */}
          {goals.length > 0 && (
            <select
              value={goalFilter}
              onChange={(e) => setGoalFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-[#E8E4DA] bg-white text-xs text-[#5C6560] font-medium outline-none max-w-[150px] truncate"
            >
              <option value="all">All Goals</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          )}

          {(searchQuery ||
            priorityFilter !== 'all' ||
            assigneeFilter !== 'all' ||
            goalFilter !== 'all' ||
            scopeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setScopeFilter('all');
                setPriorityFilter('all');
                setAssigneeFilter('all');
                setGoalFilter('all');
              }}
              className="text-xs text-[#1E3A2F] font-semibold hover:underline px-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-6">
          {COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                className="bg-white/85 backdrop-blur-md rounded-2xl border border-[#E8E4DA] p-3.5 flex flex-col min-h-[500px] shadow-sm"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DA] mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                    <h3 className="font-bold text-xs text-[#1C221F] uppercase tracking-wide">
                      {col.title}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-medium text-[#737C76] bg-white px-2 py-0.5 rounded-full border border-[#E8E4DA]">
                    {colTasks.length}
                  </span>
                </div>

                {/* Task Cards Column */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh]">
                  {colTasks.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#8E9892] border border-dashed border-[#E8E4DA] rounded-xl p-3">
                      No tasks in {col.title}
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const assignee = users.find((u) => u.id === task.assigneeId);
                      const linkedGoal = goals.find((g) => g.id === task.linkedGoalId);
                      const completedChecklist = task.checklist.filter((c) => c.completed).length;

                      return (
                        <div
                          key={task.id}
                          className="group relative bg-white rounded-xl border border-[#E8E4DA] hover:border-[#1E3A2F] hover:shadow-md p-3.5 space-y-2.5 transition-all text-xs"
                        >
                          {/* Privacy / Scope Tag */}
                          <div className="flex items-center justify-between text-[10px]">
                            {task.isPrivate ? (
                              <span className="flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-semibold">
                                <Lock size={10} />
                                <span>Private Task</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[#1E3A2F] bg-[#E7F0E8] border border-[#CDE0D0] px-1.5 py-0.2 rounded font-semibold">
                                <Users size={10} />
                                <span>Team Task</span>
                              </span>
                            )}
                            <span
                              className={`font-semibold uppercase px-1.5 py-0.2 rounded border text-[9px] ${getPriorityStyle(
                                task.priority
                              )}`}
                            >
                              {task.priority}
                            </span>
                          </div>

                          {/* Quick Complete & Title */}
                          <div className="flex items-start gap-2.5">
                            <button
                              onClick={() => toggleTaskStatus(task.id)}
                              className="mt-0.5 text-[#B8B0A0] hover:text-emerald-600 transition-colors shrink-0"
                              title="Toggle completion"
                            >
                              {task.status === 'done' ? (
                                <CheckCircle2 size={16} className="text-emerald-600" />
                              ) : (
                                <Circle size={16} />
                              )}
                            </button>

                            <div
                              onClick={() => setSelectedTaskId(task.id)}
                              className="cursor-pointer min-w-0 flex-1"
                            >
                              <h4
                                className={`font-semibold text-xs leading-snug group-hover:text-[#1E3A2F] ${
                                  task.status === 'done'
                                    ? 'line-through text-[#8E9892]'
                                    : 'text-[#1C221F]'
                                }`}
                              >
                                {task.title}
                              </h4>
                            </div>
                          </div>

                          {/* Linked Goal Pill */}
                          {linkedGoal && (
                            <div className="flex items-center gap-1 text-[10px] text-[#5C6560] bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#E8E4DA] truncate">
                              <FolderOpen size={10} className="text-[#1E3A2F] shrink-0" />
                              <span className="truncate">{linkedGoal.title}</span>
                            </div>
                          )}

                          {/* Labels */}
                          {task.labels.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {task.labels.map((lbl, idx) => (
                                <span
                                  key={idx}
                                  className="text-[9px] px-1.5 py-0.2 rounded bg-[#F2EFE9] text-[#5C6560] font-medium"
                                >
                                  {lbl}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Footer: Due Date, Subtask count, Assignee with AnimalAvatar */}
                          <div className="pt-2 border-t border-[#F2EFE9] flex items-center justify-between text-[11px] text-[#8E9892]">
                            <div className="flex items-center gap-2">
                              {task.checklist.length > 0 && (
                                <span className="flex items-center gap-0.5 text-[10px] text-[#5C6560]">
                                  <CheckSquare size={11} />
                                  <span>
                                    {completedChecklist}/{task.checklist.length}
                                  </span>
                                </span>
                              )}

                              {task.dueDate && (
                                <span className="text-[10px] flex items-center gap-0.5">
                                  <Clock size={10} />
                                  <span>{task.dueDate.split('-').slice(1).join('/')}</span>
                                </span>
                              )}
                            </div>

                            {/* Assignee Avatar with Animal Badge and Onboarding target */}
                            <div id="onboarding-assign-task" className="flex items-center gap-1">
                              {assignee ? (
                                <AnimalAvatar
                                  avatar={assignee.avatar}
                                  name={assignee.name}
                                  size={24}
                                  showBadge
                                  status="online"
                                />
                              ) : (
                                <button
                                  onClick={() => claimTask(task.id)}
                                  className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-0.5 cursor-pointer"
                                  title="Claim this unassigned task"
                                >
                                  <UserCheck size={10} />
                                  <span>Claim</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Quick Column Change Dropdown */}
                          <div className="pt-1 flex items-center justify-between text-[10px] text-[#8E9892]">
                            <span>Status:</span>
                            <select
                              value={task.status}
                              onChange={(e) =>
                                toggleTaskStatus(task.id, e.target.value as TaskStatus)
                              }
                              className="text-[10px] bg-[#FAF8F5] border border-[#E8E4DA] rounded px-1.5 py-0.5 text-[#5C6560] outline-none"
                            >
                              {COLUMNS.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.title}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick Add at Column Bottom */}
                <button
                  onClick={() => openQuickCreate('task')}
                  className="mt-3 w-full py-1.5 text-xs text-[#5C6560] hover:text-[#1C221F] hover:bg-white border border-transparent hover:border-[#E8E4DA] rounded-xl flex items-center justify-center gap-1 transition-all"
                >
                  <Plus size={13} />
                  <span>Add item</span>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#E8E4DA] shadow-xs overflow-hidden divide-y divide-[#F2EFE9]">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#8E9892]">
              No tasks match your current filters.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const assignee = users.find((u) => u.id === task.assigneeId);
              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className="p-3 sm:p-4 hover:bg-[#FAF8F5] flex items-center justify-between gap-3 transition-colors cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskStatus(task.id);
                      }}
                      className="text-[#B8B0A0] hover:text-emerald-600 shrink-0"
                    >
                      {task.status === 'done' ? (
                        <CheckCircle2 size={18} className="text-emerald-600" />
                      ) : (
                        <Circle size={18} />
                      )}
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold ${
                            task.status === 'done' ? 'line-through text-[#8E9892]' : 'text-[#1C221F]'
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.isPrivate && (
                          <span className="flex items-center gap-0.5 text-[9px] text-amber-700 bg-amber-50 px-1 rounded font-semibold border border-amber-200">
                            <Lock size={9} />
                            <span>Private</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#737C76] capitalize">
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${getPriorityStyle(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                    {assignee ? (
                      <AnimalAvatar
                        avatar={assignee.avatar}
                        name={assignee.name}
                        size={24}
                        showBadge
                        status="online"
                      />
                    ) : (
                      <span className="text-[10px] text-[#8E9892] italic">Unassigned</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Trello-Style Board Background Picker Modal */}
      {backgroundPickerOpen && (
        <BoardBackgroundPicker
          currentThemeId={boardBackground}
          onSelectTheme={(id) => {
            setBoardBackground(id);
          }}
          onClose={() => setBackgroundPickerOpen(false)}
        />
      )}
    </div>
  );
};
