import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo3.png';
import {
  checkPasswordRules,
  registerSchema,
  validateSingleField,
} from '../../utils/authValidation';
import './register.css';

const initialForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState(initialForm);
  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const getFieldErrors = (field, data) =>
    validateSingleField(registerSchema, data, field) || [];

  const handleChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    setServerError('');

    if (touched[field]) {
      setFieldErrors((previous) => ({
        ...previous,
        [field]: getFieldErrors(field, updatedData),
      }));
    }

    if (field === 'password' && touched.confirmPassword) {
      setFieldErrors((previous) => ({
        ...previous,
        confirmPassword: getFieldErrors('confirmPassword', updatedData),
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched((previous) => ({ ...previous, [field]: true }));
    setFieldErrors((previous) => ({
      ...previous,
      [field]: getFieldErrors(field, formData),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');

    const normalizedData = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
    };
    const result = registerSchema.safeParse(normalizedData);

    if (!result.success) {
      const errors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (!errors[field]) errors[field] = [];
        errors[field].push(issue.message);
      });

      setFieldErrors(errors);
      setTouched({
        name: true,
        email: true,
        password: true,
        confirmPassword: true,
      });
      return;
    }

    setLoading(true);
    try {
      await register({
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
      });
      navigate('/login');
    } catch (error) {
      setServerError(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          'Unable to create your account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const passwordRules = checkPasswordRules(formData.password);

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden grid grid-cols-1 md:grid-cols-2 bg-white">
      <section className="text-white p-12 flex flex-col justify-between sideMarketingPanel-r md:h-full md:overflow-hidden">
        <div className="flex items-center" style={{ width: '15rem' }}>
          <img
            src={logo}
            alt="JobTrail"
            className="max-w-full max-h-16 object-contain"
          />
        </div>

        <div className="space-y-4 max-w-md my-12">
          <h1 className="text-4xl font-bold leading-tight">
            Start your search with a plan.
          </h1>
          <p className="text-indigo-200 text-sm">
            Organize your job hunt, prepare for interviews, and land your next role faster.
          </p>
        </div>

        <p className="text-xs text-indigo-200">
          Your career journey, organized.
        </p>
      </section>

      <main className="flex items-center justify-center p-6 sm:p-8 md:h-full overflow-y-auto">
        <div className="w-full max-w-sm space-y-5">
          <h2 className="text-2xl font-bold text-gray-900">
            Create your account
          </h2>

          {serverError && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-sm flex items-center gap-2"
            >
              <AlertCircle size={16} className="shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(event) => handleChange('name', event.target.value)}
                onBlur={() => handleBlur('name')}
                aria-invalid={Boolean(fieldErrors.name?.length)}
                aria-describedby={fieldErrors.name?.length ? 'name-error' : undefined}
                className={`w-full border rounded-lg p-2.5 text-sm ${
                  fieldErrors.name?.length
                    ? 'border-rose-500 bg-rose-50/20'
                    : 'border-slate-300'
                }`}
              />
              {fieldErrors.name?.length > 0 && (
                <p id="name-error" className="text-xs text-rose-600 mt-1 font-medium">
                  {fieldErrors.name[0]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(event) => handleChange('email', event.target.value)}
                onBlur={() => handleBlur('email')}
                aria-invalid={Boolean(fieldErrors.email?.length)}
                aria-describedby={fieldErrors.email?.length ? 'email-error' : undefined}
                className={`w-full border rounded-lg p-2.5 text-sm ${
                  fieldErrors.email?.length
                    ? 'border-rose-500 bg-rose-50/20'
                    : 'border-slate-300'
                }`}
              />
              {fieldErrors.email?.length > 0 && (
                <p id="email-error" className="text-xs text-rose-600 mt-1 font-medium">
                  {fieldErrors.email[0]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(event) => handleChange('password', event.target.value)}
                  onBlur={() => handleBlur('password')}
                  aria-invalid={Boolean(fieldErrors.password?.length)}
                  aria-describedby={
                    fieldErrors.password?.length ? 'password-error' : 'password-rules'
                  }
                  className={`w-full border rounded-lg p-2.5 pr-12 text-sm ${
                    fieldErrors.password?.length
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </button>
              </div>
              {fieldErrors.password?.length > 0 && (
                <p id="password-error" className="text-xs text-rose-600 mt-1 font-medium">
                  {fieldErrors.password[0]}
                </p>
              )}
              <div
                id="password-rules"
                className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
              >
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Password requirements:
                </p>
                <ul className="space-y-1">
                  {passwordRules.map((rule) => (
                    <li
                      key={rule.label}
                      className={`text-xs ${rule.met ? 'text-emerald-600' : 'text-gray-500'}`}
                    >
                      {rule.met ? '✓' : '○'} {rule.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={(event) =>
                    handleChange('confirmPassword', event.target.value)
                  }
                  onBlur={() => handleBlur('confirmPassword')}
                  aria-invalid={Boolean(fieldErrors.confirmPassword?.length)}
                  aria-describedby={
                    fieldErrors.confirmPassword?.length
                      ? 'confirm-password-error'
                      : undefined
                  }
                  className={`w-full border rounded-lg p-2.5 pr-12 text-sm ${
                    fieldErrors.confirmPassword?.length
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((visible) => !visible)}
                  aria-label={
                    showConfirmPassword
                      ? 'Hide confirm password'
                      : 'Show confirm password'
                  }
                  aria-pressed={showConfirmPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? (
                    <VisibilityOff fontSize="small" />
                  ) : (
                    <Visibility fontSize="small" />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword?.length > 0 && (
                <p
                  id="confirm-password-error"
                  className="text-xs text-rose-600 mt-1 font-medium"
                >
                  {fieldErrors.confirmPassword[0]}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-800"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register;
