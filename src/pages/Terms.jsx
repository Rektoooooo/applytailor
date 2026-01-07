import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-warm-white">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/landing" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="ApplyTailor" className="w-11 h-11 object-contain" />
            <span className="text-xl font-bold text-charcoal">ApplyTailor</span>
          </Link>
          <Link to="/landing" className="flex items-center gap-2 text-slate-600 hover:text-teal-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Title */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-charcoal">Terms of Service</h1>
              <p className="text-slate-500">Last updated: January 2025</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <section className="card p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-charcoal mb-4">1. Acceptance of Terms</h2>
                <p className="text-slate-600 leading-relaxed">
                  By accessing or using ApplyTailor, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-charcoal mb-4">2. Description of Service</h2>
                <p className="text-slate-600 leading-relaxed">
                  ApplyTailor is an AI-powered CV tailoring service that helps users customize their resumes and cover letters for specific job applications. The service analyzes job descriptions and generates tailored content based on your profile information.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-charcoal mb-4">3. User Accounts</h2>
                <p className="text-slate-600 leading-relaxed">
                  You are responsible for:
                </p>
                <ul className="list-disc list-inside text-slate-600 mt-3 space-y-2">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Providing accurate and complete information</li>
                  <li>Notifying us of any unauthorized use of your account</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-charcoal mb-4">4. Credit System & Payments</h2>
                <p className="text-slate-600 leading-relaxed">
                  ApplyTailor operates on a credit-based system:
                </p>
                <ul className="list-disc list-inside text-slate-600 mt-3 space-y-2">
                  <li>New users receive 1 free credit</li>
                  <li>Additional credits can be purchased in packages</li>
                  <li>Credits never expire</li>
                  <li>Each CV generation consumes one credit</li>
                  <li>All purchases are final and non-refundable</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-charcoal mb-4">5. Acceptable Use</h2>
                <p className="text-slate-600 leading-relaxed">
                  You agree not to:
                </p>
                <ul className="list-disc list-inside text-slate-600 mt-3 space-y-2">
                  <li>Use the service for any illegal purpose</li>
                  <li>Submit false or misleading information</li>
                  <li>Attempt to gain unauthorized access to any part of the service</li>
                  <li>Use automated tools to access the service without permission</li>
                  <li>Share your account with others</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-charcoal mb-4">6. Content Ownership</h2>
                <p className="text-slate-600 leading-relaxed">
                  You retain ownership of all content you submit to ApplyTailor. By using our service, you grant us a limited license to process your content solely for the purpose of providing the service. Generated content (tailored CVs, cover letters) belongs to you.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-charcoal mb-4">7. AI-Generated Content</h2>
                <p className="text-slate-600 leading-relaxed">
                  The content generated by ApplyTailor is created using artificial intelligence. While we strive for accuracy:
                </p>
                <ul className="list-disc list-inside text-slate-600 mt-3 space-y-2">
                  <li>You are responsible for reviewing and editing generated content</li>
                  <li>We do not guarantee that AI-generated content is error-free</li>
                  <li>You should verify all information before using it in applications</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-charcoal mb-4">8. Limitation of Liability</h2>
                <p className="text-slate-600 leading-relaxed">
                  ApplyTailor is provided "as is" without warranties of any kind. We are not liable for:
                </p>
                <ul className="list-disc list-inside text-slate-600 mt-3 space-y-2">
                  <li>Job application outcomes</li>
                  <li>Accuracy of AI-generated content</li>
                  <li>Service interruptions or data loss</li>
                  <li>Any indirect, incidental, or consequential damages</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-charcoal mb-4">9. Termination</h2>
                <p className="text-slate-600 leading-relaxed">
                  We may terminate or suspend your account at any time for violation of these terms. You may delete your account at any time through the Settings page. Upon termination, your right to use the service ceases immediately.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-charcoal mb-4">10. Changes to Terms</h2>
                <p className="text-slate-600 leading-relaxed">
                  We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the service. Continued use of the service after changes constitutes acceptance of the new terms.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-charcoal mb-4">11. Contact</h2>
                <p className="text-slate-600 leading-relaxed">
                  For questions about these Terms of Service, please contact us at{' '}
                  <a href="mailto:sebastian.kucera@icloud.com" className="text-teal-600 hover:underline">
                    sebastian.kucera@icloud.com
                  </a>
                </p>
              </div>
            </section>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-4xl mx-auto px-6 flex justify-between items-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} ApplyTailor. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-teal-600 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-teal-600 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
