/**
 * Template constraints define content limits for each CV template
 * These ensure AI-generated content fits properly within each layout
 */

export const TEMPLATE_CONSTRAINTS = {
  // Two-column with sidebar - less space for main content
  'executive-navy': {
    summary: { maxChars: 280, maxLines: 4 },
    experience: {
      maxJobs: 3,
      maxBulletsPerJob: 4,
      maxCharsPerBullet: 140,
    },
    education: { maxItems: 2 },
    skills: {
      maxLanguages: 6,
      maxFrameworks: 6,
      maxTools: 6,
    },
    projects: { maxItems: 2, maxCharsDescription: 80 },
  },

  'classic': {
    summary: { maxChars: 350, maxLines: 5 },
    experience: {
      maxJobs: 3,
      maxBulletsPerJob: 4,
      maxCharsPerBullet: 150,
    },
    education: { maxItems: 2 },
    skills: {
      maxLanguages: 8,
      maxFrameworks: 8,
      maxTools: 8,
    },
    projects: { maxItems: 2, maxCharsDescription: 100 },
  },

  // Single column - more horizontal space
  'modern': {
    summary: { maxChars: 400, maxLines: 5 },
    experience: {
      maxJobs: 4,
      maxBulletsPerJob: 5,
      maxCharsPerBullet: 180,
    },
    education: { maxItems: 3 },
    skills: {
      maxLanguages: 10,
      maxFrameworks: 10,
      maxTools: 10,
    },
    projects: { maxItems: 3, maxCharsDescription: 120 },
  },

  'coral-accent': {
    summary: { maxChars: 300, maxLines: 4 },
    experience: {
      maxJobs: 3,
      maxBulletsPerJob: 4,
      maxCharsPerBullet: 140,
    },
    education: { maxItems: 2 },
    skills: {
      maxLanguages: 6,
      maxFrameworks: 6,
      maxTools: 6,
    },
    projects: { maxItems: 2, maxCharsDescription: 80 },
  },

  'golden-highlight': {
    summary: { maxChars: 380, maxLines: 5 },
    experience: {
      maxJobs: 4,
      maxBulletsPerJob: 4,
      maxCharsPerBullet: 160,
    },
    education: { maxItems: 2 },
    skills: {
      maxLanguages: 8,
      maxFrameworks: 8,
      maxTools: 8,
    },
    projects: { maxItems: 2, maxCharsDescription: 100 },
  },

  'teal-corporate': {
    summary: { maxChars: 350, maxLines: 5 },
    experience: {
      maxJobs: 3,
      maxBulletsPerJob: 5,
      maxCharsPerBullet: 160,
    },
    education: { maxItems: 2 },
    skills: {
      maxLanguages: 8,
      maxFrameworks: 8,
      maxTools: 8,
    },
    projects: { maxItems: 2, maxCharsDescription: 100 },
  },

  'emerald-fresh': {
    summary: { maxChars: 380, maxLines: 5 },
    experience: {
      maxJobs: 4,
      maxBulletsPerJob: 4,
      maxCharsPerBullet: 160,
    },
    education: { maxItems: 3 },
    skills: {
      maxLanguages: 8,
      maxFrameworks: 8,
      maxTools: 8,
    },
    projects: { maxItems: 3, maxCharsDescription: 100 },
  },

  'slate-professional': {
    summary: { maxChars: 400, maxLines: 5 },
    experience: {
      maxJobs: 4,
      maxBulletsPerJob: 5,
      maxCharsPerBullet: 170,
    },
    education: { maxItems: 3 },
    skills: {
      maxLanguages: 10,
      maxFrameworks: 10,
      maxTools: 10,
    },
    projects: { maxItems: 3, maxCharsDescription: 120 },
  },

  'burgundy-executive': {
    summary: { maxChars: 320, maxLines: 4 },
    experience: {
      maxJobs: 3,
      maxBulletsPerJob: 4,
      maxCharsPerBullet: 150,
    },
    education: { maxItems: 2 },
    skills: {
      maxLanguages: 6,
      maxFrameworks: 6,
      maxTools: 6,
    },
    projects: { maxItems: 2, maxCharsDescription: 90 },
  },

  'creative': {
    summary: { maxChars: 300, maxLines: 4 },
    experience: {
      maxJobs: 3,
      maxBulletsPerJob: 4,
      maxCharsPerBullet: 140,
    },
    education: { maxItems: 2 },
    skills: {
      maxLanguages: 8,
      maxFrameworks: 8,
      maxTools: 8,
    },
    projects: { maxItems: 2, maxCharsDescription: 80 },
  },
};

// Default constraints for unknown templates
export const DEFAULT_CONSTRAINTS = {
  summary: { maxChars: 350, maxLines: 5 },
  experience: {
    maxJobs: 3,
    maxBulletsPerJob: 4,
    maxCharsPerBullet: 150,
  },
  education: { maxItems: 2 },
  skills: {
    maxLanguages: 8,
    maxFrameworks: 8,
    maxTools: 8,
  },
  projects: { maxItems: 2, maxCharsDescription: 100 },
};

/**
 * Get constraints for a specific template
 */
export function getConstraints(templateId) {
  return TEMPLATE_CONSTRAINTS[templateId] || DEFAULT_CONSTRAINTS;
}
