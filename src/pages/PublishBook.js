import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const PublishBook = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    thumbnail: null,
    pdf: null,
    additionalImages: []
  });
  
  const genres = [
    'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery',
    'Romance', 'Thriller', 'Horror', 'Biography', 'History', 'Science',
    'Technology', 'Self-Help', 'Poetry', 'Drama', 'Children', 'Investigative Report'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    
    if (name === 'additionalImages') {
      // Limit to 4 additional images
      const selectedFiles = Array.from(files).slice(0, 4);
      setFormData(prev => ({
        ...prev,
        additionalImages: selectedFiles
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Title is required';
    if (formData.description.length < 10) return 'Description must be at least 10 characters';
    if (!formData.genre) return 'Please select a genre';
    if (!formData.thumbnail) return 'Book thumbnail is required';
    if (!formData.pdf) return 'PDF file is required';
    
    // Validate file types
    if (!formData.thumbnail.type.startsWith('image/')) return 'Thumbnail must be an image file';
    if (formData.pdf.type !== 'application/pdf') return 'Book file must be a PDF';
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('genre', formData.genre);
      formDataToSend.append('thumbnail', formData.thumbnail);
      formDataToSend.append('pdf', formData.pdf);
      
      formData.additionalImages.forEach((image, index) => {
        formDataToSend.append(`image${index + 1}`, image);
      });

      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3001/api/books/publish', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error publishing book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Publish Your Book</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Book Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Genre *
          </label>
          <select
            name="genre"
            value={formData.genre}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select a genre</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Book Thumbnail *
          </label>
          <input
            type="file"
            name="thumbnail"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PDF File *
          </label>
          <input
            type="file"
            name="pdf"
            accept=".pdf"
            onChange={handleFileChange}
            className="w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Images (Up to 4)
          </label>
          <input
            type="file"
            name="additionalImages"
            accept="image/*"
            onChange={handleFileChange}
            multiple
            className="w-full"
            max="4"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Publishing...' : 'Publish Book'}
        </button>
      </form>
    </div>
  );
};

export default PublishBook;