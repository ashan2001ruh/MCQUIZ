import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
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
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            Privacy Policy
          </h1>
          
          <div className="text-gray-700 space-y-6 leading-relaxed">
            <p className="text-sm text-gray-500 mb-8">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-[#014482] mb-4">1. Introduction</h2>
              <p>
                Welcome to MCQuiz ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our educational quiz platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#014482] mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-[#018ABD] mb-3">2.1 Personal Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name, email address, and contact information</li>
                <li>Profile information including profile pictures</li>
                <li>Educational background and preferences</li>
                <li>Payment information for premium subscriptions</li>
                <li>Account credentials and authentication data</li>
              </ul>

              <h3 className="text-xl font-medium text-[#018ABD] mb-3 mt-6">2.2 Usage Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Quiz attempts, scores, and performance data</li>
                <li>Learning progress and study patterns</li>
                <li>Subject preferences and difficulty levels</li>
                <li>Time spent on quizzes and platform usage</li>
                <li>Device information and browser type</li>
              </ul>

              <h3 className="text-xl font-medium text-[#018ABD] mb-3 mt-6">2.3 Technical Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>IP address and location data</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Log files and system information</li>
                <li>Error reports and performance data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#014482] mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and maintain our educational services</li>
                <li>Personalize your learning experience and content</li>
                <li>Track your progress and provide performance analytics</li>
                <li>Process payments and manage subscriptions</li>
                <li>Send important updates and educational content</li>
                <li>Improve our platform and develop new features</li>
                <li>Ensure platform security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#014482] mb-4">4. Information Sharing and Disclosure</h2>
              <p className="mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Service Providers:</strong> With trusted third-party service providers who assist in operating our platform</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>Consent:</strong> With your explicit consent for specific purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#014482] mb-4">5. Data Security</h2>
              <p className="mb-4">
                We implement appropriate technical and organizational measures to protect your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Secure data storage and backup procedures</li>
                <li>Employee training on data protection practices</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#014482] mb-4">6. Your Rights and Choices</h2>
              <p className="mb-4">You have the following rights regarding your personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Cookies:</strong> Manage cookie preferences through browser settings</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#014482] mb-4">7. Children's Privacy</h2>
              <p>
                Our platform is designed for educational purposes and may be used by students under 13 years of age. We collect limited personal information from children and obtain parental consent when required by law. Parents can review, delete, or refuse further collection of their child's information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#014482] mb-4">8. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy and applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#014482] mb-4">9. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of our platform after such changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#014482] mb-4">10. Contact Us</h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Email:</strong> privacy@mcquiz.com</p>
                <p><strong>Phone:</strong> +9477898898</p>
                <p><strong>Address:</strong> MCQuiz Educational Platform</p>
                <p><strong>Website:</strong> www.mcquiz.com</p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              &copy; {new Date().getFullYear()} MCQuiz. All rights reserved.
            </p>
            <div className="mt-4 space-x-4">
              <Link to="/terms-of-use" className="text-[#018ABD] hover:text-[#014482]">
                Terms of Use
              </Link>
              <Link to="/" className="text-[#018ABD] hover:text-[#014482]">
                Home
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
