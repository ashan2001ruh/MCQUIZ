import React from 'react';
import { motion } from 'framer-motion';

const Pricing = () => {
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
      title: 'Schol Pro',
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
    <div className="bg-[#DDE8F0] py-16"> {/* Outer background color */}
      <div className="max-w-[1240px] mx-auto px-6">
        {/* Header */}
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[#004581]">Choose the</span>{' '}
          <span className="text-[#018ABD]">Plan</span>
        </motion.h2>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className="flex flex-col justify-between rounded-lg shadow-lg p-6 text-center cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #97CBDC, #DDE8F0)', // Gradient background
                minWidth: '200px', // Fixed width for each card
                height: '500px', // Increased height for each card
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              whileHover={{
                scale: 1.05, // Slightly scale up on hover
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)', // Add shadow on hover
              }}
            >
              {/* Plan Title */}
              <h3 className="text-2xl font-semibold text-[#004581] mb-4">{plan.title}</h3>

              {/* Plan Price */}
              <p className="text-3xl font-bold text-[#018ABD] mb-6">{plan.price}</p>

              {/* Plan Features */}
              <ul className="text-left text-[#004581] mb-6 flex-1 overflow-y-auto"> {/* Scrollable features */}
                {plan.features.map((feature, i) => (
                  <li key={i} className="mb-4">
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Try Now Button */}
              <button
                className={`${plan.buttonColor} text-white font-semibold py-3 px-6 rounded-full transition-colors duration-300`}
              >
                {plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;