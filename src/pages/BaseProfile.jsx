import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Briefcase,
  FolderKanban,
  Wrench,
  GraduationCap,
  Link2,
  Settings2,
  Trophy,
  Plus,
  Trash2,
  GripVertical,
  Save,
  CheckCircle,
  Loader2,
  User,
  Upload,
  Link as LinkIcon,
  Camera
} from 'lucide-react';
import Header from '../components/Header';
import { useBaseProfile } from '../hooks/useBaseProfile';

const tabs = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'experience', label: 'Work Experience', icon: Briefcase },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'skills', label: 'Skills', icon: Wrench },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'links', label: 'Links', icon: Link2 },
  { id: 'preferences', label: 'Preferences', icon: Settings2 },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
];

// Default empty state for base profile
const defaultProfile = {
  personal_info: {
    name: '',
    email: '',
    phone: '',
    address: '',
    linkedin: '',
    portfolio: '',
    date_of_birth: '',
    photo_url: ''
  },
  work_experience: [],
  projects: [],
  skills: { languages: [], frameworks: [], tools: [] },
  education: [],
  links: { linkedin: '', github: '', portfolio: '', other: '' },
  preferences: { roles: [], locations: [], seniority: 'mid', tone: 'neutral' },
  achievements: [],
};

export default function BaseProfile() {
  const [activeTab, setActiveTab] = useState('personal');
  const [saved, setSaved] = useState(false);
  const { baseProfile, loading, saving, updateBaseProfile, addItem, updateItem, removeItem, uploadPhoto } = useBaseProfile();

  // Local state for editing (initialized from database)
  const [localProfile, setLocalProfile] = useState(defaultProfile);

  // Sync local state with database data when it loads
  useEffect(() => {
    if (baseProfile) {
      setLocalProfile({
        personal_info: baseProfile.personal_info || {
          name: '',
          email: '',
          phone: '',
          address: '',
          linkedin: '',
          portfolio: '',
          date_of_birth: '',
          photo_url: ''
        },
        work_experience: baseProfile.work_experience || [],
        projects: baseProfile.projects || [],
        skills: baseProfile.skills || { languages: [], frameworks: [], tools: [] },
        education: baseProfile.education || [],
        links: baseProfile.links || { linkedin: '', github: '', portfolio: '', other: '' },
        preferences: baseProfile.preferences || { roles: [], locations: [], seniority: 'mid', tone: 'neutral' },
        achievements: baseProfile.achievements || [],
      });
    }
  }, [baseProfile]);

  // Profile completion percentage
  const completionPercentage = baseProfile?.completion_percentage || 0;

  // Update a specific section in local state
  const updateLocalSection = (section, data) => {
    setLocalProfile(prev => ({ ...prev, [section]: data }));
  };

  // Save all changes to database
  const handleSave = async () => {
    const result = await updateBaseProfile(localProfile);
    if (!result.error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Base Profile"
        subtitle="Your master profile powers all tailored applications"
      />

      <div className="p-4 md:p-8">
        {/* Progress Bar - only show if profile is loaded and incomplete */}
        {!loading && baseProfile?.completion_percentage !== undefined && baseProfile.completion_percentage < 100 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-4 mb-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Profile Completion</span>
              <span className="text-sm font-semibold text-teal-600">{baseProfile.completion_percentage}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${baseProfile.completion_percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {baseProfile.completion_percentage < 50
                ? 'Add work experience and skills to boost your profile strength'
                : 'Add achievements to complete your profile'}
            </p>
          </motion.div>
        )}

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-56 flex-shrink-0"
          >
            <nav className="card p-2 flex lg:flex-col gap-1 lg:space-y-1 overflow-x-auto lg:overflow-visible lg:sticky lg:top-24 scrollbar-hide">
              {tabs.map((tab, index) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex-shrink-0 lg:w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-left transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-teal-50 text-teal-700 font-medium'
                      : 'text-slate-600 hover:bg-warm-gray hover:text-charcoal'
                  }`}
                >
                  <tab.icon className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="text-xs lg:text-sm">{tab.label}</span>
                </motion.button>
              ))}
            </nav>
          </motion.div>

          {/* Content Area */}
          <div className="flex-1">
            {loading ? (
              <div className="card p-6 md:p-8 text-center">
                <Loader2 className="w-8 h-8 text-teal-500 mx-auto mb-3 animate-spin" />
                <p className="text-slate-500">Loading your profile...</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {activeTab === 'personal' && (
                  <PersonalInfoTab
                    key="personal"
                    data={localProfile.personal_info}
                    onUpdate={(data) => updateLocalSection('personal_info', data)}
                    onUploadPhoto={uploadPhoto}
                    saving={saving}
                  />
                )}
                {activeTab === 'experience' && (
                  <ExperienceTab
                    key="experience"
                    data={localProfile.work_experience}
                    onUpdate={(data) => updateLocalSection('work_experience', data)}
                  />
                )}
                {activeTab === 'projects' && (
                  <ProjectsTab
                    key="projects"
                    data={localProfile.projects}
                    onUpdate={(data) => updateLocalSection('projects', data)}
                  />
                )}
                {activeTab === 'skills' && (
                  <SkillsTab
                    key="skills"
                    data={localProfile.skills}
                    onUpdate={(data) => updateLocalSection('skills', data)}
                  />
                )}
                {activeTab === 'education' && (
                  <EducationTab
                    key="education"
                    data={localProfile.education}
                    onUpdate={(data) => updateLocalSection('education', data)}
                  />
                )}
                {activeTab === 'links' && (
                  <LinksTab
                    key="links"
                    data={localProfile.links}
                    onUpdate={(data) => updateLocalSection('links', data)}
                  />
                )}
                {activeTab === 'preferences' && (
                  <PreferencesTab
                    key="preferences"
                    data={localProfile.preferences}
                    onUpdate={(data) => updateLocalSection('preferences', data)}
                  />
                )}
                {activeTab === 'achievements' && (
                  <AchievementsTab
                    key="achievements"
                    data={localProfile.achievements}
                    onUpdate={(data) => updateLocalSection('achievements', data)}
                  />
                )}
              </AnimatePresence>
            )}

            {/* Save Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 flex justify-end"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving}
                className={`btn-primary ${saved ? 'bg-emerald-600 hover:bg-emerald-600' : ''}`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Month/Year picker component for work experience dates
function MonthYearPicker({ value, onChange, disabled = false }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => String(currentYear - i + 5)); // Future 5 years + past 45 years
  const months = [
    { value: '01', label: 'Jan' },
    { value: '02', label: 'Feb' },
    { value: '03', label: 'Mar' },
    { value: '04', label: 'Apr' },
    { value: '05', label: 'May' },
    { value: '06', label: 'Jun' },
    { value: '07', label: 'Jul' },
    { value: '08', label: 'Aug' },
    { value: '09', label: 'Sep' },
    { value: '10', label: 'Oct' },
    { value: '11', label: 'Nov' },
    { value: '12', label: 'Dec' },
  ];

  // Parse value (format: "MM/YYYY")
  const parseValue = (val) => {
    if (!val || val === 'Present') return { month: '', year: '' };
    if (val.includes('/')) {
      const [m, y] = val.split('/');
      return { month: m || '', year: y || '' };
    }
    // Handle old format or just year
    if (val.length === 4 && !isNaN(val)) {
      return { month: '', year: val };
    }
    return { month: '', year: '' };
  };

  const [localMonth, setLocalMonth] = useState(() => parseValue(value).month);
  const [localYear, setLocalYear] = useState(() => parseValue(value).year);

  // Sync with external value changes
  useEffect(() => {
    const parsed = parseValue(value);
    setLocalMonth(parsed.month);
    setLocalYear(parsed.year);
  }, [value]);

  const handleMonthChange = (newMonth) => {
    setLocalMonth(newMonth);
    // Always update parent with current state
    if (newMonth && localYear) {
      onChange(`${newMonth}/${localYear}`);
    } else if (newMonth) {
      // Store partial - just month selected
      onChange(`${newMonth}/`);
    } else if (localYear) {
      onChange(`/${localYear}`);
    } else {
      onChange('');
    }
  };

  const handleYearChange = (newYear) => {
    setLocalYear(newYear);
    // Always update parent with current state
    if (localMonth && newYear) {
      onChange(`${localMonth}/${newYear}`);
    } else if (newYear) {
      // Store partial - just year selected
      onChange(`/${newYear}`);
    } else if (localMonth) {
      onChange(`${localMonth}/`);
    } else {
      onChange('');
    }
  };

  return (
    <div className="flex gap-1">
      <select
        value={localMonth}
        onChange={(e) => handleMonthChange(e.target.value)}
        disabled={disabled}
        className={`px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 ${disabled ? 'bg-slate-100 text-slate-400' : 'bg-white'}`}
      >
        <option value="">Month</option>
        {months.map((m) => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>
      <select
        value={localYear}
        onChange={(e) => handleYearChange(e.target.value)}
        disabled={disabled}
        className={`px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 ${disabled ? 'bg-slate-100 text-slate-400' : 'bg-white'}`}
      >
        <option value="">Year</option>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );
}

function ExperienceTab({ data = [], onUpdate }) {
  const handleUpdateExp = (index, field, value) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onUpdate(newData);
  };

  const handleTogglePresent = (index) => {
    const newData = [...data];
    const isPresent = newData[index].isPresent;
    newData[index] = {
      ...newData[index],
      isPresent: !isPresent,
      endDate: !isPresent ? 'Present' : ''
    };
    onUpdate(newData);
  };

  const handleUpdateBullet = (expIndex, bulletIndex, value) => {
    const newData = [...data];
    const newBullets = [...(newData[expIndex].bullets || [])];
    newBullets[bulletIndex] = value;
    newData[expIndex] = { ...newData[expIndex], bullets: newBullets };
    onUpdate(newData);
  };

  const handleAddBullet = (expIndex) => {
    const newData = [...data];
    const newBullets = [...(newData[expIndex].bullets || []), ''];
    newData[expIndex] = { ...newData[expIndex], bullets: newBullets };
    onUpdate(newData);
  };

  const handleRemoveBullet = (expIndex, bulletIndex) => {
    const newData = [...data];
    const newBullets = [...newData[expIndex].bullets];
    newBullets.splice(bulletIndex, 1);
    newData[expIndex] = { ...newData[expIndex], bullets: newBullets };
    onUpdate(newData);
  };

  const handleAddExperience = () => {
    onUpdate([...data, {
      id: crypto.randomUUID(),
      role: '',
      company: '',
      startDate: '',
      endDate: '',
      isPresent: false,
      bullets: []
    }]);
  };

  const handleRemoveExperience = (index) => {
    const newData = [...data];
    newData.splice(index, 1);
    onUpdate(newData);
  };

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === 'Present') return dateStr || '';
    const { month, year } = (() => {
      if (dateStr.includes('/')) {
        const [m, y] = dateStr.split('/');
        return { month: m, year: y };
      }
      return { month: '', year: dateStr };
    })();
    if (!month) return year;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {data.length === 0 ? (
        <div className="card p-6 md:p-8 text-center">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No work experience yet</p>
          <p className="text-sm text-slate-400 mt-1">Add your work history to get started</p>
        </div>
      ) : (
        data.map((exp, index) => (
          <motion.div
            key={exp.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6 group"
          >
            <div className="flex items-start gap-4">
              <div className="mt-1 text-slate-300 cursor-grab hover:text-slate-400 transition-colors">
                <GripVertical className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={exp.role || ''}
                      onChange={(e) => handleUpdateExp(index, 'role', e.target.value)}
                      placeholder="Job Title"
                      className="text-lg font-semibold text-charcoal bg-transparent border-none outline-none focus:ring-0 p-0 w-full"
                    />
                    <input
                      type="text"
                      value={exp.company || ''}
                      onChange={(e) => handleUpdateExp(index, 'company', e.target.value)}
                      placeholder="Company"
                      className="text-slate-500 bg-transparent border-none outline-none focus:ring-0 p-0 mt-1 w-full"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveExperience(index)}
                    className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Date Selection */}
                <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Start Date</label>
                    <MonthYearPicker
                      value={exp.startDate || ''}
                      onChange={(val) => handleUpdateExp(index, 'startDate', val)}
                    />
                  </div>
                  <span className="text-slate-300 mt-4">-</span>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">End Date</label>
                    <MonthYearPicker
                      value={exp.isPresent ? '' : exp.endDate || ''}
                      onChange={(val) => handleUpdateExp(index, 'endDate', val)}
                      disabled={exp.isPresent}
                    />
                  </div>
                  <label className="flex items-center gap-2 mt-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exp.isPresent || false}
                      onChange={() => handleTogglePresent(index)}
                      className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-slate-600">Present</span>
                  </label>
                  <div className="ml-auto text-xs text-slate-400">
                    {formatDate(exp.startDate)} - {exp.isPresent ? 'Present' : formatDate(exp.endDate)}
                  </div>
                </div>

                <div className="space-y-2">
                  {(exp.bullets || []).map((bullet, i) => (
                    <div key={i} className="flex items-start gap-3 group/bullet">
                      <span className="mt-2 w-1.5 h-1.5 bg-teal-500 rounded-full flex-shrink-0" />
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => handleUpdateBullet(index, i, e.target.value)}
                        placeholder="Describe your achievement..."
                        className="flex-1 text-slate-600 bg-transparent border-none outline-none focus:ring-0 p-0 text-sm leading-relaxed"
                      />
                      <button
                        onClick={() => handleRemoveBullet(index, i)}
                        className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover/bullet:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => handleAddBullet(index)}
                    className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 mt-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add bullet point
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))
      )}

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleAddExperience}
        className="w-full card p-4 border-2 border-dashed border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 transition-all flex items-center justify-center gap-2 text-slate-500 hover:text-teal-600"
      >
        <Plus className="w-5 h-5" />
        Add Work Experience
      </motion.button>
    </motion.div>
  );
}

function ProjectsTab({ data = [], onUpdate }) {
  const [activeTechInput, setActiveTechInput] = useState(null);
  const [techInputValue, setTechInputValue] = useState('');

  const handleUpdateProject = (index, field, value) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onUpdate(newData);
  };

  const handleAddProject = () => {
    onUpdate([...data, { id: crypto.randomUUID(), title: '', technologies: [], description: '' }]);
  };

  const handleRemoveProject = (index) => {
    const newData = [...data];
    newData.splice(index, 1);
    onUpdate(newData);
  };

  const handleAddTech = (projectIndex) => {
    if (!techInputValue.trim()) return;
    const newData = [...data];
    const newTechs = [...(newData[projectIndex].technologies || []), techInputValue.trim()];
    newData[projectIndex] = { ...newData[projectIndex], technologies: newTechs };
    onUpdate(newData);
    setTechInputValue('');
    setActiveTechInput(null);
  };

  const handleRemoveTech = (projectIndex, techIndex) => {
    const newData = [...data];
    const newTechs = [...newData[projectIndex].technologies];
    newTechs.splice(techIndex, 1);
    newData[projectIndex] = { ...newData[projectIndex], technologies: newTechs };
    onUpdate(newData);
  };

  const handleTechKeyDown = (e, projectIndex) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTech(projectIndex);
    } else if (e.key === 'Escape') {
      setActiveTechInput(null);
      setTechInputValue('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {data.length === 0 ? (
        <div className="card p-6 md:p-8 text-center">
          <FolderKanban className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No projects yet</p>
          <p className="text-sm text-slate-400 mt-1">Showcase your best work</p>
        </div>
      ) : (
        data.map((project, index) => (
          <div key={project.id || index} className="card p-6 group">
            <div className="flex items-start gap-4">
              <div className="mt-1 text-slate-300 cursor-grab">
                <GripVertical className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <input
                    type="text"
                    placeholder="Project Title"
                    value={project.title || ''}
                    onChange={(e) => handleUpdateProject(index, 'title', e.target.value)}
                    className="text-lg font-semibold text-charcoal bg-transparent border-none outline-none focus:ring-0 p-0 w-full mb-2"
                  />
                  <button
                    onClick={() => handleRemoveProject(index)}
                    className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(project.technologies || []).map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded group/tech flex items-center gap-1"
                    >
                      {tech}
                      <button
                        onClick={() => handleRemoveTech(index, techIndex)}
                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover/tech:opacity-100"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {activeTechInput === index ? (
                    <input
                      type="text"
                      value={techInputValue}
                      onChange={(e) => setTechInputValue(e.target.value)}
                      onKeyDown={(e) => handleTechKeyDown(e, index)}
                      onBlur={() => {
                        if (techInputValue.trim()) handleAddTech(index);
                        else { setActiveTechInput(null); setTechInputValue(''); }
                      }}
                      placeholder="e.g. React"
                      className="px-2 py-1 text-xs border border-teal-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 w-24"
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => { setActiveTechInput(index); setTechInputValue(''); }}
                      className="px-2 py-1 border border-dashed border-slate-300 text-slate-400 text-xs rounded hover:border-teal-400 hover:text-teal-600 transition-colors"
                    >
                      + Add
                    </button>
                  )}
                </div>
                <textarea
                  placeholder="Describe the project outcomes..."
                  value={project.description || ''}
                  onChange={(e) => handleUpdateProject(index, 'description', e.target.value)}
                  className="w-full text-slate-600 bg-transparent border-none outline-none focus:ring-0 p-0 text-sm leading-relaxed resize-none"
                  rows={2}
                />
              </div>
            </div>
          </div>
        ))
      )}

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleAddProject}
        className="w-full card p-4 border-2 border-dashed border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 transition-all flex items-center justify-center gap-2 text-slate-500 hover:text-teal-600"
      >
        <Plus className="w-5 h-5" />
        Add Project
      </motion.button>
    </motion.div>
  );
}

function SkillsTab({ data = { languages: [], frameworks: [], tools: [] }, onUpdate }) {
  const [activeInput, setActiveInput] = useState(null);
  const [inputValue, setInputValue] = useState('');

  const categories = [
    { id: 'languages', label: 'Languages', items: data.languages || [], placeholder: 'e.g. JavaScript' },
    { id: 'frameworks', label: 'Frameworks & Libraries', items: data.frameworks || [], placeholder: 'e.g. React' },
    { id: 'tools', label: 'Tools & Platforms', items: data.tools || [], placeholder: 'e.g. Docker' },
  ];

  const handleAddSkill = (categoryId) => {
    if (!inputValue.trim()) return;
    const newData = { ...data };
    newData[categoryId] = [...(newData[categoryId] || []), inputValue.trim()];
    onUpdate(newData);
    setInputValue('');
    setActiveInput(null);
  };

  const handleRemoveSkill = (categoryId, index) => {
    const newData = { ...data };
    const newItems = [...(newData[categoryId] || [])];
    newItems.splice(index, 1);
    newData[categoryId] = newItems;
    onUpdate(newData);
  };

  const handleKeyDown = (e, categoryId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill(categoryId);
    } else if (e.key === 'Escape') {
      setActiveInput(null);
      setInputValue('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {categories.map((category, index) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="card p-6"
        >
          <h3 className="text-sm font-semibold text-slate-700 mb-3">{category.label}</h3>
          <div className="flex flex-wrap gap-2">
            {category.items.map((skill, skillIndex) => (
              <span
                key={skillIndex}
                className="px-3 py-1.5 bg-teal-50 text-teal-700 text-sm font-medium rounded-lg border border-teal-100 hover:bg-teal-100 transition-colors cursor-default group flex items-center gap-2"
              >
                {skill}
                <button
                  onClick={() => handleRemoveSkill(category.id, skillIndex)}
                  className="text-teal-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
            {activeInput === category.id ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, category.id)}
                  onBlur={() => {
                    if (inputValue.trim()) handleAddSkill(category.id);
                    else { setActiveInput(null); setInputValue(''); }
                  }}
                  placeholder={category.placeholder}
                  className="px-3 py-1.5 text-sm border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-32"
                  autoFocus
                />
              </div>
            ) : (
              <button
                onClick={() => { setActiveInput(category.id); setInputValue(''); }}
                className="px-3 py-1.5 border-2 border-dashed border-slate-200 text-slate-400 text-sm rounded-lg hover:border-teal-300 hover:text-teal-600 transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function EducationTab({ data = [], onUpdate }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 60 }, (_, i) => currentYear - i + 10); // Future 10 years + past 50 years

  const educationTypes = [
    { value: 'high_school', label: 'High School' },
    { value: 'vocational', label: 'Vocational / Trade School' },
    { value: 'associate', label: "Associate's Degree" },
    { value: 'bachelor', label: "Bachelor's Degree" },
    { value: 'master', label: "Master's Degree" },
    { value: 'doctorate', label: 'Doctorate / PhD' },
    { value: 'certificate', label: 'Certificate / Certification' },
    { value: 'bootcamp', label: 'Bootcamp' },
    { value: 'other', label: 'Other' },
  ];

  const handleUpdateEducation = (index, field, value) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onUpdate(newData);
  };

  const handleAddEducation = () => {
    onUpdate([...data, {
      id: crypto.randomUUID(),
      type: '',
      degree: '',
      field: '',
      institution: '',
      startYear: '',
      endYear: '',
      gpa: ''
    }]);
  };

  const handleRemoveEducation = (index) => {
    const newData = [...data];
    newData.splice(index, 1);
    onUpdate(newData);
  };

  // Get label for education type
  const getTypeLabel = (typeValue) => {
    const type = educationTypes.find(t => t.value === typeValue);
    return type ? type.label : typeValue;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {data.length === 0 ? (
        <div className="card p-6 md:p-8 text-center">
          <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No education added yet</p>
          <p className="text-sm text-slate-400 mt-1">Add your educational background (high school, university, certifications, etc.)</p>
        </div>
      ) : (
        data.map((edu, index) => (
          <motion.div
            key={edu.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-700">
                  {edu.type ? getTypeLabel(edu.type) : `Education ${index + 1}`}
                </h3>
                {edu.startYear && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {edu.startYear} - {edu.endYear || 'Present'}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleRemoveEducation(index)}
                className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Education Type */}
              <div>
                <label className="label">Education Type *</label>
                <select
                  value={edu.type || ''}
                  onChange={(e) => handleUpdateEducation(index, 'type', e.target.value)}
                  className="input-field"
                >
                  <option value="">Select type...</option>
                  {educationTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Institution */}
              <div>
                <label className="label">Institution *</label>
                <input
                  type="text"
                  placeholder="School / University name"
                  value={edu.institution || ''}
                  onChange={(e) => handleUpdateEducation(index, 'institution', e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Degree/Certificate Name (conditional based on type) */}
              <div>
                <label className="label">
                  {edu.type === 'high_school' ? 'Program / Track' :
                   edu.type === 'certificate' || edu.type === 'bootcamp' ? 'Certificate Name' :
                   'Degree'}
                </label>
                <input
                  type="text"
                  placeholder={
                    edu.type === 'high_school' ? 'e.g. Science Track, General' :
                    edu.type === 'certificate' || edu.type === 'bootcamp' ? 'e.g. AWS Solutions Architect' :
                    'e.g. Bachelor of Science'
                  }
                  value={edu.degree || ''}
                  onChange={(e) => handleUpdateEducation(index, 'degree', e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Field of Study */}
              <div>
                <label className="label">Field of Study</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science, Business"
                  value={edu.field || ''}
                  onChange={(e) => handleUpdateEducation(index, 'field', e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Year Range */}
              <div className="col-span-2">
                <label className="label">Duration</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <select
                      value={edu.startYear || ''}
                      onChange={(e) => handleUpdateEducation(index, 'startYear', e.target.value)}
                      className="input-field"
                    >
                      <option value="">Start Year</option>
                      {years.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <span className="text-slate-400">-</span>
                  <div className="flex-1">
                    <select
                      value={edu.endYear || ''}
                      onChange={(e) => handleUpdateEducation(index, 'endYear', e.target.value)}
                      className="input-field"
                    >
                      <option value="">End Year (or expected)</option>
                      {years.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* GPA - only show for certain types */}
              {edu.type && !['certificate', 'bootcamp', 'vocational'].includes(edu.type) && (
                <div>
                  <label className="label">GPA (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 3.8 / 4.0"
                    value={edu.gpa || ''}
                    onChange={(e) => handleUpdateEducation(index, 'gpa', e.target.value)}
                    className="input-field"
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))
      )}

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleAddEducation}
        className="w-full card p-4 border-2 border-dashed border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 transition-all flex items-center justify-center gap-2 text-slate-500 hover:text-teal-600"
      >
        <Plus className="w-5 h-5" />
        Add Education
      </motion.button>
    </motion.div>
  );
}

function LinksTab({ data = { linkedin: '', github: '', portfolio: '', other: '' }, onUpdate }) {
  const links = [
    { id: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/...' },
    { id: 'github', label: 'GitHub', placeholder: 'github.com/...' },
    { id: 'portfolio', label: 'Portfolio', placeholder: 'yourwebsite.com' },
    { id: 'other', label: 'Other', placeholder: 'Add any other link' },
  ];

  const handleUpdateLink = (linkId, value) => {
    onUpdate({ ...data, [linkId]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="card p-6 space-y-4"
    >
      {links.map((link, index) => (
        <motion.div
          key={link.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <label className="label">{link.label}</label>
          <input
            type="url"
            placeholder={link.placeholder}
            value={data[link.id] || ''}
            onChange={(e) => handleUpdateLink(link.id, e.target.value)}
            className="input-field"
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

function PreferencesTab({ data = { roles: [], locations: [], seniority: 'mid', tone: 'neutral' }, onUpdate }) {
  const [activeInput, setActiveInput] = useState(null);
  const [inputValue, setInputValue] = useState('');

  const handleAddItem = (field) => {
    if (!inputValue.trim()) return;
    const newItems = [...(data[field] || []), inputValue.trim()];
    onUpdate({ ...data, [field]: newItems });
    setInputValue('');
    setActiveInput(null);
  };

  const handleRemoveItem = (field, index) => {
    const newItems = [...(data[field] || [])];
    newItems.splice(index, 1);
    onUpdate({ ...data, [field]: newItems });
  };

  const handleUpdateField = (field, value) => {
    onUpdate({ ...data, [field]: value });
  };

  const handleKeyDown = (e, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem(field);
    } else if (e.key === 'Escape') {
      setActiveInput(null);
      setInputValue('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="card p-6 space-y-6"
    >
      <div>
        <label className="label">Preferred Roles</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {(data.roles || []).map((role, index) => (
            <span
              key={index}
              className="px-3 py-1.5 bg-teal-50 text-teal-700 text-sm font-medium rounded-lg border border-teal-100 group flex items-center gap-2"
            >
              {role}
              <button
                onClick={() => handleRemoveItem('roles', index)}
                className="text-teal-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
          {activeInput === 'roles' ? (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'roles')}
              onBlur={() => {
                if (inputValue.trim()) handleAddItem('roles');
                else { setActiveInput(null); setInputValue(''); }
              }}
              placeholder="e.g. Frontend Developer"
              className="px-3 py-1.5 text-sm border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-44"
              autoFocus
            />
          ) : (
            <button
              onClick={() => { setActiveInput('roles'); setInputValue(''); }}
              className="px-3 py-1.5 border-2 border-dashed border-slate-200 text-slate-400 text-sm rounded-lg hover:border-teal-300 hover:text-teal-600 transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="label">Preferred Locations</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {(data.locations || []).map((loc, index) => (
            <span
              key={index}
              className="px-3 py-1.5 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg group flex items-center gap-2"
            >
              {loc}
              <button
                onClick={() => handleRemoveItem('locations', index)}
                className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
          {activeInput === 'locations' ? (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'locations')}
              onBlur={() => {
                if (inputValue.trim()) handleAddItem('locations');
                else { setActiveInput(null); setInputValue(''); }
              }}
              placeholder="e.g. Remote, New York"
              className="px-3 py-1.5 text-sm border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-44"
              autoFocus
            />
          ) : (
            <button
              onClick={() => { setActiveInput('locations'); setInputValue(''); }}
              className="px-3 py-1.5 border-2 border-dashed border-slate-200 text-slate-400 text-sm rounded-lg hover:border-teal-300 hover:text-teal-600 transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="label">Seniority Level</label>
        <select
          className="input-field mt-2"
          value={data.seniority || 'mid'}
          onChange={(e) => handleUpdateField('seniority', e.target.value)}
        >
          <option value="junior">Junior (0-2 years)</option>
          <option value="mid">Mid-level (2-5 years)</option>
          <option value="senior">Senior (5+ years)</option>
          <option value="lead">Lead / Principal</option>
        </select>
      </div>

      <div>
        <label className="label">Default Tone</label>
        <div className="flex gap-3 mt-2">
          {[
            { id: 'neutral', label: 'Neutral' },
            { id: 'confident', label: 'Confident' },
            { id: 'friendly', label: 'Friendly' },
          ].map((tone) => (
            <button
              key={tone.id}
              onClick={() => handleUpdateField('tone', tone.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                (data.tone || 'neutral') === tone.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {tone.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function AchievementsTab({ data = [], onUpdate }) {
  const handleUpdateAchievement = (index, value) => {
    const newData = [...data];
    newData[index] = value;
    onUpdate(newData);
  };

  const handleAddAchievement = () => {
    onUpdate([...data, '']);
  };

  const handleRemoveAchievement = (index) => {
    const newData = [...data];
    newData.splice(index, 1);
    onUpdate(newData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="card p-4 bg-amber-50 border-amber-100">
        <div className="flex items-start gap-3">
          <Trophy className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Why achievements matter</p>
            <p className="text-sm text-amber-700 mt-1">
              Measurable wins help the AI craft more compelling, specific bullet points for your CV.
            </p>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="card p-6 md:p-8 text-center">
          <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No achievements yet</p>
          <p className="text-sm text-slate-400 mt-1">Add your key accomplishments and wins</p>
        </div>
      ) : (
        data.map((achievement, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-4 group"
          >
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Trophy className="w-3 h-3 text-teal-600" />
              </div>
              <textarea
                value={achievement}
                onChange={(e) => handleUpdateAchievement(index, e.target.value)}
                placeholder="Describe your achievement with measurable outcomes..."
                className="flex-1 text-slate-600 bg-transparent border-none outline-none focus:ring-0 p-0 text-sm leading-relaxed resize-none"
                rows={2}
              />
              <button
                onClick={() => handleRemoveAchievement(index)}
                className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))
      )}

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleAddAchievement}
        className="w-full card p-4 border-2 border-dashed border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 transition-all flex items-center justify-center gap-2 text-slate-500 hover:text-teal-600"
      >
        <Plus className="w-5 h-5" />
        Add Achievement
      </motion.button>
    </motion.div>
  );
}

// Custom Date of Birth Picker with dropdowns
function DateOfBirthPicker({ value, onChange }) {
  // Parse existing value (format: YYYY-MM-DD)
  const parseDate = (dateStr) => {
    if (!dateStr) return { day: '', month: '', year: '' };
    const [y, m, d] = dateStr.split('-');
    return { day: d || '', month: m || '', year: y || '' };
  };

  const [localDate, setLocalDate] = useState(() => parseDate(value));

  // Sync with external value changes
  useEffect(() => {
    setLocalDate(parseDate(value));
  }, [value]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  // Calculate days based on selected month/year
  const getDaysInMonth = (m, y) => {
    if (!m || !y) return 31;
    return new Date(parseInt(y), parseInt(m), 0).getDate();
  };
  const daysInMonth = getDaysInMonth(localDate.month, localDate.year);
  const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'));

  const handleChange = (field, newValue) => {
    const updated = { ...localDate, [field]: newValue };

    // Validate day if month/year changed
    if (field !== 'day' && updated.day) {
      const maxDays = getDaysInMonth(updated.month, updated.year);
      if (parseInt(updated.day) > maxDays) {
        updated.day = String(maxDays).padStart(2, '0');
      }
    }

    setLocalDate(updated);

    // Build date string only if all fields have values
    if (updated.year && updated.month && updated.day) {
      onChange(`${updated.year}-${updated.month}-${updated.day}`);
    } else if (!updated.year && !updated.month && !updated.day) {
      onChange('');
    }
  };

  return (
    <div className="flex gap-2">
      <select
        value={localDate.day}
        onChange={(e) => handleChange('day', e.target.value)}
        className="input-field flex-1"
      >
        <option value="">Day</option>
        {days.map((d) => (
          <option key={d} value={d}>{parseInt(d)}</option>
        ))}
      </select>
      <select
        value={localDate.month}
        onChange={(e) => handleChange('month', e.target.value)}
        className="input-field flex-[2]"
      >
        <option value="">Month</option>
        {months.map((m) => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>
      <select
        value={localDate.year}
        onChange={(e) => handleChange('year', e.target.value)}
        className="input-field flex-1"
      >
        <option value="">Year</option>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );
}

function PersonalInfoTab({ data = {}, onUpdate, onUploadPhoto, saving }) {
  const fileInputRef = useRef(null);
  const [photoInputMode, setPhotoInputMode] = useState('upload'); // 'upload' or 'url'
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleUpdateField = (field, value) => {
    onUpdate({ ...data, [field]: value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    setUploadingPhoto(true);
    const result = await onUploadPhoto(file);
    setUploadingPhoto(false);

    if (result.error) {
      toast.error('Failed to upload photo: ' + result.error);
    } else {
      toast.success('Photo uploaded successfully');
    }
  };

  const handleUrlSubmit = () => {
    if (photoUrlInput.trim()) {
      handleUpdateField('photo_url', photoUrlInput.trim());
      setPhotoUrlInput('');
    }
  };

  const handleRemovePhoto = () => {
    handleUpdateField('photo_url', '');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Photo Section */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Profile Photo</h3>
        <div className="flex items-start gap-6">
          {/* Photo Preview */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center">
              {data.photo_url ? (
                <img
                  src={data.photo_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-slate-300" />
              )}
            </div>
            {data.photo_url && (
              <button
                onClick={handleRemovePhoto}
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Upload Options */}
          <div className="flex-1">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setPhotoInputMode('upload')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  photoInputMode === 'upload'
                    ? 'bg-teal-100 text-teal-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Upload className="w-4 h-4 inline-block mr-1" />
                Upload
              </button>
              <button
                onClick={() => setPhotoInputMode('url')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  photoInputMode === 'url'
                    ? 'bg-teal-100 text-teal-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <LinkIcon className="w-4 h-4 inline-block mr-1" />
                URL
              </button>
            </div>

            {photoInputMode === 'upload' ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto || saving}
                  className="btn-secondary text-sm"
                >
                  {uploadingPhoto ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      Choose Photo
                    </>
                  )}
                </button>
                <p className="text-xs text-slate-400 mt-2">
                  JPG, PNG or GIF. Max 5MB.
                </p>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={photoUrlInput}
                  onChange={(e) => setPhotoUrlInput(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="input-field flex-1 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleUrlSubmit();
                    }
                  }}
                />
                <button
                  onClick={handleUrlSubmit}
                  disabled={!photoUrlInput.trim()}
                  className="btn-primary text-sm"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Personal Details */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Personal Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name *</label>
            <input
              type="text"
              placeholder="John Doe"
              value={data.name || ''}
              onChange={(e) => handleUpdateField('name', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Email *</label>
            <input
              type="email"
              placeholder="john@example.com"
              value={data.email || ''}
              onChange={(e) => handleUpdateField('email', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input
              type="tel"
              placeholder="+1 234 567 890"
              value={data.phone || ''}
              onChange={(e) => handleUpdateField('phone', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Address / Location</label>
            <input
              type="text"
              placeholder="New York, NY"
              value={data.address || ''}
              onChange={(e) => handleUpdateField('address', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">LinkedIn URL</label>
            <input
              type="url"
              placeholder="linkedin.com/in/johndoe"
              value={data.linkedin || ''}
              onChange={(e) => handleUpdateField('linkedin', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Portfolio Website</label>
            <input
              type="url"
              placeholder="johndoe.com"
              value={data.portfolio || ''}
              onChange={(e) => handleUpdateField('portfolio', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Date of Birth (Optional)</label>
            <DateOfBirthPicker
              value={data.date_of_birth || ''}
              onChange={(value) => handleUpdateField('date_of_birth', value)}
            />
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="card p-4 bg-blue-50 border-blue-100">
        <div className="flex items-start gap-3">
          <User className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">Why personal info matters</p>
            <p className="text-sm text-blue-700 mt-1">
              Your personal information will appear on your CV templates. Fill in the required fields (name & email) to ensure your CV looks complete.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
