import React, { useState, useEffect } from 'react';
import {
  X,
  CheckSquare,
  Target,
  Users,
  FileText,
  Plus,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Priority } from '../../types';

export const QuickCreateModal: React.FC = () => {
  const {
    quickCreateOpen,
    setQuickCreateOpen,
    quickCreateDefaultType,
    createTask,
    createGoal,
    createNote,
    activeWorkspace,
    currentUser,
    users,
    goals,
  } = useApp();

  const [activeType, setActiveType] = useState<
    'task' | 'personal_goal' | 'group_goal' | 'note'
  >('task');

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [taskAssignee, setTaskAssignee] = useState<string>('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskLinkedGoal, setTaskLinkedGoal] = useState<string>('');
  const [taskLabel, setTaskLabel] = useState('');

  // Goal form state
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalCategory, setGoalCategory] = useState<
    'Engineering' | 'Product' | 'Growth' | 'Learning' | 'Fitness' | 'Operations'
  >('Product');
  const [goalPriority, setGoalPriority] = useState<Priority>('high');
  const [goalDueDate, setGoalDueDate] = useState('');
  const [milestonesList, setMilestonesList] = useState<string[]>(['']);

  // Note form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTag, setNoteTag] = useState('');
  const [noteLinkedGoal, setNoteLinkedGoal] = useState<string>('');

  useEffect(() => {
    if (quickCreateOpen) {
      setActiveType(quickCreateDefaultType);
      // Reset forms
      setTaskTitle('');
      setTaskDesc('');
      setTaskPriority('medium');
      setTaskAssignee(currentUser.id);
      setTaskDueDate(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
      setTaskLinkedGoal('');
      setTaskLabel('');

      setGoalTitle('');
      setGoalDesc('');
      setGoalCategory('Product');
      setGoalPriority('high');
      setGoalDueDate(new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]);
      setMilestonesList(['Define core deliverables', '']);

      setNoteTitle('');
      setNoteContent('');
      setNoteTag('');
      setNoteLinkedGoal('');
    }
  }, [quickCreateOpen, quickCreateDefaultType, currentUser.id]);

  if (!quickCreateOpen) return null;

  // Milestone helpers
  const handleMilestoneChange = (index: number, val: string) => {
    const updated = [...milestonesList];
    updated[index] = val;
    setMilestonesList(updated);
  };

  const addMilestoneField = () => {
    setMilestonesList([...milestonesList, '']);
  };

  const removeMilestoneField = (index: number) => {
    setMilestonesList(milestonesList.filter((_, i) => i !== index));
  };

  // Submit Handlers
  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    createTask({
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      status: 'todo',
      priority: taskPriority,
      creatorId: currentUser.id,
      assigneeId: taskAssignee || null,
      workspaceId: activeWorkspace.id,
      linkedGoalId: taskLinkedGoal || null,
      dueDate: taskDueDate,
      labels: taskLabel
        ? taskLabel.split(',').map((l) => l.trim()).filter(Boolean)
        : ['Productivity'],
      checklist: [],
      isTodayFocus: false,
    });
    setQuickCreateOpen(false);
  };

  const handleSubmitGoal = (e: React.FormEvent, isGroup: boolean) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    const validMilestones = milestonesList
      .filter((m) => m.trim().length > 0)
      .map((title, idx) => ({
        id: 'm-' + Date.now() + '-' + idx,
        title: title.trim(),
        dueDate: goalDueDate,
        completed: false,
      }));

    createGoal({
      title: goalTitle.trim(),
      description: goalDesc.trim(),
      type: isGroup ? 'group' : 'personal',
      ownerId: currentUser.id,
      workspaceId: activeWorkspace.id,
      visibility: isGroup ? 'workspace' : 'private',
      category: goalCategory,
      priority: goalPriority,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: goalDueDate,
      milestones: validMilestones,
    });
    setQuickCreateOpen(false);
  };

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    createNote({
      title: noteTitle.trim(),
      content: noteContent.trim(),
      workspaceId: activeWorkspace.id,
      authorId: currentUser.id,
      linkedGoalId: noteLinkedGoal || null,
      tags: noteTag
        ? noteTag.split(',').map((t) => t.trim()).filter(Boolean)
        : ['General'],
    });
    setQuickCreateOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/35 backdrop-blur-xs transition-opacity"
        onClick={() => setQuickCreateOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E8E4DA] overflow-hidden z-10 animate-scale-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#E8E4DA] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#1C221F]">Quick Create</h3>
            <span className="text-[11px] text-[#8E9892]">
              in {activeWorkspace.name}
            </span>
          </div>
          <button
            onClick={() => setQuickCreateOpen(false)}
            className="text-[#8E9892] hover:text-[#1C221F] p-1 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Type Switcher Tabs */}
        <div className="flex border-b border-[#E8E4DA] bg-[#F7F5F0] p-1 gap-1">
          <button
            onClick={() => setActiveType('task')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
              activeType === 'task'
                ? 'bg-white text-[#1E3A2F] shadow-xs font-semibold'
                : 'text-[#5C6560] hover:text-[#1C221F]'
            }`}
          >
            <CheckSquare size={14} />
            <span>Task</span>
          </button>

          <button
            onClick={() => setActiveType('personal_goal')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
              activeType === 'personal_goal'
                ? 'bg-white text-[#1E3A2F] shadow-xs font-semibold'
                : 'text-[#5C6560] hover:text-[#1C221F]'
            }`}
          >
            <Target size={14} />
            <span>Personal Goal</span>
          </button>

          <button
            onClick={() => setActiveType('group_goal')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
              activeType === 'group_goal'
                ? 'bg-white text-[#1E3A2F] shadow-xs font-semibold'
                : 'text-[#5C6560] hover:text-[#1C221F]'
            }`}
          >
            <Users size={14} />
            <span>Group Goal</span>
          </button>

          <button
            onClick={() => setActiveType('note')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
              activeType === 'note'
                ? 'bg-white text-[#1E3A2F] shadow-xs font-semibold'
                : 'text-[#5C6560] hover:text-[#1C221F]'
            }`}
          >
            <FileText size={14} />
            <span>Document</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {/* TASK FORM */}
          {activeType === 'task' && (
            <form onSubmit={handleSubmitTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C221F] mb-1">
                  Task Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Conduct UX audit on mobile layout"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E4DA] focus:border-[#1E3A2F] focus:ring-1 focus:ring-[#1E3A2F] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C221F] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Add context, acceptance criteria, or relevant links..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E4DA] focus:border-[#1E3A2F] focus:ring-1 focus:ring-[#1E3A2F] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1C221F] mb-1">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E4DA] focus:border-[#1E3A2F] bg-white outline-none"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C221F] mb-1">
                    Assignee
                  </label>
                  <select
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E4DA] focus:border-[#1E3A2F] bg-white outline-none"
                  >
                    <option value="">(Unassigned - Open to claim)</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1C221F] mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E4DA] focus:border-[#1E3A2F] bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C221F] mb-1">
                    Link to Goal
                  </label>
                  <select
                    value={taskLinkedGoal}
                    onChange={(e) => setTaskLinkedGoal(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E4DA] focus:border-[#1E3A2F] bg-white outline-none"
                  >
                    <option value="">(No linked goal)</option>
                    {goals
                      .filter((g) => g.workspaceId === activeWorkspace.id)
                      .map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.title}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C221F] mb-1">
                  Labels (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Design, Frontend, Urgent"
                  value={taskLabel}
                  onChange={(e) => setTaskLabel(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E4DA] focus:border-[#1E3A2F] outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#E8E4DA] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuickCreateOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#5C6560] hover:text-[#1C221F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#1E3A2F] hover:bg-[#162A22] rounded-xl shadow-xs transition-colors"
                >
                  Create Task
                </button>
              </div>
            </form>
          )}

          {/* GOAL FORM (Personal or Group) */}
          {(activeType === 'personal_goal' || activeType === 'group_goal') && (
            <form
              onSubmit={(e) => handleSubmitGoal(e, activeType === 'group_goal')}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-[#1C221F] mb-1">
                  Goal Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    activeType === 'personal_goal'
                      ? 'e.g. Master System Design Principles'
                      : 'e.g. Complete SOC2 Type II Certification'
                  }
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E4DA] focus:border-[#1E3A2F] focus:ring-1 focus:ring-[#1E3A2F] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C221F] mb-1">
                  Target Objective & Scope
                </label>
                <textarea
                  rows={2}
                  placeholder="What does success look like? Detail the measurable outcome..."
                  value={goalDesc}
                  onChange={(e) => setGoalDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E4DA] focus:border-[#1E3A2F] focus:ring-1 focus:ring-[#1E3A2F] outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1C221F] mb-1">
                    Category
                  </label>
                  <select
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E4DA] focus:border-[#1E3A2F] bg-white outline-none"
                  >
                    <option value="Product">Product</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Growth">Growth</option>
                    <option value="Learning">Learning</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C221F] mb-1">
                    Priority
                  </label>
                  <select
                    value={goalPriority}
                    onChange={(e) => setGoalPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E4DA] focus:border-[#1E3A2F] bg-white outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C221F] mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={goalDueDate}
                    onChange={(e) => setGoalDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E4DA] focus:border-[#1E3A2F] bg-white outline-none"
                  />
                </div>
              </div>

              {/* Milestones list */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#1C221F]">
                    Measurable Milestones
                  </label>
                  <button
                    type="button"
                    onClick={addMilestoneField}
                    className="text-[11px] text-[#1E3A2F] font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Plus size={12} /> Add Milestone
                  </button>
                </div>
                <div className="space-y-2">
                  {milestonesList.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-[#8E9892] w-4 text-center">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        placeholder={`Milestone #${idx + 1}`}
                        value={m}
                        onChange={(e) => handleMilestoneChange(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[#E8E4DA] focus:border-[#1E3A2F] outline-none"
                      />
                      {milestonesList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMilestoneField(idx)}
                          className="text-[#8E9892] hover:text-rose-600 p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8E4DA] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuickCreateOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#5C6560] hover:text-[#1C221F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#1E3A2F] hover:bg-[#162A22] rounded-xl shadow-xs transition-colors"
                >
                  Create {activeType === 'group_goal' ? 'Group' : 'Personal'} Goal
                </button>
              </div>
            </form>
          )}

          {/* NOTE / DOCUMENT FORM */}
          {activeType === 'note' && (
            <form onSubmit={handleSubmitNote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C221F] mb-1">
                  Document Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly Engineering Sync Notes"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E4DA] focus:border-[#1E3A2F] focus:ring-1 focus:ring-[#1E3A2F] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1C221F] mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Architecture, Sync, Review"
                    value={noteTag}
                    onChange={(e) => setNoteTag(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E4DA] focus:border-[#1E3A2F] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C221F] mb-1">
                    Link to Goal
                  </label>
                  <select
                    value={noteLinkedGoal}
                    onChange={(e) => setNoteLinkedGoal(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E4DA] focus:border-[#1E3A2F] bg-white outline-none"
                  >
                    <option value="">(No linked goal)</option>
                    {goals
                      .filter((g) => g.workspaceId === activeWorkspace.id)
                      .map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.title}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C221F] mb-1">
                  Content (Markdown supported)
                </label>
                <textarea
                  rows={5}
                  placeholder="# Summary
Write meeting notes, architecture decisions, or reflection bullets..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E4DA] focus:border-[#1E3A2F] font-mono focus:ring-1 focus:ring-[#1E3A2F] outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#E8E4DA] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuickCreateOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#5C6560] hover:text-[#1C221F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#1E3A2F] hover:bg-[#162A22] rounded-xl shadow-xs transition-colors"
                >
                  Save Document
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
