import { forwardRef } from 'react';

const ModernMinimal = forwardRef(function ModernMinimal(
  { personalInfo, summary, experience, education, skills, projects },
  ref
) {
  const { languages = [], frameworks = [], tools = [] } = skills || {};
  const hasSkills = languages.length > 0 || frameworks.length > 0 || tools.length > 0;

  return (
    <div
      ref={ref}
      className="bg-white w-[210mm] h-[297mm] mx-auto shadow-elevated px-12 py-10 overflow-hidden"
      style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
    >
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-[#0f172a] tracking-tight mb-1">
          {personalInfo?.name || 'Your Name'}
        </h1>
        <p className="text-lg text-[#0d9488] font-medium mb-4">
          {personalInfo?.title || 'Professional Title'}
        </p>

        {/* Contact Row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#64748b]">
          {personalInfo?.email && (
            <span>{personalInfo.email}</span>
          )}
          {personalInfo?.email && personalInfo?.phone && (
            <span className="text-[#0d9488]">•</span>
          )}
          {personalInfo?.phone && (
            <span>{personalInfo.phone}</span>
          )}
          {(personalInfo?.email || personalInfo?.phone) && personalInfo?.location && (
            <span className="text-[#0d9488]">•</span>
          )}
          {personalInfo?.location && (
            <span>{personalInfo.location}</span>
          )}
          {(personalInfo?.email || personalInfo?.phone || personalInfo?.location) && personalInfo?.linkedin && (
            <span className="text-[#0d9488]">•</span>
          )}
          {personalInfo?.linkedin && (
            <span>{personalInfo.linkedin}</span>
          )}
        </div>
      </header>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-[#0d9488] via-[#0d9488]/50 to-transparent mb-8" />

      {/* Summary */}
      {summary && (
        <section className="mb-8">
          <p className="text-[#334155] leading-relaxed">
            {summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {experience?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-bold text-[#0d9488] uppercase tracking-[0.2em] mb-4">
            Experience
          </h2>
          <div className="space-y-5">
            {experience.map((job, idx) => (
              <div key={job.id || idx}>
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="font-semibold text-[#0f172a]">
                    {job.company}
                  </h3>
                  <span className="text-sm text-[#94a3b8]">
                    {job.duration}
                  </span>
                </div>
                <p className="text-[#0d9488] text-sm font-medium mb-2">
                  {job.position}
                </p>
                {job.bullets?.length > 0 && (
                  <ul className="space-y-1.5 text-sm text-[#475569]">
                    {job.bullets.map((bullet, bulletIdx) => (
                      <li key={bulletIdx} className="flex gap-3">
                        <span className="text-[#0d9488] select-none">•</span>
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

      {/* Divider */}
      {(experience?.length > 0 && (projects?.length > 0 || education?.length > 0 || hasSkills)) && (
        <div className="h-px bg-[#e2e8f0] mb-8" />
      )}

      {/* Projects */}
      {projects?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-bold text-[#0d9488] uppercase tracking-[0.2em] mb-4">
            Projects
          </h2>
          <div className="space-y-4">
            {projects.slice(0, 3).map((project, idx) => (
              <div key={project.id || idx}>
                <div className="flex items-baseline gap-2 mb-1">
                  <h3 className="font-semibold text-[#0f172a]">
                    {project.name}
                  </h3>
                  {project.technologies?.length > 0 && (
                    <span className="text-xs text-[#94a3b8]">
                      {project.technologies.slice(0, 3).join(', ')}
                    </span>
                  )}
                </div>
                {project.description && (
                  <p className="text-sm text-[#475569] leading-relaxed">
                    {project.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Two Column Section: Education & Skills */}
      <div className="flex gap-12">
        {/* Education */}
        {education?.length > 0 && (
          <section className="flex-1">
            <h2 className="text-xs font-bold text-[#0d9488] uppercase tracking-[0.2em] mb-4">
              Education
            </h2>
            <div className="space-y-3">
              {education.map((edu, idx) => (
                <div key={edu.id || idx}>
                  <h3 className="font-semibold text-[#0f172a] text-sm">
                    {edu.degree}
                    {edu.field && ` in ${edu.field}`}
                  </h3>
                  <p className="text-sm text-[#64748b]">
                    {edu.school}
                    {edu.year && ` • ${edu.year}`}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {hasSkills && (
          <section className="flex-1">
            <h2 className="text-xs font-bold text-[#0d9488] uppercase tracking-[0.2em] mb-4">
              Skills
            </h2>
            <div className="space-y-3">
              {languages.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5">Languages</p>
                  <div className="flex flex-wrap gap-1.5">
                    {languages.map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-[#f1f5f9] text-[#334155] text-xs font-medium rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {frameworks.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5">Frameworks</p>
                  <div className="flex flex-wrap gap-1.5">
                    {frameworks.map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-[#f1f5f9] text-[#334155] text-xs font-medium rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {tools.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5">Tools</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tools.map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-[#f1f5f9] text-[#334155] text-xs font-medium rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
});

export default ModernMinimal;
