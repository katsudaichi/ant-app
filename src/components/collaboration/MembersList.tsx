import React from 'react';
import { User, Crown, Trash2 } from 'lucide-react';
import { ProjectMember } from '../../types';

interface MembersListProps {
  members: ProjectMember[];
  currentUserId: string;
  onDeleteMember: (memberId: string) => void;
}

export function MembersList({ members, currentUserId, onDeleteMember }: MembersListProps) {
  const handleDelete = (member: ProjectMember) => {
    if (member.role === 'owner') {
      alert('Cannot delete the project owner');
      return;
    }
    if (window.confirm(`Are you sure you want to remove ${member.name} from the project?`)) {
      onDeleteMember(member.id);
    }
  };

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              {member.online && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full ring-2 ring-white" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  {member.name}
                </span>
                {member.role === 'owner' && (
                  <Crown className="w-4 h-4 text-yellow-400" />
                )}
                {member.id === currentUserId && (
                  <span className="text-xs text-gray-500">(You)</span>
                )}
              </div>
              <span className="text-xs text-gray-500">{member.email}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              {member.online ? 'Online' : 'Offline'}
            </span>
            {member.id !== currentUserId && (
              <button
                onClick={() => handleDelete(member)}
                className="p-1 text-gray-400 hover:text-red-600 rounded"
                title="Remove member"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}