import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import {
  FileText,
  Target,
  Zap,
  Check,
  ArrowRight,
  Shield,
  Clock,
  BarChart3,
  Sparkles,
  MousePointer,
  Upload,
  Star,
  Quote,
  ChevronRight,
} from 'lucide-react';
import { LogoIcon } from '../components/Logo';

// Floating animation for mockup cards
const floatAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-8, 8, -8],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const floatAnimationDelayed = {
  initial: { y: 0 },
  animate: {
    y: [8, -8, 8],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Stagger children animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

// Product Mockup Component - Shows actual Results page UI
function ProductMockup() {
  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Main app window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative z-10 bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
      >
        {/* Window header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-3 py-0.5 bg-white rounded text-[10px] text-slate-400 border border-slate-200">
              applytailor.com/results
            </div>
          </div>
        </div>

        {/* App Header */}
        <div className="px-4 py-3 border-b border-slate-100 bg-white">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Application Results</div>
          <div className="font-semibold text-charcoal text-sm">Senior Product Designer at Stripe</div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50/50">
          <div className="bg-white rounded-lg p-2 border border-slate-100">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-gradient-to-br from-teal-400 to-teal-600 rounded-md flex items-center justify-center">
                <Target className="w-3 h-3 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-charcoal">87%</div>
                <div className="text-[8px] text-slate-400">Match</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-2 border border-slate-100">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-emerald-100 rounded-md flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-charcoal">8</div>
                <div className="text-[8px] text-slate-400">Covered</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-2 border border-slate-100">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-amber-100 rounded-md flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              </div>
              <div>
                <div className="text-sm font-bold text-charcoal">2</div>
                <div className="text-[8px] text-slate-400">Weak</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-2 border border-slate-100">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-red-100 rounded-md flex items-center justify-center">
                <div className="w-2 h-0.5 bg-red-500 rounded" />
              </div>
              <div>
                <div className="text-sm font-bold text-charcoal">1</div>
                <div className="text-[8px] text-slate-400">Missing</div>
              </div>
            </div>
          </div>
        </div>

        {/* Three Column Layout Preview */}
        <div className="grid grid-cols-12 gap-2 p-3">
          {/* Requirements Column */}
          <div className="col-span-3 space-y-1.5">
            <div className="text-[8px] text-slate-400 uppercase tracking-wider font-medium mb-1 flex items-center gap-1">
              <Target className="w-2.5 h-2.5 text-teal-500" />
              Requirements
            </div>
            <div className="p-1.5 bg-emerald-50 rounded border border-emerald-100 text-[8px] text-emerald-700 flex items-center gap-1">
              <Check className="w-2.5 h-2.5" /> Figma
            </div>
            <div className="p-1.5 bg-emerald-50 rounded border border-emerald-100 text-[8px] text-emerald-700 flex items-center gap-1">
              <Check className="w-2.5 h-2.5" /> User Research
            </div>
            <div className="p-1.5 bg-amber-50 rounded border border-amber-100 text-[8px] text-amber-700 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" /> A/B Testing
            </div>
            <div className="p-1.5 bg-emerald-50 rounded border border-emerald-100 text-[8px] text-emerald-700 flex items-center gap-1">
              <Check className="w-2.5 h-2.5" /> Prototyping
            </div>
          </div>

          {/* Tailored Bullets Column */}
          <div className="col-span-6">
            <div className="text-[8px] text-slate-400 uppercase tracking-wider font-medium mb-1 flex items-center gap-1">
              <FileText className="w-2.5 h-2.5 text-teal-500" />
              Tailored CV Bullets
            </div>

            {/* Bullet Card */}
            <div className="border-2 border-emerald-200 bg-emerald-50/30 rounded-lg overflow-hidden mb-2">
              <div className="p-2">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[7px] uppercase tracking-wider text-teal-600 font-medium">Tailored</span>
                  <span className="px-1 py-0.5 bg-emerald-100 text-emerald-700 text-[7px] rounded">Accepted</span>
                </div>
                <p className="text-[9px] text-charcoal leading-relaxed">
                  Led end-to-end design for payment flows, increasing conversion by <span className="font-semibold text-teal-600">23%</span> through user research and iterative prototyping
                </p>
              </div>
              <div className="bg-slate-50 px-2 py-1.5 border-t border-slate-100 flex items-center gap-1">
                <button className="p-1 bg-emerald-100 rounded text-emerald-600">
                  <Check className="w-2.5 h-2.5" />
                </button>
                <button className="p-1 hover:bg-slate-100 rounded text-slate-400">
                  <div className="w-2.5 h-0.5 bg-current rounded" />
                </button>
                <div className="flex-1" />
                <span className="text-[7px] text-slate-400">Rephrase</span>
              </div>
            </div>

            {/* Second bullet */}
            <div className="border border-slate-200 rounded-lg p-2">
              <div className="text-[7px] uppercase tracking-wider text-slate-400 mb-1">Tailored</div>
              <p className="text-[9px] text-charcoal leading-relaxed">
                Collaborated with cross-functional teams to deliver design systems used by <span className="font-semibold text-teal-600">50+</span> engineers
              </p>
            </div>
          </div>

          {/* Cover Letter Column */}
          <div className="col-span-3">
            <div className="text-[8px] text-slate-400 uppercase tracking-wider font-medium mb-1 flex items-center gap-1">
              <FileText className="w-2.5 h-2.5 text-teal-500" />
              Cover Letter
            </div>
            <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 h-20">
              <div className="space-y-1">
                <div className="h-1 bg-slate-200 rounded w-full" />
                <div className="h-1 bg-slate-200 rounded w-11/12" />
                <div className="h-1 bg-slate-200 rounded w-full" />
                <div className="h-1 bg-slate-200 rounded w-4/5" />
                <div className="h-1 bg-slate-200 rounded w-full" />
                <div className="h-1 bg-slate-200 rounded w-3/4" />
              </div>
            </div>
            <button className="mt-1.5 w-full py-1 bg-teal-500 text-white text-[8px] font-medium rounded flex items-center justify-center gap-1">
              <FileText className="w-2.5 h-2.5" />
              Export PDF
            </button>
          </div>
        </div>
      </motion.div>

      {/* Floating card - Keywords */}
      <motion.div
        variants={floatAnimation}
        initial="initial"
        animate="animate"
        className="absolute -left-12 top-16 z-20 bg-white rounded-xl shadow-xl shadow-slate-200/50 p-3 border border-slate-100"
      >
        <div className="text-[9px] uppercase tracking-wider text-slate-400 mb-2 font-medium">Keyword Coverage</div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] text-slate-600">Figma</span>
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= 3 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                ))}
              </div>
              <span className="text-[9px] text-slate-400">3x</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] text-slate-600">TypeScript</span>
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= 2 ? 'bg-amber-500' : 'bg-slate-200'}`} />
                ))}
              </div>
              <span className="text-[9px] text-slate-400">2x</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] text-slate-600">Research</span>
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= 4 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                ))}
              </div>
              <span className="text-[9px] text-slate-400">4x</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating card - Interview notification */}
      <motion.div
        variants={floatAnimationDelayed}
        initial="initial"
        animate="animate"
        className="absolute -right-6 bottom-24 z-20 bg-white rounded-xl shadow-xl shadow-slate-200/50 p-3 border border-slate-100"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-[10px] font-medium text-charcoal">Interview Request!</div>
            <div className="text-[9px] text-slate-500">Stripe · 2 min ago</div>
          </div>
        </div>
      </motion.div>

      {/* Decorative gradient blob */}
      <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-teal-200/30 via-emerald-200/20 to-transparent rounded-full blur-3xl" />
    </div>
  );
}

// Company logos for social proof
function CompanyLogos() {
  const companies = [
    { name: 'Google', logo: 'G' },
    { name: 'Meta', logo: 'M' },
    { name: 'Apple', logo: '' },
    { name: 'Microsoft', logo: 'M' },
    { name: 'Amazon', logo: 'a' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="py-12 border-y border-slate-100 bg-white"
    >
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-sm text-slate-400 mb-8">
          Trusted by job seekers who landed roles at
        </p>
        <div className="flex items-center justify-center gap-12 flex-wrap">
          {/* Google */}
          <svg className="h-7 text-slate-400" viewBox="0 0 272 92" fill="currentColor">
            <path d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
            <path d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
            <path d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"/>
            <path d="M225 3v65h-9.5V3h9.5z"/>
            <path d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"/>
            <path d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z"/>
          </svg>
          {/* Meta */}
          <svg className="h-6 text-slate-400" viewBox="0 0 500 100" fill="currentColor">
            <path d="M186.2 24.2c-5.4 0-10.1 2-14.8 7.6-3.5-5-8.3-7.6-14.8-7.6-4.6 0-8.7 1.6-12.4 5v-3.9h-11.9v49.5h12.4V46.5c0-7.4 4.3-11.8 10.3-11.8 5.7 0 9.3 4 9.3 10.6v29.5h12.4V46.5c0-7.4 4.3-11.8 10.3-11.8 5.7 0 9.3 4 9.3 10.6v29.5h12.4V43.5c0-12.1-7.3-19.3-17.5-19.3M247.9 58.8c-2.7 3.8-7 6.2-12.1 6.2-8.3 0-14.3-6.6-14.3-15.1s6-15.1 14.3-15.1c5.1 0 9.4 2.4 12.1 6.2l9.5-7c-5.1-6.7-13-10.7-21.6-10.7-16 0-27.1 11.7-27.1 26.6s11.1 26.6 27.1 26.6c8.6 0 16.5-4 21.6-10.7l-9.5-7M299.4 74.8V50.1c0-16.7-9.6-25.9-25.3-25.9-8.1 0-15.8 2.3-21.6 7.1l5.1 8.3c4.3-3.4 9.7-5.3 15.1-5.3 8.7 0 14.1 4.7 14.1 13v2.2c-4-2.9-10-4.5-16.5-4.5-11.6 0-21.3 5.8-21.3 17.3 0 10.8 9 17.3 20.1 17.3 7.3 0 13.9-2.7 17.7-7.4v6.6h12.6zm-12.5-14.5c-2.3 4.1-7.6 6.6-13.5 6.6-6.2 0-10.9-3.2-10.9-8.2 0-5.2 4.7-8.2 11.6-8.2 5.3 0 10.2 1.3 12.8 3.8v6z"/>
          </svg>
          {/* Apple */}
          <svg className="h-7 text-slate-400" viewBox="0 0 170 170" fill="currentColor">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.197-2.12-9.973-3.17-14.34-3.17-4.58 0-9.492 1.05-14.746 3.17-5.262 2.13-9.501 3.24-12.742 3.35-4.929.21-9.842-1.96-14.746-6.52-3.13-2.73-7.045-7.41-11.735-14.04-5.032-7.08-9.169-15.29-12.41-24.65-3.471-10.11-5.211-19.9-5.211-29.378 0-10.857 2.346-20.221 7.045-28.068 3.693-6.303 8.606-11.275 14.755-14.925s12.793-5.51 19.948-5.629c3.915 0 9.049 1.211 15.429 3.591 6.362 2.388 10.447 3.599 12.238 3.599 1.339 0 5.877-1.416 13.57-4.239 7.275-2.618 13.415-3.702 18.445-3.275 13.63 1.1 23.87 6.473 30.68 16.153-12.19 7.386-18.22 17.731-18.1 31.002.11 10.337 3.86 18.939 11.23 25.769 3.34 3.17 7.07 5.62 11.22 7.36-.9 2.61-1.85 5.11-2.86 7.51zM119.11 7.24c0 8.102-2.96 15.667-8.86 22.669-7.12 8.324-15.732 13.134-25.071 12.375a25.222 25.222 0 0 1-.188-3.07c0-7.778 3.386-16.102 9.399-22.908 3.002-3.446 6.82-6.311 11.45-8.597 4.62-2.252 8.99-3.497 13.1-3.71.12 1.083.17 2.166.17 3.24z"/>
          </svg>
          {/* Microsoft */}
          <svg className="h-6 text-slate-400" viewBox="0 0 318 69" fill="currentColor">
            <path d="M44.836 12.696v42.531H31.978V25.063l-13.09 30.164h-8.747L-3 25.063v30.164H-16V12.696h17.053l11.41 28.117 11.177-28.117h21.196zM50.835 19.027c0-1.979.655-3.593 1.964-4.844 1.309-1.25 2.988-1.875 5.039-1.875 2.083 0 3.778.625 5.087 1.875 1.309 1.251 1.963 2.865 1.963 4.844 0 1.948-.662 3.546-1.987 4.796-1.324 1.25-3.011 1.875-5.063 1.875-2.051 0-3.73-.625-5.039-1.875-1.309-1.25-1.964-2.848-1.964-4.796zm13.09 36.2H51.232V27.34h12.693v27.887zM100.453 40.422c0 4.818-1.391 8.597-4.173 11.338-2.782 2.74-6.615 4.11-11.498 4.11-2.474 0-4.711-.402-6.713-1.206-2.002-.803-3.722-1.986-5.16-3.549v14.063H60.216V27.34h12.693v4.355c1.406-1.627 3.117-2.872 5.136-3.733 2.018-.862 4.239-1.292 6.664-1.292 4.785 0 8.569 1.346 11.352 4.038 2.782 2.693 4.173 6.408 4.173 11.152v-1.438zm-13.113-.39c0-2.506-.589-4.437-1.768-5.795-1.178-1.357-2.839-2.036-4.98-2.036-2.083 0-3.778.679-5.087 2.036-1.31 1.358-1.964 3.29-1.964 5.795 0 2.474.654 4.397 1.964 5.77 1.309 1.374 3.004 2.06 5.087 2.06 2.141 0 3.802-.687 4.98-2.06 1.179-1.373 1.768-3.296 1.768-5.77zM134.247 27.096v12.133c-1.276-.26-2.4-.39-3.37-.39-2.864 0-5.022.703-6.476 2.109-1.455 1.406-2.182 3.548-2.182 6.427v7.852h-12.694V27.34h12.694v5.698c1.699-4.07 5.135-6.152 10.31-6.152.586 0 1.188.07 1.718.21zM163.247 45.241c0 1.366-.505 2.613-1.514 3.74-.977 1.126-2.434 2.036-4.37 2.73-1.937.695-4.182 1.042-6.737 1.042-5.566 0-10.067-1.163-13.502-3.49v-9.374c2.051 1.406 4.397 2.522 7.039 3.346 2.64.824 5.029 1.237 7.166 1.237 1.237 0 2.148-.138 2.73-.415.586-.276.878-.675.878-1.196 0-.618-.382-1.146-1.147-1.586-.764-.44-2.27-1.033-4.516-1.782-2.506-.846-4.523-1.66-6.054-2.44-1.53-.781-2.774-1.816-3.733-3.102-.958-1.285-1.437-2.929-1.437-4.931 0-3.255 1.325-5.803 3.977-7.642 2.65-1.84 6.25-2.76 10.798-2.76 2.376 0 4.663.268 6.859.805 2.197.537 4.2 1.293 6.006 2.27v8.936c-3.744-2.246-7.683-3.368-11.816-3.368-2.637 0-3.955.577-3.955 1.73 0 .587.374 1.083 1.123 1.49.748.407 2.295 1.001 4.637 1.782 2.506.845 4.532 1.675 6.079 2.488 1.545.814 2.806 1.872 3.78 3.175.977 1.302 1.465 2.978 1.465 5.026v.285zM196.637 45.61c0 3.223-1.293 5.795-3.88 7.715-2.587 1.92-6.095 2.88-10.527 2.88-2.343 0-4.59-.26-6.737-.782-2.148-.52-4.028-1.252-5.64-2.196v-9.131c4.037 2.538 8.156 3.806 12.353 3.806 2.766 0 4.149-.651 4.149-1.952 0-.651-.35-1.171-1.05-1.562-.7-.39-2.132-.976-4.296-1.757-2.473-.846-4.467-1.667-5.981-2.464-1.514-.797-2.75-1.856-3.709-3.175-.958-1.318-1.438-2.994-1.438-5.026 0-3.125 1.31-5.616 3.928-7.471 2.62-1.856 6.12-2.783 10.505-2.783 2.148 0 4.23.228 6.249.684 2.019.456 3.823 1.09 5.413 1.903v8.887c-3.321-1.855-6.925-2.783-10.81-2.783-2.571 0-3.857.56-3.857 1.682 0 .586.342 1.074 1.026 1.465.683.39 2.099.97 4.247 1.74 2.571.879 4.613 1.724 6.127 2.537 1.514.813 2.75 1.88 3.709 3.199.958 1.318 1.438 2.986 1.438 5.002l-.22.102zM231.454 40.031c0 5.11-1.587 9.217-4.76 12.32-3.175 3.103-7.439 4.654-12.792 4.654-5.256 0-9.463-1.55-12.622-4.654-3.158-3.103-4.736-7.21-4.736-12.32 0-5.077 1.594-9.16 4.785-12.247 3.19-3.086 7.414-4.63 12.671-4.63 5.223 0 9.438 1.544 12.646 4.63 3.206 3.087 4.808 7.17 4.808 12.247zm-13.453 0c0-2.408-.537-4.28-1.611-5.616-1.074-1.334-2.554-2.002-4.44-2.002-1.92 0-3.417.668-4.49 2.002-1.075 1.335-1.612 3.208-1.612 5.616 0 2.441.537 4.329 1.611 5.665 1.074 1.334 2.572 2.002 4.491 2.002 1.886 0 3.366-.668 4.44-2.002 1.074-1.336 1.611-3.224 1.611-5.665zM261.258 22.107h-10.186v33.12h-12.693v-33.12h-10.186V12.72h33.065v9.387zM281.854 22.107h-10.186v33.12h-12.693v-33.12h-10.186V12.72h33.065v9.387z"/>
          </svg>
          {/* Amazon */}
          <svg className="h-6 text-slate-400" viewBox="0 0 603 182" fill="currentColor">
            <path d="M374.01 142.77c-34.52 25.45-84.58 39.01-127.68 39.01-60.41 0-114.81-22.34-155.94-59.49-3.23-2.92-.34-6.9 3.54-4.63 44.42 25.82 99.35 41.36 156.1 41.36 38.27 0 80.38-7.93 119.12-24.36 5.85-2.48 10.75 3.83 4.86 8.11"/>
            <path d="M387.93 126.87c-4.41-5.65-29.2-2.67-40.33-1.35-3.39.41-3.91-2.54-.85-4.67 19.75-13.88 52.12-9.87 55.9-5.22 3.79 4.67-.99 37.05-19.53 52.49-2.85 2.37-5.57 1.11-4.3-2.03 4.17-10.43 13.52-33.58 9.11-39.22M348.65 20.47V6.34c0-2.14 1.62-3.57 3.57-3.57h63.2c2.03 0 3.65 1.47 3.65 3.57v12.1c-.02 2.05-1.74 4.72-4.78 8.96l-32.74 46.74c12.16-.3 25.01 1.52 36.06 7.75 2.48 1.41 3.16 3.47 3.35 5.51v15.09c0 2.07-2.28 4.49-4.68 3.24-19.55-10.25-45.51-11.36-67.12.11-2.2 1.19-4.51-1.19-4.51-3.26v-14.34c0-2.32.03-6.28 3.21-9.81l37.94-54.41h-33.02c-2.03 0-3.65-1.45-3.65-3.55"/>
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

// Stats component
const stats = [
  { number: '10,000+', label: 'CVs tailored' },
  { number: '3x', label: 'Higher callback rate' },
  { number: '60s', label: 'Average time per application' },
  { number: '94%', label: 'User satisfaction' },
];

// Features data
const features = [
  {
    icon: Target,
    title: 'Smart Keyword Matching',
    description: 'Our AI identifies and incorporates critical keywords from job descriptions to pass ATS filters.',
  },
  {
    icon: Zap,
    title: 'Instant Transformation',
    description: 'Transform generic bullet points into role-specific achievements in under 60 seconds.',
  },
  {
    icon: FileText,
    title: 'Cover Letters That Work',
    description: 'Generate personalized, non-cringe cover letters that actually sound like you wrote them.',
  },
  {
    icon: BarChart3,
    title: 'Match Score Analysis',
    description: 'Know your chances before you apply. Focus your energy on opportunities where you truly fit.',
  },
  {
    icon: Shield,
    title: 'ATS-Optimized Output',
    description: 'Every CV is formatted to pass applicant tracking systems used by 99% of companies.',
  },
  {
    icon: Clock,
    title: 'Save 30+ Hours Weekly',
    description: 'What used to take hours of customization now happens automatically in seconds.',
  },
];

// How it works steps
const steps = [
  {
    number: '01',
    title: 'Build your profile once',
    description: 'Add your experience, skills, and achievements. This becomes your master template for all applications.',
    visual: (
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
            <Upload className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-sm font-medium text-charcoal">Base Profile</div>
        </div>
        <div className="space-y-2">
          <div className="h-2 bg-teal-200 rounded w-full" />
          <div className="h-2 bg-teal-200 rounded w-4/5" />
          <div className="h-2 bg-slate-200 rounded w-3/5" />
        </div>
      </div>
    ),
  },
  {
    number: '02',
    title: 'Paste the job description',
    description: 'Copy any job posting URL or text. Our AI extracts requirements and keywords automatically.',
    visual: (
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
            <MousePointer className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-sm font-medium text-charcoal">Job Description</div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded font-medium">React</span>
          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded font-medium">TypeScript</span>
          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded font-medium">5+ years</span>
        </div>
      </div>
    ),
  },
  {
    number: '03',
    title: 'Get tailored materials',
    description: 'Receive perfectly matched CV bullets, cover letter, and a detailed fit analysis instantly.',
    visual: (
      <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-4 border border-teal-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
          <div className="text-sm font-medium text-charcoal">Ready to Apply</div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Match Score</span>
          <span className="font-bold text-teal-600">92%</span>
        </div>
      </div>
    ),
  },
];

// Testimonials
const testimonials = [
  {
    quote: "I went from 5% callback rate to 40% in two weeks. This tool actually understands what recruiters look for.",
    author: "Sarah K.",
    role: "Product Manager at Shopify",
    avatar: "SK",
  },
  {
    quote: "Saved me 10+ hours every week on applications. The cover letters are surprisingly good—not generic at all.",
    author: "Marcus T.",
    role: "Software Engineer at Google",
    avatar: "MT",
  },
  {
    quote: "Finally landed my dream job after 6 months of searching. The keyword analysis was a game-changer.",
    author: "Priya R.",
    role: "Data Analyst at Stripe",
    avatar: "PR",
  },
];

export default function Landing() {
  const containerRef = useRef(null);

  return (
    <div className="min-h-screen bg-[#faf9f7]" ref={containerRef}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#faf9f7]/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center shadow-md">
              <LogoIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-charcoal tracking-tight">ApplyTailor</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-charcoal transition-colors">
              Sign in
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2.5 bg-charcoal text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Copy */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-full text-sm font-medium mb-6 border border-teal-100">
                <Sparkles className="w-4 h-4" />
                AI-powered CV tailoring
              </motion.div>

              <motion.h1 variants={itemVariants} className="text-5xl lg:text-6xl font-bold text-charcoal leading-[1.1] mb-6 tracking-tight">
                Land more interviews with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                  perfectly tailored
                </span>{' '}
                applications
              </motion.h1>

              <motion.p variants={itemVariants} className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                Stop sending generic CVs. Our AI transforms your experience into role-specific achievements that pass ATS filters and impress recruiters.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-medium rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2"
                >
                  Start for free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#how-it-works"
                  className="px-8 py-4 bg-white text-charcoal font-medium rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  See how it works
                </a>
              </motion.div>

              <motion.p variants={itemVariants} className="text-sm text-slate-400 mt-4">
                No credit card required · 2 free applications per month
              </motion.p>
            </motion.div>

            {/* Right - Product Mockup */}
            <div className="relative">
              <ProductMockup />
            </div>
          </div>
        </div>
      </section>

      {/* Company Logos */}
      <CompanyLogos />

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="text-sm font-medium text-teal-600 uppercase tracking-wider mb-3">
              Proven Results
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-charcoal">
              Numbers that speak for themselves
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-slate-100 text-center hover:shadow-lg hover:shadow-slate-100 transition-shadow"
              >
                <div className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="text-sm font-medium text-teal-600 uppercase tracking-wider mb-3">
              How It Works
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-charcoal mb-4">
              Three steps to your perfect application
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our streamlined process takes the pain out of job applications
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative"
              >
                <div className="bg-[#faf9f7] rounded-2xl p-8 h-full border border-slate-100">
                  <div className="text-6xl font-bold text-slate-100 mb-4">{step.number}</div>
                  <h3 className="text-xl font-bold text-charcoal mb-3">{step.title}</h3>
                  <p className="text-slate-600 mb-6">{step.description}</p>
                  {step.visual}
                </div>
                {index < 2 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ChevronRight className="w-8 h-8 text-slate-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="text-sm font-medium text-teal-600 uppercase tracking-wider mb-3">
              Features
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-charcoal mb-4">
              Everything you need to land interviews
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Built for job seekers who want results, not busywork
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg hover:shadow-slate-100 hover:border-slate-200 transition-all group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:from-teal-100 group-hover:to-emerald-100 transition-colors">
                  <feature.icon className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-lg font-bold text-charcoal mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="text-sm font-medium text-teal-600 uppercase tracking-wider mb-3">
              Testimonials
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-charcoal">
              Loved by job seekers worldwide
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[#faf9f7] rounded-2xl p-6 border border-slate-100"
              >
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-slate-200 mb-3" />
                <p className="text-charcoal mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-charcoal">{testimonial.author}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-charcoal to-slate-800 rounded-3xl p-12 text-center relative overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to land more interviews?
              </h2>
              <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto">
                Join thousands of job seekers who've transformed their job search with ApplyTailor.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg shadow-teal-500/25 flex items-center gap-2"
                >
                  Get started for free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <div className="text-slate-400 text-sm">
                  No credit card required
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-700 rounded-lg flex items-center justify-center">
                <LogoIcon className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-charcoal">ApplyTailor</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link to="/privacy" className="hover:text-teal-600 transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-teal-600 transition-colors">Terms</Link>
              <a href="mailto:sebastian.kucera@icloud.com" className="hover:text-teal-600 transition-colors">Contact</a>
            </div>
            <p className="text-sm text-slate-400">
              &copy; {new Date().getFullYear()} ApplyTailor. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
