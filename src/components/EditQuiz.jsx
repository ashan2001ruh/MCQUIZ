
import React, { useState, useEffect } from 'react';
import Axios from 'axios';

export default function EditQuiz({ isOpen, onClose, onQuizUpdated, quiz }) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    timeLimit: 0,
    difficulty: 'Medium',
    passingScore: 60,
    subscriptionLevel: 'Basic',
    isActive: true,
    questions: []
  });

  useEffect(() => {
    if (isOpen) {
      fetchSubjects();
      
      if (quiz) {
        setFormData({
          title: quiz.quiz.title,
          description: quiz.quiz.description || '',
          subject: quiz.quiz.subject._id,
          timeLimit: quiz.quiz.timeLimit || 0,
          difficulty: quiz.quiz.difficulty || 'Medium',
          passingScore: quiz.quiz.passingScore || 60,
          subscriptionLevel: quiz.quiz.subscriptionLevel || 'Basic',
          isActive: quiz.quiz.isActive !== undefined ? quiz.quiz.isActive : true,
          questions: quiz.quiz.questions.map(q => ({
            question: q.question,
            options: [...q.options],
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || ''
          }))
        });
      }
    }
  }, [isOpen, quiz]);

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await Axios.get('/api/admin/subjects', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSubjects(response.data.subjects);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      setError('Failed to load subjects. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...formData.questions];
    const options = [...updatedQuestions[questionIndex].options];
    options[optionIndex] = value;
    updatedQuestions[questionIndex].options = options;
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options.push('');
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...formData.questions];
    const options = [...updatedQuestions[questionIndex].options];
    
    if (options.length <= 2) {
      return;
    }
    
    if (updatedQuestions[questionIndex].correctAnswer === optionIndex) {
      updatedQuestions[questionIndex].correctAnswer = 0;
    } else if (updatedQuestions[questionIndex].correctAnswer > optionIndex) {
      updatedQuestions[questionIndex].correctAnswer -= 1;
    }
    
    options.splice(optionIndex, 1);
    updatedQuestions[questionIndex].options = options;
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const addQuestion = () => {
    const newQuestion = {
      question: '',
      options: ['', ''],
      correctAnswer: 0,
      explanation: ''
    };
    
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion]
    });
  };

  const removeQuestion = (index) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions.splice(index, 1);
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Quiz title is required');
      return false;
    }
    
    if (!formData.subject) {
      setError('Subject is required');
      return false;
    }
    
    if (formData.questions.length === 0) {
      setError('At least one question is required');
      return false;
    }
    
    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      
      if (!q.question.trim()) {
        setError(`Question ${i + 1} text is required`);
        return false;
      }
      
      if (q.options.length < 2) {
        setError(`Question ${i + 1} must have at least 2 options`);
        return false;
      }
      
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          setError(`Option ${j + 1} in Question ${i + 1} cannot be empty`);
          return false;
        }
      }
      
      if (q.correctAnswer === undefined || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
        setError(`Question ${i + 1} has an invalid correct answer index`);
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('authToken');
      await Axios.put(`/api/admin/quizzes/${quiz.quiz._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSuccess('Quiz updated successfully!');
      setLoading(false);
      
      setTimeout(() => {
        onQuizUpdated();
      }, 1500);
      
    } catch (error) {
      console.error('Failed to update quiz:', error);
      setError(error.response?.data?.message || 'Failed to update quiz. Please try again.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-[#DEE8F1] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg flex flex-col">
        <div className="bg-gradient-to-r from-[#014482] to-[#0389BC] p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Edit Quiz</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            ×
          </button>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3 text-[#014482] pb-2">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#014482] font-medium mb-1">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border bg-[#DEE8F1] border-[#014482] rounded focus:outline-none focus:ring-2 focus:ring-[#0389BC]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-[#014482] font-medium mb-1">
                    Subject *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[#DEE8F1] border border-[#014482] rounded focus:outline-none focus:ring-2 focus:ring-[#0389BC]"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name} ({subject.level})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-[#014482] font-medium mb-1">
                    Time Limit (minutes, 0 for no limit)
                  </label>
                  <input
                    type="number"
                    name="timeLimit"
                    value={formData.timeLimit}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 bg-[#DEE8F1] border border-[#014482] rounded focus:outline-none focus:ring-2 focus:ring-[#0389BC]"
                  />
                </div>
                
                <div>
                  <label className="block text-[#014482] font-medium mb-1">
                    Difficulty
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border bg-[#DEE8F1] border-[#014482] rounded focus:outline-none focus:ring-2 focus:ring-[#0389BC]"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[#014482] font-medium mb-1">
                    Subscription Level *
                  </label>
                  <select
                    name="subscriptionLevel"
                    value={formData.subscriptionLevel}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border bg-[#DEE8F1] border-[#014482] rounded focus:outline-none focus:ring-2 focus:ring-[#0389BC]"
                  >
                              <option value="Basic">Basic</option>
          <option value="School Pro">School Pro</option>
          <option value="O/L Pro">O/L Pro</option>
          <option value="A/L Pro">A/L Pro</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[#014482] font-medium mb-1">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    name="passingScore"
                    value={formData.passingScore}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 bg-[#DEE8F1] border border-[#014482] rounded focus:outline-none focus:ring-2 focus:ring-[#0389BC]"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#0389BC] border-gray-300 rounded focus:ring-[#0389BC]"
                  />
                  <label className="ml-2 text-[#014482] opacity-80 font-medium">
                    Active (visible to users)
                  </label>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-[#014482] font-medium mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 bg-[#DEE8F1] border border-[#014482] rounded focus:outline-none focus:ring-2 focus:ring-[#0389BC]"
                ></textarea>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-[#014482] pb-2">
                  Questions
                </h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="bg-[#014482]  text-white px-4 py-2 rounded hover:bg-opacity-90 flex items-center"
                >
                  <span className="mr-1">+</span> Add Question
                </button>
              </div>
              
              {formData.questions.length === 0 ? (
                <div className="bg-[#DEE8F1] p-6 rounded-lg border border-[#014482] text-center text-gray-500">
                  <p>
                    No questions added yet. Click "Add Question" to begin.
                  </p>
                </div>
              ) : (
                formData.questions.map((q, qIndex) => (
                  <div key={qIndex} className=" p-4 rounded-lg bg-[#DEE8F1] border  border-[#014482] mb-4 shadow-sm">
                    <div className="flex justify-between items-center mb-3 ">
                      <h4 className="font-medium text-[#014482]">
                        Question {qIndex + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[#014482] font-medium mb-1">
                          Question Text *
                        </label>
                        <textarea
                          value={q.question}
                          onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                          rows="2"
                          className="w-full px-3 py-2 bg-[#DEE8F1] border border-[#014482] rounded focus:outline-none focus:ring-2 focus:ring-[#0389BC]"
                          required
                        ></textarea>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-[#014482] font-medium">
                            Options *
                          </label>
                          <button
                            type="button"
                            onClick={() => addOption(qIndex)}
                            className="text-[#0389BC] hover:text-opacity-80 text-xs flex items-center"
                          >
                            <span className="mr-1">+</span> Add Option
                          </button>
                        </div>
                        
                        {q.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center mb-2">
                            <input
                              type="radio"
                              name={`correctAnswer-${qIndex}`}
                              checked={q.correctAnswer === oIndex}
                              onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)}
                              className="h-4 w-4 text-[#0389BC] border-gray-300 focus:ring-[#0389BC]"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                              className="ml-2 flex-1 px-3 py-2 bg-[#DEE8F1] border border-[#014482] rounded focus:outline-none focus:ring-2 focus:ring-[#0389BC]"
                              placeholder={`Option ${oIndex + 1}`}
                              required
                            />
                            {q.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOption(qIndex, oIndex)}
                                className="ml-2 text-red-500 hover:text-red-700"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                        <p className="text-[#014482] opacity-80 text-sm mt-1">
                          Select the radio button next to the correct answer.
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-[#014482] font-medium mb-1">
                          Explanation (Optional)
                        </label>
                        <textarea
                          value={q.explanation}
                          onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                          rows="2"
                          className="w-full px-3 py-2 bg-[#DEE8F1] border border-[#014482] rounded focus:outline-none focus:ring-2 focus:ring-[#0389BC]"
                          placeholder="Explain why the correct answer is right (shown after answering)"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                ))
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
                type="submit"
                className="px-4 py-2 bg-[#0389BC] text-white rounded hover:bg-opacity-90 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}