import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const [authToken, setAuthToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get auth token from localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
    }
  }, []);

  const plans = [
    {
      title: 'Basic',
      price: 'FREE',
      features: [
        'Access 10 questions from any exam to get a taste of the MCQ practice.',
        'Attempt one full-length test to assess your knowledge.',
      ],
      buttonText: 'TRY NOW',
      buttonColor: 'bg-[#018ABD] text-white font-semibold px-6 py-2 rounded-2xl text-sm hover:bg-[#005fa3] transition duration-200',
      amount: 0
    },
    {
      title: 'Schol Pro',
      price: 'Rs. 1500',
      features: [
        'Tailored for students preparing for the Grade 5 Scholarship exam.',
        'Learn by answering questions one at a time with immediate feedback.',
        'Take full tests with time limits to improve time management.',
      ],
      buttonText: 'TRY NOW',
      buttonColor: 'bg-[#018ABD] text-white font-semibold px-6 py-2 rounded-2xl text-sm hover:bg-[#005fa3] transition duration-200',
      amount: 1500
    },
    {
      title: 'O/L Pro',
      price: 'Rs. 2000',
      features: [
        'Built for students preparing for O/Ls, with specific subject-based MCQs.',
        'Answer MCQs with instant feedback to reinforce learning.',
        'Take subject-specific tests under timed conditions to practice time management.',
      ],
      buttonText: 'TRY NOW',
      buttonColor: 'bg-[#018ABD] text-white font-semibold px-6 py-2 rounded-2xl text-sm hover:bg-[#005fa3] transition duration-200',
      amount: 2000
    },
    {
      title: 'A/L Pro',
      price: 'Rs. 2500',
      features: [
        'Targeted for A/L students with categorized subject-based MCQs.',
        'Practice one question at a time with immediate correct answer feedback.',
        'Simulate real test conditions to build speed and accuracy.',
      ],
      buttonText: 'TRY NOW',
      buttonColor: 'bg-[#018ABD] text-white font-semibold px-6 py-2 rounded-2xl text-sm hover:bg-[#005fa3] transition duration-200',
      amount: 2500
    },
  ];

  const handlePlanSelection = async (plan) => {
    // For Basic plan, navigate directly to courses
    if (plan.title === 'Basic') {
      navigate('/courses');
      return;
    }

    // Check if user is logged in
    if (!authToken) {
      alert('Please login to subscribe to this plan');
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }

    try {
      setIsLoading(true);

      // Initialize payment
      const response = await axios.post(
        'http://localhost:3001/api/payment/initialize',
        {
          planType: plan.title,
          amount: plan.amount
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      const paymentData = response.data.paymentData;

      // Load PayHere script if not already loaded
      if (!window.payhere) {
        const script = document.createElement('script');
        script.src = 'https://www.payhere.lk/lib/payhere.js';
        script.async = true;
        script.onload = () => initializePayment(paymentData);
        document.body.appendChild(script);
      } else {
        initializePayment(paymentData);
      }
    } catch (error) {
      console.error('Error initializing payment:', error);
      alert('Failed to initialize payment. Please try again.');
      setIsLoading(false);
    }
  };

  const initializePayment = (paymentData) => {
    // Configure PayHere payment
    window.payhere.onCompleted = function onCompleted(orderId) {
      console.log('Payment completed. OrderID:' + orderId);
      alert('Payment successful!');
      navigate('/courses');
      setIsLoading(false);
    };

    window.payhere.onDismissed = function onDismissed() {
      console.log('Payment dismissed');
      setIsLoading(false);
    };

    window.payhere.onError = function onError(error) {
      console.log('Error:', error);
      alert('Payment error: ' + error);
      setIsLoading(false);
    };

    // Show the PayHere payment popup
    window.payhere.startPayment(paymentData);
  };

  return (
    <div className="bg-[#DDE8F0] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
          <span className="text-[#004581]">Choose the</span>{' '}
          <span className="text-[#018ABD]">Plan</span>
        </h2>
      </div>
      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            whileHover={{
              scale: 1.05,
              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
            }}
            className="flex flex-col justify-between bg-gradient-to-br from-[#97CBDC] to-[#DDE8F0] rounded-lg shadow-lg overflow-hidden h-[500px]"
          >
            {/* Plan Title */}
            <div className="py-4 px-6 text-center">
              <h3 className="text-2xl font-semibold text-[#004581]">{plan.title}</h3>
            </div>
            {/* Plan Price */}
            <div className="px-6 py-4 text-center">
              <p className="text-3xl font-bold text-[#018ABD]">{plan.price}</p>
            </div>
            {/* Plan Features */}
            <div className="px-6 py-4 flex-1">
              <div className="h-48 overflow-y-auto mb-6">
                {/* Scrollable features */}
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start mb-4">
                    <svg className="h-5 w-5 text-[#004581] mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="text-sm text-[#004581]">{feature}</p>
                  </div>
                ))}
              </div>
              {/* Try Now Button */}
              <button
                onClick={() => handlePlanSelection(plan)}
                disabled={isLoading}
                className={`w-full font-semibold py-3 px-6 rounded-full transition-colors duration-300 ${plan.buttonColor} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Processing...' : plan.buttonText}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
};

export default Pricing;