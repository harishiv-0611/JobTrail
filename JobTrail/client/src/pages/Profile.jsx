
import { useEffect, useMemo, useState } from 'react';
import { getProfile, updateProfile } from '../api/auth';

const emptyProfile = {
  name: '',
  email: '',
  phone: '',
  location: '',
  headline: '',
  professionalSummary: '',
  masterResume: '',
  skills: [],
  education: [],
  experience: [],
  projects: [],
  certifications: [],
  achievements: [],
};

const sectionDefinitions = [
  {
    key: 'education',
    title: 'Education',
    subtitle: 'Your academic background',
    fields: [
      ['institution', 'Institution'],
      ['degree', 'Degree / Qualification'],
      ['fieldOfStudy', 'Field of Study'],
      ['startDate', 'Start Date'],
      ['endDate', 'End Date'],
      ['grade', 'Grade / CGPA'],
    ],
    create: () => ({
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      grade: '',
      currentlyStudying: false,
    }),
  },
  {
    key: 'experience',
    title: 'Work Experience & Internships',
    subtitle: 'Your professional journey',
    fields: [
      ['company', 'Company'],
      ['role', 'Role / Job Title'],
      ['location', 'Location'],
      ['startDate', 'Start Date'],
      ['endDate', 'End Date'],
      ['description', 'Responsibilities and achievements'],
    ],
    create: () => ({
      company: '',
      role: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
    }),
  },
  {
    key: 'projects',
    title: 'Projects',
    subtitle: 'Showcase your work',
    fields: [
      ['name', 'Project Name'],
      ['description', 'Project Description'],
      ['technologies', 'Technologies Used'],
      ['url', 'Project URL (optional)'],
    ],
    create: () => ({
      name: '',
      description: '',
      technologies: '',
      url: '',
    }),
  },
  {
    key: 'certifications',
    title: 'Certifications',
    subtitle: 'Courses and professional credentials',
    fields: [
      ['name', 'Certification Name'],
      ['issuer', 'Issuing Organization'],
      ['issueDate', 'Issue Date'],
      ['credentialUrl', 'Credential URL (optional)'],
    ],
    create: () => ({
      name: '',
      issuer: '',
      issueDate: '',
      credentialUrl: '',
    }),
  },
  {
    key: 'achievements',
    title: 'Achievements & Awards',
    subtitle: 'Awards, competitions and accomplishments',
    fields: [
      ['title', 'Achievement Title'],
      ['organization', 'Organization'],
      ['date', 'Date'],
      ['description', 'Description'],
    ],
    create: () => ({
      title: '',
      organization: '',
      date: '',
      description: '',
    }),
  },
];

const inputClass =
  'w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100';

