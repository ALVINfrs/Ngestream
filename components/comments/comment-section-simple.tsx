"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Loader2, Lock, Send, Trash2 } from "lucide-react";

interface CommentSectionProps {
  movieId: string | number;
}

interface Comment {
  id: string;
  comment: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export default function CommentSectionSimple({ movieId }: CommentSectionProps) {
  const { user, profile } = useAuth();
  const { canComment } = useSubscription();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

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

      // Simple query without joins first
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("movie_id", movieIdString)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch comments error:", error);
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw error;
      }

      console.log("Comments fetched successfully:", data);
      setComments(data || []);
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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown date";
    }
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
      {/* Debug Info */}
      <div className="bg-gray-900 p-4 rounded text-sm">
        <p>Movie ID: {movieIdString}</p>
        <p>User: {user?.email}</p>
        <p>Can Comment: {canComment.toString()}</p>
        <p>Comments Count: {comments.length}</p>
        <Button onClick={fetchComments} size="sm" className="mt-2">
          Refresh Comments
        </Button>
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
              className="bg-gray-900 border-gray-700 min-h-[100px]"
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
      <div className="space-y-6">
        {fetchLoading ? (
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
              className="flex gap-4 bg-gray-900/50 p-4 rounded"
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gray-700">
                  {comment.user_id.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">
                      User {comment.user_id.slice(0, 8)}...
                    </h4>
                    <p className="text-xs text-gray-400">
                      {formatDate(comment.created_at)}
                    </p>
                  </div>
                  {user && user.id === comment.user_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="mt-1 text-gray-200">{comment.comment}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
