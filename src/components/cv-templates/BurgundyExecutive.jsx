import { forwardRef } from 'react';
import { Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react';

const BurgundyExecutive = forwardRef(function BurgundyExecutive(
  { personalInfo, summary, experience, education, skills, projects },
  ref
) {
  const { languages = [], frameworks = [], tools = [] } = skills || {};
  const hasSkills = languages.length > 0 || frameworks.length > 0 || tools.length > 0;

  return (
    <div
      ref={ref}
      className="bg-[#faf9f7] w-[210mm] h-[297mm] mx-auto shadow-elevated overflow-hidden flex flex-col"
      style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
    >
      {/* Burgundy Header */}
      <div className="bg-[#722f37] px-8 py-8 text-center">
        <h1 className="text-4xl font-bold text-white tracking-wide">
          {personalInfo?.name || 'Your Name'}
        </h1>
        <p className="text-[#d4a574] text-lg mt-2 tracking-[0.2em] uppercase font-light">
          {personalInfo?.title || 'Professional Title'}
        </p>

        {/* Contact Row */}
        <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-white/80">
          {personalInfo?.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#d4a574]" />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo?.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#d4a574]" />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo?.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#d4a574]" />
              <span>{personalInfo.location}</span>
            </div>
          )}
          {personalInfo?.linkedin && (
            <div className="flex items-center gap-1.5">
              <Linkedin className="w-3.5 h-3.5 text-[#d4a574]" />
              <span>{personalInfo.linkedin}</span>
            </div>
          )}
          {personalInfo?.portfolio && (
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#d4a574]" />
              <span>{personalInfo.portfolio}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6 flex-1" style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}>
        {/* Summary */}
        {summary && (
          <section className="mb-6 text-center">
            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto italic">
              "{summary}"
            </p>
          </section>
        )}

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <span className="w-16 h-px bg-[#722f37]/30" />
          <span className="w-2 h-2 rotate-45 bg-[#722f37]" />
          <span className="w-16 h-px bg-[#722f37]/30" />
        </div>

        {/* Experience */}
        {experience?.length > 0 && (
          <section className="mb-6">
            <h2 className="text-center text-lg font-semibold text-[#722f37] uppercase tracking-[0.2em] mb-4">
              Professional Experience
            </h2>
            <div className="space-y-5">
              {experience.map((job, idx) => (
                <div key={job.id || idx} className="relative pl-6 border-l-2 border-[#722f37]/20">
                  <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-[#722f37]" />
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-slate-800">
                      {job.position}
                    </h3>
                    <span className="text-xs text-[#722f37]">
                      {job.duration}
                    </span>
                  </div>
                  <p className="text-sm text-[#d4a574] font-medium mb-2">
                    {job.company}
                  </p>
                  {job.bullets?.length > 0 && (
                    <ul className="space-y-1 text-sm text-slate-600">
                      {job.bullets.map((bullet, bulletIdx) => (
                        <li key={bulletIdx} className="flex gap-2">
                          <span className="text-[#722f37]">◆</span>
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

        {/* Two Column Layout */}
        <div className="flex gap-8">
          {/* Education */}
          {education?.length > 0 && (
            <section className="flex-1">
              <h2 className="text-center text-base font-semibold text-[#722f37] uppercase tracking-[0.15em] mb-3">
                Education
              </h2>
              <div className="space-y-2">
                {education.map((edu, idx) => (
                  <div key={edu.id || idx} className="text-center">
                    <h3 className="font-semibold text-slate-800 text-sm">
                      {edu.degree}
                    </h3>
                    <p className="text-xs text-slate-500">
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
              <h2 className="text-center text-base font-semibold text-[#722f37] uppercase tracking-[0.15em] mb-3">
                Core Competencies
              </h2>
              <div className="space-y-3">
                {languages.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 text-center">Languages</p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {languages.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 border border-[#722f37]/30 text-slate-700 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {frameworks.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 text-center">Frameworks</p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {frameworks.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-[#722f37]/10 text-[#722f37] text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {tools.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 text-center">Tools</p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {tools.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 border border-[#722f37]/30 text-slate-700 text-xs rounded-full">
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

        {/* Projects */}
        {projects?.length > 0 && (
          <section className="mt-6">
            <h2 className="text-center text-base font-semibold text-[#722f37] uppercase tracking-[0.15em] mb-3">
              Notable Projects
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {projects.slice(0, 4).map((project, idx) => (
                <div key={project.id || idx} className="text-center p-3 bg-white rounded border border-slate-100">
                  <h3 className="font-semibold text-slate-800 text-sm">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-xs text-slate-500 mt-1">{project.description}</p>
                  )}
                  {project.technologies?.length > 0 && (
                    <p className="text-xs text-[#722f37] mt-1">
                      {project.technologies.slice(0, 3).join(' • ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

    </div>
  );
});

export default BurgundyExecutive;
