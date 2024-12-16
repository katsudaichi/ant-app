import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { MembersList } from './MembersList';
import { ShareModal } from '../modals/ShareModal';
import { useProjectStore } from '../../store/projectStore';
import { useAuthStore } from '../../store/authStore';

interface CollaborationPanelProps {
  projectId: string;
}

export function CollaborationPanel({ projectId }: CollaborationPanelProps) {
  const currentUser = useAuthStore(state => state.user);
  const [showShareModal, setShowShareModal] = useState(false);
  const [members, setMembers] = useState([
    {
      id: currentUser?.id || '',
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      role: 'owner' as const,
      online: true,
    },
    {
      id: '2',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      role: 'editor' as const,
      online: true,
    },
    {
      id: '3',
      name: 'Bob Smith',
      email: 'bob@example.com',
      role: 'viewer' as const,
      online: false,
    },
  ]);
  
  const handleDeleteMember = (memberId: string) => {
    // TODO: Implement API call to remove member
    setMembers(members.filter(member => member.id !== memberId));
  };

  return (
    <div className="p-4 border-t">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900">
            Project Members ({members.length})
          </h3>
        </div>        
        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
        >
          <Users className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>

      <MembersList
        members={members}
        currentUserId={currentUser?.id || ''}
        onDeleteMember={handleDeleteMember}
      />
      
      {showShareModal && (
        <ShareModal
          projectId={projectId}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}