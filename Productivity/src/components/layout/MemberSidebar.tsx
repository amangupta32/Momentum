import React from 'react';
import { Users, Shield, Plus, ChevronRight, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AnimalAvatar } from '../avatars/AnimalAvatar';
import { User } from '../../types';

interface MemberSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMember: (member: User) => void;
  onInvite: () => void;
}

export const MemberSidebar: React.FC<MemberSidebarProps> = ({
  isOpen,
  onClose,
  onSelectMember,
  onInvite,
}) => {
  const { users, currentUser, activeWorkspace, workspaceMembers } = useApp();

  if (!isOpen) return null;

  // Determine roles
  const getMemberRole = (userId: string) => {
    if (activeWorkspace.ownerId === userId) return 'owner';
    const member = workspaceMembers.find((m) => m.userId === userId);
    return member?.role || 'member';
  };

  const ownersAndAdmins = users.filter((u) => {
    const role = getMemberRole(u.id);
    return role === 'owner' || role === 'admin';
  });

  const generalMembers = users.filter((u) => {
    const role = getMemberRole(u.id);
    return role !== 'owner' && role !== 'admin';
  });

  return (
    <aside className="w-64 shrink-0 bg-[#FAF8F5] border-l border-[#E8E4DA] flex flex-col h-[calc(100vh-4rem)] sticky top-16 transition-all duration-300 z-20">
      {/* Header */}
      <div className="p-4 border-b border-[#E8E4DA] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-[#1E3A2F]" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#1C221F]">
            Team Members ({users.length})
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onInvite}
            className="p-1 rounded-lg text-[#1E3A2F] hover:bg-[#E7F0E8] transition-colors"
            title="Invite new member"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#737C76] hover:bg-[#F2EFE9] transition-colors"
            title="Close member panel"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Member Lists */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {/* Owners & Admins Section */}
        {ownersAndAdmins.length > 0 && (
          <div className="space-y-1">
            <h4 className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#8E9892]">
              Leadership — {ownersAndAdmins.length}
            </h4>
            {ownersAndAdmins.map((member) => {
              const isMe = member.id === currentUser.id;
              const role = getMemberRole(member.id);
              return (
                <button
                  key={member.id}
                  onClick={() => onSelectMember(member)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-white border border-transparent hover:border-[#E8E4DA] transition-all text-left group"
                >
                  <AnimalAvatar
                    avatar={member.avatar}
                    name={member.name}
                    size={30}
                    showBadge
                    status="online"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-[#1C221F] truncate group-hover:text-[#1E3A2F]">
                        {member.name}
                      </span>
                      {isMe && (
                        <span className="text-[9px] px-1 py-0.2 bg-[#E7F0E8] text-[#1E3A2F] font-bold rounded">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-[#737C76] truncate">
                      <Shield size={10} className={role === 'owner' ? 'text-amber-600' : 'text-blue-600'} />
                      <span className="capitalize">{role === 'owner' ? 'Owner' : 'Admin'}</span>
                    </div>
                  </div>
                  <ChevronRight size={13} className="text-[#B8B0A0] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </div>
        )}

        {/* General Members Section */}
        <div className="space-y-1">
          <h4 className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#8E9892]">
            Members — {generalMembers.length}
          </h4>
          {generalMembers.length === 0 ? (
            <p className="px-2 text-xs text-[#8E9892] italic py-1">No other members yet</p>
          ) : (
            generalMembers.map((member) => {
              const isMe = member.id === currentUser.id;
              return (
                <button
                  key={member.id}
                  onClick={() => onSelectMember(member)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-white border border-transparent hover:border-[#E8E4DA] transition-all text-left group"
                >
                  <AnimalAvatar
                    avatar={member.avatar}
                    name={member.name}
                    size={30}
                    showBadge
                    status="online"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-[#1C221F] truncate group-hover:text-[#1E3A2F]">
                        {member.name}
                      </span>
                      {isMe && (
                        <span className="text-[9px] px-1 py-0.2 bg-[#E7F0E8] text-[#1E3A2F] font-bold rounded">
                          You
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#737C76] truncate block">
                      {member.title || 'Contributor'}
                    </span>
                  </div>
                  <ChevronRight size={13} className="text-[#B8B0A0] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Invite Action */}
      <div className="p-3 border-t border-[#E8E4DA] bg-white">
        <button
          onClick={onInvite}
          className="w-full py-2 px-3 rounded-xl bg-[#E7F0E8] hover:bg-[#D5E5D7] text-[#1E3A2F] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
        >
          <Plus size={14} />
          <span>Invite Teammate</span>
        </button>
      </div>
    </aside>
  );
};
