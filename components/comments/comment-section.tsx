"use client";

import { useState, useEffect } from "react";
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

interface CommentSectionProps {
  movieId: string | number;
}

interface Comment {
  id: string;
  comment: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  parent_id: string | null;
  user_profiles?: {
    full_name: string;
    avatar_url: string | null;
  } | null;
  replies?: Comment[]; // Untuk menyimpan balasan (bisa bersarang)
  reply_count?: number;
}

export default function CommentSection({ movieId }: CommentSectionProps) {
  const { user, profile } = useAuth();
  const { canComment } = useSubscription();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [userProfiles, setUserProfiles] = useState<Record<string, any>>({});

  // State untuk reply
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set()
  );

  // Convert movieId to string for consistency
  const movieIdString = movieId.toString();

  useEffect(() => {
    if (movieId) {
      fetchComments();
    }
  }, [movieId]);

  const fetchComments = async () => {
    setFetchLoading(true);
    try {
      // Get all comments (both parent and replies) for the movie
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select("*")
        .eq("movie_id", movieIdString);

      if (commentsError) {
        throw commentsError;
      }

      // If we have comments, fetch all unique user profiles for those comments
      if (commentsData && commentsData.length > 0) {
        const userIds = [
          ...new Set(commentsData.map((comment) => comment.user_id)),
        ];

        const { data: profilesData, error: profilesError } = await supabase
          .from("user_profiles")
          .select("*")
          .in("user_id", userIds);

        if (!profilesError && profilesData) {
          const profilesMap = profilesData.reduce((acc, profile) => {
            acc[profile.user_id] = profile;
            return acc;
          }, {} as Record<string, any>);
          setUserProfiles(profilesMap);
        }
      }

      // Organize comments into a nested (threaded) structure
      const organizedComments = organizeComments(commentsData || []);
      setComments(organizedComments);
    } catch (error: any) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Error",
        description: `Failed to load comments: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const organizeComments = (commentsData: Comment[]): Comment[] => {
    const commentsMap: Record<string, Comment> = {};
    const rootComments: Comment[] = [];

    // First, create a map of all comments by their ID and initialize replies
    commentsData.forEach((comment) => {
      commentsMap[comment.id] = {
        ...comment,
        replies: [],
        reply_count: 0,
      };
    });

    // Second, iterate again to place each comment under its parent
    commentsData.forEach((comment) => {
      if (comment.parent_id && commentsMap[comment.parent_id]) {
        // This is a reply, add it to its parent's replies array
        commentsMap[comment.parent_id].replies?.push(commentsMap[comment.id]);
      } else {
        // This is a root comment
        rootComments.push(commentsMap[comment.id]);
      }
    });

    // Recursive function to sort replies and calculate counts
    const sortAndCountReplies = (comment: Comment): number => {
      if (comment.replies && comment.replies.length > 0) {
        // Sort replies from oldest to newest
        comment.replies.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        // Count direct and nested replies
        let totalReplies = comment.replies.length;
        comment.replies.forEach((reply) => {
          totalReplies += sortAndCountReplies(reply); // Recursive call
        });
        comment.reply_count = totalReplies;

        // Process replies of replies
        comment.replies.forEach(sortAndCountReplies);
      }
      return comment.reply_count || 0;
    };

    // Sort root comments (newest first) and process their replies
    rootComments.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    rootComments.forEach(sortAndCountReplies);

    return rootComments;
  };

  const handleSubmitComment = async () => {
    if (!user || !canComment || !newComment.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("comments").insert({
        user_id: user.id,
        movie_id: movieIdString,
        comment: newComment.trim(),
        parent_id: null, // Main comment
      });

      if (error) throw error;

      setNewComment("");
      toast({ title: "Comment posted successfully" });
      fetchComments(); // Refetch to show the new comment
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to post comment: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!user || !canComment || !replyText.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("comments").insert({
        user_id: user.id,
        movie_id: movieIdString,
        comment: replyText.trim(),
        parent_id: parentId, // Set the parent ID for the reply
      });

      if (error) throw error;

      setReplyText("");
      setReplyingTo(null);
      // Auto-expand the parent comment to show the new reply
      setExpandedComments((prev) => new Set(prev).add(parentId));
      toast({ title: "Reply posted successfully" });
      fetchComments(); // Refetch all comments
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to post reply: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim() || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("comments")
        .update({
          comment: editText.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", commentId)
        .eq("user_id", user.id);

      if (error) throw error;

      setEditingComment(null);
      setEditText("");
      toast({ title: "Comment updated successfully" });
      fetchComments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to update comment: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this comment and all its replies?"
      )
    )
      return;

    setLoading(true);
    try {
      // Supabase with RLS and cascading deletes is a better approach,
      // but manual deletion requires deleting children first.
      // This is complex without a recursive CTE. A simpler approach is to let the DB handle it if configured.
      // Assuming no cascading delete is set up in Supabase DB:
      // You would need a recursive function to delete all children first.
      // For simplicity, we'll just delete the target comment.
      // If you have `ON DELETE CASCADE` on your `parent_id` foreign key, this is sufficient.

      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user?.id);

      if (error) throw error;

      toast({ title: "Comment deleted successfully" });
      fetchComments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete comment: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditText(comment.comment);
    setReplyingTo(null); // Close reply box if open
  };

  const startReplying = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyText("");
    setEditingComment(null); // Close edit box if open
  };

  const toggleReplies = (commentId: string) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Unknown date";
    }
  };

  const getUserDisplayName = (comment: Comment) =>
    userProfiles[comment.user_id]?.full_name ||
    `User ${comment.user_id.slice(0, 8)}...`;
  const getUserAvatar = (comment: Comment) =>
    userProfiles[comment.user_id]?.avatar_url || "/placeholder.svg";
  const getUserInitial = (comment: Comment) =>
    (userProfiles[comment.user_id]?.full_name || comment.user_id)
      .charAt(0)
      .toUpperCase();

  const renderComment = (comment: Comment, isReply: boolean = false) => (
    <div
      key={comment.id}
      className={`bg-gray-900/30 rounded-lg p-4 border border-gray-800 ${
        isReply ? "ml-4 sm:ml-8 mt-2" : ""
      }`}
    >
      <div className="flex gap-4">
        <Avatar className={`${isReply ? "h-8 w-8" : "h-10 w-10"}`}>
          <AvatarImage
            src={getUserAvatar(comment)}
            alt={getUserDisplayName(comment)}
          />
          <AvatarFallback className="bg-gray-700">
            {getUserInitial(comment)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4
                className={`font-medium text-white ${isReply ? "text-sm" : ""}`}
              >
                {getUserDisplayName(comment)}
              </h4>
              <p className="text-xs text-gray-400">
                {formatDate(comment.created_at)}
                {comment.updated_at !== comment.created_at && " (edited)"}
              </p>
            </div>
            {user && user.id === comment.user_id && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditing(comment)}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteComment(comment.id)}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {editingComment === comment.id ? (
            <div className="space-y-2">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingComment(null)}
                  className="border-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleEditComment(comment.id)}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {loading && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p
                className={`text-gray-200 leading-relaxed ${
                  isReply ? "text-sm" : ""
                }`}
              >
                {comment.comment}
              </p>

              {user && (
                <div className="flex items-center gap-4 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startReplying(comment.id)}
                    className="text-gray-400 hover:text-white p-0 h-auto"
                  >
                    <Reply className="h-4 w-4 mr-1" />
                    Reply
                  </Button>
                  {comment.reply_count! > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleReplies(comment.id)}
                      className="text-gray-400 hover:text-white p-0 h-auto"
                    >
                      {expandedComments.has(comment.id) ? (
                        <ChevronUp className="h-4 w-4 mr-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 mr-1" />
                      )}
                      {comment.reply_count}{" "}
                      {comment.reply_count === 1 ? "reply" : "replies"}
                    </Button>
                  )}
                </div>
              )}

              {replyingTo === comment.id && (
                <div className="mt-4 flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={profile?.avatar_url || "/placeholder.svg"}
                      alt={profile?.full_name}
                    />
                    <AvatarFallback className="bg-red-600">
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder={`Replying to ${getUserDisplayName(
                        comment
                      )}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white text-sm min-h-[80px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReplyingTo(null)}
                        className="border-gray-700"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSubmitReply(comment.id)}
                        disabled={loading || !replyText.trim()}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {loading ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <Send className="h-3 w-3 mr-1" />
                        )}
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Recursive rendering of replies */}
              {expandedComments.has(comment.id) &&
                comment.replies &&
                comment.replies.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {comment.replies.map((reply) => renderComment(reply, true))}
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (!canComment) {
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
  }

  const totalComments = comments.reduce(
    (total, comment) => total + 1 + (comment.reply_count || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">
          Comments ({totalComments})
        </h3>
        <Button
          onClick={fetchComments}
          disabled={fetchLoading}
          variant="outline"
          size="sm"
          className="border-gray-700 text-gray-400 hover:text-white"
        >
          {fetchLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {user && (
        <div className="flex gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={profile?.avatar_url || "/placeholder.svg"}
              alt={profile?.full_name}
            />
            <AvatarFallback className="bg-red-600">
              {profile?.full_name?.charAt(0) || user.email?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="bg-gray-900 border-gray-700 min-h-[100px] text-white placeholder:text-gray-400"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={loading || !newComment.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Post Comment
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {fetchLoading && comments.length === 0 ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-gray-400">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">
              No comments yet. Be the first to comment!
            </p>
          </div>
        ) : (
          comments.map((comment) => renderComment(comment, false))
        )}
      </div>
    </div>
  );
}
