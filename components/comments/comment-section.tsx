"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import {
  Loader2,
  Lock,
  Send,
  Trash2,
  Edit,
  RefreshCw,
  Reply,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Tipe data untuk komentar
interface Comment {
  id: string;
  comment: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  parent_id: string | null;
  replies?: Comment[];
}

// Tipe data untuk props komponen utama
interface CommentSectionProps {
  movieId: string | number;
}

export default function CommentSection({ movieId }: CommentSectionProps) {
  const { user, profile } = useAuth();
  const { canComment } = useSubscription();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingStates, setLoadingStates] = useState({
    post: false,
    reply: false,
    edit: false,
  });
  const [fetchLoading, setFetchLoading] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [userProfiles, setUserProfiles] = useState<Record<string, any>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const movieIdString = movieId.toString();

  const organizeComments = (list: Comment[]): Comment[] => {
    const map = new Map(
      list.map((c) => [c.id, { ...c, replies: [] as Comment[] }])
    );
    const roots: Comment[] = [];
    for (const comment of map.values()) {
      if (comment.parent_id && map.has(comment.parent_id)) {
        map.get(comment.parent_id)!.replies!.push(comment);
      } else {
        roots.push(comment);
      }
    }
    const sortReplies = (replies: Comment[]) => {
      replies.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      replies.forEach((reply) => {
        if (reply.replies) sortReplies(reply.replies);
      });
    };
    sortReplies(roots);
    roots.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return roots;
  };

  const fetchComments = useCallback(async () => {
    setFetchLoading(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("movie_id", movieIdString);
      if (error) throw error;
      if (data) {
        const userIds = [...new Set(data.map((c) => c.user_id))];
        const { data: profiles } = await supabase
          .from("user_profiles")
          .select("*")
          .in("user_id", userIds);
        const profilesMap =
          profiles?.reduce((acc, p) => ({ ...acc, [p.user_id]: p }), {}) || {};
        setUserProfiles(profilesMap);
        setComments(organizeComments(data));
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to load comments: ${e.message}`,
        variant: "destructive",
      });
    } finally {
      setFetchLoading(false);
    }
  }, [movieIdString]);

  useEffect(() => {
    if (movieId) fetchComments();
  }, [movieId, fetchComments]);

  const handleSubmitComment = async () => {
    if (!user || !canComment || !newComment.trim()) return;
    setLoadingStates((s) => ({ ...s, post: true }));
    try {
      await supabase.from("comments").insert({
        user_id: user.id,
        movie_id: movieIdString,
        comment: newComment.trim(),
        parent_id: null,
      });
      setNewComment("");
      toast({ title: "Comment posted" });
      await fetchComments();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoadingStates((s) => ({ ...s, post: false }));
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!user || !canComment || !replyText.trim()) return;
    setLoadingStates((s) => ({ ...s, reply: true }));
    try {
      await supabase.from("comments").insert({
        user_id: user.id,
        movie_id: movieIdString,
        comment: replyText.trim(),
        parent_id: parentId,
      });
      setReplyText("");
      setReplyingTo(null);
      toast({ title: "Reply posted" });
      await fetchComments();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoadingStates((s) => ({ ...s, reply: false }));
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!user || !editText.trim()) return;
    setLoadingStates((s) => ({ ...s, edit: true }));
    try {
      await supabase
        .from("comments")
        .update({
          comment: editText.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", commentId)
        .eq("user_id", user.id);
      setEditingComment(null);
      setEditText("");
      toast({ title: "Comment updated" });
      await fetchComments();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoadingStates((s) => ({ ...s, edit: false }));
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!user || !window.confirm("Delete this comment and all replies?"))
      return;
    try {
      await supabase
        .from("comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id);
      toast({ title: "Comment deleted" });
      await fetchComments();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  if (!canComment)
    return (
      <div className="p-6 bg-gray-900/50 rounded-lg text-center">
        <Lock className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
        <h3 className="text-xl font-semibold mb-2">Premium Feature</h3>
        <p className="text-gray-400 mb-4">
          Comments are only available for Premium subscribers.
        </p>
        <Button className="bg-yellow-600 hover:bg-yellow-700">
          Upgrade to Premium
        </Button>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Comments</h3>
        <Button
          onClick={fetchComments}
          disabled={fetchLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${fetchLoading ? "animate-spin" : ""}`}
          />{" "}
          Refresh
        </Button>
      </div>

      {user && (
        <div className="flex gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback>
              {profile?.full_name?.charAt(0) || user.email?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={loadingStates.post || !newComment.trim()}
              >
                {loadingStates.post && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}{" "}
                Post
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {fetchLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentComponent
              key={comment.id}
              comment={comment}
              userProfiles={userProfiles}
              onReplyAction={{
                replyingTo,
                setReplyingTo,
                replyText,
                setReplyText,
                handleSubmitReply,
                loading: loadingStates.reply,
              }}
              onEditAction={{
                editingComment,
                setEditingComment,
                editText,
                setEditText,
                handleEdit,
                loading: loadingStates.edit,
              }}
              onDeleteAction={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Komponen terpisah untuk setiap komentar (bisa memanggil dirinya sendiri/rekursif)
function CommentComponent({
  comment,
  userProfiles,
  onReplyAction,
  onEditAction,
  onDeleteAction,
  level = 0,
}: {
  comment: Comment;
  userProfiles: Record<string, any>;
  onReplyAction: any;
  onEditAction: any;
  onDeleteAction: (id: string) => void;
  level?: number;
}) {
  const { user, profile } = useAuth();
  const [repliesExpanded, setRepliesExpanded] = useState(false);
  const hasReplies = comment.replies && comment.replies.length > 0;

  const getUserDisplayName = (c: Comment) =>
    userProfiles[c.user_id]?.full_name || `User...${c.user_id.slice(-4)}`;
  const getUserAvatar = (c: Comment) =>
    userProfiles[c.user_id]?.avatar_url || "/placeholder.svg";
  const getUserInitial = (c: Comment) =>
    (userProfiles[c.user_id]?.full_name || "U").charAt(0).toUpperCase();

  return (
    <div className="flex gap-3">
      <Avatar className={`shrink-0 ${level > 0 ? "w-8 h-8" : "w-10 h-10"}`}>
        <AvatarImage src={getUserAvatar(comment)} />
        <AvatarFallback>{getUserInitial(comment)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h4
            className={`font-medium text-white ${level > 0 ? "text-sm" : ""}`}
          >
            {getUserDisplayName(comment)}
          </h4>
          <p className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(comment.created_at), {
              addSuffix: true,
            })}
          </p>
          {comment.updated_at !== comment.created_at && (
            <p className="text-xs text-gray-500">(edited)</p>
          )}
        </div>

        {onEditAction.editingComment === comment.id ? (
          <div className="space-y-2 mt-1">
            <Textarea
              value={onEditAction.editText}
              onChange={(e) => onEditAction.setEditText(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditAction.setEditingComment(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => onEditAction.handleEdit(comment.id)}
                disabled={onEditAction.loading}
              >
                {onEditAction.loading && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}{" "}
                Save
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-200 text-sm mt-1 whitespace-pre-wrap">
              {comment.comment}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  onReplyAction.setReplyingTo(
                    onReplyAction.replyingTo === comment.id ? null : comment.id
                  )
                }
                className="text-gray-400 hover:text-white p-1 h-auto text-xs font-semibold"
              >
                <Reply className="h-3 w-3 mr-1" />
                REPLY
              </Button>
              {user?.id === comment.user_id && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditAction.setEditingComment(comment.id)}
                    className="h-7 w-7 text-gray-400 hover:text-white"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteAction(comment.id)}
                    className="h-7 w-7 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </>
        )}

        {onReplyAction.replyingTo === comment.id && (
          <div className="mt-3 flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder={`Replying to ${getUserDisplayName(comment)}...`}
                value={onReplyAction.replyText}
                onChange={(e) => onReplyAction.setReplyText(e.target.value)}
                className="bg-gray-800 text-sm min-h-[80px]"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReplyAction.setReplyingTo(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => onReplyAction.handleSubmitReply(comment.id)}
                  disabled={
                    onReplyAction.loading || !onReplyAction.replyText.trim()
                  }
                >
                  {onReplyAction.loading && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}{" "}
                  Reply
                </Button>
              </div>
            </div>
          </div>
        )}

        {hasReplies && (
          <div className="mt-2">
            <Button
              variant="ghost"
              onClick={() => setRepliesExpanded(!repliesExpanded)}
              className="text-blue-400 hover:text-blue-300 px-2 py-1 h-auto text-sm font-bold"
            >
              {repliesExpanded ? (
                <ChevronUp className="h-4 w-4 mr-1" />
              ) : (
                <ChevronDown className="h-4 w-4 mr-1" />
              )}{" "}
              {comment.replies?.length ?? 0}{" "}
              {(comment.replies?.length ?? 0) === 1 ? "Reply" : "Replies"}
            </Button>
          </div>
        )}

        {repliesExpanded && hasReplies && (
          <div className="mt-4 pt-4 border-l-2 border-gray-800 pl-4 space-y-4">
            {(comment.replies ?? []).map((reply) => (
              <CommentComponent
                key={reply.id}
                comment={reply}
                userProfiles={userProfiles}
                onReplyAction={onReplyAction}
                onEditAction={onEditAction}
                onDeleteAction={onDeleteAction}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
