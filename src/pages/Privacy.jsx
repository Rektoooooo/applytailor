import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-warm-white">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/landing" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="ApplyTailor" className="w-11 h-11 object-contain rounded-xl" />
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
              <Shield className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-charcoal">Privacy Policy</h1>
              <p className="text-slate-500">Last updated: January 2025</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <section className="card p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-charcoal mb-4">1. Information We Collect</h2>
                <p className="text-slate-600 leading-relaxed">
                  When you use ApplyTailor, we collect information you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside text-slate-600 mt-3 space-y-2">
                  <li>Account information (email address, name)</li>
                  <li>Profile information (work experience, education, skills)</li>
                  <li>Job descriptions you submit for tailoring</li>
                  <li>Generated CVs and cover letters</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-charcoal mb-4">2. How We Use Your Information</h2>
                <p className="text-slate-600 leading-relaxed">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside text-slate-600 mt-3 space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Generate tailored CVs and cover letters</li>
                  <li>Process transactions and send related information</li>
                  <li>Send technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-charcoal mb-4">3. Data Storage & Security</h2>
                <p className="text-slate-600 leading-relaxed">
                  We implement appropriate security measures to protect your personal information. Your data is stored securely using industry-standard encryption and is hosted on secure cloud infrastructure. We do not sell, trade, or otherwise transfer your personal information to third parties.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-charcoal mb-4">4. AI Processing</h2>
                <p className="text-slate-600 leading-relaxed">
                  ApplyTailor uses artificial intelligence to analyze job descriptions and tailor your CV content. Your data may be processed by AI systems to provide our services. We do not use your personal data to train AI models beyond what is necessary to provide the service.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-charcoal mb-4">5. Your Rights</h2>
                <p className="text-slate-600 leading-relaxed">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-slate-600 mt-3 space-y-2">
                  <li>Access your personal data</li>
                  <li>Export your data at any time</li>
                  <li>Delete your account and all associated data</li>
                  <li>Opt out of marketing communications</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-charcoal mb-4">6. Cookies</h2>
                <p className="text-slate-600 leading-relaxed">
                  We use essential cookies to maintain your session and provide core functionality. We do not use tracking cookies for advertising purposes.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-charcoal mb-4">7. Third-Party Services</h2>
                <p className="text-slate-600 leading-relaxed">
                  We use the following third-party services:
                </p>
                <ul className="list-disc list-inside text-slate-600 mt-3 space-y-2">
                  <li>Supabase for authentication and data storage</li>
                  <li>Stripe for payment processing</li>
                  <li>Google OAuth for sign-in (optional)</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-charcoal mb-4">8. Contact Us</h2>
                <p className="text-slate-600 leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at{' '}
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
