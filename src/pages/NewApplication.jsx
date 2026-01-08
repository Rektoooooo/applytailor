import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardPaste,
  Link2,
  FileText,
  Mail,
  Package,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Sliders,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import Header from '../components/Header';
import { useApplications } from '../hooks/useApplications';
import { useBaseProfile } from '../hooks/useBaseProfile';
import { useSubscription } from '../hooks/useSubscription';
import { useAuth } from '../contexts/AuthContext';
import { generateContent } from '../lib/aiApi';
import { extractCompany, extractRole } from '../lib/mockGenerator';

const steps = [
  { id: 1, title: 'Job Input', description: 'Paste the job description' },
  { id: 2, title: 'Output Choice', description: 'Select what to generate' },
  { id: 3, title: 'Fine-tune', description: 'Adjust generation settings' },
];

export default function NewApplication() {
  const navigate = useNavigate();
  const { createApplication, updateApplication } = useApplications();
  const { baseProfile } = useBaseProfile();
  const { hasAccess, refreshProfile } = useSubscription();
  const { profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const canUseUrlParsing = hasAccess('url_parsing');
  const credits = profile?.credits || 0;

  // Form state
  const [jobInput, setJobInput] = useState('');
  const [inputMethod, setInputMethod] = useState('paste');
  const [outputChoice, setOutputChoice] = useState('full');
  const [settings, setSettings] = useState({
    seniority: 70,
    tone: 'confident',
    emphasis: 'balanced',
    limitedExperience: false,
  });

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleGenerate();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = async () => {
    // Check credits first
    if (credits < 1) {
      setError('You need at least 1 credit to generate an application. Please top up your credits.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // 1. Extract company and role from job description (fallback)
      const fallbackCompany = extractCompany(jobInput) || 'Company';
      const fallbackRole = extractRole(jobInput) || 'Position';

      // 2. Create application in database (as draft)
      const { data: app, error: createError } = await createApplication({
        company: fallbackCompany,
        role: fallbackRole,
        job_description: jobInput,
        settings,
        status: 'draft',
      });

      if (createError) {
        throw new Error(createError);
      }

      // 3. Call AI to generate tailored content
      const aiContent = await generateContent({
        jobDescription: jobInput,
        companyName: fallbackCompany,
        jobTitle: fallbackRole,
        profile: baseProfile,
        outputType: outputChoice,
      });

      // Use AI-extracted company/role if available (more accurate)
      const company = aiContent.company_name || fallbackCompany;
      const role = aiContent.job_title || fallbackRole;

      // 4. Transform AI response to match database schema
      // Handle partial responses based on output type
      const tailoredBullets = outputChoice !== 'cover'
        ? (aiContent.tailored_bullets || []).map((bullet, index) => ({
            id: crypto.randomUUID(),
            before: bullet.original,
            after: bullet.tailored,
            text: bullet.tailored,
            keywords_matched: bullet.keywords_matched || [],
            accepted: null,
          }))
        : [];

      // Build keyword frequency map from all matched keywords in bullets
      const keywordCounts = {};
      tailoredBullets.forEach((bullet) => {
        (bullet.keywords_matched || []).forEach((kw) => {
          const normalizedKw = kw.toLowerCase().trim();
          keywordCounts[normalizedKw] = (keywordCounts[normalizedKw] || 0) + 1;
        });
      });

      // Also count keywords from matched requirements
      (aiContent.keyword_analysis?.matched || []).forEach((kw) => {
        const normalizedKw = kw.toLowerCase().trim();
        if (!keywordCounts[normalizedKw]) {
          keywordCounts[normalizedKw] = 1;
        }
      });

      const keywordAnalysis = {
        requirements: [
          ...(aiContent.keyword_analysis?.matched || []).map((kw) => ({
            id: crypto.randomUUID(),
            text: kw,
            status: 'covered',
            bullets: [],
          })),
          ...(aiContent.keyword_analysis?.weak || []).map((kw) => ({
            id: crypto.randomUUID(),
            text: kw,
            status: 'weak',
            bullets: [],
          })),
          ...(aiContent.keyword_analysis?.missing || []).map((kw) => ({
            id: crypto.randomUUID(),
            text: kw,
            status: 'missing',
            bullets: [],
          })),
        ],
        keywords: Object.entries(keywordCounts).map(([keyword, count]) => ({
          keyword: keyword.charAt(0).toUpperCase() + keyword.slice(1),
          count,
        })).sort((a, b) => b.count - a.count).slice(0, 10),
      };

      // 5. Update application with AI-generated content
      // Only include fields that were generated based on output type
      const updateData = {
        company, // Use AI-extracted company
        role, // Use AI-extracted role
        keyword_analysis: keywordAnalysis,
        match_score: aiContent.match_score,
        status: 'tailored',
        output_type: outputChoice, // Store what was generated
      };

      // Add CV-related fields if generated
      if (outputChoice !== 'cover') {
        updateData.tailored_bullets = tailoredBullets;
        updateData.professional_summary = aiContent.professional_summary;
      }

      // Add cover letter if generated
      if (outputChoice !== 'cv') {
        updateData.cover_letter = aiContent.cover_letter;
      }

      const { error: updateError } = await updateApplication(app.id, updateData);

      if (updateError) {
        throw new Error(updateError);
      }

      // 6. Refresh profile to update credits display
      refreshProfile?.();

      // 7. Navigate to results page
      navigate(`/dashboard/results/${app.id}`);
    } catch (err) {
      setError(err.message || 'Failed to generate application. Please try again.');
      setIsGenerating(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) return jobInput.trim().length > 50;
    return true;
  };

  return (
    <div className="min-h-screen">
      <Header
        title="New Application"
        subtitle="Create a tailored application in 3 simple steps"
      />

      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-4 md:top-5 left-0 right-0 h-0.5 bg-slate-200">
              <motion.div
                className="h-full bg-teal-500"
                initial={{ width: '0%' }}
                animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {steps.map((step, index) => (
              <div key={step.id} className="relative flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-semibold text-xs md:text-sm z-10 transition-all duration-300 ${
                    currentStep > step.id
                      ? 'bg-teal-500 text-white'
                      : currentStep === step.id
                      ? 'bg-teal-500 text-white ring-4 ring-teal-100'
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </motion.div>
                <div className="mt-3 text-center">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-charcoal' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Generation Failed</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <StepOne
              key="step1"
              jobInput={jobInput}
              setJobInput={setJobInput}
              inputMethod={inputMethod}
              setInputMethod={setInputMethod}
              canUseUrlParsing={canUseUrlParsing}
            />
          )}
          {currentStep === 2 && (
            <StepTwo
              key="step2"
              outputChoice={outputChoice}
              setOutputChoice={setOutputChoice}
            />
          )}
          {currentStep === 3 && (
            <StepThree
              key="step3"
              settings={settings}
              setSettings={setSettings}
            />
          )}
        </AnimatePresence>

        {/* Generation Loading Overlay */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full mx-4 shadow-2xl text-center"
              >
                {/* Animated Icon */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-4 border-teal-100 border-t-teal-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-teal-500" />
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-charcoal mb-2">
                  Generating Your Application
                </h3>
                <p className="text-slate-500 text-sm mb-6">
                  AI is analyzing the job description and tailoring your CV...
                </p>

                {/* Progress Steps */}
                <div className="space-y-3 text-left">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-teal-600" />
                    </div>
                    <span className="text-slate-600">Analyzing job requirements</span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />
                      </motion.div>
                    </div>
                    <span className="text-slate-600">Tailoring CV bullets</span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 0.5, x: 0 }}
                    transition={{ delay: 1.4 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                      <div className="w-2 h-2 bg-slate-300 rounded-full" />
                    </div>
                    <span className="text-slate-400">Writing cover letter</span>
                  </motion.div>
                </div>

                <p className="text-xs text-slate-400 mt-6">
                  This usually takes 10-15 seconds
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between mt-8"
        >
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`btn-secondary ${
              currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <motion.button
            whileHover={{ scale: canProceed() ? 1.02 : 1 }}
            whileTap={{ scale: canProceed() ? 0.98 : 1 }}
            onClick={handleNext}
            disabled={!canProceed() || isGenerating}
            className={`btn-primary ${
              !canProceed() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : currentStep === 3 ? (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Application
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

function StepOne({ jobInput, setJobInput, inputMethod, setInputMethod, canUseUrlParsing }) {
  const [urlInput, setUrlInput] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState(null);

  const handleFetchUrl = async () => {
    if (!urlInput.trim()) return;

    setIsLoadingUrl(true);
    setUrlError(null);

    try {
      const response = await fetch('/api/scrape-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch job posting');
      }

      // Success - set the job input and switch to paste view
      setJobInput(data.content);
      setInputMethod('paste');
      setUrlInput('');
    } catch (err) {
      setUrlError(err.message);
    } finally {
      setIsLoadingUrl(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-charcoal mb-2">
          Paste the Job Description
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          Copy and paste the full job posting. The more detail, the better we can tailor your application.
        </p>

        {/* Input Method Tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { id: 'paste', icon: ClipboardPaste, label: 'Paste Text' },
            { id: 'url', icon: Link2, label: 'From URL', pro: true },
          ].map((method) => (
            <button
              key={method.id}
              onClick={() => setInputMethod(method.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                inputMethod === method.id
                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <method.icon className="w-4 h-4" />
              {method.label}
            </button>
          ))}
        </div>

        {inputMethod === 'paste' ? (
          <div className="space-y-4">
            <textarea
              value={jobInput}
              onChange={(e) => setJobInput(e.target.value)}
              placeholder="Paste the job description here...

Example:
We're looking for a Senior Frontend Developer to join our team. You'll be working on our core product, building beautiful and performant user interfaces...

Requirements:
- 5+ years of experience with React
- Strong TypeScript skills
- Experience with modern CSS..."
              className="textarea-field h-56 font-mono text-sm"
            />

            {/* Copy Instructions */}
            <details className="group">
              <summary className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer hover:text-slate-700 transition-colors">
                <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                How to copy from LinkedIn, Indeed & other sites
              </summary>
              <div className="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium text-charcoal mb-2 flex items-center gap-2">
                      <span className="w-5 h-5 bg-[#0077b5] rounded text-white text-xs flex items-center justify-center font-bold">in</span>
                      LinkedIn
                    </h4>
                    <ol className="text-slate-600 space-y-1 list-decimal list-inside text-xs">
                      <li>Open the job posting</li>
                      <li>Click "See more" to expand description</li>
                      <li>Select from job title to end of requirements</li>
                      <li>Copy (Cmd+C / Ctrl+C)</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-medium text-charcoal mb-2 flex items-center gap-2">
                      <span className="w-5 h-5 bg-[#2557a7] rounded text-white text-xs flex items-center justify-center font-bold">in</span>
                      Indeed
                    </h4>
                    <ol className="text-slate-600 space-y-1 list-decimal list-inside text-xs">
                      <li>Open the full job description</li>
                      <li>Triple-click to select paragraphs, or</li>
                      <li>Use Cmd+A / Ctrl+A to select all</li>
                      <li>Copy and paste here</li>
                    </ol>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  <strong>Tip:</strong> Don't worry about extra text - our AI will extract the relevant job details automatically.
                </p>
              </div>
            </details>
          </div>
        ) : canUseUrlParsing ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://jobs.company.com/listing/..."
                className="input-field flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && urlInput.trim()) {
                    handleFetchUrl();
                  }
                }}
              />
              <button
                onClick={handleFetchUrl}
                disabled={isLoadingUrl || !urlInput.trim()}
                className="btn-primary px-6 flex items-center gap-2"
              >
                {isLoadingUrl ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    Fetch
                  </>
                )}
              </button>
            </div>

            {urlError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 whitespace-pre-wrap">{urlError}</p>
                </div>
              </motion.div>
            )}

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-sm text-slate-600">
                <strong>Works best with:</strong> Greenhouse, Lever, Ashby, BambooHR, and company career pages.
              </p>
              <p className="text-xs text-slate-400 mt-2">
                <strong>May not work:</strong> LinkedIn, Indeed, and sites with bot protection. For these, copy the job description manually.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="url"
              placeholder="https://jobs.company.com/listing/..."
              className="input-field opacity-50"
              disabled
            />
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">URL parsing is a Pro feature</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Upgrade to automatically extract job descriptions from URLs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {jobInput.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-slate-400 mt-2"
          >
            {jobInput.length} characters
            {jobInput.length < 50 && ' (minimum 50 characters)'}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

function StepTwo({ outputChoice, setOutputChoice }) {
  const options = [
    {
      id: 'cv',
      icon: FileText,
      title: 'CV Only',
      description: 'Tailored bullet points for your resume',
      time: '~30 seconds',
      credits: 0.75,
    },
    {
      id: 'cover',
      icon: Mail,
      title: 'Cover Letter Only',
      description: 'Professional, non-generic cover letter',
      time: '~20 seconds',
      credits: 0.25,
    },
    {
      id: 'full',
      icon: Package,
      title: 'Full Package',
      description: 'CV bullets + cover letter + keyword analysis',
      time: '~60 seconds',
      credits: 1.0,
      recommended: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card p-6">
        <h2 className="text-xl  font-semibold text-charcoal mb-2">
          What Would You Like to Generate?
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          Choose what outputs you need for this application.
        </p>

        <div className="grid gap-4">
          {options.map((option, index) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setOutputChoice(option.id)}
              className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                outputChoice === option.id
                  ? 'border-teal-500 bg-teal-50/50'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              {option.recommended && (
                <span className="absolute top-3 right-3 px-2 py-0.5 bg-teal-500 text-white text-xs font-medium rounded">
                  Recommended
                </span>
              )}
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    outputChoice === option.id
                      ? 'bg-teal-500 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <option.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-charcoal">{option.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{option.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-slate-400">{option.time}</span>
                    <span className="text-xs font-medium text-teal-600">{option.credits} credit{option.credits !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                    outputChoice === option.id
                      ? 'border-teal-500 bg-teal-500'
                      : 'border-slate-300'
                  }`}
                >
                  {outputChoice === option.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-white rounded-full"
                    />
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function StepThree({ settings, setSettings }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
            <Sliders className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-xl  font-semibold text-charcoal">
              Fine-tune Your Application
            </h2>
            <p className="text-slate-500 text-sm">
              Adjust these settings to match the role perfectly
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Seniority Slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-700">
                Experience Level
              </label>
              <span className="text-sm text-teal-600 font-medium">
                {settings.seniority < 33
                  ? 'Junior'
                  : settings.seniority < 66
                  ? 'Mid-level'
                  : 'Senior'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.seniority}
              onChange={(e) =>
                setSettings({ ...settings, seniority: parseInt(e.target.value) })
              }
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Junior</span>
              <span>Mid-level</span>
              <span>Senior+</span>
            </div>
          </div>

          {/* Tone Selection */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-3 block">
              Writing Tone
            </label>
            <div className="flex gap-3">
              {[
                { id: 'neutral', label: 'Neutral', desc: 'Professional and balanced' },
                { id: 'confident', label: 'Confident', desc: 'Bold and assertive' },
                { id: 'friendly', label: 'Friendly', desc: 'Warm and approachable' },
              ].map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => setSettings({ ...settings, tone: tone.id })}
                  className={`flex-1 p-3 rounded-lg border-2 text-center transition-all ${
                    settings.tone === tone.id
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p
                    className={`font-medium ${
                      settings.tone === tone.id ? 'text-teal-700' : 'text-charcoal'
                    }`}
                  >
                    {tone.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{tone.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Emphasis Selection */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-3 block">
              Optimization Focus
            </label>
            <div className="flex gap-3">
              {[
                { id: 'ats', label: 'ATS-Friendly', desc: 'Keyword optimized' },
                { id: 'balanced', label: 'Balanced', desc: 'Best of both' },
                { id: 'human', label: 'Human Reader', desc: 'Natural flow' },
              ].map((emphasis) => (
                <button
                  key={emphasis.id}
                  onClick={() => setSettings({ ...settings, emphasis: emphasis.id })}
                  className={`flex-1 p-3 rounded-lg border-2 text-center transition-all ${
                    settings.emphasis === emphasis.id
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p
                    className={`font-medium ${
                      settings.emphasis === emphasis.id ? 'text-teal-700' : 'text-charcoal'
                    }`}
                  >
                    {emphasis.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{emphasis.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Limited Experience Checkbox */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.limitedExperience}
                onChange={(e) =>
                  setSettings({ ...settings, limitedExperience: e.target.checked })
                }
                className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 mt-0.5"
              />
              <div>
                <p className="font-medium text-charcoal">
                  I have limited experience in some requirements
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  The AI will focus on transferable skills and avoid overstating experience
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
