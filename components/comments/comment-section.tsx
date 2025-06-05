"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Loader2, Lock, Send, Trash2, Edit, RefreshCw } from "lucide-react";
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
  user_profiles?: {
    full_name: string;
    avatar_url: string | null;
  } | null;
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
      console.log("Fetching comments for movie:", movieIdString);

      // Get comments first
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select("*")
        .eq("movie_id", movieIdString)
        .order("created_at", { ascending: false });

      if (commentsError) {
        throw commentsError;
      }

      // If we have comments, fetch all user profiles for those comments
      if (commentsData && commentsData.length > 0) {
        const userIds = [
          ...new Set(commentsData.map((comment) => comment.user_id)),
        ];

        const { data: profilesData, error: profilesError } = await supabase
          .from("user_profiles")
          .select("*")
          .in("user_id", userIds);

        if (!profilesError && profilesData) {
          // Create a map of user_id to profile data
          const profilesMap = profilesData.reduce((acc, profile) => {
            acc[profile.user_id] = profile;
            return acc;
          }, {} as Record<string, any>);

          setUserProfiles(profilesMap);
        }
      }

      console.log("Comments fetched successfully:", commentsData);
      setComments(commentsData || []);
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

  const handleSubmitComment = async () => {
    if (!user || !canComment) return;
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      console.log("Submitting comment:", {
        user_id: user.id,
        movie_id: movieIdString,
        comment: newComment.trim(),
      });

      const { data, error } = await supabase
        .from("comments")
        .insert({
          user_id: user.id,
          movie_id: movieIdString,
          comment: newComment.trim(),
        })
        .select();

      if (error) {
        console.error("Submit comment error:", error);
        throw error;
      }

      console.log("Comment submitted successfully:", data);
      setNewComment("");
      toast({ title: "Comment posted successfully" });
      fetchComments();
    } catch (error: any) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Error",
        description: `Failed to post comment: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("comments")
        .update({
          comment: editText.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", commentId)
        .eq("user_id", user?.id);

      if (error) throw error;

      setEditingComment(null);
      setEditText("");
      toast({ title: "Comment updated successfully" });
      fetchComments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    setLoading(true);
    try {
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
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Unknown date";
    }
  };

  const getUserDisplayName = (comment: Comment) => {
    // Check if we have the profile in our map
    const userProfile = userProfiles[comment.user_id];
    if (userProfile?.full_name) {
      return userProfile.full_name;
    }

    // Simple fallback without async session check
    return `User ${comment.user_id.slice(0, 8)}...`;
  };

  const getUserAvatar = (comment: Comment) => {
    const userProfile = userProfiles[comment.user_id];
    return userProfile?.avatar_url || "/placeholder.svg";
  };

  const getUserInitial = (comment: Comment) => {
    const userProfile = userProfiles[comment.user_id];
    if (userProfile?.full_name) {
      return userProfile.full_name.charAt(0).toUpperCase();
    }
    return comment.user_id.charAt(0).toUpperCase();
  };

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

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">
          Comments ({comments.length})
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

      {/* Debug info */}
      <div className="bg-gray-900/30 p-3 rounded-md text-xs text-gray-400">
        <p>Movie ID: {movieIdString}</p>
        <p>User Profiles Loaded: {Object.keys(userProfiles).length}</p>
        <p>Comments Count: {comments.length}</p>
      </div>

      {/* Comment form */}
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

      {/* Comments list */}
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
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-gray-900/30 rounded-lg p-4 border border-gray-800"
            >
              <div className="flex gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={getUserAvatar(comment) || "/placeholder.svg"}
                    alt={getUserDisplayName(comment)}
                  />
                  <AvatarFallback className="bg-gray-700">
                    {getUserInitial(comment)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-white">
                        {getUserDisplayName(comment)}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {formatDate(comment.created_at)}
                        {comment.updated_at !== comment.created_at &&
                          " (edited)"}
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
                          onClick={() => {
                            setEditingComment(null);
                            setEditText("");
                          }}
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
                          {loading ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : null}
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-200 leading-relaxed">
                      {comment.comment}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
