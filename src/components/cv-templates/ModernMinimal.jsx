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
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#64748b]">
          {personalInfo?.email && (
            <span>{personalInfo.email}</span>
          )}
          {personalInfo?.phone && (
            <>
              <span className="text-[#0d9488]">•</span>
              <span>{personalInfo.phone}</span>
            </>
          )}
          {personalInfo?.location && (
            <>
              <span className="text-[#0d9488]">•</span>
              <span>{personalInfo.location}</span>
            </>
          )}
          {personalInfo?.linkedin && (
            <>
              <span className="text-[#0d9488]">•</span>
              <span>{personalInfo.linkedin}</span>
            </>
          )}
          {personalInfo?.portfolio && (
            <>
              <span className="text-[#0d9488]">•</span>
              <span>{personalInfo.portfolio}</span>
            </>
          )}
        </div>
      </header>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-[#0d9488] via-[#0d9488]/50 to-transparent mb-5" />

      {/* Summary */}
      {summary && (
        <section className="mb-5">
          <p className="text-[#334155] leading-snug text-sm">
            {summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {experience?.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold text-[#0d9488] uppercase tracking-[0.2em] mb-3">
            Experience
          </h2>
          <div className="space-y-3">
            {experience.map((job, idx) => (
              <div key={job.id || idx}>
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="font-semibold text-[#0f172a] text-sm">
                    {job.company}
                  </h3>
                  <span className="text-xs text-[#94a3b8]">
                    {job.duration}
                  </span>
                </div>
                <p className="text-[#0d9488] text-xs font-medium mb-1">
                  {job.position}
                </p>
                {job.bullets?.length > 0 && (
                  <ul className="space-y-0.5 text-xs text-[#475569]">
                    {job.bullets.map((bullet, bulletIdx) => (
                      <li key={bulletIdx} className="flex gap-2">
                        <span className="text-[#0d9488] select-none">•</span>
                        <span className="leading-snug">{bullet}</span>
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
        <div className="h-px bg-[#e2e8f0] mb-5" />
      )}

      {/* Projects */}
      {projects?.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold text-[#0d9488] uppercase tracking-[0.2em] mb-2">
            Projects
          </h2>
          <div className="space-y-2">
            {projects.slice(0, 2).map((project, idx) => (
              <div key={project.id || idx}>
                <div className="flex items-baseline gap-2">
                  <h3 className="font-semibold text-[#0f172a] text-sm">
                    {project.name}
                  </h3>
                  {project.technologies?.length > 0 && (
                    <span className="text-[10px] text-[#94a3b8]">
                      {project.technologies.slice(0, 3).join(', ')}
                    </span>
                  )}
                </div>
                {project.description && (
                  <p className="text-xs text-[#475569] leading-snug">
                    {project.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Two Column Section: Education & Skills */}
      <div className="flex gap-8">
        {/* Education */}
        {education?.length > 0 && (
          <section className="flex-1">
            <h2 className="text-xs font-bold text-[#0d9488] uppercase tracking-[0.2em] mb-2">
              Education
            </h2>
            <div className="space-y-2">
              {education.map((edu, idx) => (
                <div key={edu.id || idx}>
                  <h3 className="font-semibold text-[#0f172a] text-xs">
                    {edu.degree}
                  </h3>
                  <p className="text-xs text-[#64748b]">
                    {edu.school}{edu.year && ` • ${edu.year}`}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {hasSkills && (
          <section className="flex-[2]">
            <h2 className="text-xs font-bold text-[#0d9488] uppercase tracking-[0.2em] mb-2">
              Skills
            </h2>
            <div className="space-y-2">
              {languages.length > 0 && (
                <div>
                  <p className="text-[9px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-1">Languages</p>
                  <div className="flex flex-wrap gap-1">
                    {languages.map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-[#f1f5f9] text-[#334155] text-[10px] font-medium rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {frameworks.length > 0 && (
                <div>
                  <p className="text-[9px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-1">Frameworks</p>
                  <div className="flex flex-wrap gap-1">
                    {frameworks.map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-[#f1f5f9] text-[#334155] text-[10px] font-medium rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {tools.length > 0 && (
                <div>
                  <p className="text-[9px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-1">Tools</p>
                  <div className="flex flex-wrap gap-1">
                    {tools.map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-[#f1f5f9] text-[#334155] text-[10px] font-medium rounded-full">
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
