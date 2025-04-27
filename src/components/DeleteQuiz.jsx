import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const DeleteQuiz = ({ isOpen, onClose, quizId, quizTitle, onQuizDeleted }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleDeleteQuiz = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      
      await axios.delete(`http://localhost:3001/api/admin/quizzes/${quizId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setIsDeleting(false);
      toast.success('Quiz deleted successfully');
      onQuizDeleted();
      onClose();
    } catch (error) {
      setIsDeleting(false);
      console.error('Failed to delete quiz:', error);
      setError(error.response?.data?.message || 'Failed to delete quiz. Please try again.');
      toast.error('Failed to delete quiz');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-[#DEE8F1] w-full max-w-md rounded-lg shadow-lg">
        <div className="bg-gradient-to-r from-[#014482] to-[#0389BC] p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Confirm Delete</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-[#014482] mb-6">
            Are you sure you want to delete the quiz: <span className="font-medium">{quizTitle}</span>?
            This action cannot be undone.
          </p>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 border border-[#014482] text-[#014482] rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            
            <button
              onClick={handleDeleteQuiz}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center"
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                'Delete Quiz'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteQuiz;