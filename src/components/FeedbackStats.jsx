import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineMessage, AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';

const FeedbackStats = () => {
  const [stats, setStats] = useState({
    overall: { positive: 0, negative: 0, total: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/feedback/public-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#DDE8F0] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[#018ABD] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading community insights...</p>
          </div>
        </div>
      </div>
    );
  }

  const satisfactionRate = stats.overall.total > 0 
    ? ((stats.overall.positive / stats.overall.total) * 100).toFixed(1) 
    : 0;

  return (
    <div className="bg-[#DDE8F0] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#004581] mb-4">
            Community Insights
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See what our users are saying about MCQuiz. We value every piece of feedback to make your learning experience better.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-blue-50 p-6 rounded-xl text-center"
          >
            <div className="flex justify-center mb-3">
              <AiOutlineMessage className="text-blue-500" size={32} />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.overall.total.toLocaleString()}
            </div>
            <div className="text-blue-600 font-medium">Total Feedback</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-green-50 p-6 rounded-xl text-center"
          >
            <div className="flex justify-center mb-3">
              <AiOutlineCheckCircle className="text-green-500" size={32} />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.overall.positive.toLocaleString()}
            </div>
            <div className="text-green-600 font-medium">Positive</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-red-50 p-6 rounded-xl text-center"
          >
            <div className="flex justify-center mb-3">
              <AiOutlineCloseCircle className="text-red-500" size={32} />
            </div>
            <div className="text-3xl font-bold text-red-600 mb-2">
              {stats.overall.negative.toLocaleString()}
            </div>
            <div className="text-red-600 font-medium">Negative</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-purple-50 p-6 rounded-xl text-center"
          >
            <div className="flex justify-center mb-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">%</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {satisfactionRate}%
            </div>
            <div className="text-purple-600 font-medium">Satisfaction Rate</div>
          </motion.div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Join thousands of students who have shared their experience with MCQuiz
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackStats;
