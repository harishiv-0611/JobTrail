
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Layout as BoardIcon,
  User,
  Plus,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo3.png';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const navItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    {
      path: '/applications',
      label: 'Applications',
      icon: <Briefcase size={20} />,
    },
    {
      path: '/board',
      label: 'Board',
      icon: <BoardIcon size={20} />,
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: <User size={20} />,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="flex w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-white">
        <div>
          <div className="flex h-16 items-center gap-2.5 border-b border-slate-100 px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg">
              <img
                src={logo}
                alt="JobTrail Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              JobTrail
            </h1>
          </div>

          <nav className="space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}

            <Link
              to="/applications/new"
              className="mt-4 flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Plus size={20} />
              Add Application
            </Link>
          </nav>
        </div>

        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
              {userInitials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">
                {user?.name || 'User'}
              </p>
              <p className="truncate text-xs text-slate-500">
                {user?.email || ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-rose-600"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8">
          <h2 className="text-lg font-semibold text-slate-900">
            {navItems.find((item) => item.path === location.pathname)?.label ||
              'JobTrail'}
          </h2>
        </header>

        <div className="flex-1 p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
