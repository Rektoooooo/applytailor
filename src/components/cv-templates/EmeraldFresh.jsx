import { forwardRef } from 'react';
import { Mail, Phone, MapPin, Linkedin, Circle } from 'lucide-react';

const EmeraldFresh = forwardRef(function EmeraldFresh(
  { personalInfo, summary, experience, education, skills, projects },
  ref
) {
  const { languages = [], frameworks = [], tools = [] } = skills || {};
  const hasSkills = languages.length > 0 || frameworks.length > 0 || tools.length > 0;

  return (
    <div
      ref={ref}
      className="bg-white w-[210mm] h-[297mm] mx-auto shadow-elevated overflow-hidden"
      style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
    >
      {/* Header with emerald accent top bar */}
      <div className="h-2 bg-gradient-to-r from-emerald-500 to-emerald-600" />

      <div className="px-8 py-6">
        {/* Name Section */}
        <header className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
              {personalInfo?.name || 'Your Name'}
            </h1>
            <p className="text-emerald-600 text-lg font-medium mt-1">
              {personalInfo?.title || 'Professional Title'}
            </p>
          </div>

          {/* Contact */}
          <div className="text-right text-sm text-slate-600 space-y-1">
            {personalInfo?.email && (
              <div className="flex items-center justify-end gap-2">
                <span>{personalInfo.email}</span>
                <Mail className="w-4 h-4 text-emerald-500" />
              </div>
            )}
            {personalInfo?.phone && (
              <div className="flex items-center justify-end gap-2">
                <span>{personalInfo.phone}</span>
                <Phone className="w-4 h-4 text-emerald-500" />
              </div>
            )}
            {personalInfo?.location && (
              <div className="flex items-center justify-end gap-2">
                <span>{personalInfo.location}</span>
                <MapPin className="w-4 h-4 text-emerald-500" />
              </div>
            )}
            {personalInfo?.linkedin && (
              <div className="flex items-center justify-end gap-2">
                <span className="text-xs">{personalInfo.linkedin}</span>
                <Linkedin className="w-4 h-4 text-emerald-500" />
              </div>
            )}
          </div>
        </header>

        {/* Summary */}
        {summary && (
          <section className="mb-6 p-4 bg-emerald-50 rounded-lg border-l-4 border-emerald-500">
            <p className="text-sm text-slate-700 leading-relaxed">
              {summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {experience?.length > 0 && (
          <section className="mb-6">
            <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                <span className="text-white text-sm">01</span>
              </div>
              Work Experience
            </h2>
            <div className="space-y-4 pl-11">
              {experience.map((job, idx) => (
                <div key={job.id || idx} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-[26px] top-1 w-3 h-3 rounded-full bg-emerald-200 border-2 border-emerald-500" />

                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-slate-800">
                      {job.position}
                    </h3>
                    <span className="text-xs text-emerald-600 font-medium">
                      {job.duration}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-2">
                    {job.company}
                  </p>
                  {job.bullets?.length > 0 && (
                    <ul className="space-y-1 text-sm text-slate-600">
                      {job.bullets.map((bullet, bulletIdx) => (
                        <li key={bulletIdx} className="flex gap-2">
                          <span className="text-emerald-500">→</span>
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

        {/* Two columns: Skills & Education */}
        <div className="flex gap-6">
          {/* Skills */}
          {hasSkills && (
            <section className="flex-1">
              <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                  <span className="text-white text-sm">02</span>
                </div>
                Skills
              </h2>
              <div className="space-y-3 pl-11">
                {languages.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Languages</p>
                    <div className="flex flex-wrap gap-1.5">
                      {languages.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {frameworks.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Frameworks</p>
                    <div className="flex flex-wrap gap-1.5">
                      {frameworks.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-emerald-200 text-emerald-900 text-xs font-medium rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {tools.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Tools</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tools.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Education */}
          {education?.length > 0 && (
            <section className="flex-1">
              <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                  <span className="text-white text-sm">03</span>
                </div>
                Education
              </h2>
              <div className="space-y-3 pl-11">
                {education.map((edu, idx) => (
                  <div key={edu.id || idx}>
                    <h3 className="font-semibold text-slate-800 text-sm">
                      {edu.degree}
                      {edu.field && ` - ${edu.field}`}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {edu.school}
                      {edu.year && ` | ${edu.year}`}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Projects */}
        {projects?.length > 0 && (
          <section className="mt-6">
            <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                <span className="text-white text-sm">04</span>
              </div>
              Projects
            </h2>
            <div className="grid grid-cols-2 gap-4 pl-11">
              {projects.slice(0, 4).map((project, idx) => (
                <div key={project.id || idx} className="p-3 bg-slate-50 rounded-lg">
                  <h3 className="font-semibold text-slate-800 text-sm">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-xs text-slate-500 mt-1">{project.description}</p>
                  )}
                  {project.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies.slice(0, 3).map((tech, techIdx) => (
                        <span key={techIdx} className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
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

export default EmeraldFresh;
