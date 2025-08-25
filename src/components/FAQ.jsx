import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const FAQ = () => {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const faqData = [
    {
      question: "What is MCQuiz?",
      answer: "MCQuiz is an educational platform that provides comprehensive multiple choice question (MCQ) practice tests for Grade 5 Scholarship, O/L, and A/L exams. Our platform helps students prepare for their exams through interactive quizzes, performance tracking, and personalized learning recommendations."
    },
    {
      question: "How do I create an account?",
      answer: "Creating an account is simple! Click on the 'Sign Up' button in the top navigation, fill in your details including name, email, and password, and you'll be ready to start practicing. You can also sign up using your Google account for faster registration."
    },
    {
      question: "What subjects are available on MCQuiz?",
      answer: "We offer a wide range of subjects including Mathematics, Science, English, Sinhala, History, Geography, and more. Our question bank covers all major subjects for Grade 5 Scholarship, O/L, and A/L examinations with questions updated regularly to match current syllabi."
    },
    {
      question: "Is MCQuiz free to use?",
      answer: "MCQuiz offers both free and premium subscription options. The free tier provides access to basic quizzes and limited features. Our premium subscription unlocks all features including unlimited quizzes, detailed analytics, personalized recommendations, and priority support."
    },
    {
      question: "How do I track my progress?",
      answer: "Your progress is automatically tracked on our platform. You can view your quiz history, scores, improvement trends, and performance analytics in your dashboard. We provide detailed insights into your strengths and areas for improvement across different subjects."
    },
    {
      question: "Can I retake quizzes?",
      answer: "Yes! You can retake quizzes multiple times to improve your understanding and scores. Each attempt is recorded separately, allowing you to track your progress over time. This helps you identify areas where you need more practice."
    },
    {
      question: "How accurate are the quiz questions?",
      answer: "Our questions are carefully curated by experienced educators and subject matter experts. They are regularly reviewed and updated to ensure accuracy and alignment with current exam patterns and syllabi. However, we recommend cross-referencing with official sources for critical information."
    },
    {
      question: "What if I find an error in a question?",
      answer: "We strive for accuracy, but if you encounter any errors, please report them through our feedback system. You can use the feedback form on our platform or contact us directly. We review all reports and make corrections promptly."
    },
    {
      question: "How do I cancel my subscription?",
      answer: "You can cancel your subscription at any time through your account settings. Cancellation takes effect at the end of your current billing period. You'll continue to have access to premium features until the end of the period you've already paid for."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely! We take data security seriously. All personal information is encrypted, and we follow industry best practices for data protection. We never share your personal information with third parties without your explicit consent. Read our Privacy Policy for more details."
    },
    {
      question: "Can I use MCQuiz on mobile devices?",
      answer: "Yes! MCQuiz is fully responsive and works perfectly on all devices including smartphones, tablets, and desktop computers. You can practice quizzes anywhere, anytime, making it convenient for your study schedule."
    },
    {
      question: "How often are new questions added?",
      answer: "We regularly update our question bank with new questions based on current exam patterns and syllabi changes. New questions are added monthly, and we also update existing questions to ensure they remain relevant and accurate."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept various payment methods including credit cards, debit cards, and digital wallets. All payments are processed securely through trusted third-party payment providers to ensure your financial information is protected."
    },
    {
      question: "How can I get help if I have technical issues?",
      answer: "If you encounter any technical issues, you can contact our support team through multiple channels: email us at support@mcquiz.com, call us at +9477898898, or use the contact form on our website. We typically respond within 24 hours."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer refunds according to our refund policy. If you're not satisfied with our service within the first 7 days of your subscription, you can request a full refund. Please contact our support team for assistance with refund requests."
    }
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#014482] to-[#018ABD] rounded-xl flex items-center justify-center">
                <span className="text-2xl text-white font-bold">Q</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#014482] to-[#018ABD] bg-clip-text text-transparent">
                MCQuiz
              </h1>
            </Link>
            <Link
              to="/"
              className="bg-[#018ABD] text-white px-6 py-2 rounded-lg hover:bg-[#004581] transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Find answers to common questions about MCQuiz and how to make the most of your learning experience.
          </p>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqData.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <h3 className="text-lg font-semibold text-[#014482] pr-4">
                    {item.question}
                  </h3>
                  {openItems[index] ? (
                    <FaChevronUp className="text-[#018ABD] flex-shrink-0" />
                  ) : (
                    <FaChevronDown className="text-[#018ABD] flex-shrink-0" />
                  )}
                </button>
                {openItems[index] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 py-4 bg-white"
                  >
                    <p className="text-gray-700 leading-relaxed">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-12 p-6 bg-gradient-to-r from-[#014482] to-[#018ABD] rounded-xl text-white">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Still Have Questions?
            </h2>
            <p className="text-center mb-6 opacity-90">
              Can't find what you're looking for? Our support team is here to help!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <h3 className="font-semibold mb-2">Email Support</h3>
                <p className="opacity-90">support@mcquiz.com</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Phone Support</h3>
                <p className="opacity-90">+9477898898</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Response Time</h3>
                <p className="opacity-90">Within 24 hours</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Related Links
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/privacy-policy"
                className="text-[#018ABD] hover:text-[#014482] transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-of-use"
                className="text-[#018ABD] hover:text-[#014482] transition-colors"
              >
                Terms of Use
              </Link>
              <Link
                to="/courses"
                className="text-[#018ABD] hover:text-[#014482] transition-colors"
              >
                Start Learning
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              &copy; {new Date().getFullYear()} MCQuiz. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;
