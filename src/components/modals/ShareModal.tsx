import React, { useState } from 'react';
import { Users, Link, Mail, Copy, Check, X } from 'lucide-react';
import { MembersList } from '../collaboration/MembersList';
import { useAuthStore } from '../../store/authStore';

interface ShareModalProps {
  projectId: string;
  onClose: () => void;
}

export function ShareModal({ projectId, onClose }: ShareModalProps) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [showCopied, setShowCopied] = useState(false);
  const currentUser = useAuthStore(state => state.user);
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

  const shareLink = `${window.location.origin}/projects/${projectId}/join`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement invite functionality
    console.log('Invite sent to:', inviteEmail);
    setInviteEmail('');
  };

  const handleDeleteMember = (memberId: string) => {
    // TODO: Implement API call to remove member
    setMembers(members.filter(member => member.id !== memberId));
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900">
              Project Members ({members.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Invite by email */}
          <form onSubmit={handleInvite}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invite members
            </label>
            <div className="flex space-x-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Mail className="w-4 h-4 mr-2" />
                Invite
              </button>
            </div>
          </form>

          {/* Share link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share link
            </label>
            <div className="flex items-center space-x-2 max-w-full">
              <div className="flex-1 flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-500 min-w-0">
                <Link className="w-4 h-4" />
                <span className="truncate flex-1" onClick={() => handleCopyLink()} style={{ cursor: 'pointer' }}>{shareLink}</span>
              </div>
              <button
                onClick={handleCopyLink}
                className="p-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
                title={showCopied ? 'Copied!' : 'Copy to clipboard'}
              >
                {showCopied ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
            {showCopied && (
              <p className="mt-1 text-sm text-green-600">
                Link copied to clipboard!
              </p>
            )}
          </div>

          {/* Members list */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Members</h3>
            <MembersList
              members={members}
              currentUserId={currentUser?.id || ''}
              onDeleteMember={handleDeleteMember}
            />
          </div>
        </div>
      </div>
    </div>
  );
}