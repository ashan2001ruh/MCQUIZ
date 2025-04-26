import React, { useState } from 'react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, subject }) {
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setError('');
    setIsDeleting(true);
    
    try {
      const result = await onConfirm();
      
      if (result && result.error) {
        setError(result.error);
        setIsDeleting(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsDeleting(false);
    }
  };

  if (!isOpen || !subject) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-[#DEE8F1] w-full max-w-md rounded-lg shadow-lg">
        <div className="bg-gradient-to-r from-[#014482] to-[#0389BC] p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Delete Subject</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="mb-6">
            <p className="text-[#014482] mb-2">
              Are you sure you want to delete the subject:
            </p>
            <p className="font-bold text-[#014482]">{subject.name} ({subject.level})</p>
            
            {subject.quizCount > 0 && (
              <div className="mt-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                <p className="font-bold">Warning:</p>
                <p>This subject has {subject.quizCount} associated quizzes. You may not be able to delete it.</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#014482] text-[#014482] rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}