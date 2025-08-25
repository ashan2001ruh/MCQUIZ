import React, { useState, useEffect } from 'react';
import Axios from 'axios';

const AddQuiz = ({ isOpen, onClose, onQuizAdded }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    subject: '',
    timeLimit: 0,
    passingScore: 60,
    difficulty: 'Medium',
    subscriptionLevel: 'Basic',
    questions: [createEmptyQuestion()]
  });

  function createEmptyQuestion() {
    return {
      question: '',
      options: ['', ''],
      correctAnswer: 0,
      explanation: ''
    };
  }

  useEffect(() => {
    if (isOpen) {
      fetchSubjects();
    }
  }, [isOpen]);

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await Axios.get('/api/admin/subjects', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSubjects(response.data.subjects || []);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      setError('Failed to load subjects. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuizData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[index][field] = value;
    setQuizData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuizData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[questionIndex].options.push('');
    setQuizData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...quizData.questions];
    if (updatedQuestions[questionIndex].options.length <= 2) return;
    
    const currentCorrectAnswer = updatedQuestions[questionIndex].correctAnswer;
    if (optionIndex === currentCorrectAnswer) {
      updatedQuestions[questionIndex].correctAnswer = 0;
    } else if (optionIndex < currentCorrectAnswer) {
      updatedQuestions[questionIndex].correctAnswer -= 1;
    }
    
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    setQuizData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const addQuestion = () => {
    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, createEmptyQuestion()]
    }));
  };

  const removeQuestion = (index) => {
    if (quizData.questions.length <= 1) return;
    
    const updatedQuestions = [...quizData.questions];
    updatedQuestions.splice(index, 1);
    setQuizData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await Axios.post('/api/admin/quizzes', quizData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSuccess('Quiz created successfully!');
      resetForm();
      
      if (onQuizAdded) {
        onQuizAdded(response.data.quiz);
      }
      
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Failed to create quiz:', error);
      setError(error.response?.data?.message || 'Failed to create quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setQuizData({
      title: '',
      description: '',
      subject: '',
      timeLimit: 0,
      passingScore: 60,
      difficulty: 'Medium',
      subscriptionLevel: 'Basic',
      questions: [createEmptyQuestion()]
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-[#DEE8F1] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg flex flex-col">
        <div className="bg-gradient-to-r from-[#014482] to-[#0389BC] p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Create New Quiz</h2>
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
                    id="title"
                    name="title"
                    value={quizData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-[#DEE8F1] border border-[#014482] rounded focus:outline-none focus:ring-2 focus:ring-[#0389BC]"
                  />
                </div>
                
                <div>
                  <label className="block text-[#014482] font-medium mb-1">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={quizData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-[#DEE8F1] border border-[#014482] rounded focus:outline-none focus:ring-2 focus:ring-[#0389BC]"
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
                    id="timeLimit"
                    name="timeLimit"
                    min="0"
                    value={quizData.timeLimit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#DEE8F1] border border-[#014482] rounded focus:outline-none focus:ring-2 focus:ring-[#0389BC]"
                  />
                </div>
                
                <div>
                  <label className="block text-[#014482] font-medium mb-1">
                    Difficulty
                  </label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={quizData.difficulty}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#DEE8F1] border border-[#014482] rounded focus:outline-none focus:ring-2 focus:ring-[#0389BC]"
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
                    id="subscriptionLevel"
                    name="subscriptionLevel"
                    value={quizData.subscriptionLevel}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-[#DEE8F1] border border-[#014482] rounded focus:outline-none focus:ring-2 focus:ring-[#0389BC]"
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
                    id="passingScore"
                    name="passingScore"
                    min="0"
                    max="100"
                    value={quizData.passingScore}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#DEE8F1] border border-[#014482] rounded focus:outline-none focus:ring-2 focus:ring-[#0389BC]"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-[#014482] font-medium mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={quizData.description}
                  onChange={handleInputChange}
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
                  className="bg-[#014482] text-white px-4 py-2 rounded hover:bg-opacity-90 flex items-center"
                >
                  <span className="mr-1">+</span> Add Question
                </button>
              </div>
              
              {quizData.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="p-4 rounded-lg bg-[#DEE8F1] border border-[#014482] mb-4 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-[#014482]">
                      Question {questionIndex + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeQuestion(questionIndex)}
                      disabled={quizData.questions.length <= 1}
                      className={`text-red-500 hover:text-red-700 text-sm ${quizData.questions.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                        value={question.question}
                        onChange={(e) => handleQuestionChange(questionIndex, 'question', e.target.value)}
                        rows="2"
                        required
                        className="w-full px-3 py-2 bg-[#DEE8F1] border border-[#014482] rounded focus:outline-none focus:ring-2 focus:ring-[#0389BC]"
                      ></textarea>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-[#014482] font-medium">
                          Options *
                        </label>
                        <button
                          type="button"
                          onClick={() => addOption(questionIndex)}
                          className="text-[#0389BC] hover:text-opacity-80 text-xs flex items-center"
                        >
                          <span className="mr-1">+</span> Add Option
                        </button>
                      </div>
                      
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center mb-2">
                          <input
                            type="radio"
                            id={`q${questionIndex}-correct-${optionIndex}`}
                            name={`q${questionIndex}-correct`}
                            checked={question.correctAnswer === optionIndex}
                            onChange={() => handleQuestionChange(questionIndex, 'correctAnswer', optionIndex)}
                            className="h-4 w-4 text-[#0389BC] border-gray-300 focus:ring-[#0389BC]"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                            placeholder={`Option ${optionIndex + 1}`}
                            required
                            className="ml-2 flex-1 px-3 py-2 bg-[#DEE8F1] border border-[#014482] rounded focus:outline-none focus:ring-2 focus:ring-[#0389BC]"
                          />
                          {question.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(questionIndex, optionIndex)}
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
                        value={question.explanation}
                        onChange={(e) => handleQuestionChange(questionIndex, 'explanation', e.target.value)}
                        rows="2"
                        className="w-full px-3 py-2 bg-[#DEE8F1] border border-[#014482] rounded focus:outline-none focus:ring-2 focus:ring-[#0389BC]"
                        placeholder="Explain why the correct answer is right (shown after answering)"
                      ></textarea>
                    </div>
                  </div>
                </div>
              ))}
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
                disabled={loading}
                className="px-4 py-2 bg-[#0389BC] text-white rounded hover:bg-opacity-90 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Quiz'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddQuiz;