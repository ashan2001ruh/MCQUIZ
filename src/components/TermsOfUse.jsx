import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const TermsOfUse = () => {
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
            Terms of Use
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
              <h2 className="text-2xl font-semibold text-[#014482] mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using MCQuiz ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#014482] mb-4">2. Description of Service</h2>
              <p className="mb-4">
                MCQuiz is an educational platform that provides:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Multiple choice question (MCQ) practice tests</li>
                <li>Educational content for Grade 5 Scholarship, O/L, and A/L exams</li>
                <li>Performance tracking and analytics</li>
                <li>Personalized learning recommendations</li>
                <li>Progress monitoring and assessment tools</li>
                <li>Subscription-based premium features</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#014482] mb-4">3. User Accounts and Registration</h2>
              
              <h3 className="text-xl font-medium text-[#018ABD] mb-3">3.1 Account Creation</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must provide accurate and complete information during registration</li>
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>You must be at least 13 years old to create an account</li>
                <li>Parental consent may be required for users under 18</li>
              </ul>

              <h3 className="text-xl font-medium text-[#018ABD] mb-3 mt-6">3.2 Account Security</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are responsible for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
                <li>We reserve the right to suspend or terminate accounts for violations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#014482] mb-4">4. Acceptable Use Policy</h2>
              
              <h3 className="text-xl font-medium text-[#018ABD] mb-3">4.1 Permitted Uses</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Educational purposes and exam preparation</li>
                <li>Personal learning and skill development</li>
                <li>Legitimate academic research and study</li>
                <li>Sharing educational content with proper attribution</li>
              </ul>

              <h3 className="text-xl font-medium text-[#018ABD] mb-3 mt-6">4.2 Prohibited Activities</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Cheating, plagiarism, or academic dishonesty</li>
                <li>Sharing quiz answers or content with other users</li>
                <li>Attempting to hack or compromise the platform</li>
                <li>Creating multiple accounts to circumvent restrictions</li>
                <li>Using automated tools or bots to access the service</li>
                <li>Harassing, bullying, or inappropriate behavior</li>
                <li>Violating intellectual property rights</li>
                <li>Commercial use without authorization</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#014482] mb-4">5. Subscription and Payment Terms</h2>
              
              <h3 className="text-xl font-medium text-[#018ABD] mb-3">5.1 Subscription Plans</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Free tier with limited access to basic features</li>
                <li>Premium subscription with full access to all features</li>
                <li>Subscription fees are billed in advance</li>
                <li>Prices may change with 30 days notice</li>
              </ul>

              <h3 className="text-xl font-medium text-[#018ABD] mb-3 mt-6">5.2 Payment and Billing</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>All payments are processed securely through third-party providers</li>
                <li>Subscriptions automatically renew unless cancelled</li>
                <li>Refunds are provided according to our refund policy</li>
                <li>Failed payments may result in service suspension</li>
              </ul>

              <h3 className="text-xl font-medium text-[#018ABD] mb-3 mt-6">5.3 Cancellation</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>You may cancel your subscription at any time</li>
                <li>Cancellation takes effect at the end of the current billing period</li>
                <li>No refunds for partial months of service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#014482] mb-4">6. Intellectual Property Rights</h2>
              
              <h3 className="text-xl font-medium text-[#018ABD] mb-3">6.1 Our Content</h3>
              <p className="mb-3">
                All content on MCQuiz, including but not limited to questions, explanations, graphics, and software, is owned by MCQuiz or its licensors and is protected by copyright, trademark, and other intellectual property laws.
              </p>

              <h3 className="text-xl font-medium text-[#018ABD] mb-3 mt-6">6.2 User Content</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>You retain ownership of content you submit</li>
                <li>You grant us a license to use your content for platform operation</li>
                <li>You represent that you have rights to any content you submit</li>
                <li>We may remove content that violates these terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#014482] mb-4">7. Privacy and Data Protection</h2>
              <p>
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms of Use by reference.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#014482] mb-4">8. Disclaimers and Limitations</h2>
              
              <h3 className="text-xl font-medium text-[#018ABD] mb-3">8.1 Service Availability</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>We strive to maintain high availability but cannot guarantee uninterrupted service</li>
                <li>We may perform maintenance that temporarily affects availability</li>
                <li>We are not responsible for issues beyond our control</li>
              </ul>

              <h3 className="text-xl font-medium text-[#018ABD] mb-3 mt-6">8.2 Educational Content</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>While we strive for accuracy, we cannot guarantee error-free content</li>
                <li>Our platform is for educational purposes only</li>
                <li>We do not guarantee exam results or academic success</li>
                <li>Users should verify information from official sources</li>
              </ul>

              <h3 className="text-xl font-medium text-[#018ABD] mb-3 mt-6">8.3 Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by law, MCQuiz shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#014482] mb-4">9. Termination</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>We may terminate or suspend your account for violations of these terms</li>
                <li>You may terminate your account at any time</li>
                <li>Upon termination, your right to use the service ceases immediately</li>
                <li>Certain provisions survive termination</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#014482] mb-4">10. Governing Law and Disputes</h2>
              <p className="mb-4">
                These terms are governed by the laws of Sri Lanka. Any disputes shall be resolved through:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Good faith negotiations between parties</li>
                <li>Mediation if negotiations fail</li>
                <li>Legal proceedings in Sri Lankan courts if necessary</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#014482] mb-4">11. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of material changes via email or platform notification. Continued use after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#014482] mb-4">12. Contact Information</h2>
              <p className="mb-4">
                For questions about these Terms of Use, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Email:</strong> legal@mcquiz.com</p>
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
              <Link to="/privacy-policy" className="text-[#018ABD] hover:text-[#014482]">
                Privacy Policy
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

export default TermsOfUse;
