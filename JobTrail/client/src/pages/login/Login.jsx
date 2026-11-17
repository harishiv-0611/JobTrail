// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import {
//   loginSchema,
//   validateSingleField,
// } from '../../utils/authValidation';
// import Visibility from '@mui/icons-material/Visibility';
// import VisibilityOff from '@mui/icons-material/VisibilityOff';
// import { AlertCircle } from 'lucide-react';
// import './login.css';

// const Login = () => {
//   const navigate = useNavigate();
//   const { login } = useAuth();

//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//   });

//   const [touched, setTouched] = useState({});
//   const [showPassword, setShowPassword] = useState(false);
//   const [fieldErrors, setFieldErrors] = useState({});
//   const [serverError, setServerError] = useState('');
//   const [loading, setLoading] = useState(false);

//   // Normalize validation results to an array.
//   const getFieldErrors = (field, data) => {
//     const result = validateSingleField(loginSchema, data, field);

//     // Some validators return null when the field is valid.
//     if (!result) return [];

//     const errors = result[field];

//     if (!errors) return [];
//     if (Array.isArray(errors)) return errors;
//     return [errors];
//   };

//   const handleChange = (field, value) => {
//     const updatedData = {
//       ...formData,
//       [field]: value,
//     };

//     setFormData(updatedData);

//     if (touched[field]) {
//       setFieldErrors((prev) => ({
//         ...prev,
//         [field]: getFieldErrors(field, updatedData),
//       }));
//     }
//   };

//   const handleBlur = (field) => {
//     setTouched((prev) => ({
//       ...prev,
//       [field]: true,
//     }));

//     setFieldErrors((prev) => ({
//       ...prev,
//       [field]: getFieldErrors(field, formData),
//     }));
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setServerError('');

//     const result = loginSchema.safeParse(formData);

//     if (!result.success) {
//       const formattedErrors = {};

//       result.error.issues.forEach((issue) => {
//         const field = issue.path[0];

//         if (!formattedErrors[field]) {
//           formattedErrors[field] = [];
//         }

//         formattedErrors[field].push(issue.message);
//       });

//       setFieldErrors(formattedErrors);
//       setTouched({
//         email: true,
//         password: true,
//       });

//       return;
//     }

//     setLoading(true);

//     try {
//       await login(formData.email, formData.password);
//       navigate('/dashboard');
//     } catch (err) {
//       setServerError(
//         err?.message ||
//           'Failed to sign in. Check whether json-server is running on port 5000.'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen md:h-screen md:overflow-hidden grid grid-cols-1 md:grid-cols-2 bg-white">
//       {/* Left marketing panel */}
//       <div className="bg-indigo-950 text-white p-12 flex flex-col justify-between sideMarketingPanel-r md:h-full md:overflow-hidden">
//         <div
//           className="flex items-center gap-2.5"
//           style={{ width: '15rem' }}
//         >
//           <div
//             className="w-16 h-16 rounded-lg text-white font-bold flex items-center justify-center transparentImage"
//             style={{ width: '100%' }}
//           >
//             <img
//               src="/src/assets/logo3.png"
//               alt="JobTrail Logo"
//               className="max-w-full max-h-full object-contain"
//             />
//           </div>
//         </div>

//         <div className="space-y-4 max-w-md my-12">
//           <h1 className="text-4xl font-bold leading-tight">
//             Start your search with a plan.
//           </h1>

//           <p className="text-indigo-200 text-sm">
//             Organize your job hunt, prepare for interviews, and land your next role faster.
//           </p>
//         </div>

//         <p className="text-xs text-indigo-400"></p>
//       </div>

//       {/* Login form */}
//       <div className="flex items-center justify-center p-8 md:h-full overflow-y-auto">
//         <div className="w-full max-w-sm space-y-5">
//           <h2 className="text-2xl font-bold text-gray-900">
//             Welcome back
//           </h2>

//           {serverError && (
//             <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-sm flex items-center gap-2">
//               <AlertCircle size={16} className="shrink-0" />
//               <span>{serverError}</span>
//             </div>
//           )}

//           <form onSubmit={handleLogin} className="space-y-4" noValidate>
//             {/* Email field */}
//             <div>
//               <label
//                 htmlFor="email"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Email Address
//               </label>

//               <input
//                 id="email"
//                 type="email"
//                 placeholder="you@example.com"
//                 value={formData.email}
//                 onChange={(e) =>
//                   handleChange('email', e.target.value)
//                 }
//                 onBlur={() => handleBlur('email')}
//                 className={`w-full border rounded-lg p-2.5 text-sm ${
//                   fieldErrors.email?.length
//                     ? 'border-rose-500 bg-rose-50/20'
//                     : 'border-slate-300'
//                 }`}
//               />

//               {fieldErrors.email?.length > 0 && (
//                 <p className="text-xs text-rose-600 mt-1 font-medium">
//                   {fieldErrors.email[0]}
//                 </p>
//               )}
//             </div>

//             {/* Password field */}
//             <div>
//               <label
//                 htmlFor="password"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Password
//               </label>

