import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trash2 } from 'lucide-react';

const BookshelfPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookshelf();
  }, []);

  const fetchBookshelf = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/bookshelf', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setBooks(response.data);
    } catch (err) {
      setError('Failed to fetch bookshelf');
      console.error('Error fetching bookshelf:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromShelf = async (bookId, e) => {
    e.stopPropagation();
    
    try {
      await axios.delete(`http://localhost:3001/api/bookshelf/remove/${bookId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setBooks(books.filter(book => book.id !== bookId));
    } catch (err) {
      console.error('Error removing book from shelf:', err);
      alert('Failed to remove book from shelf');
    }
  };

  const handleCardClick = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-xl text-gray-600">Loading bookshelf...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookshelf</h1>

      {books.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">Your bookshelf is empty.</p>
          <p className="mt-4 text-gray-600">
            Browse books on the home page to add them to your shelf!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <div 
              key={book.id} 
              onClick={() => handleCardClick(book.id)}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group relative"
            >
              <div className="aspect-w-3 aspect-h-4">
                <img
                  src={`http://localhost:3001/${book.thumbnail_url}`}
                  alt={book.title}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
                  }}
                />
                
                <button
                  onClick={(e) => handleRemoveFromShelf(book.id, e)}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  title="Remove from shelf"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                  {book.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-2">
                  by {book.author_name}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="inline-block px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded">
                    {book.genre}
                  </span>
                  <span className="text-xs text-gray-500">
                    Added {new Date(book.added_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookshelfPage;