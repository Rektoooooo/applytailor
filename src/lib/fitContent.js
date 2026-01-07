import { getConstraints } from './templateConstraints';

/**
 * Truncate text to max length, adding ellipsis if needed
 */
function truncateText(text, maxChars) {
  if (!text || text.length <= maxChars) return text;

  // Try to break at a word boundary
  const truncated = text.slice(0, maxChars);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxChars * 0.8) {
    return truncated.slice(0, lastSpace) + '...';
  }

  return truncated.slice(0, maxChars - 3) + '...';
}

/**
 * Fit summary to template constraints
 */
function fitSummary(summary, constraints) {
  if (!summary) return '';
  return truncateText(summary, constraints.summary.maxChars);
}

/**
 * Fit experience to template constraints
 */
function fitExperience(experience, constraints) {
  if (!experience || !Array.isArray(experience)) return [];

  const { maxJobs, maxBulletsPerJob, maxCharsPerBullet } = constraints.experience;

  return experience.slice(0, maxJobs).map((job) => ({
    ...job,
    bullets: (job.bullets || [])
      .slice(0, maxBulletsPerJob)
      .map((bullet) => truncateText(bullet, maxCharsPerBullet)),
  }));
}

/**
 * Fit education to template constraints
 */
function fitEducation(education, constraints) {
  if (!education || !Array.isArray(education)) return [];
  return education.slice(0, constraints.education.maxItems);
}

/**
 * Fit skills to template constraints
 */
function fitSkills(skills, constraints) {
  if (!skills) return { languages: [], frameworks: [], tools: [] };

  const { maxLanguages, maxFrameworks, maxTools } = constraints.skills;

  return {
    languages: (skills.languages || []).slice(0, maxLanguages),
    frameworks: (skills.frameworks || []).slice(0, maxFrameworks),
    tools: (skills.tools || []).slice(0, maxTools),
  };
}

/**
 * Fit projects to template constraints
 */
function fitProjects(projects, constraints) {
  if (!projects || !Array.isArray(projects)) return [];

  const { maxItems, maxCharsDescription } = constraints.projects;

  return projects.slice(0, maxItems).map((project) => ({
    ...project,
    description: truncateText(project.description, maxCharsDescription),
  }));
}

/**
 * Fit all CV content to a specific template's constraints
 *
 * @param {Object} content - The full CV content
 * @param {string} templateId - The template to fit content for
 * @returns {Object} - Content fitted to template constraints
 */
export function fitContentToTemplate(content, templateId) {
  const constraints = getConstraints(templateId);

  return {
    personalInfo: content.personalInfo,
    summary: fitSummary(content.summary, constraints),
    experience: fitExperience(content.experience, constraints),
    education: fitEducation(content.education, constraints),
    skills: fitSkills(content.skills, constraints),
    projects: fitProjects(content.projects, constraints),
  };
}

/**
 * Check if content exceeds template constraints (for warnings)
 *
 * @param {Object} content - The CV content to check
 * @param {string} templateId - The template to check against
 * @returns {Object} - Object with overflow flags and warnings
 */
export function checkContentOverflow(content, templateId) {
  const constraints = getConstraints(templateId);
  const warnings = [];

  // Check summary
  if (content.summary && content.summary.length > constraints.summary.maxChars) {
    warnings.push({
      field: 'summary',
      message: `Summary exceeds ${constraints.summary.maxChars} characters (currently ${content.summary.length})`,
    });
  }

  // Check experience
  if (content.experience?.length > constraints.experience.maxJobs) {
    warnings.push({
      field: 'experience',
      message: `Only ${constraints.experience.maxJobs} jobs will be shown (you have ${content.experience.length})`,
    });
  }

  content.experience?.forEach((job, i) => {
    if (job.bullets?.length > constraints.experience.maxBulletsPerJob) {
      warnings.push({
        field: 'experience',
        message: `Job "${job.company}": Only ${constraints.experience.maxBulletsPerJob} bullets will be shown`,
      });
    }

    job.bullets?.forEach((bullet, j) => {
      if (bullet.length > constraints.experience.maxCharsPerBullet) {
        warnings.push({
          field: 'experience',
          message: `Job "${job.company}" bullet ${j + 1}: Will be truncated`,
        });
      }
    });
  });

  // Check education
  if (content.education?.length > constraints.education.maxItems) {
    warnings.push({
      field: 'education',
      message: `Only ${constraints.education.maxItems} education entries will be shown`,
    });
  }

  // Check projects
  if (content.projects?.length > constraints.projects.maxItems) {
    warnings.push({
      field: 'projects',
      message: `Only ${constraints.projects.maxItems} projects will be shown`,
    });
  }

  return {
    hasOverflow: warnings.length > 0,
    warnings,
  };
}