function Section({ title, subtitle, children, action }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({ label, value, onChange, disabled, multiline = false }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-600">
        {label}
      </span>
      {multiline ? (
        <textarea
          rows={4}
          className={inputClass}
          value={value || ''}
          disabled={disabled}
          onChange={e => onChange(e.target.value)}
        />
      ) : (
        <input
          className={inputClass}
          value={value || ''}
          disabled={disabled}
          onChange={e => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

function EntrySection({
  definition,
  items,
  editing,
  onAdd,
  onUpdate,
  onDelete,
}) {
  const { key, title, subtitle, fields } = definition;

  return (
    <Section
      title={title}
      subtitle={subtitle}
      action={
        editing && (
          <button
            type="button"
            onClick={onAdd}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            + Add
          </button>
        )
      }
    >
      {items.length === 0 && (
        <p className="py-3 text-sm text-gray-400">
          No {title.toLowerCase()} added yet.
        </p>
      )}

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item._id || `${key}-${index}`}
            className="rounded-lg border border-gray-100 p-4"
          >
            {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {fields.map(([field, label]) => (
                    <div
                      key={field}
                      className={
                        field === 'description' ? 'md:col-span-2' : ''
                      }
                    >
                      <Field
                        label={label}
                        value={item[field]}
                        multiline={
                          field === 'description'
                        }
                        onChange={value =>
                          onUpdate(index, field, value)
                        }
                      />
                    </div>
                  ))}
                </div>

                {key === 'education' && (
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={Boolean(item.currentlyStudying)}
                      onChange={e =>
                        onUpdate(
                          index,
                          'currentlyStudying',
                          e.target.checked
                        )
                      }
                    />
                    Currently studying here
                  </label>
                )}

                <button
                  type="button"
                  onClick={() => onDelete(index)}
                  className="text-sm font-medium text-red-500 hover:text-red-700"
                >
                  Remove entry
                </button>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold text-gray-900">
                  {item.institution ||
                    item.company ||
                    item.name ||
                    item.title ||
                    'Untitled entry'}
                </h3>
                <p className="mt-1 text-sm text-indigo-600">
                  {item.degree || item.role || item.issuer || item.organization || ''}
                </p>
                {item.fieldOfStudy && (
                  <p className="mt-1 text-sm text-gray-600">
                    {item.fieldOfStudy}
                  </p>
                )}
                {item.technologies && (
                  <p className="mt-1 text-sm text-gray-500">
                    Technologies: {item.technologies}
                  </p>
                )}
                {item.description && (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                    {item.description}
                  </p>
                )}
                {(item.startDate || item.endDate || item.date || item.issueDate) && (
                  <p className="mt-2 text-xs text-gray-400">
                    {item.startDate || item.date || item.issueDate}
                    {item.endDate ? ` – ${item.currentlyStudying ? 'Present' : item.endDate}` : ''}
                  </p>
                )}
                {item.url && (
                  <p className="mt-2 break-all text-sm text-indigo-600">{item.url}</p>
                )}
                {item.credentialUrl && (
                  <p className="mt-2 break-all text-sm text-indigo-600">
                    {item.credentialUrl}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

export default function Profile() {
  const [profile, setProfile] = useState(emptyProfile);
  const [originalProfile, setOriginalProfile] = useState(emptyProfile);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        setLoading(true);
        setError('');

        const user = await getProfile();
        if (!active) return;

        const loaded = {
          ...emptyProfile,
          ...(user.profile || {}),
          name: user.name || '',
          email: user.email || '',
          masterResume: user.masterResume || '',
        };

        setProfile(loaded);
        setOriginalProfile(loaded);
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
            err.message ||
            'Unable to load profile.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const updateField = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const updateEntry = (section, index, field, value) => {
    setProfile(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addEntry = definition => {
    setProfile(prev => ({
      ...prev,
      [definition.key]: [
        ...prev[definition.key],
        definition.create(),
      ],
    }));
  };

  const deleteEntry = (section, index) => {
    setProfile(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (!skill) return;

    if (
      profile.skills.some(
        item => item.toLowerCase() === skill.toLowerCase()
      )
    ) {
      setSkillInput('');
      return;
    }

    updateField('skills', [...profile.skills, skill]);
    setSkillInput('');
  };

  const removeSkill = index => {
    updateField(
      'skills',
      profile.skills.filter((_, i) => i !== index)
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        name: profile.name,
        phone: profile.phone,
        location: profile.location,
        headline: profile.headline,
        professionalSummary: profile.professionalSummary,
        education: profile.education,
        skills: profile.skills,
        experience: profile.experience,
        projects: profile.projects,
        certifications: profile.certifications,
        achievements: profile.achievements,
        masterResume: profile.masterResume,
      };

      const updatedUser = await updateProfile(payload);

      const saved = {
        ...emptyProfile,
        ...(updatedUser.profile || {}),
        name: updatedUser.name || '',
        email: updatedUser.email || '',
        masterResume: updatedUser.masterResume || '',
      };

      setProfile(saved);
      setOriginalProfile(saved);
      setEditing(false);
      setSuccess('Your complete profile has been saved successfully.');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Unable to save your profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  const cancelEditing = () => {
    setProfile(originalProfile);
    setEditing(false);
    setError('');
    setSuccess('');
    setSkillInput('');
  };

  const completedSections = useMemo(() => {
    return [
      Boolean(profile.name && profile.email),
      Boolean(profile.professionalSummary.trim()),
      profile.skills.length > 0,
      profile.education.length > 0,
      profile.experience.length > 0,
      profile.projects.length > 0,
      profile.certifications.length > 0,
      profile.achievements.length > 0,
      Boolean(profile.masterResume.trim()),
    ].filter(Boolean).length;
  }, [profile]);

  const completion = Math.round((completedSections / 9) * 100);

  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
        Loading your profile...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-1 text-sm text-gray-500">
            Build and maintain your professional identity.
          </p>
        </div>

        {!editing ? (
          <button
            type="button"
            onClick={() => {
              setError('');
              setSuccess('');
              setEditing(true);
            }}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={cancelEditing}
              disabled={saving}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Profile overview */}
      <div className="rounded-xl bg-gradient-to-r from-indigo-950 to-indigo-600 p-7 text-white">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-2xl font-bold text-indigo-700">
            {(profile.name || 'U')
              .split(' ')
              .map(part => part[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold">
              {profile.name || 'Your Name'}
            </h2>
            <p className="mt-1 text-indigo-100">
              {profile.headline || 'Add your professional headline'}
            </p>
            <p className="mt-2 text-sm text-indigo-200">
              {profile.email}
              {profile.location && ` • ${profile.location}`}
            </p>
          </div>

          <div className="min-w-32 rounded-lg bg-white/10 px-5 py-3">
            <p className="text-xs text-indigo-100">Profile completion</p>
            <p className="text-2xl font-bold">{completion}%</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Personal information */}
      <Section
        title="Personal Information"
        subtitle="Your basic contact and professional details"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {[
            ['name', 'Full Name'],
            ['email', 'Email Address'],
            ['phone', 'Phone Number'],
            ['location', 'Location'],
            ['headline', 'Professional Headline'],
          ].map(([field, label]) => (
            <Field
              key={field}
              label={label}
              value={profile[field]}
              disabled={!editing || field === 'email'}
              onChange={value => updateField(field, value)}
            />
          ))}
        </div>
      </Section>

      {/* Professional summary */}
      <Section
        title="Professional Summary"
        subtitle="Introduce yourself to recruiters"
      >
        {editing ? (
          <Field
            label="Your Summary"
            value={profile.professionalSummary}
            multiline
            onChange={value =>
              updateField('professionalSummary', value)
            }
          />
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-7 text-gray-600">
            {profile.professionalSummary || 'No professional summary added yet.'}
          </p>
        )}
      </Section>

      {/* Skills */}
      <Section
        title="Skills & Technologies"
        subtitle="Technical, analytical and professional skills"
      >
        {editing && (
          <div className="mb-5 flex gap-2">
            <input
              className={inputClass}
              placeholder="Add a skill (e.g. Python, React, SQL)"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
            />
            <button
              type="button"
              onClick={addSkill}
              className="rounded-lg bg-indigo-600 px-5 text-sm text-white"
            >
              Add
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {profile.skills.map((skill, index) => (
            <span
              key={`${skill}-${index}`}
              className="flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm text-indigo-700"
            >
              {skill}
              {editing && (
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="font-bold text-indigo-500"
                  aria-label={`Remove ${skill}`}
                >
                  ×
                </button>
              )}
            </span>
          ))}
          {profile.skills.length === 0 && (
            <p className="text-sm text-gray-400">No skills added yet.</p>
          )}
        </div>
      </Section>

      {/* Education, experience, projects, certifications, achievements */}
      {sectionDefinitions.map(definition => (
        <EntrySection
          key={definition.key}
          definition={definition}
          items={profile[definition.key]}
          editing={editing}
          onAdd={() => addEntry(definition)}
          onUpdate={(index, field, value) =>
            updateEntry(definition.key, index, field, value)
          }
          onDelete={index => deleteEntry(definition.key, index)}
        />
      ))}

      {/* Written Master Resume */}
      <Section
        title="Written Master Resume"
        subtitle="Your complete resume in editable text format"
      >
        {editing ? (
          <div className="space-y-2">
            <Field
              label="Master Resume Content"
              value={profile.masterResume}
              multiline
              onChange={value => updateField('masterResume', value)}
            />
            <p className="text-xs text-gray-400">
              Write or maintain your complete resume here. Your content is saved as text in your JobTrail account.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-5">
            {profile.masterResume ? (
              <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                {profile.masterResume}
              </p>
            ) : (
              <p className="text-sm text-gray-400">
                Your written Master Resume is empty. Click Edit Profile to add your resume.
              </p>
            )}
          </div>
        )}
      </Section>

      {editing && (
        <div className="flex justify-end gap-3 pb-4">
          <button
            type="button"
            onClick={cancelEditing}
            disabled={saving}
            className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Complete Profile'}
          </button>
        </div>
      )}
    </div>
  );
}