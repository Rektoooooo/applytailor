import { forwardRef } from 'react';
import { Mail, Phone, MapPin, Linkedin } from 'lucide-react';

const CreativeBold = forwardRef(function CreativeBold(
  { personalInfo, summary, experience, education, skills, projects },
  ref
) {
  const { languages = [], frameworks = [], tools = [] } = skills || {};
  const hasSkills = languages.length > 0 || frameworks.length > 0 || tools.length > 0;

  const firstName = personalInfo?.name?.split(' ')[0] || 'FIRST';
  const lastName = personalInfo?.name?.split(' ').slice(1).join(' ') || 'LAST';

  return (
    <div
      ref={ref}
      className="bg-[#f8f7f4] w-[210mm] h-[297mm] mx-auto shadow-elevated overflow-hidden"
      style={{ fontFamily: '"Work Sans", system-ui, sans-serif' }}
    >
      {/* Bold Header Block */}
      <div className="bg-[#1c1c1c] px-8 py-8 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff6b6b] opacity-90" />
        <div className="relative">
          <h1
            className="text-6xl font-normal text-white tracking-wider leading-none"
            style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}
          >
            {firstName}
          </h1>
          <h1
            className="text-6xl font-normal text-[#ff6b6b] tracking-wider leading-none"
            style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}
          >
            {lastName}
          </h1>
          <p className="text-white/80 text-sm font-medium tracking-[0.3em] uppercase mt-3">
            {personalInfo?.title || 'Creative Professional'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-6">
        {/* Contact & Summary Row */}
        <div className="flex gap-8 mb-8">
          {/* Summary Box */}
          {summary && (
            <div className="flex-1 bg-white p-5 border-l-4 border-[#ff6b6b]">
              <h2
                className="text-xs font-bold text-[#1c1c1c] tracking-[0.2em] mb-2"
                style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: '14px', letterSpacing: '0.15em' }}
              >
                ABOUT ME
              </h2>
              <p className="text-sm text-[#1c1c1c]/70 leading-relaxed">
                {summary}
              </p>
            </div>
          )}

          {/* Contact */}
          <div className="w-48">
            <h2
              className="text-xs font-bold text-[#1c1c1c] tracking-[0.2em] mb-3 pb-2 border-b-2 border-[#ff6b6b]"
              style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: '14px', letterSpacing: '0.15em' }}
            >
              CONTACT
            </h2>
            <div className="space-y-2 text-xs text-[#1c1c1c]/70">
              {personalInfo?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#ff6b6b]" />
                  <span className="break-all">{personalInfo.email}</span>
                </div>
              )}
              {personalInfo?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#ff6b6b]" />
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#ff6b6b]" />
                  <span>{personalInfo.location}</span>
                </div>
              )}
              {personalInfo?.linkedin && (
                <div className="flex items-center gap-2">
                  <Linkedin className="w-3.5 h-3.5 text-[#ff6b6b]" />
                  <span className="break-all">{personalInfo.linkedin}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Experience */}
        {experience?.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <h2
                className="text-[#1c1c1c] tracking-[0.15em]"
                style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: '20px' }}
              >
                EXPERIENCE
              </h2>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-[#ff6b6b] to-transparent" />
            </div>
            <div className="space-y-4">
              {experience.map((job, idx) => (
                <div key={job.id || idx} className="flex gap-4">
                  {/* Accent bar */}
                  <div className="w-1 bg-[#ff6b6b] rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3
                        className="font-semibold text-[#1c1c1c] tracking-wide"
                        style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: '16px', letterSpacing: '0.05em' }}
                      >
                        {job.company?.toUpperCase()}
                      </h3>
                      <span className="text-xs text-[#ff6b6b] font-semibold tracking-wider">
                        {job.duration?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-[#1c1c1c]/60 font-medium mb-2">
                      {job.position}
                    </p>
                    {job.bullets?.length > 0 && (
                      <ul className="space-y-1 text-sm text-[#1c1c1c]/70">
                        {job.bullets.map((bullet, bulletIdx) => (
                          <li key={bulletIdx} className="flex gap-2">
                            <span className="text-[#ff6b6b] font-bold">-</span>
                            <span className="leading-relaxed">{bullet}</span>
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

        {/* Skills Section */}
        {hasSkills && (
          <section className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <h2
                className="text-[#1c1c1c] tracking-[0.15em]"
                style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: '20px' }}
              >
                SKILLS
              </h2>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-[#ff6b6b] to-transparent" />
            </div>
            <div className="space-y-3">
              {languages.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-[#1c1c1c]/50 uppercase tracking-[0.15em] mb-1.5">Languages</p>
                  <div className="flex flex-wrap gap-1.5">
                    {languages.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-[#1c1c1c] text-white text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {frameworks.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-[#1c1c1c]/50 uppercase tracking-[0.15em] mb-1.5">Frameworks</p>
                  <div className="flex flex-wrap gap-1.5">
                    {frameworks.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-[#ff6b6b] text-white text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {tools.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-[#1c1c1c]/50 uppercase tracking-[0.15em] mb-1.5">Tools</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tools.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-[#1c1c1c] text-white text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Two Column: Education & Projects */}
        <div className="flex gap-8">
          {/* Education */}
          {education?.length > 0 && (
            <section className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h2
                  className="text-[#1c1c1c] tracking-[0.15em]"
                  style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: '20px' }}
                >
                  EDUCATION
                </h2>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-[#ff6b6b] to-transparent" />
              </div>
              <div className="space-y-3">
                {education.map((edu, idx) => (
                  <div key={edu.id || idx} className="flex gap-3">
                    <div className="w-1 bg-[#ff6b6b] rounded-full flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-[#1c1c1c] text-sm">
                        {edu.degree}
                        {edu.field && ` - ${edu.field}`}
                      </h3>
                      <p className="text-xs text-[#1c1c1c]/60">
                        {edu.school}
                        {edu.year && ` | ${edu.year}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects?.length > 0 && (
            <section className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h2
                  className="text-[#1c1c1c] tracking-[0.15em]"
                  style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: '20px' }}
                >
                  PROJECTS
                </h2>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-[#ff6b6b] to-transparent" />
              </div>
              <div className="space-y-3">
                {projects.slice(0, 3).map((project, idx) => (
                  <div key={project.id || idx} className="flex gap-3">
                    <div className="w-1 bg-[#ff6b6b] rounded-full flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-[#1c1c1c] text-sm">
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-xs text-[#1c1c1c]/60 leading-relaxed">
                          {project.description}
                        </p>
                      )}
                      {project.technologies?.length > 0 && (
                        <p className="text-xs text-[#ff6b6b] font-medium mt-0.5">
                          {project.technologies.slice(0, 4).join(' / ')}
                        </p>
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

export default CreativeBold;