//               <div className="relative">
//                 <input
//                   id="password"
//                   type={showPassword ? 'text' : 'password'}
//                   placeholder="Enter your password"
//                   value={formData.password}
//                   onChange={(e) =>
//                     handleChange('password', e.target.value)
//                   }
//                   onBlur={() => handleBlur('password')}
//                   className={`w-full border rounded-lg p-2.5 pr-10 text-sm ${
//                     fieldErrors.password?.length
//                       ? 'border-rose-500 bg-rose-50/20'
//                       : 'border-slate-300'
//                   }`}
//                 />

//                 <button
//                   type="button"
//                   tabIndex={-1}
//                   onClick={() =>
//                     setShowPassword((prev) => !prev)
//                   }
//                   className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 flex items-center justify-center"
//                   aria-label="Toggle password visibility"
//                 >
//                   {showPassword ? (
//                     <VisibilityOff fontSize="small" />
//                   ) : (
//                     <Visibility fontSize="small" />
//                   )}
//                 </button>
//               </div>

//               {fieldErrors.password?.length > 0 && (
//                 <ul className="mt-2 space-y-1 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
//                   {fieldErrors.password.map((message, index) => (
//                     <li key={index}>• {message}</li>
//                   ))}
//                 </ul>
//               )}
//             </div>

//             {/* Sign-in button */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
//             >
//               {loading ? 'Signing in...' : 'Sign in'}
//             </button>
//           </form>

//           <p className="text-sm text-center text-gray-600">
//             New here?{' '}
//             <Link
//               to="/register"
//               className="text-indigo-600 font-medium hover:underline"
//             >
//               Create an account
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  loginSchema,
  validateSingleField,
} from '../../utils/authValidation';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { AlertCircle } from 'lucide-react';
import logo from '../../assets/logo3.png';
import './login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const getFieldErrors = (field, data) => {
    return validateSingleField(loginSchema, data, field) || [];
  };

  const handleChange = (field, value) => {
    const updatedData = {
      ...formData,
      [field]: value,
    };

    setFormData(updatedData);

    if (touched[field]) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: getFieldErrors(field, updatedData),
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [field]: getFieldErrors(field, formData),
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setServerError('');

    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const formattedErrors = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (!formattedErrors[field]) {
          formattedErrors[field] = [];
        }

        formattedErrors[field].push(issue.message);
      });

      setFieldErrors(formattedErrors);
      setTouched({
        email: true,
        password: true,
      });

      return;
    }

    setLoading(true);

    try {
      await login(formData.email, formData.password);

      // Save the success message before redirecting.
      sessionStorage.setItem(
        'jobtrail_toast',
        'Login successful!'
      );

      navigate('/dashboard');
    } catch (err) {
      setServerError(
        err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          err?.message ||
          'Failed to sign in. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden grid grid-cols-1 md:grid-cols-2 bg-white">
      {/* Left marketing panel */}
      <div className="bg-indigo-950 text-white p-12 flex flex-col justify-between sideMarketingPanel-r md:h-full md:overflow-hidden">
        <div
          className="flex items-center gap-2.5"
          style={{ width: '15rem' }}
        >
          <div
            className="w-16 h-16 rounded-lg text-white font-bold flex items-center justify-center transparentImage"
            style={{ width: '100%' }}
          >
            <img
              src={logo}
              alt="JobTrail Logo"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>

        <div className="space-y-4 max-w-md my-12">
          <h1 className="text-4xl font-bold leading-tight">
            Start your search with a plan.
          </h1>

          <p className="text-indigo-200 text-sm">
            Organize your job hunt, prepare for interviews, and land your next role faster.
          </p>
        </div>

        <p className="text-xs text-indigo-400"></p>
      </div>

      {/* Login form */}
      <div className="flex items-center justify-center p-8 md:h-full overflow-y-auto">
        <div className="w-full max-w-sm space-y-5">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back
          </h2>

          {serverError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-sm flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form
            onSubmit={handleLogin}
            className="space-y-4"
            noValidate
          >
            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  handleChange('email', e.target.value)
                }
                onBlur={() => handleBlur('email')}
                className={`w-full border rounded-lg p-2.5 text-sm ${
                  fieldErrors.email?.length
                    ? 'border-rose-500 bg-rose-50/20'
                    : 'border-slate-300'
                }`}
              />

              {fieldErrors.email?.length > 0 && (
                <p className="text-xs text-rose-600 mt-1 font-medium">
                  {fieldErrors.email[0]}
                </p>
              )}
            </div>

            {/* Password field */}
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
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    handleChange('password', e.target.value)
                  }
                  onBlur={() => handleBlur('password')}
                  className={`w-full border rounded-lg p-2.5 pr-10 text-sm ${
                    fieldErrors.password?.length
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-slate-300'
                  }`}
                />

                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 flex items-center justify-center"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <VisibilityOff fontSize="small" />
                  ) : (
                    <Visibility fontSize="small" />
                  )}
                </button>
              </div>

              {fieldErrors.password?.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                  {fieldErrors.password.map((message, index) => (
                    <li key={index}>• {message}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Sign-in button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-sm text-center text-gray-600">
            New here?{' '}
            <Link
              to="/register"
              className="text-indigo-600 font-medium hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
