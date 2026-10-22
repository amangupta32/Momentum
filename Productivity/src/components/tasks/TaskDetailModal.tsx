import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Calendar,
  User,
  Plus,
  CheckCircle2,
  Circle,
  FolderOpen,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Priority, TaskStatus } from '../../types';

export const TaskDetailModal: React.FC = () => {
  const {
    selectedTaskId,
    setSelectedTaskId,
    tasks,
    updateTask,
    deleteTask,
    toggleChecklistItem,
    claimTask,
    currentUser,
    users,
    goals,
    activeWorkspace,
    setSelectedGoalId,
  } = useApp();

  const task = tasks.find((t) => t.id === selectedTaskId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<Priority>('medium');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [linkedGoalId, setLinkedGoalId] = useState<string>('');
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setAssigneeId(task.assigneeId || '');
      setDueDate(task.dueDate || '');
      setLinkedGoalId(task.linkedGoalId || '');
      setIsPrivate(Boolean(task.isPrivate));
      setNewChecklistTitle('');
    }
  }, [task]);

  if (!selectedTaskId || !task) return null;

  const linkedGoal = goals.find((g) => g.id === task.linkedGoalId);

  const handleSave = () => {
    updateTask(task.id, {
      title: title.trim() || task.title,
      description: description.trim(),
      status,
      priority,
      assigneeId: assigneeId || null,
      dueDate,
      linkedGoalId: linkedGoalId || null,
      isPrivate,
    });
    setSelectedTaskId(null);
  };

  const handleDelete = () => {
    if (confirm(`Delete task "${task.title}"?`)) {
      deleteTask(task.id);
      setSelectedTaskId(null);
    }
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;

    const newItem = {
      id: 'chk-' + Date.now(),
      title: newChecklistTitle.trim(),
      completed: false,
    };

    updateTask(task.id, {
      checklist: [...task.checklist, newItem],
    });
    setNewChecklistTitle('');
  };

  const handleRemoveChecklistItem = (itemId: string) => {
    updateTask(task.id, {
      checklist: task.checklist.filter((c) => c.id !== itemId),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/35 backdrop-blur-xs transition-opacity"
        onClick={() => setSelectedTaskId(null)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E8E4DA] overflow-hidden z-10 animate-scale-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#E8E4DA] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-[#8E9892]">
              {task.id}
            </span>
            {task.assigneeId ? (
              <span className="text-xs text-[#5C6560] bg-white px-2 py-0.5 rounded-md border border-[#E8E4DA]">
                Assigned
              </span>
            ) : (
              <button
                onClick={() => claimTask(task.id)}
                className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1 hover:bg-emerald-100 transition-colors"
              >
                <UserCheck size={12} />
                <span>Claim Task</span>
              </button>
            )}
          </div>

          <button
            onClick={() => setSelectedTaskId(null)}
            className="text-[#8E9892] hover:text-[#1C221F] p-1 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Title Input */}
          <div>
            <label className="block text-[11px] font-semibold text-[#8E9892] uppercase tracking-wider mb-1">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-base font-bold text-[#1C221F] font-display border-b border-[#E8E4DA] focus:border-[#1E3A2F] py-1 outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-[#8E9892] uppercase tracking-wider mb-1">
              Description & Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add context, references, or checklist items..."
              className="w-full p-2.5 text-xs rounded-xl border border-[#E8E4DA] focus:border-[#1E3A2F] outline-none"
            />
          </div>

          {/* Task Visibility Scope */}
          <div>
            <label className="block text-[11px] font-semibold text-[#8E9892] uppercase tracking-wider mb-1">
              Task Visibility & Scope
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#FAF8F5] p-1 rounded-xl border border-[#E8E4DA]">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  !isPrivate
                    ? 'bg-[#1E3A2F] text-white shadow-2xs'
                    : 'text-[#5C6560] hover:text-[#1C221F]'
                }`}
              >
                Team Task (Shared)
              </button>
              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  isPrivate
                    ? 'bg-[#1E3A2F] text-white shadow-2xs'
                    : 'text-[#5C6560] hover:text-[#1C221F]'
                }`}
              >
                Personal Task (Private)
              </button>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-2 gap-3 bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E8E4DA]">
            <div>
              <label className="block text-[10px] font-semibold text-[#8E9892] uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full text-xs font-medium bg-white p-2 rounded-lg border border-[#E8E4DA] outline-none"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#8E9892] uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full text-xs font-medium bg-white p-2 rounded-lg border border-[#E8E4DA] outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#8E9892] uppercase tracking-wider mb-1">
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full text-xs font-medium bg-white p-2 rounded-lg border border-[#E8E4DA] outline-none"
              >
                <option value="">(Unassigned)</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#8E9892] uppercase tracking-wider mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs font-medium bg-white p-2 rounded-lg border border-[#E8E4DA] outline-none"
              />
            </div>
          </div>

          {/* Linked Goal */}
          <div>
            <label className="block text-[11px] font-semibold text-[#8E9892] uppercase tracking-wider mb-1">
              Linked Goal (Contributes to progress)
            </label>
            <select
              value={linkedGoalId}
              onChange={(e) => setLinkedGoalId(e.target.value)}
              className="w-full text-xs font-medium bg-white p-2.5 rounded-xl border border-[#E8E4DA] focus:border-[#1E3A2F] outline-none"
            >
              <option value="">(None - Independent task)</option>
              {goals
                .filter((g) => g.workspaceId === activeWorkspace.id)
                .map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title} ({g.category})
                  </option>
                ))}
            </select>
            {linkedGoal && (
              <div className="mt-2 flex items-center justify-between text-xs text-[#5C6560] bg-[#FAF8F5] p-2 rounded-lg border border-[#E8E4DA]">
                <div className="flex items-center gap-1.5 truncate">
                  <FolderOpen size={13} className="text-[#1E3A2F]" />
                  <span className="truncate">Linked: {linkedGoal.title}</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedTaskId(null);
                    setSelectedGoalId(linkedGoal.id);
                  }}
                  className="text-[11px] font-semibold text-[#1E3A2F] hover:underline shrink-0"
                >
                  View Goal
                </button>
              </div>
            )}
          </div>

          {/* Checklist / Subtasks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-[#8E9892] uppercase tracking-wider">
                Checklist Items ({task.checklist.filter((c) => c.completed).length}/
                {task.checklist.length})
              </label>
            </div>

            <div className="space-y-1.5">
              {task.checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-lg border border-[#E8E4DA] hover:bg-[#FAF8F5] text-xs transition-colors group"
                >
                  <button
                    onClick={() => toggleChecklistItem(task.id, item.id)}
                    className="flex items-center gap-2 min-w-0 flex-1 text-left"
                  >
                    {item.completed ? (
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    ) : (
                      <Circle size={15} className="text-[#B8B0A0] shrink-0" />
                    )}
                    <span
                      className={`truncate ${
                        item.completed ? 'line-through text-[#8E9892]' : 'text-[#1C221F]'
                      }`}
                    >
                      {item.title}
                    </span>
                  </button>
                  <button
                    onClick={() => handleRemoveChecklistItem(item.id)}
                    className="text-[#8E9892] hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Checklist Form */}
            <form onSubmit={handleAddChecklistItem} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add subtask or acceptance item..."
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[#E8E4DA] focus:border-[#1E3A2F] outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1E3A2F] rounded-lg shadow-2xs"
              >
                Add
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E8E4DA] bg-[#FAF8F5] flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium transition-colors"
          >
            <Trash2 size={13} />
            <span>Delete Task</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedTaskId(null)}
              className="px-3 py-1.5 text-xs font-medium text-[#5C6560] hover:text-[#1C221F]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1E3A2F] hover:bg-[#162A22] rounded-xl shadow-xs transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
