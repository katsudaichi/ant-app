import React, { useState } from 'react';
import { Users, Link, Mail, Copy, Check } from 'lucide-react';

interface ProjectShareProps {
  projectId: string;
}

export function ProjectShare({ projectId }: ProjectShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showCopied, setShowCopied] = useState(false);

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

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
      >
        <Users className="w-4 h-4" />
        <span>Share</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Share Project
            </h3>

            {/* Invite by email */}
            <form onSubmit={handleInvite} className="mb-6">
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
              <div className="flex items-center space-x-2">
                <div className="flex-1 flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-500">
                  <Link className="w-4 h-4" />
                  <span className="truncate">{shareLink}</span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  {showCopied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}