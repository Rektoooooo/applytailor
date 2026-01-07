import { forwardRef } from 'react';
import { Mail, Phone, MapPin, Linkedin, Globe, ExternalLink } from 'lucide-react';

const ClassicProfessional = forwardRef(function ClassicProfessional(
  { personalInfo, summary, experience, education, skills, projects },
  ref
) {
  const { languages = [], frameworks = [], tools = [] } = skills || {};
  const hasSkills = languages.length > 0 || frameworks.length > 0 || tools.length > 0;

  return (
    <div
      ref={ref}
      className="bg-[#faf8f2] w-[210mm] h-[297mm] mx-auto shadow-elevated overflow-hidden flex flex-col"
      style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}
    >
      {/* Header */}
      <div className="bg-[#1e3a5f] text-white px-8 py-6 flex-shrink-0">
        <h1
          className="text-4xl font-semibold tracking-wide mb-1"
          style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
        >
          {personalInfo?.name || 'Your Name'}
        </h1>
        <p className="text-[#b8860b] text-lg font-medium tracking-wider uppercase">
          {personalInfo?.title || 'Professional Title'}
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-[70mm] bg-[#1e3a5f]/5 px-6 py-6 border-r border-[#1e3a5f]/10 flex flex-col flex-shrink-0">
          {/* Contact */}
          <div className="mb-6">
            <h2
              className="text-[#1e3a5f] text-sm font-semibold uppercase tracking-widest mb-3 pb-2 border-b-2 border-[#b8860b]"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              Contact
            </h2>
            <div className="space-y-2 text-sm text-[#1e3a5f]/80">
              {personalInfo?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#b8860b]" />
                  <span className="break-all">{personalInfo.email}</span>
                </div>
              )}
              {personalInfo?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#b8860b]" />
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#b8860b]" />
                  <span>{personalInfo.location}</span>
                </div>
              )}
              {personalInfo?.linkedin && (
                <div className="flex items-center gap-2">
                  <Linkedin className="w-3.5 h-3.5 text-[#b8860b]" />
                  <span className="break-all text-xs">{personalInfo.linkedin}</span>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {hasSkills && (
            <div className="mb-6">
              <h2
                className="text-[#1e3a5f] text-sm font-semibold uppercase tracking-widest mb-3 pb-2 border-b-2 border-[#b8860b]"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                Expertise
              </h2>
              <div className="space-y-3">
                {languages.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-[#1e3a5f]/60 uppercase tracking-wider mb-1">Languages</p>
                    <ul className="space-y-1 text-sm text-[#1e3a5f]/80">
                      {languages.slice(0, 5).map((skill, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-[#b8860b] rounded-full" />
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {frameworks.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-[#1e3a5f]/60 uppercase tracking-wider mb-1">Frameworks</p>
                    <ul className="space-y-1 text-sm text-[#1e3a5f]/80">
                      {frameworks.slice(0, 5).map((skill, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-[#b8860b] rounded-full" />
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {tools.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-[#1e3a5f]/60 uppercase tracking-wider mb-1">Tools</p>
                    <ul className="space-y-1 text-sm text-[#1e3a5f]/80">
                      {tools.slice(0, 5).map((skill, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-[#b8860b] rounded-full" />
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
            <div>
              <h2
                className="text-[#1e3a5f] text-sm font-semibold uppercase tracking-widest mb-3 pb-2 border-b-2 border-[#b8860b]"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                Education
              </h2>
              <div className="space-y-3">
                {education.map((edu, idx) => (
                  <div key={edu.id || idx} className="text-sm">
                    <p className="font-semibold text-[#1e3a5f]">
                      {edu.degree}
                      {edu.field && ` in ${edu.field}`}
                    </p>
                    <p className="text-[#1e3a5f]/70">{edu.school}</p>
                    {edu.year && (
                      <p className="text-[#b8860b] text-xs mt-0.5">{edu.year}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spacer to fill remaining height */}
          <div className="flex-1" />
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6 py-6">
          {/* Summary */}
          {summary && (
            <div className="mb-6">
              <h2
                className="text-[#1e3a5f] text-sm font-semibold uppercase tracking-widest mb-3 pb-2 border-b-2 border-[#b8860b]"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                Professional Summary
              </h2>
              <p className="text-sm text-[#1e3a5f]/80 leading-relaxed">
                {summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {experience?.length > 0 && (
            <div className="mb-6">
              <h2
                className="text-[#1e3a5f] text-sm font-semibold uppercase tracking-widest mb-3 pb-2 border-b-2 border-[#b8860b]"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                Professional Experience
              </h2>
              <div className="space-y-4">
                {experience.map((job, idx) => (
                  <div key={job.id || idx}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3
                        className="font-semibold text-[#1e3a5f]"
                        style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                      >
                        {job.position}
                      </h3>
                      <span className="text-xs text-[#b8860b] font-medium">
                        {job.duration}
                      </span>
                    </div>
                    <p className="text-sm text-[#1e3a5f]/70 mb-2 italic">
                      {job.company}
                    </p>
                    {job.bullets?.length > 0 && (
                      <ul className="space-y-1 text-sm text-[#1e3a5f]/80">
                        {job.bullets.map((bullet, bulletIdx) => (
                          <li key={bulletIdx} className="flex gap-2">
                            <span className="text-[#b8860b] mt-1.5">-</span>
                            <span className="leading-relaxed">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects?.length > 0 && (
            <div>
              <h2
                className="text-[#1e3a5f] text-sm font-semibold uppercase tracking-widest mb-3 pb-2 border-b-2 border-[#b8860b]"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                Notable Projects
              </h2>
              <div className="space-y-3">
                {projects.slice(0, 3).map((project, idx) => (
                  <div key={project.id || idx}>
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className="font-semibold text-[#1e3a5f] text-sm"
                        style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                      >
                        {project.name}
                      </h3>
                      {project.link && (
                        <ExternalLink className="w-3 h-3 text-[#b8860b]" />
                      )}
                    </div>
                    {project.description && (
                      <p className="text-xs text-[#1e3a5f]/70 leading-relaxed">
                        {project.description}
                      </p>
                    )}
                    {project.technologies?.length > 0 && (
                      <p className="text-xs text-[#b8860b] mt-1">
                        {project.technologies.join(' | ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default ClassicProfessional;
