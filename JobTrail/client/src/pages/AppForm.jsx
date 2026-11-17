
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  createApplication,
  fetchApplicationById,
  updateApplication,
} from '../api/applications';

const STATUS_FLOW = [
  'Wishlist',
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Accepted',
];

const ALL_STATUSES = [
  ...STATUS_FLOW,
  'Rejected',
  'Withdrawn',
];

const getToday = () => new Date().toISOString().split('T')[0];

const getTimestamp = () =>
  new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

// Keep history up to the selected stage and remove later stages.
const buildStatusHistory = (
  currentStatus,
  newStatus,
  history = []
) => {
  if (newStatus === 'Applied') {
    const appliedEntry = [...history]
      .reverse()
      .find((item) => item.status === 'Applied');

    return [{
      ...(appliedEntry || {}),
      status: 'Applied',
      at: appliedEntry?.at || getTimestamp(),
      skipped: false,
    }];
  }

  if (currentStatus === newStatus) {
    return history;
  }

  const at = getTimestamp();
  const newIndex = STATUS_FLOW.indexOf(newStatus);

  // Rejected and Withdrawn are separate ending statuses.
  if (newStatus === 'Rejected' || newStatus === 'Withdrawn') {
    const earlierHistory = history.filter(
      (item) =>
        item.status !== 'Rejected' &&
        item.status !== 'Withdrawn' &&
        item.status !== 'Accepted'
    );

    return [
      ...earlierHistory,
      {
        status: newStatus,
        at,
        skipped: false,
      },
    ];
  }

  // Keep only normal workflow stages up to the selected status.
  const updatedHistory = history.filter((item) => {
    const itemIndex = STATUS_FLOW.indexOf(item.status);
    return itemIndex !== -1 && itemIndex < newIndex;
  });

  // Find the last retained workflow stage.
  const lastEntry = updatedHistory[updatedHistory.length - 1];

  const lastIndex = lastEntry
    ? STATUS_FLOW.indexOf(lastEntry.status)
    : -1;

  // Add any intermediate stages when moving forward.
  for (let i = lastIndex + 1; i < newIndex; i++) {
    updatedHistory.push({
      status: STATUS_FLOW[i],
      at,
      skipped: true,
    });
  }

  // Add the newly selected status.
  updatedHistory.push({
    status: newStatus,
    at,
    skipped: false,
  });

  return updatedHistory;
};

const AppForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    company: '',
    role: '',
    location: '',
    status: 'Applied',
    jobUrl: '',
    source: '',
    appliedDate: getToday(),
    jobDescription: '',
  });

  const [originalApp, setOriginalApp] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    let active = true;

    if (!isEditMode) {
      return () => {
        active = false;
      };
    }

    fetchApplicationById(id)
      .then((data) => {
        if (!active) return;

        setOriginalApp(data);

        setFormData({
          ...data,
          company: data.company || '',
          role: data.role || '',
          location: data.location || '',
          status: data.status || 'Applied',
          jobUrl: data.jobUrl || '',
          source: data.source || '',
          appliedDate: data.appliedDate
            ? String(data.appliedDate).slice(0, 10)
            : getToday(),
          jobDescription: data.jobDescription || '',
        });

        setLoading(false);
      })
      .catch(() => {
        if (!active) return;

        setFormError('Could not load this application.');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, isEditMode]);

  const handleChange = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: '',
    }));

    setFormError('');
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }

    if (!formData.role.trim()) {
      newErrors.role = 'Role is required';
    }

    if (formData.jobUrl.trim()) {
      try {
        const url = new URL(formData.jobUrl);

        if (!['http:', 'https:'].includes(url.protocol)) {
          newErrors.jobUrl = 'Use a valid HTTP or HTTPS URL';
        }
      } catch {
        newErrors.jobUrl =
          'Enter a valid URL (e.g. https://example.com)';
      }
    }

    if (!ALL_STATUSES.includes(formData.status)) {
      newErrors.status = 'Select a valid application status';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!validate() || saving) return;

    setSaving(true);

    try {
      if (isEditMode) {
        const oldStatus = originalApp.status || 'Applied';

        const statusChanged = formData.status !== oldStatus;

        const updatedHistory = statusChanged
          ? buildStatusHistory(
              oldStatus,
              formData.status,
              originalApp.history || []
            )
          : (originalApp.history || []);

        const updatedData = {
          ...formData,
          history: updatedHistory,
        };

        const updated = await updateApplication(id, updatedData);

        setOriginalApp(updated);
        navigate(`/applications/${id}`);
      } else {
        const newApplication = {
          ...formData,
          history: [{ status: formData.status, at: getTimestamp() }],
          notes: [],
          interviews: [],
        };

        await createApplication(newApplication);
        navigate('/applications');
      }
    } catch (err) {
      setFormError(
        err?.message ||
          'Could not save the application. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-gray-500">
        Loading application...
      </div>
    );
  }

  if (isEditMode && !originalApp) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-rose-600 bg-rose-50 rounded-xl">
        {formError || 'Application not found.'}

        <div className="mt-3">
          <Link to="/applications" className="underline">
            Back to applications
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="text-sm text-gray-500">
        <Link to="/applications" className="hover:underline">
          Applications
        </Link>{' '}
        /{' '}
        <span className="text-gray-900 font-medium">
          {isEditMode ? 'Edit' : 'New'}
        </span>
      </div>

      <div className="bg-white p-8 rounded-xl border shadow-sm">
        <h2 className="text-2xl font-bold mb-6">
          {isEditMode ? 'Edit application' : 'Add application'}
        </h2>

        {formError && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
          >
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company *
              </label>

              <input
                type="text"
                className={`w-full border rounded-lg p-2.5 text-sm ${
                  errors.company ? 'border-rose-500' : ''
                }`}
                value={formData.company}
                onChange={(e) =>
                  handleChange('company', e.target.value)
                }
              />

              {errors.company && (
                <p className="text-xs text-rose-600 mt-1">
                  {errors.company}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>

              <input
                type="text"
                className={`w-full border rounded-lg p-2.5 text-sm ${
                  errors.role ? 'border-rose-500' : ''
                }`}
                value={formData.role}
                onChange={(e) =>
                  handleChange('role', e.target.value)
                }
              />

              {errors.role && (
                <p className="text-xs text-rose-600 mt-1">
                  {errors.role}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>

              <input
                type="text"
                placeholder="e.g. Remote, London, New York"
                className="w-full border rounded-lg p-2.5 text-sm"
                value={formData.location}
                onChange={(e) =>
                  handleChange('location', e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>

              <select
                className="w-full border rounded-lg p-2.5 text-sm bg-white"
                value={formData.status}
                onChange={(e) =>
                  handleChange('status', e.target.value)
                }
              >
                {ALL_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <p className="text-xs text-gray-500 mt-1">
                You can change the status at any time. Later stages
                are removed when you move backward.
              </p>

              {errors.status && (
                <p className="text-xs text-rose-600 mt-1">
                  {errors.status}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job URL
              </label>

              <input
                type="text"
                placeholder="https://..."
                className={`w-full border rounded-lg p-2.5 text-sm ${
                  errors.jobUrl ? 'border-rose-500' : ''
                }`}
                value={formData.jobUrl}
                onChange={(e) =>
                  handleChange('jobUrl', e.target.value)
                }
              />

              {errors.jobUrl && (
                <p className="text-xs text-rose-600 mt-1">
                  {errors.jobUrl}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>

              <input
                type="text"
                placeholder="LinkedIn, Referral..."
                className="w-full border rounded-lg p-2.5 text-sm"
                value={formData.source}
                onChange={(e) =>
                  handleChange('source', e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Applied date
              </label>

              <input
                type="date"
                className="w-full border rounded-lg p-2.5 text-sm"
                value={formData.appliedDate}
                onChange={(e) =>
                  handleChange('appliedDate', e.target.value)
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job description
            </label>

            <textarea
              rows="5"
              className="w-full border rounded-lg p-2.5 text-sm"
              placeholder="Paste the job description here..."
              value={formData.jobDescription}
              onChange={(e) =>
                handleChange('jobDescription', e.target.value)
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppForm;
