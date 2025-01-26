import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Trash2, Search, X, BookmarkPlus, BookmarkCheck } from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [continueReading, setContinueReading] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [bookshelfStatus, setBookshelfStatus] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && books.length > 0) {
      books.forEach(async (book) => {
        try {
          const response = await axios.get(`http://localhost:3001/api/bookshelf/check/${book.id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          setBookshelfStatus(prev => ({
            ...prev,
            [book.id]: response.data.isInShelf
          }));
        } catch (error) {
          console.error('Error checking bookshelf status:', error);
        }
      });
    }
  }, [isAuthenticated, books]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBooks(books);
      return;
    }

    const searchTerms = searchTerm.toLowerCase().split(' ');
    const filtered = books.filter(book => {
      return searchTerms.some(term =>
        book.title.toLowerCase().includes(term) ||
        book.author_name.toLowerCase().includes(term) ||
        book.genre.toLowerCase().includes(term) ||
        book.description.toLowerCase().includes(term)
      );
    });
    setFilteredBooks(filtered);
  }, [searchTerm, books]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  const fetchData = async () => {
    try {
      const booksResponse = await axios.get('http://localhost:3001/api/books');
      setBooks(booksResponse.data);
      setFilteredBooks(booksResponse.data);

      if (isAuthenticated) {
        const token = localStorage.getItem('token');
        const progressResponse = await axios.get('http://localhost:3001/api/reading-progress', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setContinueReading(progressResponse.data);
      }
    } catch (err) {
      setError('Failed to fetch books');
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3001/api/books/${bookId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setBooks(books.filter(book => book.id !== bookId));
    } catch (err) {
      console.error('Error deleting book:', err);
      alert('Failed to delete book');
    }
  };

  const handleAddToShelf = async (bookId, e) => {
    e.stopPropagation();
    
    try {
      if (bookshelfStatus[bookId]) {
        await axios.delete(`http://localhost:3001/api/bookshelf/remove/${bookId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else {
        await axios.post('http://localhost:3001/api/bookshelf/add', 
          { bookId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
      }
      setBookshelfStatus(prev => ({
        ...prev,
        [bookId]: !prev[bookId]
      }));
    } catch (error) {
      console.error('Error updating bookshelf:', error);
      alert('Failed to update bookshelf');
    }
  };

  const removeReadingProgress = async (bookId, e) => {
    e.stopPropagation();
    
    try {
      await axios.delete(`http://localhost:3001/api/reading-progress/${bookId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setContinueReading(prev => prev.filter(book => book.id !== bookId));
    } catch (error) {
      console.error('Error removing reading progress:', error);
      alert('Failed to remove from Continue Reading');
    }
  };

  const handleCardClick = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  const highlightText = (text, searchTerm) => {
    if (!searchTerm.trim()) return text;
    
    const terms = searchTerm.toLowerCase().split(' ');
    let highlightedText = text;
    
    terms.forEach(term => {
      if (term.trim()) {
        const regex = new RegExp(`(${term})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<strong>$1</strong>');
      }
    });
    
    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-xl text-gray-600">Loading books...</div>
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
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {isAuthenticated ? `Hey ${user?.username}! Welcome to Nile` : 'Welcome to Nile'}
        </h1>
        <p className="text-xl text-gray-600 mb-8">Your Free Book Publishing & Reading Platform</p>
      
      </div>

      <div className="mb-8 max-w-2xl mx-auto">
        <div className={`relative group transition-all duration-300 ${searchFocused ? 'ring-2 ring-blue-500 shadow-lg' : 'shadow-md'}`}>
          <div className="relative flex items-center bg-white rounded-lg overflow-hidden">
            <Search 
              className={`absolute left-3 transition-colors duration-300 ${searchFocused ? 'text-blue-500' : 'text-gray-400'}`} 
              size={20} 
            />
            <input
              type="text"
              placeholder="Search by title, author, genre, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full px-4 py-3 pl-10 pr-10 border-none focus:outline-none focus:ring-0 placeholder-gray-400"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 group"
                aria-label="Clear search"
              >
                <X 
                  className="text-gray-400 group-hover:text-gray-600 transition-colors duration-200" 
                  size={18} 
                />
              </button>
            )}
          </div>
          
          {/* Search stats */}
          {searchTerm && (
            <div className="absolute -bottom-6 left-0 text-sm text-gray-500">
              Found {filteredBooks.length} {filteredBooks.length === 1 ? 'result' : 'results'}
            </div>
          )}
        </div>
      </div>

      {/* Continue Reading Section */}
      {isAuthenticated && continueReading.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Continue Reading</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {continueReading.map((book) => (
              <div 
                key={book.id}
                className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative group"
              >
                <Link to={`/book/${book.id}`}>
                  <img 
                    src={`http://localhost:3001/${book.thumbnail_url}`} 
                    alt={book.title} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{book.title}</h3>
                    <p className="text-gray-600">by {book.author_name}</p>
                  </div>
                </Link>
                <button
                  onClick={(e) => removeReadingProgress(book.id, e)}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  title="Remove from Continue Reading"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredBooks.map((book) => (
          <div 
            key={book.id} 
            onClick={() => handleCardClick(book.id)}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group relative"
          >
            <div className="aspect-w-3 aspect-h-4 relative">
              <img
                src={`http://localhost:3001/${book.thumbnail_url}`}
                alt={book.title}
                className="object-cover w-full h-full"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
                }}
              />
              
              {isAuthenticated && (
                <div className="absolute top-2 right-2 flex gap-2">
                  {user?.id === book.user_id && (
                    <button
                      onClick={(e) => handleDelete(book.id, e)}
                      className="p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                      title="Delete book"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => handleAddToShelf(book.id, e)}
                    className="p-2 bg-blue-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-700"
                    title={bookshelfStatus[book.id] ? "Remove from shelf" : "Add to shelf"}
                  >
                    {bookshelfStatus[book.id] ? (
                      <BookmarkCheck size={18} />
                    ) : (
                      <BookmarkPlus size={18} />
                    )}
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                {highlightText(book.title, searchTerm)}
              </h3>
              
              <p className="text-sm text-gray-600 mb-2">
                by {highlightText(book.author_name, searchTerm)}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="inline-block px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded">
                  {highlightText(book.genre, searchTerm)}
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                {highlightText(book.description, searchTerm)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          {searchTerm ? (
            <p className="text-xl text-gray-600">No books found matching your search.</p>
          ) : (
            <>
              <p className="text-xl text-gray-600">No books published yet.</p>
              {isAuthenticated && (
                <p className="mt-4 text-gray-600">
                  Be the first to{' '}
                  <Link to="/publish" className="text-blue-600 hover:text-blue-800">
                    Publish a Book
                  </Link>
                  !
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;