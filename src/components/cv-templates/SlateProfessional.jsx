import { forwardRef } from 'react';
import { Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react';

const SlateProfessional = forwardRef(function SlateProfessional(
  { personalInfo, summary, experience, education, skills, projects },
  ref
) {
  const { languages = [], frameworks = [], tools = [] } = skills || {};
  const hasSkills = languages.length > 0 || frameworks.length > 0 || tools.length > 0;

  return (
    <div
      ref={ref}
      className="bg-white w-[210mm] h-[297mm] mx-auto shadow-elevated px-10 py-8 overflow-hidden"
      style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}
    >
      {/* Header */}
      <header className="text-center mb-6 pb-6 border-b-2 border-slate-800">
        <h1 className="text-4xl font-semibold text-slate-800 tracking-tight mb-1">
          {personalInfo?.name || 'Your Name'}
        </h1>
        <p className="text-slate-500 text-lg mb-4">
          {personalInfo?.title || 'Professional Title'}
        </p>

        {/* Contact Row */}
        <div className="flex justify-center flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
          {personalInfo?.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo?.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo?.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{personalInfo.location}</span>
            </div>
          )}
          {personalInfo?.linkedin && (
            <div className="flex items-center gap-1.5">
              <Linkedin className="w-4 h-4 text-slate-400" />
              <span>{personalInfo.linkedin}</span>
            </div>
          )}
          {personalInfo?.portfolio && (
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-slate-400" />
              <span>{personalInfo.portfolio}</span>
            </div>
          )}
        </div>
      </header>

      {/* Summary */}
      {summary && (
        <section className="mb-6">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-[0.2em] mb-2">
            Professional Summary
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {experience?.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-[0.2em] mb-3">
            Experience
          </h2>
          <div className="space-y-4">
            {experience.map((job, idx) => (
              <div key={job.id || idx}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-slate-800">
                    {job.position}
                  </h3>
                  <span className="text-sm text-slate-400">
                    {job.duration}
                  </span>
                </div>
                <p className="text-sm text-slate-500 italic mb-2">
                  {job.company}
                </p>
                {job.bullets?.length > 0 && (
                  <ul className="space-y-1 text-sm text-slate-600 pl-4">
                    {job.bullets.map((bullet, bulletIdx) => (
                      <li key={bulletIdx} className="list-disc leading-relaxed">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Two column for Education and Skills */}
      <div className="flex gap-8">
        {/* Education */}
        {education?.length > 0 && (
          <section className="flex-1">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-[0.2em] mb-3">
              Education
            </h2>
            <div className="space-y-2">
              {education.map((edu, idx) => (
                <div key={edu.id || idx}>
                  <h3 className="font-semibold text-slate-800 text-sm">
                    {edu.degree}
                    {edu.field && ` in ${edu.field}`}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {edu.school}
                    {edu.year && `, ${edu.year}`}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {hasSkills && (
          <section className="flex-1">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-[0.2em] mb-3">
              Skills
            </h2>
            <div className="space-y-3">
              {languages.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Languages</p>
                  <div className="flex flex-wrap gap-1.5">
                    {languages.map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded">
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
                      <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded">
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
                      <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded">
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
        <section className="mt-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-[0.2em] mb-2">
            Projects
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {projects.slice(0, 2).map((project, idx) => (
              <div key={project.id || idx}>
                <h3 className="font-semibold text-slate-800 text-sm">
                  {project.name}
                </h3>
                {project.technologies?.length > 0 && (
                  <p className="text-xs text-slate-400">
                    {project.technologies.slice(0, 3).join(' · ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
});

export default SlateProfessional;
