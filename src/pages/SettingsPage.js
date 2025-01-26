import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Eye, EyeOff, Trash2, ThumbsUp, ThumbsDown, Link } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [personalInfo, setPersonalInfo] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [userBooks, setUserBooks] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [userReactions, setUserReactions] = useState([]);
  const [message, setMessage] = useState({ type: '', content: '' });

  useEffect(() => {
    if (user) {
      setPersonalInfo(prevInfo => ({
        ...prevInfo,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }));
      fetchUserBooks();
      if (activeTab === 'activity') {
        fetchUserActivity();
      }
    }
  }, [user, activeTab]);

  const fetchUserBooks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/books', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserBooks(response.data.filter(book => book.user_id === user.id));
    } catch (error) {
      setMessage({ type: 'error', content: 'Error fetching books' });
    }
  };

  const fetchUserActivity = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [commentsRes, reactionsRes] = await Promise.all([
        axios.get('http://localhost:3001/api/users/comments', { headers }),
        axios.get('http://localhost:3001/api/users/reactions', { headers })
      ]);
      
      setUserComments(commentsRes.data);
      setUserReactions(reactionsRes.data);
    } catch (error) {
      setMessage({ type: 'error', content: 'Error fetching activity' });
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUserActivity();
      setMessage({ type: 'success', content: 'Comment deleted successfully' });
    } catch (error) {
      setMessage({ type: 'error', content: 'Error deleting comment' });
    }
  };

  const handleDeleteBook = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/api/books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUserBooks();
      setMessage({ type: 'success', content: 'Book deleted successfully' });
    } catch (error) {
      setMessage({ type: 'error', content: 'Error deleting book' });
    }
  };

  const handlePersonalInfoUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:3001/api/users/update',
        {
          username: personalInfo.username,
          email: personalInfo.email,
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
  
      updateUser({
        username: personalInfo.username,
        email: personalInfo.email,
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName
      });
  
      setMessage({ type: 'success', content: 'Profile updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', content: error.response?.data?.message || 'Error updating profile' });
      
      setPersonalInfo(prevInfo => ({
        ...prevInfo,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }));
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (personalInfo.newPassword !== personalInfo.confirmPassword) {
      setMessage({ type: 'error', content: 'New passwords do not match' });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:3001/api/users/password',
        {
          currentPassword: personalInfo.currentPassword,
          newPassword: personalInfo.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', content: 'Password updated successfully' });
      setPersonalInfo(prevInfo => ({
        ...prevInfo,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      setMessage({ type: 'error', content: error.response?.data?.message || 'Error updating password' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo(prevInfo => ({
      ...prevInfo,
      [name]: value
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {message.content && (
        <div className={`mb-4 p-4 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.content}
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('personal')}
          className={`px-4 py-2 rounded ${
            activeTab === 'personal' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Personal Settings
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded ${
            activeTab === 'dashboard' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 rounded ${
            activeTab === 'activity' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Activity
        </button>
      </div>

      {activeTab === 'personal' ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Personal Settings</h2>
          
          <form onSubmit={handlePersonalInfoUpdate} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={personalInfo.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={personalInfo.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={personalInfo.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={personalInfo.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-6 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Update Profile
            </button>
          </form>

          <h3 className="text-xl font-bold mb-4">Change Password</h3>
          <form onSubmit={handlePasswordUpdate}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="currentPassword"
                    value={personalInfo.currentPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={personalInfo.newPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={personalInfo.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-6 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Update Password
            </button>
          </form>
        </div>
      ) : activeTab === 'dashboard' ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">My Published Books</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userBooks.map((book) => (
              <div key={book.id} className="border rounded-lg p-4">
                <img
                  src={`http://localhost:3001/${book.thumbnail_url}`}
                  alt={book.title}
                  className="w-full h-48 object-cover rounded mb-4"
                />
                <h3 className="font-bold text-lg mb-2">{book.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{book.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Published: {new Date(book.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDeleteBook(book.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
            {userBooks.length === 0 && (
              <p className="text-gray-500 col-span-full text-center py-8">
                You haven't published any books yet.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">My Activity</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">My Comments</h3>
              <div className="space-y-4">
                {userComments.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <RouterLink 
                          to={`/book/${comment.book_id}`}
                          className="text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                          <Link size={16} />
                          {comment.book_title}
                        </RouterLink><span className="text-sm text-gray-500">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <ThumbsUp size={16} /> {comment.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsDown size={16} /> {comment.dislikes}
                      </span>
                    </div>
                  </div>
                ))}
                {userComments.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    You haven't made any comments yet.
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">My Reactions</h3>
              <div className="space-y-4">
                {userReactions.map((reaction) => (
                  <div key={reaction.id} className="border rounded-lg p-4">
                    <RouterLink 
                      to={`/book/${reaction.book_id}`}
                      className="text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1 mb-2"
                    >
                      <Link size={16} />
                      {reaction.book_title}
                    </RouterLink>
                    <p className="text-gray-700">"{reaction.comment_content}"</p>
                    <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                      <span>You {reaction.reaction_type}d this comment</span>
                      <span>•</span>
                      <span>{formatDate(reaction.created_at)}</span>
                    </div>
                  </div>
                ))}
                {userReactions.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    You haven't reacted to any comments yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;