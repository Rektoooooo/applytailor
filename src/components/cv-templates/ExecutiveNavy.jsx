import { forwardRef } from 'react';
import { Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react';

const ExecutiveNavy = forwardRef(function ExecutiveNavy(
  { personalInfo, summary, experience, education, skills, projects },
  ref
) {
  const { languages = [], frameworks = [], tools = [] } = skills || {};
  const hasSkills = languages.length > 0 || frameworks.length > 0 || tools.length > 0;

  return (
    <div
      ref={ref}
      className="bg-white w-[210mm] h-[297mm] mx-auto shadow-elevated flex overflow-hidden"
      style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
    >
      {/* Navy Sidebar */}
      <div className="w-[75mm] bg-[#1e3a5f] text-white flex flex-col">
        {/* Photo & Name Header */}
        <div className="px-6 pt-8 pb-6 text-center border-b border-white/10">
          {/* Photo circle */}
          <div className="w-24 h-24 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-4 overflow-hidden">
            {personalInfo?.photo ? (
              <img src={personalInfo.photo} alt={personalInfo?.name || 'Profile'} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-white/60">
                {personalInfo?.name?.split(' ').map(n => n[0]).join('') || 'CV'}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-wide">
            {personalInfo?.name || 'Your Name'}
          </h1>
          <p className="text-white/70 text-sm mt-1">
            {personalInfo?.title || 'Professional Title'}
          </p>
        </div>

        {/* Contact Section */}
        <div className="px-6 py-5 border-b border-white/10">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-white/50">
            Contact
          </h2>
          <div className="space-y-3 text-sm">
            {personalInfo?.location && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-white/50 mt-0.5 flex-shrink-0" />
                <span className="text-white/80">{personalInfo.location}</span>
              </div>
            )}
            {personalInfo?.phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-white/50 mt-0.5 flex-shrink-0" />
                <span className="text-white/80">{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo?.email && (
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-white/50 mt-0.5 flex-shrink-0" />
                <span className="text-white/80 break-all text-xs">{personalInfo.email}</span>
              </div>
            )}
            {personalInfo?.linkedin && (
              <div className="flex items-start gap-3">
                <Linkedin className="w-4 h-4 text-white/50 mt-0.5 flex-shrink-0" />
                <span className="text-white/80 break-all text-xs">{personalInfo.linkedin}</span>
              </div>
            )}
            {personalInfo?.portfolio && (
              <div className="flex items-start gap-3">
                <Globe className="w-4 h-4 text-white/50 mt-0.5 flex-shrink-0" />
                <span className="text-white/80 break-all text-xs">{personalInfo.portfolio}</span>
              </div>
            )}
          </div>
        </div>

        {/* Skills Section */}
        {hasSkills && (
          <div className="px-6 py-5 border-b border-white/10">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-white/50">
              Skills
            </h2>
            <div className="space-y-3">
              {languages.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1">Languages</p>
                  <ul className="space-y-1 text-sm">
                    {languages.slice(0, 4).map((skill, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-white/80">
                        <span className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {frameworks.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1">Frameworks</p>
                  <ul className="space-y-1 text-sm">
                    {frameworks.slice(0, 4).map((skill, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-white/80">
                        <span className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {tools.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1">Tools</p>
                  <ul className="space-y-1 text-sm">
                    {tools.slice(0, 4).map((skill, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-white/80">
                        <span className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Education in Sidebar */}
        {education?.length > 0 && (
          <div className="px-6 py-5">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-white/50">
              Education
            </h2>
            <div className="space-y-3">
              {education.map((edu, idx) => (
                <div key={edu.id || idx} className="text-sm">
                  <p className="font-semibold text-white">
                    {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                  </p>
                  <p className="text-white/60 text-xs">{edu.school || edu.institution}</p>
                  {(edu.year || edu.graduation_year) && (
                    <p className="text-white/40 text-xs mt-0.5">{edu.year || edu.graduation_year}</p>
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
      <div className="flex-1 px-8 py-8">
        {/* Profile/Summary */}
        {summary && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-[#1e3a5f] uppercase tracking-wide mb-3 pb-2 border-b-2 border-[#1e3a5f]">
              Profile
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {summary}
            </p>
          </section>
        )}

        {/* Professional Experience */}
        {experience?.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-[#1e3a5f] uppercase tracking-wide mb-3 pb-2 border-b-2 border-[#1e3a5f]">
              Professional Experience
            </h2>
            <div className="space-y-5">
              {experience.map((job, idx) => (
                <div key={job.id || idx}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-slate-800">
                      {job.position}
                    </h3>
                  </div>
                  <p className="text-sm text-[#1e3a5f] font-medium">
                    {job.company}
                  </p>
                  <p className="text-xs text-slate-400 mb-2">
                    {job.duration}
                  </p>
                  {job.bullets?.length > 0 && (
                    <ul className="space-y-1.5 text-sm text-slate-600">
                      {job.bullets.map((bullet, bulletIdx) => (
                        <li key={bulletIdx} className="flex gap-2">
                          <span className="text-[#1e3a5f] mt-1">•</span>
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

        {/* Projects */}
        {projects?.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-[#1e3a5f] uppercase tracking-wide mb-3 pb-2 border-b-2 border-[#1e3a5f]">
              Projects
            </h2>
            <div className="space-y-3">
              {projects.slice(0, 3).map((project, idx) => (
                <div key={project.id || idx}>
                  <h3 className="font-semibold text-slate-800 text-sm">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {project.description}
                    </p>
                  )}
                  {project.technologies?.length > 0 && (
                    <p className="text-xs text-[#1e3a5f] mt-1">
                      {project.technologies.join(' • ')}
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

export default ExecutiveNavy;
