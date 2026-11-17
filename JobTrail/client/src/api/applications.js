
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthConfig = () => {
  const token = localStorage.getItem('jobtrail_token');
    
  return {
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
  };
};

export const fetchApplications = async () => {
  const { data: response } = await axios.get(
    `${API_URL}/applications`,
    getAuthConfig()
  );

  const applications = Array.isArray(response) ? response : response?.data;
  if (!Array.isArray(applications)) {
    throw new Error('Unexpected applications response from the server');
  }

  return applications;
};

export const fetchApplicationById = async (id) => {console.log(id)
  const { data: response } = await axios.get(
    `${API_URL}/applications/${id}`,
    getAuthConfig()
  );

  return response?.data ?? response;
};

export const createApplication = async (appData) => {
  const payload = {
    ...appData,
    notes: appData.notes ?? [],
    interviews: appData.interviews ?? [],
    history: appData.history?.length
      ? appData.history
      : [
          {
            status: appData.status,
            at: appData.appliedDate || new Date().toISOString(),
          },
        ],
  };

  const { data: response } = await axios.post(
    `${API_URL}/applications`,
    payload,
    getAuthConfig()
  );

  return response?.data ?? response;
};

export const updateApplication = async (id, appData) => {
  const { data: response } = await axios.patch(
    `${API_URL}/applications/${id}`,
    appData,
    getAuthConfig()
  );

  return response?.data ?? response;
};

export const deleteApplication = async (id) => {
  await axios.delete(
    `${API_URL}/applications/${id}`,
    getAuthConfig()
  );

  return id;
};

export const fetchStats = async (applications) => {
  const apps = applications ?? await fetchApplications();

  const counts = {
    Applied: 0,
    Screening: 0,
    Interviewing: 0,
    Offers: 0,
    Accepted: 0,
    Rejected: 0,
    Wishlist: 0,
    Withdrawn: 0,
  };

  const weeklyCounts = Array(8).fill(0);
  const currentWeek = new Date();

  currentWeek.setUTCHours(0, 0, 0, 0);
  currentWeek.setUTCDate(
    currentWeek.getUTCDate() -
      ((currentWeek.getUTCDay() + 6) % 7)
  );

  for (const application of apps) {
    if (application.status === 'Applied') counts.Applied++;
    if (application.status === 'Screening') counts.Screening++;
    if (application.status === 'Interview') counts.Interviewing++;
    if (application.status === 'Offer') counts.Offers++;
    if (application.status === 'Accepted') counts.Accepted++;
    if (application.status === 'Rejected') counts.Rejected++;
    if (application.status === 'Wishlist') counts.Wishlist++;
    if (application.status === 'Withdrawn') counts.Withdrawn++;

    if (!application.appliedDate) continue;

    const appliedAt = new Date(application.appliedDate);

    if (Number.isNaN(appliedAt.getTime())) continue;

    const weeksAgo = Math.floor(
      (currentWeek.getTime() - appliedAt.getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    );

    if (weeksAgo >= 0 && weeksAgo < weeklyCounts.length) {
      weeklyCounts[weeklyCounts.length - weeksAgo - 1]++;
    }
  }

  return {
    counts,
    weekly: weeklyCounts.map((count, index) => ({
      week: index + 1,
      count,
    })),
  };
};
