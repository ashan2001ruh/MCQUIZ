import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineBarChart, AiOutlineTrendingUp, AiOutlineTrendingDown, AiOutlineCalendar } from 'react-icons/ai';

const SentimentTrendsDashboard = () => {
  const [trends, setTrends] = useState({});
  const [period, setPeriod] = useState('week'); // 'week', 'month', 'quarter'
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    fetchTrends();
  }, [period]);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `/api/feedback/trends?period=${period}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTrends(data.trends || {});
        setSummary(data.summary || {});
      }
    } catch (error) {
      console.error('Error fetching trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateKey) => {
    if (period === 'quarter') {
      return dateKey; // Already formatted as "2024-W12"
    }
    const [year, month, day] = dateKey.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      ...(period === 'month' ? { year: 'numeric' } : {})
    });
  };

  const calculatePercentage = (positive, total) => {
    return total > 0 ? ((positive / total) * 100).toFixed(1) : 0;
  };

  const getTrendDirection = () => {
    const dates = Object.keys(trends).sort();
    if (dates.length < 2) return 'neutral';
    
    const recent = trends[dates[dates.length - 1]];
    const previous = trends[dates[dates.length - 2]];
    
    const recentPercentage = calculatePercentage(recent.positive, recent.total);
    const previousPercentage = calculatePercentage(previous.positive, previous.total);
    
    if (recentPercentage > previousPercentage) return 'up';
    if (recentPercentage < previousPercentage) return 'down';
    return 'neutral';
  };

  const overallSentiment = Object.values(trends).reduce(
    (acc, day) => ({
      positive: acc.positive + day.positive,
      negative: acc.negative + day.negative,
      total: acc.total + day.total
    }),
    { positive: 0, negative: 0, total: 0 }
  );

  const trendDirection = getTrendDirection();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-[#004581] flex items-center gap-2">
          <AiOutlineBarChart />
          Sentiment Trends Analysis
        </h3>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#018ABD]"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-[#018ABD] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading trends...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{overallSentiment.total}</div>
              <div className="text-sm text-blue-600">Total Feedback</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {calculatePercentage(overallSentiment.positive, overallSentiment.total)}%
              </div>
              <div className="text-sm text-green-600">Positive Rate</div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {summary.avgFeedbackPerDay ? summary.avgFeedbackPerDay.toFixed(1) : '0'}
              </div>
              <div className="text-sm text-purple-600">Avg per Day</div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-orange-600">
                  {trendDirection === 'up' ? (
                    <AiOutlineTrendingUp className="text-green-500" />
                  ) : trendDirection === 'down' ? (
                    <AiOutlineTrendingDown className="text-red-500" />
                  ) : (
                    <AiOutlineCalendar className="text-gray-500" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-orange-600">
                    {trendDirection === 'up' ? 'Improving' : 
                     trendDirection === 'down' ? 'Declining' : 'Stable'}
                  </div>
                  <div className="text-xs text-orange-600">Trend</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trends Chart */}
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-800 mb-4">Sentiment Over Time</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              {Object.keys(trends).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No data available for the selected period
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(trends)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([date, data]) => {
                      const positivePercentage = calculatePercentage(data.positive, data.total);
                      const negativePercentage = calculatePercentage(data.negative, data.total);
                      
                      return (
                        <motion.div
                          key={date}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-4"
                        >
                          <div className="w-20 text-sm font-medium text-gray-700">
                            {formatDate(date)}
                          </div>
                          
                          <div className="flex-1 bg-white rounded-lg p-3 border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                {data.total} feedback{data.total !== 1 ? 's' : ''}
                              </span>
                              <span className="text-sm text-gray-500">
                                {positivePercentage}% positive
                              </span>
                            </div>
                            
                            <div className="flex h-6 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="bg-green-500 transition-all duration-300"
                                style={{ width: `${positivePercentage}%` }}
                              />
                              <div
                                className="bg-red-500 transition-all duration-300"
                                style={{ width: `${negativePercentage}%` }}
                              />
                            </div>
                            
                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                              <span>{data.positive} positive</span>
                              <span>{data.negative} negative</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Insights */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-lg font-medium text-blue-800 mb-2">Key Insights</h4>
            <div className="space-y-2 text-sm text-blue-700">
              {overallSentiment.total === 0 ? (
                <p>No feedback data available for analysis.</p>
              ) : (
                <>
                  <p>
                    • Overall satisfaction rate: {calculatePercentage(overallSentiment.positive, overallSentiment.total)}% 
                    ({overallSentiment.positive} positive out of {overallSentiment.total} total)
                  </p>
                  {summary.avgFeedbackPerDay && (
                    <p>
                      • Average daily feedback: {summary.avgFeedbackPerDay.toFixed(1)} submissions
                    </p>
                  )}
                  <p>
                    • Trend direction: {
                      trendDirection === 'up' ? 'Sentiment is improving over time' :
                      trendDirection === 'down' ? 'Sentiment is declining - attention needed' :
                      'Sentiment remains stable'
                    }
                  </p>
                  {overallSentiment.negative > 0 && (
                    <p>
                      • Action needed: {overallSentiment.negative} negative feedback items require review
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SentimentTrendsDashboard;
