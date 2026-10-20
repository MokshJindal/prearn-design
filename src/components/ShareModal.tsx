import React, { useState } from 'react';
import { 
  X, 
  Link, 
  Check, 
  Copy, 
  Users, 
  UserPlus, 
  Globe, 
  Lock, 
  ShieldCheck, 
  Mail, 
  MessageSquare,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { Collaborator } from '../types/design';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  documentId: string;
  collaborators: Collaborator[];
  onAddCollaborator: (collaborator: Omit<Collaborator, 'id'>) => void;
  onRemoveCollaborator: (id: string) => void;
  onShowToast: (msg: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  documentId,
  collaborators,
  onAddCollaborator,
  onRemoveCollaborator,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'commenter' | 'viewer'>('editor');
  const [accessLevel, setAccessLevel] = useState<'public' | 'restricted'>('public');

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/?project=${documentId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    onShowToast('Shareable collaboration link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#3B82F6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const displayName = inviteName.trim() || inviteEmail.split('@')[0];

    onAddCollaborator({
      name: displayName,
      email: inviteEmail.trim(),
      avatar: displayName.charAt(0).toUpperCase(),
      role: inviteRole,
      color: randomColor,
      status: 'active',
      lastSeen: 'Just invited',
    });

    setInviteEmail('');
    setInviteName('');
    onShowToast(`Invited ${displayName} as ${inviteRole}!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#12131C] border border-white/10 rounded-3xl shadow-2xl overflow-hidden text-neutral-200 animate-slideUp">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#151724]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-gamma-glow">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Share & Collaborate</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                  LIVE SYNC
                </span>
              </h2>
              <p className="text-xs text-neutral-400 truncate max-w-xs sm:max-w-sm">
                Invite team members to view, edit, or comment on <span className="text-white font-medium">"{documentTitle}"</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Quick Share Link Box */}
          <div className="p-4 rounded-2xl bg-[#090A10] border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Globe className="w-4 h-4 text-purple-400" />
                <span>General Access</span>
              </div>
              <select
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value as any)}
                className="bg-[#181926] border border-white/10 rounded-lg px-2 py-1 text-[11px] text-neutral-300 focus:outline-none focus:border-purple-500"
              >
                <option value="public">Anyone with link can view</option>
                <option value="restricted">Restricted to invited team</option>
              </select>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 bg-[#151624] border border-white/10 rounded-xl px-3 py-2 text-[11px] text-neutral-400 font-mono truncate select-all">
                {shareUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-gamma-glow flex-shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Invite Collaborator Form */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-2 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-purple-400" />
              <span>Invite People & Teammates</span>
            </label>
            <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Name (optional)"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="w-full sm:w-1/3 bg-[#0E0F17] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500"
              />
              <input
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                className="flex-1 bg-[#0E0F17] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="bg-[#181926] border border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-purple-500 flex-shrink-0"
              >
                <option value="editor">Can edit</option>
                <option value="commenter">Can comment</option>
                <option value="viewer">Can view</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors flex-shrink-0"
              >
                Send Invite
              </button>
            </form>
          </div>

          {/* Active Collaborators List */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-mono uppercase text-neutral-400 font-semibold">
                Who has access ({collaborators.length})
              </span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Multi-User Sync
              </span>
            </div>

            <div className="divide-y divide-white/5 border border-white/5 rounded-2xl bg-[#0E0F17] overflow-hidden">
              {collaborators.map((c) => (
                <div key={c.id} className="p-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm relative"
                      style={{ backgroundColor: c.color }}
                    >
                      {c.avatar}
                      {c.status === 'active' && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0E0F17]" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>{c.name}</span>
                        {c.role === 'owner' && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                            OWNER
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono">{c.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono capitalize px-2 py-0.5 rounded-lg bg-white/5 text-neutral-300">
                      {c.role}
                    </span>
                    {c.role !== 'owner' && (
                      <button
                        onClick={() => onRemoveCollaborator(c.id)}
                        className="text-neutral-500 hover:text-red-400 p-1 rounded-lg transition-colors"
                        title="Remove collaborator"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#151724] flex items-center justify-between">
          <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>End-to-end encrypted live workspace</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
