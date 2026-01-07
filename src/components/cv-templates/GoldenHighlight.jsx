import { forwardRef } from 'react';
import { Mail, Phone, MapPin, Linkedin } from 'lucide-react';

const GoldenHighlight = forwardRef(function GoldenHighlight(
  { personalInfo, summary, experience, education, skills, projects },
  ref
) {
  const { languages = [], frameworks = [], tools = [] } = skills || {};
  const hasSkills = languages.length > 0 || frameworks.length > 0 || tools.length > 0;

  return (
    <div
      ref={ref}
      className="bg-white w-[210mm] h-[297mm] mx-auto shadow-elevated overflow-hidden flex"
      style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
    >
      {/* Yellow accent bar - full height */}
      <div className="w-3 bg-[#f1c40f] flex-shrink-0" />

      {/* Left Column - Photo, Skills, Education */}
      <div className="w-[70mm] bg-slate-50 flex flex-col flex-shrink-0">
        {/* Photo area */}
        <div className="p-6 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-[#f1c40f] flex items-center justify-center overflow-hidden">
            {personalInfo?.photo ? (
              <img src={personalInfo.photo} alt={personalInfo?.name || 'Profile'} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-white">
                {personalInfo?.name?.split(' ').map(n => n[0]).join('') || 'CV'}
              </span>
            )}
          </div>
        </div>

        {/* Skills */}
        {hasSkills && (
          <div className="px-5 py-4">
            <h2 className="text-sm font-bold text-slate-800 mb-3">
              Skills
              <span className="block w-8 h-0.5 bg-[#f1c40f] mt-1" />
            </h2>
            <div className="space-y-3">
              {languages.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Languages</p>
                  <ul className="space-y-1 text-sm text-slate-600">
                    {languages.slice(0, 4).map((skill, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#f1c40f] rounded-full" />
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {frameworks.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Frameworks</p>
                  <ul className="space-y-1 text-sm text-slate-600">
                    {frameworks.slice(0, 4).map((skill, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#f1c40f] rounded-full" />
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {tools.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Tools</p>
                  <ul className="space-y-1 text-sm text-slate-600">
                    {tools.slice(0, 4).map((skill, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#f1c40f] rounded-full" />
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Education */}
        {education?.length > 0 && (
          <div className="px-5 py-4">
            <h2 className="text-sm font-bold text-slate-800 mb-3">
              Education
              <span className="block w-8 h-0.5 bg-[#f1c40f] mt-1" />
            </h2>
            <div className="space-y-3">
              {education.map((edu, idx) => (
                <div key={edu.id || idx}>
                  <p className="font-medium text-slate-800 text-sm">
                    {edu.degree}
                  </p>
                  <p className="text-xs text-slate-500">
                    {edu.school}
                    {edu.year && ` - ${edu.year}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects?.length > 0 && (
          <div className="px-5 py-4">
            <h2 className="text-sm font-bold text-slate-800 mb-3">
              Projects
              <span className="block w-8 h-0.5 bg-[#f1c40f] mt-1" />
            </h2>
            <div className="space-y-2">
              {projects.slice(0, 3).map((project, idx) => (
                <div key={project.id || idx}>
                  <p className="font-medium text-slate-700 text-sm">{project.name}</p>
                  {project.technologies?.length > 0 && (
                    <p className="text-xs text-slate-400">
                      {project.technologies.slice(0, 3).join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spacer to fill remaining height */}
        <div className="flex-1" />
      </div>

      {/* Right Column - Name, Summary, Experience */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-6 py-6 border-b border-slate-200">
          <h1 className="text-3xl font-bold text-slate-800 mb-1">
            {personalInfo?.name || 'Your Name'}
          </h1>
          <p className="text-slate-500 text-sm mb-3">
            {personalInfo?.title || 'Professional Title'}
          </p>

          {/* Contact info row */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
            {personalInfo?.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#f1c40f]" />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo?.email && (
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-[#f1c40f]" />
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo?.linkedin && (
              <div className="flex items-center gap-1">
                <Linkedin className="w-3 h-3 text-[#f1c40f]" />
                <span>{personalInfo.linkedin}</span>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 mb-2">
              Summary
              <span className="block w-12 h-0.5 bg-[#f1c40f] mt-1" />
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {summary}
            </p>
          </div>
        )}

        {/* Work History */}
        <div className="px-6 py-4 flex-1">
          {experience?.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-slate-800 mb-3">
                Work history
                <span className="block w-8 h-0.5 bg-[#f1c40f] mt-1" />
              </h2>
              <div className="space-y-4">
                {experience.map((job, idx) => (
                  <div key={job.id || idx}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm">
                          {job.position}
                        </h3>
                        <p className="text-xs text-[#f1c40f] font-medium">{job.company}</p>
                      </div>
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {job.duration}
                      </span>
                    </div>
                    {job.bullets?.length > 0 && (
                      <ul className="space-y-1 text-xs text-slate-600 mt-2">
                        {job.bullets.map((bullet, bulletIdx) => (
                          <li key={bulletIdx} className="flex gap-2">
                            <span className="text-[#f1c40f] mt-0.5">•</span>
                            <span className="leading-relaxed">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
});

export default GoldenHighlight;
