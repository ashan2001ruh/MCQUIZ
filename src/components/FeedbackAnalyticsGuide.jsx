import React from 'react';
import { motion } from 'framer-motion';
import { AiOutlineInfoCircle, AiOutlineBulb, AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineBarChart } from 'react-icons/ai';

const FeedbackAnalyticsGuide = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-6">
        <AiOutlineInfoCircle className="text-[#018ABD]" size={24} />
        <h3 className="text-xl font-semibold text-[#004581]">
          Understanding Feedback Analytics
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Analysis Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200"
        >
          <h4 className="text-lg font-medium text-blue-800 mb-3 flex items-center gap-2">
            <AiOutlineBulb />
            Sentiment Analysis
          </h4>
          <div className="space-y-3 text-sm text-blue-700">
            <p>
              Our AI-powered sentiment analysis automatically categorizes feedback as positive or negative 
              using advanced machine learning algorithms.
            </p>
            <div className="flex items-center gap-2">
              <AiOutlineCheckCircle className="text-green-500" />
              <span><strong>Positive:</strong> Feedback expressing satisfaction, praise, or appreciation</span>
            </div>
            <div className="flex items-center gap-2">
              <AiOutlineCloseCircle className="text-red-500" />
              <span><strong>Negative:</strong> Feedback expressing dissatisfaction, complaints, or concerns</span>
            </div>
          </div>
        </motion.div>

        {/* Confidence Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200"
        >
          <h4 className="text-lg font-medium text-green-800 mb-3 flex items-center gap-2">
            <AiOutlineBarChart />
            Confidence Scores
          </h4>
          <div className="space-y-3 text-sm text-green-700">
            <p>
              Each sentiment prediction comes with a confidence score indicating how certain 
              the AI model is about its classification.
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">High (80%+)</span>
                <span>Very reliable prediction</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Medium (60-79%)</span>
                <span>Generally accurate</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Low (&lt;60%)</span>
                <span>May need manual review</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trends Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200"
        >
          <h4 className="text-lg font-medium text-purple-800 mb-3">
            Trend Analysis
          </h4>
          <div className="space-y-3 text-sm text-purple-700">
            <p>
              Track sentiment changes over time to identify patterns and measure improvement efforts.
            </p>
            <ul className="space-y-1">
              <li>• <strong>Weekly view:</strong> Daily sentiment breakdown</li>
              <li>• <strong>Monthly view:</strong> Track longer-term patterns</li>
              <li>• <strong>Quarterly view:</strong> Strategic overview</li>
            </ul>
          </div>
        </motion.div>

        {/* Action Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200"
        >
          <h4 className="text-lg font-medium text-orange-800 mb-3">
            Recommended Actions
          </h4>
          <div className="space-y-3 text-sm text-orange-700">
            <p>
              Use feedback insights to improve your platform:
            </p>
            <ul className="space-y-1">
              <li>• <strong>High negative sentiment:</strong> Immediate attention required</li>
              <li>• <strong>Low confidence scores:</strong> Manual review recommended</li>
              <li>• <strong>Declining trends:</strong> Investigate recent changes</li>
              <li>• <strong>Positive feedback:</strong> Identify and replicate successes</li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Best Practices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200"
      >
        <h4 className="text-lg font-medium text-gray-800 mb-3">
          Best Practices for Feedback Management
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Regular Monitoring</h5>
            <ul className="space-y-1">
              <li>• Check feedback daily for urgent issues</li>
              <li>• Review weekly trends for patterns</li>
              <li>• Export data monthly for deeper analysis</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Response Strategy</h5>
            <ul className="space-y-1">
              <li>• Prioritize negative feedback with high confidence</li>
              <li>• Use bulk actions for efficient management</li>
              <li>• Track resolution status with review markers</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FeedbackAnalyticsGuide;
