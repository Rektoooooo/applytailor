import { forwardRef } from 'react';
import { Mail, Phone, MapPin, Linkedin } from 'lucide-react';

const CoralAccent = forwardRef(function CoralAccent(
  { personalInfo, summary, experience, education, skills, projects },
  ref
) {
  const { languages = [], frameworks = [], tools = [] } = skills || {};
  const hasSkills = languages.length > 0 || frameworks.length > 0 || tools.length > 0;

  return (
    <div
      ref={ref}
      className="bg-white w-[210mm] h-[297mm] mx-auto shadow-elevated flex overflow-hidden"
      style={{ fontFamily: '"Work Sans", system-ui, sans-serif' }}
    >
      {/* Charcoal Sidebar */}
      <div className="w-[70mm] bg-[#2d3436] text-white flex flex-col">
        {/* Photo */}
        <div className="px-6 pt-8 pb-6 flex justify-center">
          <div className="w-28 h-28 rounded-full bg-[#e17055] flex items-center justify-center overflow-hidden">
            {personalInfo?.photo ? (
              <img src={personalInfo.photo} alt={personalInfo?.name || 'Profile'} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-white">
                {personalInfo?.name?.split(' ').map(n => n[0]).join('') || 'CV'}
              </span>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="px-5 py-4 border-t border-white/10">
          <div className="space-y-3 text-sm">
            {personalInfo?.email && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#e17055] flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/80 break-all text-xs">{personalInfo.email}</span>
              </div>
            )}
            {personalInfo?.phone && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#e17055] flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/80">{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo?.location && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#e17055] flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/80">{personalInfo.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Education */}
        {education?.length > 0 && (
          <div className="px-5 py-4 border-t border-white/10">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3 text-[#e17055]">
              Education
            </h2>
            <div className="space-y-3">
              {education.map((edu, idx) => (
                <div key={edu.id || idx} className="text-sm">
                  <p className="font-medium text-white text-xs">
                    {edu.degree}
                    {edu.field && `: ${edu.field}`}
                  </p>
                  <p className="text-white/60 text-xs">{edu.school}</p>
                  {edu.year && (
                    <p className="text-white/40 text-xs">{edu.year}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {hasSkills && (
          <div className="px-5 py-4 border-t border-white/10">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3 text-[#e17055]">
              Skills
            </h2>
            <div className="space-y-3">
              {languages.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1">Languages</p>
                  <ul className="space-y-1 text-xs">
                    {languages.slice(0, 4).map((skill, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-white/80">
                        <span className="w-1.5 h-1.5 bg-[#e17055] rounded-full" />
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {frameworks.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1">Frameworks</p>
                  <ul className="space-y-1 text-xs">
                    {frameworks.slice(0, 4).map((skill, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-white/80">
                        <span className="w-1.5 h-1.5 bg-[#e17055] rounded-full" />
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {tools.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1">Tools</p>
                  <ul className="space-y-1 text-xs">
                    {tools.slice(0, 4).map((skill, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-white/80">
                        <span className="w-1.5 h-1.5 bg-[#e17055] rounded-full" />
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Projects as Certifications style */}
        {projects?.length > 0 && (
          <div className="px-5 py-4 border-t border-white/10">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3 text-[#e17055]">
              Projects
            </h2>
            <div className="space-y-2">
              {projects.slice(0, 3).map((project, idx) => (
                <div key={project.id || idx} className="text-xs">
                  <p className="font-medium text-white">{project.name}</p>
                  {project.technologies?.length > 0 && (
                    <p className="text-white/50">{project.technologies.slice(0, 2).join(', ')}</p>
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
      <div className="flex-1">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200">
          <h1 className="text-3xl font-bold text-[#2d3436] uppercase tracking-wide">
            {personalInfo?.name || 'Your Name'}
          </h1>
          <p className="text-[#e17055] font-medium mt-1">
            {personalInfo?.title || 'Professional Title'}
          </p>
        </div>

        <div className="px-8 py-6">
          {/* Summary */}
          {summary && (
            <section className="mb-6">
              <h2 className="text-sm font-bold text-[#2d3436] uppercase tracking-wider mb-2">
                Summary Statement
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {summary}
              </p>
            </section>
          )}

          {/* Core Qualifications Box */}
          {hasSkills && (
            <section className="mb-6">
              <h2 className="text-sm font-bold text-[#2d3436] uppercase tracking-wider mb-2">
                Core Qualifications
              </h2>
              <div className="bg-[#ffeaa7]/30 border border-[#e17055]/20 rounded p-4">
                <div className="space-y-2">
                  {languages.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Languages</p>
                      <div className="flex flex-wrap gap-1.5">
                        {languages.slice(0, 4).map((skill, idx) => (
                          <span key={idx} className="text-xs text-slate-700 flex items-center gap-1">
                            <span className="text-[#e17055]">•</span> {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {frameworks.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Frameworks</p>
                      <div className="flex flex-wrap gap-1.5">
                        {frameworks.slice(0, 4).map((skill, idx) => (
                          <span key={idx} className="text-xs text-slate-700 flex items-center gap-1">
                            <span className="text-[#e17055]">•</span> {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {tools.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tools</p>
                      <div className="flex flex-wrap gap-1.5">
                        {tools.slice(0, 4).map((skill, idx) => (
                          <span key={idx} className="text-xs text-slate-700 flex items-center gap-1">
                            <span className="text-[#e17055]">•</span> {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Work Experience */}
          {experience?.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-[#2d3436] uppercase tracking-wider mb-3">
                Work Experience
              </h2>
              <div className="space-y-4">
                {experience.map((job, idx) => (
                  <div key={job.id || idx}>
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="font-semibold text-slate-800 text-sm">{job.company}</span>
                        <span className="text-slate-400 text-sm"> - </span>
                        <span className="text-[#e17055] text-sm">{job.position}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{job.duration}</p>
                    {job.bullets?.length > 0 && (
                      <ul className="space-y-1 text-xs text-slate-600">
                        {job.bullets.map((bullet, bulletIdx) => (
                          <li key={bulletIdx} className="flex gap-2">
                            <span className="text-[#e17055]">•</span>
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

export default CoralAccent;
