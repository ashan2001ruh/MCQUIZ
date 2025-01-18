import React from 'react';
import { motion } from 'framer-motion';

const Features = () => {
  const features = [
    {
      title: 'Comprehensive MCQ Bank',
      description: 'Access a vast MCQ collection organized by topics and difficulty levels.',
      icon: '📚',
    },
    {
      title: 'Time Target MCQs',
      description: 'Solve MCQs with a timer to enhance time management skills.',
      icon: '⏱️',
    },
    {
      title: 'Instant Answer Feedback',
      description: 'Receive immediate feedback at the end of each test, highlighting correct answers.',
      icon: '✅',
    },
    {
      title: 'Adaptive Suggestions',
      description: 'Get adaptive suggestions tailored to your unique learning needs.',
      icon: '🧠',
    },
    {
      title: 'Progress Tracking',
      description: 'Track your progress over time with detailed analytics and reports.',
      icon: '📊',
    },
    {
      title: 'Customizable Tests',
      description: 'Create custom tests based on your specific needs and preferences.',
      icon: '🛠️',
    },
  ];

  return (
    <div className="bg-[#DDE8F0] py-16 overflow-hidden"> {/* Outer background color */}
      <div className="max-w-[1240px] mx-auto px-6">
      <motion.h2
          className="text-4xl md:text-5xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[#004581]">Essential</span>{' '}
          <span className="text-[#018ABD]">Features</span>
        </motion.h2>
        <motion.div
          className="flex"
          animate={{
            x: ['0%', '-100%'], // Move from left to right
          }}
          transition={{
            duration: 10, // Adjust speed of movement
            repeat: Infinity, // Loop infinitely
            ease: 'linear', // Smooth linear movement
          }}
        >
          {/* Render cards twice for seamless looping */}
          {[...features, ...features].map((feature, index) => (
            <motion.div
              key={index}
              className="flex flex-col justify-center items-center rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300 mx-4"
              style={{
                background: 'linear-gradient(135deg, #97CBDC, #DDE8F0)', // Gradient background
                minWidth: '300px', // Fixed width for each card
                aspectRatio: '1 / 1', // Ensures the card is square
              }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-[#004581] mb-2 min-h-[72px] flex items-center justify-center">
                {feature.title}
              </h3>
              <p className="text-base text-[#018ABD]">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Features;