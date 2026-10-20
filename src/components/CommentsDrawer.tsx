import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Send, 
  Check, 
  CornerDownRight, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  Filter,
  Sparkles
} from 'lucide-react';
import { SlideComment } from '../types/design';

interface CommentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  comments: SlideComment[];
  currentSlideIndex: number;
  currentSlideId: string;
  onAddComment: (content: string, slideId: string, slideNumber: number) => void;
  onAddReply: (commentId: string, content: string) => void;
  onToggleResolve: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
  userName?: string;
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  isOpen,
  onClose,
  comments,
  currentSlideIndex,
  currentSlideId,
  onAddComment,
  onAddReply,
  onToggleResolve,
  onDeleteComment,
  userName = 'You (Designer)',
}) => {
  const [newCommentText, setNewCommentText] = useState('');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'current' | 'all' | 'unresolved'>('current');

  if (!isOpen) return null;

  const currentSlideNum = currentSlideIndex + 1;

  const filteredComments = comments.filter((c) => {
    if (filterMode === 'current') return c.slideId === currentSlideId;
    if (filterMode === 'unresolved') return !c.resolved;
    return true;
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment(newCommentText.trim(), currentSlideId, currentSlideNum);
    setNewCommentText('');
  };

  const handleSendReply = (commentId: string) => {
    const text = replyTextMap[commentId]?.trim();
    if (!text) return;
    onAddReply(commentId, text);
    setReplyTextMap({ ...replyTextMap, [commentId]: '' });
    setReplyingToId(null);
  };

  return (
    <div className="fixed top-14 right-0 bottom-0 w-80 sm:w-96 bg-[#12131D] border-l border-white/10 shadow-2xl z-40 flex flex-col justify-between text-neutral-200 animate-slideLeft font-sans">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#151724]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Comments & Feedback</h3>
            <p className="text-[11px] text-neutral-400">Slide {currentSlideNum} • Real-time notes</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-2 bg-[#0E0F17] border-b border-white/5 flex items-center gap-1.5 text-[11px] font-mono">
        <button
          onClick={() => setFilterMode('current')}
          className={`px-2.5 py-1 rounded-lg transition-colors ${
            filterMode === 'current'
              ? 'bg-purple-600 text-white font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Slide {currentSlideNum}
        </button>
        <button
          onClick={() => setFilterMode('all')}
          className={`px-2.5 py-1 rounded-lg transition-colors ${
            filterMode === 'all'
              ? 'bg-purple-600 text-white font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          All ({comments.length})
        </button>
        <button
          onClick={() => setFilterMode('unresolved')}
          className={`px-2.5 py-1 rounded-lg transition-colors ${
            filterMode === 'unresolved'
              ? 'bg-purple-600 text-white font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Open ({comments.filter((c) => !c.resolved).length})
        </button>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {filteredComments.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-neutral-500 mb-2.5">
              <MessageSquare className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-neutral-300">No comments yet</p>
            <p className="text-[11px] text-neutral-500 mt-1">
              Leave feedback or notes on this slide using the input below.
            </p>
          </div>
        ) : (
          filteredComments.map((comment) => (
            <div
              key={comment.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                comment.resolved
                  ? 'bg-white/[0.01] border-white/5 opacity-60'
                  : 'bg-[#161726] border-white/10 shadow-sm'
              }`}
            >
              {/* Comment Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: comment.authorColor }}
                  >
                    {comment.authorAvatar}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">{comment.authorName}</span>
                    <span className="text-[10px] text-neutral-400 ml-1.5 font-mono">
                      {comment.timestamp}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onToggleResolve(comment.id)}
                    className={`p-1 rounded-lg transition-colors ${
                      comment.resolved
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-neutral-500 hover:text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                    title={comment.resolved ? 'Mark unresolved' : 'Mark resolved'}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteComment(comment.id)}
                    className="p-1 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete comment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Comment Body */}
              <p className="text-xs text-neutral-200 leading-relaxed font-sans pl-8">
                {comment.content}
              </p>

              {/* Slide badge if viewing 'All' */}
              {filterMode !== 'current' && (
                <div className="pl-8 mt-2">
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-md bg-white/5 text-purple-300 border border-white/5">
                    Slide {comment.slideNumber}
                  </span>
                </div>
              )}

              {/* Threaded Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 pl-8 space-y-2 border-l border-white/10 ml-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="text-xs bg-[#0E0F17] p-2.5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-bold text-[11px] text-white">{reply.authorName}</span>
                        <span className="text-[10px] text-neutral-500 font-mono">{reply.timestamp}</span>
                      </div>
                      <p className="text-neutral-300 text-[11px] leading-relaxed">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Input Trigger */}
              <div className="pl-8 mt-2.5 flex items-center justify-between">
                {replyingToId === comment.id ? (
                  <div className="w-full flex items-center gap-1.5 mt-1">
                    <input
                      type="text"
                      placeholder="Write a reply..."
                      value={replyTextMap[comment.id] || ''}
                      onChange={(e) =>
                        setReplyTextMap({ ...replyTextMap, [comment.id]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendReply(comment.id);
                      }}
                      className="flex-1 bg-[#090A10] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSendReply(comment.id)}
                      className="p-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setReplyingToId(null)}
                      className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setReplyingToId(comment.id)}
                    className="text-[11px] text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 transition-colors"
                  >
                    <CornerDownRight className="w-3 h-3" />
                    <span>Reply</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Comment Input Box */}
      <div className="p-4 border-t border-white/10 bg-[#151724]">
        <form onSubmit={handleSubmitComment} className="flex items-center gap-2">
          <input
            type="text"
            placeholder={`Comment on Slide ${currentSlideNum}...`}
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            className="flex-1 bg-[#090A10] border border-white/10 rounded-2xl px-3.5 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!newCommentText.trim()}
            className="p-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-gamma-glow disabled:opacity-40 disabled:pointer-events-none"
            title="Post Comment"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
