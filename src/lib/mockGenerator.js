// Mock data generator for application tailoring
// This generates realistic mock data until AI integration is added

/**
 * Extract company name from job description
 */
export function extractCompany(jobDescription) {
  // Look for common patterns like "at Company" or "Company is hiring"
  const patterns = [
    /(?:at|@)\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s+is|\s+we|\.|,)/i,
    /([A-Z][A-Za-z0-9\s&]+?)\s+is\s+(?:hiring|looking|seeking)/i,
    /(?:join|work\s+at|about)\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s|,|\.)/i,
  ];

  for (const pattern of patterns) {
    const match = jobDescription.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Extract role/job title from job description
 */
export function extractRole(jobDescription) {
  // Look for common job title patterns
  const patterns = [
    /(?:seeking|hiring|looking\s+for)\s+(?:a|an)?\s*([A-Za-z\s]+(?:Engineer|Developer|Designer|Manager|Analyst|Lead|Architect))/i,
    /^([A-Za-z\s]+(?:Engineer|Developer|Designer|Manager|Analyst|Lead|Architect))/im,
    /position:\s*([A-Za-z\s]+)/i,
    /role:\s*([A-Za-z\s]+)/i,
    /job\s+title:\s*([A-Za-z\s]+)/i,
  ];

  for (const pattern of patterns) {
    const match = jobDescription.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Extract keywords from job description
 */
function extractKeywords(jobDescription) {
  const commonKeywords = [
    'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Java', 'Go', 'Rust',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Git',
    'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'REST API',
    'Agile', 'Scrum', 'TDD', 'Unit Testing', 'Integration Testing',
    'Leadership', 'Communication', 'Problem Solving', 'Team Player',
    'Figma', 'Design Systems', 'UX', 'UI', 'Prototyping',
    'Machine Learning', 'AI', 'Data Analysis', 'Analytics',
  ];

  const found = [];
  const lowerDesc = jobDescription.toLowerCase();

  for (const keyword of commonKeywords) {
    if (lowerDesc.includes(keyword.toLowerCase())) {
      // Count occurrences
      const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = jobDescription.match(regex);
      found.push({
        keyword,
        count: Math.min(matches ? matches.length : 1, 4),
      });
    }
  }

  // Sort by count and return top 8
  return found.sort((a, b) => b.count - a.count).slice(0, 8);
}

/**
 * Generate mock requirements from job description
 */
function generateRequirements(jobDescription) {
  const requirementPatterns = [
    /(\d+\+?\s+years?\s+(?:of\s+)?experience\s+(?:in|with)\s+[A-Za-z\s,]+)/gi,
    /(experience\s+(?:in|with)\s+[A-Za-z\s,]+)/gi,
    /(proficiency\s+in\s+[A-Za-z\s,]+)/gi,
    /(strong\s+[A-Za-z\s]+\s+skills)/gi,
    /(knowledge\s+of\s+[A-Za-z\s,]+)/gi,
    /(familiar(?:ity)?\s+with\s+[A-Za-z\s,]+)/gi,
  ];

  const requirements = [];
  const statuses = ['covered', 'covered', 'covered', 'weak', 'covered', 'missing', 'covered', 'weak'];
  let index = 0;

  for (const pattern of requirementPatterns) {
    const matches = jobDescription.match(pattern);
    if (matches) {
      for (const match of matches.slice(0, 2)) {
        requirements.push({
          id: crypto.randomUUID(),
          text: match.charAt(0).toUpperCase() + match.slice(1).toLowerCase(),
          status: statuses[index % statuses.length],
          bullets: statuses[index % statuses.length] !== 'missing' ? [index + 1] : [],
        });
        index++;
        if (requirements.length >= 8) break;
      }
    }
    if (requirements.length >= 8) break;
  }

  // Add some default requirements if we didn't find enough
  const defaults = [
    { text: 'Strong problem-solving skills', status: 'covered' },
    { text: 'Excellent communication abilities', status: 'covered' },
    { text: 'Team collaboration experience', status: 'weak' },
    { text: 'Self-motivated and proactive', status: 'covered' },
  ];

  while (requirements.length < 6) {
    const def = defaults[requirements.length % defaults.length];
    requirements.push({
      id: crypto.randomUUID(),
      text: def.text,
      status: def.status,
      bullets: def.status !== 'missing' ? [requirements.length + 1] : [],
    });
  }

  return requirements;
}

/**
 * Generate tailored bullets from base profile
 */
function generateTailoredBullets(baseProfile, keywords) {
  const workExperience = baseProfile?.work_experience || [];
  const bullets = [];

  // Metrics to inject into bullets
  const metrics = ['15%', '20%', '30%', '25%', '40%', '2x', '3x', '50%'];
  const actions = ['Increased', 'Improved', 'Reduced', 'Accelerated', 'Optimized', 'Streamlined'];

  // Get existing bullets from work experience
  for (const job of workExperience.slice(0, 2)) {
    const jobBullets = job.bullets || [];
    for (const bullet of jobBullets.slice(0, 3)) {
      const metric = metrics[bullets.length % metrics.length];
      const action = actions[bullets.length % actions.length];

      // Create enhanced version
      let enhanced = bullet;
      if (!bullet.match(/\d+%|[\d.]+x/)) {
        // Add metrics if none exist
        enhanced = `${action} ${bullet.toLowerCase().replace(/^(led|managed|developed|built|created|designed)/i, '').trim()}, resulting in ${metric} improvement in team productivity`;
      }

      bullets.push({
        id: crypto.randomUUID(),
        before: bullet,
        after: enhanced,
        text: enhanced,
        accepted: null,
      });
    }
  }

  // Add some generic enhanced bullets if we don't have enough
  const genericBullets = [
    {
      before: 'Worked on various frontend projects',
      after: 'Led development of 5+ customer-facing features using React and TypeScript, improving user engagement by 25%',
    },
    {
      before: 'Collaborated with team members',
      after: 'Collaborated with cross-functional teams of 8+ engineers and designers, delivering projects 20% ahead of schedule',
    },
    {
      before: 'Fixed bugs and improved code quality',
      after: 'Reduced bug count by 40% through implementation of comprehensive testing strategy and code review processes',
    },
    {
      before: 'Built new features for the product',
      after: 'Architected and delivered 3 major product features, contributing to 15% increase in monthly active users',
    },
  ];

  while (bullets.length < 5) {
    const generic = genericBullets[bullets.length % genericBullets.length];
    bullets.push({
      id: crypto.randomUUID(),
      before: generic.before,
      after: generic.after,
      text: generic.after,
      accepted: null,
    });
  }

  return bullets;
}

/**
 * Generate professional summary for CV
 */
function generateProfessionalSummary(role, baseProfile, keywords) {
  const currentRole = baseProfile?.work_experience?.[0]?.position || 'professional';
  const yearsExp = baseProfile?.work_experience?.length > 1 ? `${baseProfile.work_experience.length + 3}+` : '3+';

  // Pick top 3 keywords to mention
  const topKeywords = keywords.slice(0, 3).map(k => k.keyword).join(', ');

  const summaries = [
    `Results-driven ${currentRole} with ${yearsExp} years of experience delivering high-impact solutions. Proven track record in ${topKeywords || 'software development'}, with a focus on clean code, performance optimization, and user-centric design. Passionate about solving complex problems and driving measurable business outcomes.`,
    `Experienced ${currentRole} with ${yearsExp} years building scalable applications and leading technical initiatives. Skilled in ${topKeywords || 'modern technologies'}, with expertise in cross-functional collaboration and agile methodologies. Committed to continuous learning and delivering exceptional results.`,
    `Dynamic ${currentRole} bringing ${yearsExp} years of hands-on experience in ${topKeywords || 'software engineering'}. Strong background in architecting solutions, mentoring teams, and translating business requirements into technical excellence. Track record of improving system performance and user satisfaction.`,
  ];

  return summaries[Math.floor(Math.random() * summaries.length)];
}

/**
 * Generate cover letter
 */
function generateCoverLetter(company, role, baseProfile) {
  const name = baseProfile?.personal_info?.name || 'Your Name';
  const currentRole = baseProfile?.work_experience?.[0]?.position || 'Software Professional';
  const currentCompany = baseProfile?.work_experience?.[0]?.company || 'my current company';

  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${role} position at ${company}. With my background as a ${currentRole} at ${currentCompany}, I am confident that my skills and experience align well with the requirements of this role.

Throughout my career, I have demonstrated a passion for building high-quality software solutions and collaborating effectively with cross-functional teams. I have consistently delivered impactful results, including improving system performance, mentoring junior developers, and contributing to products used by thousands of users.

What excites me most about ${company} is the opportunity to work on challenging problems alongside talented professionals. I am particularly drawn to your company's commitment to innovation and the impact your products have on users worldwide.

I would welcome the opportunity to discuss how my experience and enthusiasm can contribute to your team's success. Thank you for considering my application.

Best regards,
${name}`;
}

/**
 * Main function to generate all mock content
 */
export function generateMockContent(jobDescription, baseProfile) {
  const company = extractCompany(jobDescription) || 'the company';
  const role = extractRole(jobDescription) || 'this position';
  const keywords = extractKeywords(jobDescription);
  const requirements = generateRequirements(jobDescription);
  const tailoredBullets = generateTailoredBullets(baseProfile, keywords);
  const coverLetter = generateCoverLetter(company, role, baseProfile);
  const professionalSummary = generateProfessionalSummary(role, baseProfile, keywords);

  // Calculate match score based on requirements
  const coveredCount = requirements.filter(r => r.status === 'covered').length;
  const weakCount = requirements.filter(r => r.status === 'weak').length;
  const matchScore = Math.round(
    ((coveredCount * 1 + weakCount * 0.5) / requirements.length) * 100
  );

  return {
    tailored_bullets: tailoredBullets,
    cover_letter: coverLetter,
    professional_summary: professionalSummary,
    keyword_analysis: {
      requirements,
      keywords,
    },
    match_score: Math.max(70, Math.min(95, matchScore + Math.floor(Math.random() * 10))),
  };
}
