import Header from '../components/Header';
import { CVTemplateSelector } from '../components/cv-templates';
import { useBaseProfile } from '../hooks/useBaseProfile';

// Sample data for preview when no profile exists
const sampleData = {
  personalInfo: {
    name: 'Alex Johnson',
    title: 'Senior Software Engineer',
    email: 'alex.johnson@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexjohnson',
  },
  summary: 'Experienced software engineer with 8+ years building scalable web applications. Passionate about clean code, mentoring teams, and delivering user-focused solutions that drive business growth.',
  experience: [
    {
      id: '1',
      position: 'Senior Software Engineer',
      company: 'TechCorp Inc.',
      duration: '2021 - Present',
      bullets: [
        'Led migration of legacy monolith to microservices architecture, reducing deployment time by 75%',
        'Mentored team of 5 junior developers, improving code review turnaround by 40%',
        'Implemented CI/CD pipeline that increased release frequency from monthly to weekly',
      ],
    },
    {
      id: '2',
      position: 'Software Engineer',
      company: 'StartupXYZ',
      duration: '2018 - 2021',
      bullets: [
        'Built real-time collaboration features serving 50K+ daily active users',
        'Reduced API response times by 60% through database optimization',
        'Developed mobile-first responsive design system adopted across 3 product teams',
      ],
    },
  ],
  education: [
    {
      id: '1',
      degree: 'B.S. Computer Science',
      field: '',
      school: 'University of California, Berkeley',
      year: '2018',
    },
  ],
  skills: {
    languages: ['JavaScript', 'TypeScript', 'Python', 'Go'],
    frameworks: ['React', 'Node.js', 'Next.js', 'Django'],
    tools: ['AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis'],
  },
  projects: [
    {
      id: '1',
      name: 'Open Source CLI Tool',
      description: 'Built a developer productivity CLI with 2K+ GitHub stars',
      technologies: ['Rust', 'CLI', 'Open Source'],
      link: 'github.com/alex/cli-tool',
    },
    {
      id: '2',
      name: 'E-commerce Platform',
      description: 'Full-stack marketplace handling $1M+ monthly transactions',
      technologies: ['Next.js', 'Stripe', 'PostgreSQL'],
      link: '',
    },
  ],
};

// Generate a summary from profile data
function generateProfileSummary(profile) {
  const role = profile?.work_experience?.[0]?.position || 'Professional';
  const skills = profile?.skills;
  const topSkills = [
    ...(skills?.languages || []).slice(0, 2),
    ...(skills?.frameworks || []).slice(0, 2),
  ].join(', ');

  const yearsExp = profile?.work_experience?.length > 1
    ? `${profile.work_experience.length + 2}+`
    : '3+';

  return `Results-driven ${role} with ${yearsExp} years of experience delivering high-impact solutions. ${topSkills ? `Skilled in ${topSkills}, with expertise in` : 'Expertise in'} building scalable applications and cross-functional collaboration. Committed to clean code, continuous learning, and driving measurable business outcomes.`;
}

export default function CVTemplates() {
  const { baseProfile } = useBaseProfile();

  // Use real profile data if available, otherwise use sample data
  const hasProfile = baseProfile?.work_experience?.length > 0;

  const personalInfo = hasProfile
    ? {
        name: baseProfile?.personal_info?.name || 'Your Name',
        title: baseProfile?.work_experience?.[0]?.position || baseProfile?.preferences?.roles?.[0] || 'Professional',
        email: baseProfile?.personal_info?.email || '',
        phone: baseProfile?.personal_info?.phone || '',
        location: baseProfile?.personal_info?.address || baseProfile?.preferences?.locations?.[0] || '',
        linkedin: baseProfile?.personal_info?.linkedin || baseProfile?.links?.linkedin || '',
        portfolio: baseProfile?.personal_info?.portfolio || '',
        photo: baseProfile?.personal_info?.photo_url || '',
      }
    : sampleData.personalInfo;

  const experience = hasProfile
    ? baseProfile.work_experience.map((exp) => ({
        id: exp.id,
        position: exp.position,
        company: exp.company,
        duration: exp.duration,
        bullets: exp.bullets || [],
      }))
    : sampleData.experience;

  const education = hasProfile ? baseProfile.education || [] : sampleData.education;
  const skills = hasProfile
    ? baseProfile.skills || { languages: [], frameworks: [], tools: [] }
    : sampleData.skills;
  const projects = hasProfile ? baseProfile.projects || [] : sampleData.projects;

  // Generate a professional summary based on profile or use sample
  const summary = hasProfile
    ? baseProfile?.professional_summary || generateProfileSummary(baseProfile)
    : sampleData.summary;

  return (
    <div className="min-h-screen">
      <Header
        title="CV Templates"
        subtitle={hasProfile ? 'Preview and export your CV' : 'Preview templates with sample data'}
      />

      <div className="p-6 h-[calc(100vh-120px)]">
        {!hasProfile && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            Showing sample data. Complete your <a href="/profile" className="underline font-medium">Base Profile</a> to see your own information.
          </div>
        )}

        <CVTemplateSelector
          personalInfo={personalInfo}
          summary={summary}
          experience={experience}
          education={education}
          skills={skills}
          projects={projects}
          disableExport={!hasProfile}
          onExport={() => {}}
        />
      </div>
    </div>
  );
}
