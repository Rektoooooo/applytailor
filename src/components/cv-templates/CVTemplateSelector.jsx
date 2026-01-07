import { useState, useRef, useMemo } from 'react';
import { Check, Loader2, ZoomIn, ZoomOut, FileText, AlertTriangle } from 'lucide-react';
import ClassicProfessional from './ClassicProfessional';
import ModernMinimal from './ModernMinimal';
import CreativeBold from './CreativeBold';
import ExecutiveNavy from './ExecutiveNavy';
import CoralAccent from './CoralAccent';
import GoldenHighlight from './GoldenHighlight';
import TealCorporate from './TealCorporate';
import SlateProfessional from './SlateProfessional';
import EmeraldFresh from './EmeraldFresh';
import BurgundyExecutive from './BurgundyExecutive';
import { usePdfExport } from './usePdfExport';
import { fitContentToTemplate, checkContentOverflow } from '../../lib/fitContent';

const TEMPLATES = [
  {
    id: 'modern',
    name: 'Modern Minimal',
    description: 'Clean single-column design with generous whitespace. Ideal for tech and startups.',
    component: ModernMinimal,
    preview: { bg: 'bg-white', accent: 'bg-[#0f172a]', highlight: 'bg-[#0d9488]' },
  },
  {
    id: 'executive-navy',
    name: 'Executive Navy',
    description: 'Professional navy sidebar with photo area. Perfect for corporate and executive roles.',
    component: ExecutiveNavy,
    preview: { bg: 'bg-white', accent: 'bg-[#1e3a5f]', highlight: 'bg-[#1e3a5f]' },
  },
  {
    id: 'classic',
    name: 'Classic Professional',
    description: 'Traditional two-column layout with elegant serif typography. Timeless corporate style.',
    component: ClassicProfessional,
    preview: { bg: 'bg-[#faf8f2]', accent: 'bg-[#1e3a5f]', highlight: 'bg-[#b8860b]' },
  },
  {
    id: 'coral-accent',
    name: 'Coral Accent',
    description: 'Charcoal sidebar with warm coral highlights. Modern and approachable.',
    component: CoralAccent,
    preview: { bg: 'bg-white', accent: 'bg-[#2d3436]', highlight: 'bg-[#e17055]' },
  },
  {
    id: 'golden-highlight',
    name: 'Golden Highlight',
    description: 'Clean layout with golden accent bar. Professional with a touch of warmth.',
    component: GoldenHighlight,
    preview: { bg: 'bg-white', accent: 'bg-slate-100', highlight: 'bg-[#f1c40f]' },
  },
  {
    id: 'teal-corporate',
    name: 'Teal Corporate',
    description: 'Bold teal header with structured layout. Great for business professionals.',
    component: TealCorporate,
    preview: { bg: 'bg-slate-50', accent: 'bg-[#2c8c99]', highlight: 'bg-[#2c8c99]' },
  },
  {
    id: 'emerald-fresh',
    name: 'Emerald Fresh',
    description: 'Modern green accents with numbered sections. Fresh and organized look.',
    component: EmeraldFresh,
    preview: { bg: 'bg-white', accent: 'bg-emerald-500', highlight: 'bg-emerald-500' },
  },
  {
    id: 'slate-professional',
    name: 'Slate Professional',
    description: 'Elegant centered header with classic serif fonts. Refined and sophisticated.',
    component: SlateProfessional,
    preview: { bg: 'bg-white', accent: 'bg-slate-800', highlight: 'bg-slate-800' },
  },
  {
    id: 'burgundy-executive',
    name: 'Burgundy Executive',
    description: 'Rich burgundy header with gold accents. Luxury executive style.',
    component: BurgundyExecutive,
    preview: { bg: 'bg-[#faf9f7]', accent: 'bg-[#722f37]', highlight: 'bg-[#d4a574]' },
  },
  {
    id: 'creative',
    name: 'Creative Bold',
    description: 'Distinctive asymmetric layout with bold typography. Best for creative roles.',
    component: CreativeBold,
    preview: { bg: 'bg-[#f8f7f4]', accent: 'bg-[#1c1c1c]', highlight: 'bg-[#ff6b6b]' },
  },
];

