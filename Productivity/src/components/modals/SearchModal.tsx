import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  X,
  Target,
  CheckSquare,
  FileText,
  User,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SearchModal: React.FC = () => {
  const {
    searchOpen,
    setSearchOpen,
    goals,
    tasks,
    notes,
    users,
    activeWorkspace,
    setSelectedGoalId,
    setSelectedTaskId,
    setSelectedNoteId,
    setActiveTab,
  } = useApp();

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (searchOpen) {
      setQuery('');
    }
  }, [searchOpen]);

  // Filter items across active workspace
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { goals: [], tasks: [], notes: [], members: [] };

    const matchedGoals = goals
      .filter(
        (g) =>
          g.workspaceId === activeWorkspace.id &&
          (g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q))
      )
      .slice(0, 4);

    const matchedTasks = tasks
      .filter(
        (t) =>
          t.workspaceId === activeWorkspace.id &&
          (t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.labels.some((l) => l.toLowerCase().includes(q)))
      )
      .slice(0, 5);

    const matchedNotes = notes
      .filter(
        (n) =>
          n.workspaceId === activeWorkspace.id &&
          (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
      )
      .slice(0, 3);

    const matchedMembers = users
      .filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q) ||
          u.title.toLowerCase().includes(q)
      )
      .slice(0, 3);

    return {
      goals: matchedGoals,
      tasks: matchedTasks,
      notes: matchedNotes,
      members: matchedMembers,
    };
  }, [query, goals, tasks, notes, users, activeWorkspace.id]);

  if (!searchOpen) return null;

  const totalResults =
    results.goals.length +
    results.tasks.length +
    results.notes.length +
    results.members.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/35 backdrop-blur-xs transition-opacity"
        onClick={() => setSearchOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E8E4DA] overflow-hidden z-10 animate-scale-in">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-[#E8E4DA] flex items-center gap-3 bg-[#FAF8F5]">
          <Search size={18} className="text-[#737C76] shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search goals, tasks, documents, or team members..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#1C221F] placeholder-[#8E9892] focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="text-[#8E9892] hover:text-[#1C221F] p-1"
            >
              <X size={16} />
            </button>
          ) : (
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-[#8E9892] bg-white border border-[#E8E4DA] rounded">
              ESC
            </kbd>
          )}
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-[#F2EFE9]">
          {query.trim() === '' ? (
            <div className="py-10 text-center text-xs text-[#8E9892]">
              Type a keyword to search across {activeWorkspace.name}...
            </div>
          ) : totalResults === 0 ? (
            <div className="py-10 text-center text-xs text-[#8E9892]">
              No matching items found for <span className="font-semibold text-[#1C221F]">"{query}"</span>
            </div>
          ) : (
            <>
              {/* Tasks Results */}
              {results.tasks.length > 0 && (
                <div className="py-2">
                  <div className="text-[11px] font-semibold text-[#8E9892] uppercase tracking-wider px-3 py-1 flex items-center gap-1.5">
                    <CheckSquare size={13} />
                    Tasks ({results.tasks.length})
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.tasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => {
                          setSelectedTaskId(task.id);
                          setSearchOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF8F5] text-left text-xs transition-colors group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-[#1C221F] truncate group-hover:text-[#1E3A2F]">
                            {task.title}
                          </div>
                          <div className="text-[11px] text-[#737C76] flex items-center gap-2 mt-0.5">
                            <span className="capitalize">{task.status.replace('_', ' ')}</span>
                            <span>•</span>
                            <span className="capitalize">{task.priority} priority</span>
                          </div>
                        </div>
                        <ArrowRight
                          size={14}
                          className="text-[#B8B0A0] group-hover:text-[#1E3A2F] group-hover:translate-x-0.5 transition-all shrink-0 ml-2"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Goals Results */}
              {results.goals.length > 0 && (
                <div className="py-2">
                  <div className="text-[11px] font-semibold text-[#8E9892] uppercase tracking-wider px-3 py-1 flex items-center gap-1.5">
                    <Target size={13} />
                    Goals ({results.goals.length})
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.goals.map((goal) => (
                      <button
                        key={goal.id}
                        onClick={() => {
                          setSelectedGoalId(goal.id);
                          setSearchOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF8F5] text-left text-xs transition-colors group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-[#1C221F] truncate group-hover:text-[#1E3A2F]">
                            {goal.title}
                          </div>
                          <div className="text-[11px] text-[#737C76] flex items-center gap-2 mt-0.5">
                            <span>{goal.category}</span>
                            <span>•</span>
                            <span>{goal.milestones.length} milestones</span>
                          </div>
                        </div>
                        <ArrowRight
                          size={14}
                          className="text-[#B8B0A0] group-hover:text-[#1E3A2F] group-hover:translate-x-0.5 transition-all shrink-0 ml-2"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes Results */}
              {results.notes.length > 0 && (
                <div className="py-2">
                  <div className="text-[11px] font-semibold text-[#8E9892] uppercase tracking-wider px-3 py-1 flex items-center gap-1.5">
                    <FileText size={13} />
                    Notes & Docs ({results.notes.length})
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.notes.map((note) => (
                      <button
                        key={note.id}
                        onClick={() => {
                          setSelectedNoteId(note.id);
                          setActiveTab('notes');
                          setSearchOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF8F5] text-left text-xs transition-colors group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-[#1C221F] truncate group-hover:text-[#1E3A2F]">
                            {note.title}
                          </div>
                          <div className="text-[11px] text-[#737C76] line-clamp-1 mt-0.5">
                            {note.content.substring(0, 60)}...
                          </div>
                        </div>
                        <ArrowRight
                          size={14}
                          className="text-[#B8B0A0] group-hover:text-[#1E3A2F] group-hover:translate-x-0.5 transition-all shrink-0 ml-2"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Team Members */}
              {results.members.length > 0 && (
                <div className="py-2">
                  <div className="text-[11px] font-semibold text-[#8E9892] uppercase tracking-wider px-3 py-1 flex items-center gap-1.5">
                    <User size={13} />
                    Team Members ({results.members.length})
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.members.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => {
                          setActiveTab('team');
                          setSearchOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF8F5] text-left text-xs transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-medium text-[#1C221F] truncate">
                              {member.name}
                            </div>
                            <div className="text-[11px] text-[#737C76]">{member.title}</div>
                          </div>
                        </div>
                        <ArrowRight
                          size={14}
                          className="text-[#B8B0A0] group-hover:text-[#1E3A2F] shrink-0"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="p-2.5 bg-[#FAF8F5] border-t border-[#E8E4DA] text-[11px] text-[#8E9892] flex items-center justify-between">
          <span>Search with instant local indexing</span>
          <span>Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
