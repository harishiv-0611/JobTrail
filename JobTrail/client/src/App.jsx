
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Dashboard from './pages/Dashboard';
import AppList from './pages/AppList';
import AppForm from './pages/AppForm';
import AppDetail from './pages/AppDetail';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import Profile from './pages/Profile';
import Board from './pages/Board';

const PlaceholderPage = ({ title }) => (
  <div className="bg-white p-8 rounded-xl border">
    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
    <p className="text-gray-500 mt-2 text-sm">
      This view will be expanded in upcoming sessions.
    </p>
  </div>
);

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/applications" element={<AppList />} />
                <Route path="/applications/new" element={<AppForm />} />
                <Route path="/applications/:id" element={<AppDetail />} />
                <Route path="/applications/:id/edit" element={<AppForm />} />

                <Route path="/board" element={<Board />} />
                <Route path="/profile" element={<Profile />} />

                <Route
                  path="*"
                  element={<PlaceholderPage title="404 - Page Not Found" />}
                />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  );
}

export default App;
