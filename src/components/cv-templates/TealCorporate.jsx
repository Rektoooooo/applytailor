import { forwardRef } from 'react';
import { Mail, Phone, MapPin, Linkedin, Globe, Calendar, User } from 'lucide-react';

const TealCorporate = forwardRef(function TealCorporate(
  { personalInfo, summary, experience, education, skills, projects },
  ref
) {
  const { languages = [], frameworks = [], tools = [] } = skills || {};
  const hasSkills = languages.length > 0 || frameworks.length > 0 || tools.length > 0;

  return (
    <div
      ref={ref}
      className="bg-slate-50 w-[210mm] h-[297mm] mx-auto shadow-elevated overflow-hidden flex flex-col"
      style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
    >
      {/* Teal Header Band */}
      <div className="bg-[#2c8c99] px-6 py-5 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-wide">
            {personalInfo?.name || 'Your Name'}
          </h1>
          <p className="text-white/80 text-sm tracking-wider uppercase mt-1">
            {personalInfo?.title || 'Professional Title'}
          </p>
        </div>
        {/* Photo circle */}
        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
          {personalInfo?.photo ? (
            <img src={personalInfo.photo} alt={personalInfo?.name || 'Profile'} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl font-bold text-[#2c8c99]">
              {personalInfo?.name?.split(' ').map(n => n[0]).join('') || 'CV'}
            </span>
          )}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <div className="w-[70mm] bg-slate-100 px-5 py-6 flex flex-col flex-shrink-0">
          {/* Contact Info */}
          <section className="mb-6">
            <div className="space-y-2.5 text-sm">
              {personalInfo?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#2c8c99]" />
                  <span className="text-slate-600">{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#2c8c99]" />
                  <span className="text-slate-600 break-all text-xs">{personalInfo.email}</span>
                </div>
              )}
              {personalInfo?.linkedin && (
                <div className="flex items-center gap-3">
                  <Linkedin className="w-4 h-4 text-[#2c8c99]" />
                  <span className="text-slate-600 break-all text-xs">{personalInfo.linkedin}</span>
                </div>
              )}
              {personalInfo?.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#2c8c99]" />
                  <span className="text-slate-600">{personalInfo.location}</span>
                </div>
              )}
              {personalInfo?.portfolio && (
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-[#2c8c99]" />
                  <span className="text-slate-600 break-all text-xs">{personalInfo.portfolio}</span>
                </div>
              )}
            </div>
          </section>

          {/* Skills */}
          {hasSkills && (
            <section className="mb-6">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
                Skills
              </h2>
              <div className="space-y-3">
                {languages.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Languages</p>
                    <ul className="space-y-1 text-sm">
                      {languages.slice(0, 4).map((skill, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-slate-600">
                          <span className="w-1.5 h-1.5 bg-[#2c8c99] rounded-full" />
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {frameworks.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Frameworks</p>
                    <ul className="space-y-1 text-sm">
                      {frameworks.slice(0, 4).map((skill, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-slate-600">
                          <span className="w-1.5 h-1.5 bg-[#2c8c99] rounded-full" />
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {tools.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Tools</p>
                    <ul className="space-y-1 text-sm">
                      {tools.slice(0, 4).map((skill, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-slate-600">
                          <span className="w-1.5 h-1.5 bg-[#2c8c99] rounded-full" />
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Awards/Projects */}
          {projects?.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
                Key Projects
              </h2>
              <div className="space-y-2 text-sm">
                {projects.slice(0, 3).map((project, idx) => (
                  <div key={project.id || idx}>
                    <p className="font-medium text-slate-700">{project.name}</p>
                    {project.description && (
                      <p className="text-xs text-slate-500">{project.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Spacer to fill remaining height */}
          <div className="flex-1" />
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6 py-6 bg-white">
          {/* Objective/Summary */}
          {summary && (
            <section className="mb-6">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                Objective
                <span className="flex-1 h-px bg-slate-200" />
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {summary}
              </p>
            </section>
          )}

          {/* Education */}
          {education?.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                Education
                <span className="flex-1 h-px bg-slate-200" />
              </h2>
              <div className="space-y-3">
                {education.map((edu, idx) => (
                  <div key={edu.id || idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#2c8c99] mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-semibold text-slate-800 text-sm">{edu.school}</h3>
                        <span className="text-xs text-slate-400">{edu.year}</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {edu.degree}
                        {edu.field && `: ${edu.field}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Work Experience */}
          {experience?.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                Work Experience
                <span className="flex-1 h-px bg-slate-200" />
              </h2>
              <div className="space-y-4">
                {experience.map((job, idx) => (
                  <div key={job.id || idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#2c8c99] mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-semibold text-slate-800 text-sm">{job.company}</h3>
                        <span className="text-xs text-slate-400">{job.duration}</span>
                      </div>
                      <p className="text-xs text-[#2c8c99] font-medium mb-1">
                        {job.position}
                      </p>
                      {job.bullets?.length > 0 && (
                        <ul className="space-y-1 text-xs text-slate-600">
                          {job.bullets.map((bullet, bulletIdx) => (
                            <li key={bulletIdx} className="leading-relaxed">
                              - {bullet}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
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

export default TealCorporate;
