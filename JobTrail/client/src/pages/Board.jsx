
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchApplications,
  updateApplication,
} from '../api/applications';

const STATUSES = [
  'Wishlist',
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Accepted',
  'Rejected',
  'Withdrawn',
];

const STATUS_STYLES = {
  Wishlist: 'bg-slate-100 text-slate-700',
  Applied: 'bg-blue-100 text-blue-700',
  Screening: 'bg-violet-100 text-violet-700',
  Interview: 'bg-amber-100 text-amber-700',
  Offer: 'bg-emerald-100 text-emerald-700',
  Accepted: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
  Withdrawn: 'bg-gray-100 text-gray-600',
};

function getId(application) {
  return application._id || application.id;
}

function getDate(value) {
  if (!value) return 'Date not set';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Date not set';

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function ApplicationCard({ application, onDragStart, onDragEnd }) {
  return (
    <article
      draggable
      onDragStart={event => onDragStart(event, application)}
      onDragEnd={onDragEnd}
      className="group cursor-grab rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-gray-900">
            {application.company}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {application.role}
          </p>
        </div>

        <span className="text-gray-300 transition group-hover:text-indigo-500">
          ⠿
        </span>
      </div>

      {application.location && (
        <p className="mt-3 truncate text-xs text-gray-500">
          <span className="mr-1">📍</span>
          {application.location}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
        <span className="text-xs text-gray-400">
          Applied: {getDate(application.appliedDate)}
        </span>

        {application.source && (
          <span className="rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-500">
            {application.source}
          </span>
        )}
      </div>

      {application.jobUrl && (
        <a
          href={application.jobUrl}
          target="_blank"
          rel="noreferrer"
          onClick={event => event.stopPropagation()}
          className="mt-3 inline-block text-xs font-medium text-indigo-600 hover:text-indigo-800"
        >
          View job posting ↗
        </a>
      )}
    </article>
  );
}

export default function Board() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);
  const [search, setSearch] = useState('');
  const [savingIds, setSavingIds] = useState([]);

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetchApplications();

      const list = Array.isArray(response)
        ? response
        : response?.data || response?.applications || [];

      setApplications(list);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Unable to load applications.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return applications;

    return applications.filter(application =>
      [
        application.company,
        application.role,
        application.location,
        application.status,
      ]
        .filter(Boolean)
        .some(value => value.toLowerCase().includes(query))
    );
  }, [applications, search]);

  const counts = useMemo(() => {
    return STATUSES.reduce((result, status) => {
      result[status] = applications.filter(
        application => application.status === status
      ).length;

      return result;
    }, {});
  }, [applications]);

  const handleDragStart = (event, application) => {
    const id = getId(application);

    setDraggedId(id);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(id));
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverStatus(null);
  };

  const handleDrop = async (event, newStatus) => {
    event.preventDefault();

    const id = event.dataTransfer.getData('text/plain') || draggedId;

    setDragOverStatus(null);
    setDraggedId(null);

    const application = applications.find(
      item => String(getId(item)) === String(id)
    );

    if (!application || application.status === newStatus) return;

    const previousStatus = application.status;

    // Optimistic UI update
    setApplications(prev =>
      prev.map(item =>
        String(getId(item)) === String(id)
          ? { ...item, status: newStatus }
          : item
      )
    );

    setSavingIds(prev => [...prev, id]);
    setError('');
    setSuccess('');

    try {
      await updateApplication(id, { status: newStatus });

      setSuccess(
        `${application.company} moved to ${newStatus}.`
      );
    } catch (err) {
      // Restore the previous status if the server rejects the update
      setApplications(prev =>
        prev.map(item =>
          String(getId(item)) === String(id)
            ? { ...item, status: previousStatus }
            : item
        )
      );

      setError(
        err.response?.data?.message ||
        err.message ||
        'Could not update application status.'
      );
    } finally {
      setSavingIds(prev =>
        prev.filter(item => String(item) !== String(id))
      );
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
        Loading your application board...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Application Board
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage your job search visually.
          </p>
        </div>

        <button
          type="button"
          onClick={loadApplications}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ↻ Refresh Board
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Total applications</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {applications.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Interviews</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">
            {counts.Interview}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Offers</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {counts.Offer}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Accepted</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {counts.Accepted}
          </p>
        </div>
      </div>

      {/* Search and feedback */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Search company, role or location..."
          className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />

        <span className="text-sm text-gray-500">
          {filteredApplications.length} applications
        </span>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Kanban columns */}
      <div className="flex gap-4 overflow-x-auto pb-5">
        {STATUSES.map(status => {
          const columnApplications = filteredApplications.filter(
            application => application.status === status
          );

          const isOver = dragOverStatus === status;

          return (
            <section
              key={status}
              onDragOver={event => {
                event.preventDefault();
                setDragOverStatus(status);
              }}
              onDragLeave={event => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setDragOverStatus(null);
                }
              }}
              onDrop={event => handleDrop(event, status)}
              className={`w-[280px] min-w-[280px] self-start rounded-xl border p-3 transition ${
                isOver
                  ? 'border-indigo-400 bg-indigo-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="mb-4 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-gray-800">
                    {status}
                  </h2>

                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-500">
                    {columnApplications.length}
                  </span>
                </div>

                <span className="text-xs text-gray-400">
                  {savingIds.length > 0 ? 'Saving...' : ''}
                </span>
              </div>

              <div className="min-h-32 space-y-3">
                {columnApplications.map(application => (
                  <ApplicationCard
                    key={getId(application)}
                    application={application}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  />
                ))}

                {columnApplications.length === 0 && (
                  <div className="rounded-lg border border-dashed border-gray-300 px-3 py-8 text-center text-xs text-gray-400">
                    {isOver
                      ? 'Drop application here'
                      : 'No applications here'}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <p className="text-xs text-gray-400">
        Tip: Drag an application card into another column to update its status.
        Changes are saved to your database.
      </p>
    </div>
  );
}
