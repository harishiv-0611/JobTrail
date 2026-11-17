
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  fetchApplicationById,
  updateApplication,
  deleteApplication,
} from '../api/applications';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatDate, formatDateTime } from '../utils/date';
import {
  ExternalLink,
  Trash2,
  Edit3,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const STATUS_FLOW = [
  'Wishlist',
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Accepted',
];

const TERMINAL_STATUSES = [
  'Accepted',
  'Rejected',
  'Withdrawn',
];

const EXIT_STATUSES = ['Rejected', 'Withdrawn'];

const getTimestamp = () =>
  new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const getAllowedStatuses = (currentStatus) => {
  if (TERMINAL_STATUSES.includes(currentStatus)) {
    return [];
  }

  const currentIndex = STATUS_FLOW.indexOf(currentStatus);

  if (currentIndex === -1) {
    return [];
  }

  // Allow every later status, including skipped stages.
  return [
    ...STATUS_FLOW.slice(currentIndex + 1),
    ...EXIT_STATUSES,
  ];
};

const buildStatusHistory = (
  currentStatus,
  newStatus,
  history = []
) => {
  if (currentStatus === newStatus) {
    return history;
  }

  const currentIndex = STATUS_FLOW.indexOf(currentStatus);
  const newIndex = STATUS_FLOW.indexOf(newStatus);
  const timestamp = getTimestamp();
  const updatedHistory = [...history];

  // Record intermediate stages when moving forward.
  if (
    currentIndex >= 0 &&
    newIndex > currentIndex + 1
  ) {
    for (let i = currentIndex + 1; i < newIndex; i++) {
      updatedHistory.push({
        status: STATUS_FLOW[i],
        at: timestamp,
        skipped: true,
      });
    }
  }

  updatedHistory.push({
    status: newStatus,
    at: timestamp,
    skipped: false,
  });

  return updatedHistory;
};

const AppDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusError, setStatusError] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [noteText, setNoteText] = useState('');
  const [interviewType, setInterviewType] = useState('');
  const [interviewDate, setInterviewDate] = useState('');

  useEffect(() => {
    let active = true;

    fetchApplicationById(id)
      .then((data) => {
        if (!active) return;
        setApp(data);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError('Application not found.');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const allowedStatuses = app
    ? getAllowedStatuses(app.status)
    : [];

  const isTerminal = app
    ? TERMINAL_STATUSES.includes(app.status)
    : false;

  const handleStatusChange = async (newStatus) => {
    if (
      !app ||
      savingStatus ||
      newStatus === app.status
    ) {
      return;
    }

    if (!allowedStatuses.includes(newStatus)) {
      setStatusError(
        `You cannot change ${app.status} to ${newStatus}.`
      );
      return;
    }

    setStatusError('');
    setSavingStatus(true);

    try {
      const updatedHistory = buildStatusHistory(
        app.status,
        newStatus,
        app.history || []
      );

      const updated = await updateApplication(id, {
        status: newStatus,
        history: updatedHistory,
      });

      setApp(updated);
    } catch (err) {
      setStatusError(
        err?.message ||
          'Could not update the application status. Please try again.'
      );
    } finally {
      setSavingStatus(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();

    if (!noteText.trim()) return;

    const newNote = {
      content: noteText.trim(),
      createdAt: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
    };

    try {
      const updated = await updateApplication(id, {
        notes: [...(app.notes || []), newNote],
      });

      setApp(updated);
      setNoteText('');
      setStatusError('');
    } catch {
      setStatusError('Could not save the note. Please try again.');
    }
  };

  const handleAddInterview = async (e) => {
    e.preventDefault();

    if (!interviewType.trim() || !interviewDate) return;

    const newInterview = {
      id: Date.now().toString(),
      type: interviewType.trim(),
      scheduledAt: interviewDate,
    };

    try {
      const updated = await updateApplication(id, {
        interviews: [...(app.interviews || []), newInterview],
      });

      setApp(updated);
      setInterviewType('');
      setInterviewDate('');
      setStatusError('');
    } catch {
      setStatusError('Could not save the interview. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteApplication(id);
      navigate('/applications');
    } catch {
      setStatusError('Could not delete the application. Please try again.');
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-gray-500">
        Loading application details...
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="p-8 text-rose-600 bg-rose-50 rounded-xl">
        {error || 'Application not found.'}
      </div>
    );
  }

  const initials = (app.company || 'NA')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Application header */}
      <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-indigo-50 text-primary font-bold text-xl flex items-center justify-center border border-indigo-100">
            {initials}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {app.role}
            </h1>
            <p className="text-gray-600 font-medium">
              {app.company} ·{' '}
              <span className="text-gray-500">
                {app.location || 'Location not specified'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
         

<select
  value={app.status}
  onChange={(e) => handleStatusChange(e.target.value)}
  disabled={savingStatus || isTerminal}
  className="border rounded-lg px-3 py-2 text-sm font-medium bg-gray-50 hover:bg-white focus:ring-2 focus:ring-primary outline-none disabled:opacity-60"
  aria-label="Application status"
>
  {[
    'Wishlist',
    'Applied',
    'Screening',
    'Interview',
    'Offer',
    'Accepted',
    'Rejected',
    'Withdrawn',
  ].map((status) => (
    <option
      key={status}
      value={status}
      disabled={
        status !== app.status &&
        !allowedStatuses.includes(status)
      }
    >
      {status}
    </option>
  ))}
</select>


          <Link
            to={`/applications/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            <Edit3 size={16} />
            Edit
          </Link>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-rose-200 text-rose-600 rounded-lg text-sm font-medium hover:bg-rose-50"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {statusError && (
        <div
          role="alert"
          className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2"
        >
          <AlertCircle size={17} className="shrink-0" />
          <span>{statusError}</span>
          <button
            type="button"
            className="ml-auto underline"
            onClick={() => setStatusError('')}
          >
            Dismiss
          </button>
        </div>
      )}

      {savingStatus && (
        <p className="text-sm text-gray-500">
          Updating application status...
        </p>
      )}

      {isTerminal && (
        <div className="p-3 rounded-lg bg-gray-50 border text-gray-600 text-sm">
          This application is marked as {app.status} and is now closed.
          Create a new application to track a different opportunity.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Application details */}
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900">
              Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm border-b pb-4">
              <div>
                <span className="text-gray-500 block">Job link</span>

                {app.jobUrl ? (
                  <a
                    href={app.jobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 font-medium truncate mt-1"
                  >
                    {app.jobUrl}
                    <ExternalLink size={14} />
                  </a>
                ) : (
                  <span className="text-gray-400 mt-1 block">
                    Not provided
                  </span>
                )}
              </div>

              <div>
                <span className="text-gray-500 block">Source</span>
                <span className="font-medium text-gray-900 mt-1 block">
                  {app.source || 'Direct'}
                </span>
              </div>

              <div>
                <span className="text-gray-500 block">Applied date</span>
                <span className="font-medium text-gray-900 mt-1 block">
                  {formatDate(app.appliedDate) || 'Not provided'}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Job description
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {app.jobDescription || 'No job description added yet.'}
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Notes</h2>

            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                placeholder="Add a new note..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />

              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                Add Note
              </button>
            </form>

            <div className="space-y-3 pt-2">
              {(app.notes || []).length === 0 && (
                <p className="text-sm text-gray-400">No notes yet.</p>
              )}

              {(app.notes || []).map((note) => (
                <div
                  key={note.id || note._id || `${note.content || note.text}-${note.createdAt}`}
                  className="p-3.5 bg-gray-50 rounded-lg border text-sm"
                >
                  <p className="text-gray-800">{note.content || note.text}</p>
                  <span className="text-xs text-gray-400 mt-1 block">
                    {formatDateTime(note.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status history */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Status history
            </h2>

            <div className="relative pl-4 border-l-2 border-indigo-100 space-y-6">
              {(app.history || []).map((item, idx) => (
                <div
                  key={`${item.status}-${item.at}-${idx}`}
                  className="relative"
                >
                  {/* All timeline circles are blue */}
                  <div className="w-3 h-3 rounded-full absolute -left-[23px] top-1.5 ring-4 ring-white bg-indigo-600" />

                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={item.status} />
                    <span className="text-xs text-gray-500">
                      {formatDate(item.at)}
                    </span>
                  </div>

                  {/* Both skipped and completed entries say Status recorded */}
                  <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                    <CheckCircle2 size={13} />
                    Status recorded
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interviews */}
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900">
              Interviews
            </h2>

            <div className="space-y-3">
              {(app.interviews || []).map((iv) => (
                <div
                  key={iv.id || iv._id || `${iv.type}-${iv.scheduledAt}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border text-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar size={16} className="text-primary" />
                    <span className="font-medium text-gray-900">
                      {iv.type}
                    </span>
                  </div>

                  <span className="text-gray-500 text-xs">
                    {formatDate(iv.scheduledAt)}
                  </span>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleAddInterview}
              className="space-y-2 pt-2 border-t"
            >
              <input
                type="text"
                placeholder="Interview round (e.g. Technical)"
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />

              <div className="flex gap-2">
                <input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                />

                <button
                  type="submit"
                  className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center gap-1"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteModal}
        title="Delete Application"
        message={`Are you sure you want to delete your application for ${app.role} at ${app.company}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default AppDetail;
