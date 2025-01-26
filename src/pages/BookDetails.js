import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isInBookshelf, setIsInBookshelf] = useState(false);

  useEffect(() => {
    fetchBookDetails();
    
    if (isAuthenticated) {
      checkBookshelfStatus();
    }
  }, [id, isAuthenticated]);

  const fetchBookDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/books/${id}`);
      setBook(response.data);
      setSelectedImage(response.data.thumbnail_url);
    } catch (err) {
      setError('Failed to fetch book details');
      console.error('Error fetching book details:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkBookshelfStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/api/bookshelf/check/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsInBookshelf(response.data.isInShelf);
    } catch (err) {
      console.error('Error checking bookshelf status:', err);
    }
  };

  const handleAddToBookshelf = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3001/api/bookshelf/add', 
        { bookId: id }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsInBookshelf(true);
    } catch (err) {
      console.error('Error adding book to shelf:', err);
    }
  };

  const handleRemoveFromBookshelf = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/api/bookshelf/remove/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsInBookshelf(false);
    } catch (err) {
      console.error('Error removing book from shelf:', err);
    }
  };

  const handleReadBook = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3001/api/reading-progress', 
        { bookId: id }, 
        { 
          headers: { 
            Authorization: `Bearer ${token}` 
          } 
        }
      );
      window.open(`http://localhost:3001/${book.pdf_url}`, '_blank');
    } catch (error) {
      console.error('Failed to update reading progress', error);
      window.open(`http://localhost:3001/${book.pdf_url}`, '_blank');
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const getAdditionalImages = () => {
    if (!book) return [];
    return [
      book.image1_url,
      book.image2_url,
      book.image3_url,
      book.image4_url
    ].filter(Boolean);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-xl text-gray-600">Loading book details...</div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error || 'Book not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-gray-600 hover:text-gray-900 flex items-center"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column - Images */}
        <div>
          <div className="mb-4">
            <img
              src={`http://localhost:3001/${selectedImage}`}
              alt={book.title}
              className="w-full rounded-lg shadow-md cursor-pointer"
              onClick={() => handleImageClick(selectedImage)}
            />
          </div>

          {/* Thumbnail gallery */}
          <div className="grid grid-cols-5 gap-2">
            <div
              className={`cursor-pointer rounded-md overflow-hidden ${
                selectedImage === book.thumbnail_url ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedImage(book.thumbnail_url)}
            >
              <img
                src={`http://localhost:3001/${book.thumbnail_url}`}
                alt="Thumbnail"
                className="w-full h-20 object-cover"
              />
            </div>
            {getAdditionalImages().map((imageUrl, index) => (
              <div
                key={index}
                className={`cursor-pointer rounded-md overflow-hidden ${
                  selectedImage === imageUrl ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedImage(imageUrl)}
              >
                <img
                  src={`http://localhost:3001/${imageUrl}`}
                  alt={`Book image ${index + 1}`}
                  className="w-full h-20 object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right column - Details */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{book.title}</h1>
          
          <div className="mb-4">
            <span className="text-lg text-gray-600">by </span>
            <span className="text-lg font-semibold">{book.author_name}</span>
          </div>

          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
              {book.genre}
            </span>
          </div>

          <div className="prose max-w-none mb-8">
            <h2 className="text-xl font-semibold mb-2">Description:</h2>
            <p className="text-gray-600 whitespace-pre-line">{book.description}</p>
          </div>

          {!isAuthenticated ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-yellow-700">
                Please log in to read this book.
              </p>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <button
                onClick={handleReadBook}
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Read Book
              </button>
              
              {isInBookshelf ? (
                <button
                  onClick={handleRemoveFromBookshelf}
                  className="inline-block px-6 py-3 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                >
                  Remove from Bookshelf
                </button>
              ) : (
                <button
                  onClick={handleAddToBookshelf}
                  className="inline-block px-6 py-3 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
                >
                  Add to Bookshelf
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setShowImageModal(false)}
        >
          <div className="max-w-4xl max-h-screen p-4">
            <img
              src={`http://localhost:3001/${selectedImage}`}
              alt="Enlarged view"
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="mt-12 border-t pt-8">
        <CommentSection bookId={id} authorId={book.user_id} />
      </div>
    </div>
  );
};

export default BookDetails;