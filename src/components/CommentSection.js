import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { ThumbsUp, ThumbsDown, Reply, Pin, Trash2, MessageCircle } from 'lucide-react';

const CommentSection = ({ bookId, authorId }) => {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [bookId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/books/${bookId}/comments`);
      // Sort pinned comments first
      const sortedComments = response.data.sort((a, b) => {
        if (a.is_pinned === b.is_pinned) {
          return new Date(b.created_at) - new Date(a.created_at);
        }
        return b.is_pinned - a.is_pinned;
      });
      setComments(sortedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(
        `http://localhost:3001/api/books/${bookId}/comments`,
        {
          content: newComment,
          parentId: replyTo
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setComments(prev => [...prev, response.data]);
      setNewComment('');
      setReplyTo(null);
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleReaction = async (commentId, reactionType) => {
    try {
      const response = await axios.post(
        `http://localhost:3001/api/comments/${commentId}/react`,
        { reaction: reactionType },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? { ...comment, likes: response.data.likes, dislikes: response.data.dislikes }
            : comment
        )
      );
    } catch (error) {
      console.error('Error reacting to comment:', error);
    }
  };

  const handlePinComment = async (commentId) => {
    try {
      const response = await axios.post(
        `http://localhost:3001/api/comments/${commentId}/pin`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? { ...comment, is_pinned: response.data.is_pinned }
            : comment
        ).sort((a, b) => {
          if (a.is_pinned === b.is_pinned) {
            return new Date(b.created_at) - new Date(a.created_at);
          }
          return b.is_pinned - a.is_pinned;
        })
      );
    } catch (error) {
      console.error('Error pinning comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:3001/api/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setComments(prev => {
        const filtered = prev.filter(comment => 
          comment.id !== commentId && comment.parent_id !== commentId
        );
        return filtered;
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  const renderComment = (comment, isReply = false) => {
    const replies = comments.filter(c => c.parent_id === comment.id);
    const isAuthor = comment.user_id === authorId;
    const isCurrentUser = user?.id === comment.user_id;
    const canDelete = isCurrentUser || user?.id === authorId;

    return (
      <div key={comment.id} className={`mb-4 ${isReply ? 'ml-8' : ''}`}>
        <div className={`bg-white rounded-lg p-4 shadow ${comment.is_pinned ? 'border-2 border-blue-500' : ''}`}>
          {/* Pinned indicator */}
          {comment.is_pinned && (
            <div className="flex items-center text-blue-600 mb-2">
              <Pin className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">Pinned by author</span>
            </div>
          )}
          
          <div className="flex items-center mb-2">
            <span className="font-medium">{comment.username}</span>
            {isAuthor && (
              <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Author</span>
            )}
            <span className="text-gray-500 text-sm ml-2">
              {formatTimestamp(comment.created_at)}
            </span>
          </div>
          
          <p className="text-gray-700 mb-3">{comment.content}</p>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => isAuthenticated && handleReaction(comment.id, 'like')}
              className={`flex items-center space-x-1 ${
                !isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{comment.likes || 0}</span>
            </button>
            
            <button
              onClick={() => isAuthenticated && handleReaction(comment.id, 'dislike')}
              className={`flex items-center space-x-1 ${
                !isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
              <span>{comment.dislikes || 0}</span>
            </button>

            {isAuthenticated && (
              <button
                onClick={() => setReplyTo(comment.id)}
                className="flex items-center space-x-1 text-blue-600"
              >
                <Reply className="w-4 h-4" />
                <span>Reply</span>
              </button>
            )}

            {/* Author controls */}
            {user?.id === authorId && !isReply && (
              <button
                onClick={() => handlePinComment(comment.id)}
                className={`flex items-center space-x-1 ${
                  comment.is_pinned ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <Pin className="w-4 h-4" />
                <span>{comment.is_pinned ? 'Unpin' : 'Pin'}</span>
              </button>
            )}

            {canDelete && (
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="flex items-center space-x-1 text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>

        {replies.map(reply => renderComment(reply, true))}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-4">Loading comments...</div>;
  }

  return (
    <div className="mt-8">
      <div className="flex items-center mb-6">
        <h2 className="text-2xl font-bold">Comments</h2>
        <div className="ml-3 flex items-center text-gray-500">
          <MessageCircle className="w-5 h-5 mr-1" />
          <span>{comments.length}</span>
        </div>
      </div>
      
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
          />
          <div className="flex justify-between items-center mt-2">
            {replyTo && (
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-gray-600 hover:text-gray-800"
              >
                Cancel Reply
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {replyTo ? "Reply" : "Comment"}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-700">
            Please log in to leave a comment.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {comments
          .filter(comment => !comment.parent_id)
          .map(comment => renderComment(comment))}
      </div>
    </div>
  );
};

export default CommentSection;