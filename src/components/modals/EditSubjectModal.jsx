import React, { useState, useEffect } from 'react';

export default function EditSubjectModal({ isOpen, onClose, onSubmit, subject }) {
  const [formData, setFormData] = useState({
    name: '',
    level: '',
    description: '',
    isActive: true
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name || '',
        level: subject.level || 'School',
        description: subject.description || '',
        isActive: subject.isActive !== false
      });
    }
  }, [subject]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    if (!formData.name.trim()) {
      setError('Subject name is required');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const result = await onSubmit(formData);
      
      if (result && result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-[#DEE8F1] w-full max-w-md rounded-lg shadow-lg">
        <div className="bg-gradient-to-r from-[#014482] to-[#0389BC] p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Edit Subject</h2>
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
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-[#014482] font-medium mb-1" htmlFor="name">
                Subject Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#DEE8F1] border border-[#014482] rounded focus:outline-none focus:ring-2 focus:ring-[#0389BC]"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-[#014482] font-medium mb-1" htmlFor="level">
                Level*
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#DEE8F1] border border-[#014482] rounded focus:outline-none focus:ring-2 focus:ring-[#0389BC]"
                required
              >
                <option value="School">School</option>
                <option value="O/L">O/L</option>
                <option value="A/L">A/L</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-[#014482] font-medium mb-1" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#DEE8F1] border border-[#014482] rounded focus:outline-none focus:ring-2 focus:ring-[#0389BC]"
                rows="3"
              ></textarea>
            </div>
            
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="mr-2 border-[#014482] focus:ring-[#0389BC]"
                />
                <span className="text-[#014482] font-medium">Active</span>
              </label>
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
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#0389BC] text-white rounded hover:bg-opacity-90 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}