import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Target,
  FileText,
  UserCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AnimalAvatar } from '../avatars/AnimalAvatar';

export const ActivityView: React.FC = () => {
  const { activities, users, activeWorkspace, setSelectedTaskId, setSelectedGoalId } = useApp();

  const [typeFilter, setTypeFilter] = useState<string>('all');

  const workspaceActivities = activities.filter(
    (a) => a.workspaceId === activeWorkspace.id
  );

  const filtered = workspaceActivities.filter((a) => {
    if (typeFilter === 'all') return true;
    return a.type === typeFilter;
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle2 size={16} className="text-emerald-600" />;
      case 'milestone_reached':
        return <Target size={16} className="text-amber-600" />;
      case 'task_claimed':
        return <UserCheck size={16} className="text-blue-600" />;
      case 'note_created':
        return <FileText size={16} className="text-purple-600" />;
      default:
        return <Activity size={16} className="text-[#1E3A2F]" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E4DA]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#737C76]">
            <Activity size={14} className="text-[#1E3A2F]" />
            <span>Audit Trail</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1C221F] font-display mt-0.5">
            Activity Feed
          </h1>
          <p className="text-xs text-[#5C6560] mt-1">
            Real-time feed of task completions, claimed blocker assignments, and milestones in {activeWorkspace.name}.
          </p>
        </div>

        {/* Filter select */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-[#E8E4DA] bg-white text-xs text-[#5C6560] font-medium outline-none"
        >
          <option value="all">All Events</option>
          <option value="task_completed">Tasks Completed</option>
          <option value="milestone_reached">Milestones Reached</option>
          <option value="task_claimed">Tasks Claimed</option>
          <option value="note_created">Documents Published</option>
        </select>
      </div>

      {/* Feed list */}
      <div className="bg-white rounded-2xl border border-[#E8E4DA] p-5 shadow-2xs space-y-4">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#8E9892]">
            No activity matches the selected filter.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:top-2 before:bottom-2 before:left-2.5 before:w-0.5 before:bg-[#E8E4DA]">
            {filtered.map((item) => {
              const user = users.find((u) => u.id === item.userId);
              return (
                <div key={item.id} className="relative flex items-start gap-3 text-xs">
                  {/* Timeline bullet dot */}
                  <div className="absolute -left-6 mt-1 w-5 h-5 rounded-full bg-white border border-[#E8E4DA] flex items-center justify-center shadow-2xs">
                    {getEventIcon(item.type)}
                  </div>

                  <AnimalAvatar
                    avatar={user?.avatar}
                    name={user?.name}
                    size={28}
                    className="shrink-0 ring-1 ring-[#E8E4DA]"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-[#1C221F] font-medium leading-relaxed">
                      <span className="font-bold">{user?.name}</span>{' '}
                      <span className="text-[#5C6560]">{item.description}</span>
                    </p>

                    <div className="flex items-center gap-2 text-[10px] text-[#8E9892] mt-1">
                      <Calendar size={11} />
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
