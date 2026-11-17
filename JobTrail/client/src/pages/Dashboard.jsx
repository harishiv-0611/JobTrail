import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  fetchStats,
  fetchApplications,
} from '../api/applications';
import { setFilters } from '../store/applicationsSlice';
import { useAuth } from '../context/AuthContext';

import PageBanner from '../components/common/PageBanner';
import StatCard from '../components/common/StatCard';
import WeeklyChart from '../components/dashboard/WeeklyChart';
import UpcomingInterviews from '../components/dashboard/UpcomingInterviews';
import RecentApplications from '../components/dashboard/RecentApplications';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [today] = useState(() => {
    const date = new Date();
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const appsData = await fetchApplications();
        const statsData = await fetchStats(appsData);
        setStats(statsData);
        setApplications(appsData);
      } catch (loadError) {
        setError(loadError?.message || 'Could not load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="p-6 text-rose-600 bg-rose-50 rounded-xl border border-rose-200">
        {error}
      </div>
    );
  }

  const upcomingInterviews = applications
    .flatMap((app) =>
      (app.interviews || []).map((iv) => ({
        ...iv,
        company: app.company,
        appId: app.id,
      }))
    )
    .filter((interview) => {
      const scheduledAt = new Date(interview.scheduledAt);
      return !Number.isNaN(scheduledAt.getTime()) &&
        scheduledAt.toISOString().slice(0, 10) >= today;
    })
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  const dynamicCounts = {
    Applied:
      applications.filter((a) => a.status === 'Applied').length ||
      stats?.counts?.Applied ||
      0,
    Interview:
      applications.filter((a) => a.status === 'Interview').length ||
      stats?.counts?.Interviewing ||
      0,
    Offer:
      applications.filter((a) => a.status === 'Offer').length ||
      stats?.counts?.Offers ||
      0,
    Rejected:
      applications.filter((a) => a.status === 'Rejected').length ||
      stats?.counts?.Rejected ||
      0,
  };

  const handleCardClick = (statusKey) => {
    dispatch(setFilters({ status: statusKey, page: 1 }));
    navigate('/applications');
  };

  const firstName = user?.name
    ? `, ${user.name.split(' ')[0]}`
    : '';

  return (
    <div className="space-y-6">
      <PageBanner
        title={`Welcome${firstName}`}
        subtitle="Here's an overview of your job search."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Object.entries(dynamicCounts).map(([status, count]) => (
          <StatCard
            key={status}
            label={status}
            count={count}
            onClick={() => handleCardClick(status)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeeklyChart
            title="Applications per week"
            badgeText="Last 8 Weeks"
            data={stats?.weekly || []}
          />
        </div>

        <div>
          <UpcomingInterviews
            title="Upcoming interviews"
            interviews={upcomingInterviews}
            limit={4}
          />
        </div>
      </div>

      <RecentApplications
        title="Recent applications"
        applications={applications}
        limit={4}
        viewAllLink="/applications"
      />
    
    </div>
  );
};

export default Dashboard;
