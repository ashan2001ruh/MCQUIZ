import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Pricing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const isLoggedIn = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch (error) {
      return false;
    }
  };

  const handleTryNow = async (planTitle) => {
    if (planTitle === 'Basic') {
      // For Basic plan, navigate directly to courses
      navigate('/courses');
      return;
    }

    if (!isLoggedIn()) {
      alert('Please login to access this plan');
      navigate('/login');
      return;
    }

    // For paid plans, initialize payment
    setLoading(true);
    setError(null);

    try {
      const planAmounts = {
        'School Pro': 1500,
        'O/L Pro': 2000,
        'A/L Pro': 2500
      };

      const amount = planAmounts[planTitle];
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/payment/initialize`,
        {
          planType: planTitle,
          amount: amount
        },
        {
          headers: getAuthHeader()
        }
      );

      if (response.data.success) {
        // Create PayHere form and submit
        const paymentData = response.data.paymentData;
        
        // Create a form to submit to PayHere
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://sandbox.payhere.lk/pay/checkout'; // Sandbox URL
        
        // Add all payment data as hidden fields
        Object.keys(paymentData).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = paymentData[key];
          form.appendChild(input);
        });
        
        // Submit the form
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
      }
    } catch (err) {
      console.error('Payment initialization error:', err);
      setError('Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
    },
    {
      title: 'School Pro',
      price: 'Rs. 1500',
      features: [
        'Tailored for students preparing for the Grade 5 Scholarship exam.',
        'Learn by answering questions one at a time with immediate feedback.',
        'Take full tests with time limits to improve time management.',
      ],
      buttonText: 'TRY NOW',
      buttonColor: 'bg-[#018ABD] text-white font-semibold px-6 py-2 rounded-2xl text-sm hover:bg-[#005fa3] transition duration-200'
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
      buttonColor: 'bg-[#018ABD] text-white font-semibold px-6 py-2 rounded-2xl text-sm hover:bg-[#005fa3] transition duration-200'
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
      buttonColor: 'bg-[#018ABD] text-white font-semibold px-6 py-2 rounded-2xl text-sm hover:bg-[#005fa3] transition duration-200'
    },
  ];

  return (
    <div className="bg-[#DDE8F0] py-16">
      <div className="max-w-[1240px] mx-auto px-6">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[#004581]">Choose the</span>{' '}
          <span className="text-[#018ABD]">Plan</span>
        </motion.h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className="flex flex-col justify-between rounded-lg shadow-lg p-6 text-center cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #97CBDC, #DDE8F0)',
                minWidth: '200px',
                height: '500px',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
              }}
            >
              <h3 className="text-2xl font-semibold text-[#004581] mb-4">{plan.title}</h3>
              <p className="text-3xl font-bold text-[#018ABD] mb-6">{plan.price}</p>
              <ul className="text-left text-[#004581] mb-6 flex-1 overflow-y-auto">
                {plan.features.map((feature, i) => (
                  <li key={i} className="mb-4">
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`${plan.buttonColor} text-white font-semibold py-3 px-6 rounded-full transition-colors duration-300 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => handleTryNow(plan.title)}
                disabled={loading}
              >
                {loading ? 'Processing...' : plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;