export default function CVTemplateSelector({
  personalInfo,
  summary,
  experience,
  education,
  skills,
  projects,
  onExport,
  defaultTemplate = 'modern',
  hideExportButton = false,
  disableExport = false,
}) {
  const [selectedTemplate, setSelectedTemplate] = useState(defaultTemplate);
  const [zoom, setZoom] = useState(0.5);
  const templateRef = useRef(null);
  const { exportToPdf, exporting, error } = usePdfExport();

  const selected = TEMPLATES.find((t) => t.id === selectedTemplate);
  const TemplateComponent = selected?.component;

  // Raw content for overflow checking
  const rawContent = useMemo(() => ({
    personalInfo,
    summary,
    experience,
    education,
    skills,
    projects,
  }), [personalInfo, summary, experience, education, skills, projects]);

  // Fit content to selected template constraints
  const fittedContent = useMemo(() => {
    return fitContentToTemplate(rawContent, selectedTemplate);
  }, [rawContent, selectedTemplate]);

  // Check for content overflow warnings
  const overflowCheck = useMemo(() => {
    return checkContentOverflow(rawContent, selectedTemplate);
  }, [rawContent, selectedTemplate]);

  const handleExport = async () => {
    const filename = `${personalInfo?.name?.replace(/\s+/g, '_') || 'resume'}_${selectedTemplate}.pdf`;
    const success = await exportToPdf(templateRef, filename);
    if (success && onExport) {
      onExport(selectedTemplate, 'pdf');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-charcoal">Choose Your Template</h2>
          <p className="text-sm text-slate-500">Select a design that matches your style</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}
              className="p-1.5 hover:bg-white rounded transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4 text-slate-600" />
            </button>
            <span className="text-xs text-slate-600 w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1, z + 0.1))}
              className="p-1.5 hover:bg-white rounded transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          {/* Export Button */}
          {!hideExportButton && (
            <button
              onClick={handleExport}
              disabled={exporting || disableExport}
              className={`btn-primary flex items-center gap-2 ${disableExport ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={disableExport ? 'Complete your Base Profile to export' : 'Download CV as PDF'}
            >
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Export PDF
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {overflowCheck.hasOverflow && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">Content adjusted to fit template</p>
              <ul className="mt-1 text-xs text-amber-700 space-y-0.5">
                {overflowCheck.warnings.slice(0, 3).map((warning, i) => (
                  <li key={i}>{warning.message}</li>
                ))}
                {overflowCheck.warnings.length > 3 && (
                  <li>...and {overflowCheck.warnings.length - 3} more adjustments</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex gap-6 flex-1 min-h-0">
        {/* Template List - Scrollable */}
        <div className="w-72 flex-shrink-0 overflow-y-auto pr-2 space-y-2">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`w-full text-left p-2.5 rounded-lg border-2 transition-all ${
                selectedTemplate === template.id
                  ? 'border-teal-500 bg-teal-50/50'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Mini Preview */}
                <div className={`w-14 h-16 rounded overflow-hidden ${template.preview.bg} border border-slate-100 flex-shrink-0`}>
                  <div className={`h-3 ${template.preview.accent}`}>
                    <div className={`w-4 h-0.5 ${template.preview.highlight} mt-1 ml-1 rounded-full`} />
                  </div>
                  <div className="p-1 space-y-0.5">
                    <div className={`h-0.5 w-6 ${template.preview.accent} opacity-20 rounded-full`} />
                    <div className={`h-0.5 w-8 ${template.preview.accent} opacity-10 rounded-full`} />
                    <div className={`h-0.5 w-5 ${template.preview.accent} opacity-10 rounded-full`} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-charcoal text-sm truncate">{template.name}</h3>
                    {selectedTemplate === template.id && (
                      <div className="w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {template.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Preview Panel */}
        <div className="flex-1 bg-slate-100 rounded-xl overflow-auto p-6">
          <div
            className="origin-top-left transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
          >
            {TemplateComponent && (
              <TemplateComponent ref={templateRef} {...fittedContent} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact preview card for use in other places
export function CVTemplatePreview({
  personalInfo,
  summary,
  experience,
  education,
  skills,
  projects,
  templateId = 'modern',
  onSelect,
  className = '',
}) {
  const template = TEMPLATES.find((t) => t.id === templateId);
  const TemplateComponent = template?.component;

  // Fit content to this template's constraints
  const fittedContent = useMemo(() => {
    return fitContentToTemplate(
      { personalInfo, summary, experience, education, skills, projects },
      templateId
    );
  }, [personalInfo, summary, experience, education, skills, projects, templateId]);

  if (!TemplateComponent) return null;

  return (
    <button
      onClick={() => onSelect?.(templateId)}
      className={`group relative overflow-hidden rounded-xl border-2 border-slate-200 hover:border-teal-500 transition-all ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <p className="font-medium text-sm">{template.name}</p>
        <p className="text-xs text-white/80">Click to select</p>
      </div>
      <div className="transform scale-[0.2] origin-top-left w-[500%] h-[500%]">
        <TemplateComponent {...fittedContent} />
      </div>
    </button>
  );
}
