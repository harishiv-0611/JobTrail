import {
  createContext,
  useContext,
  useState,
} from 'react';

import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Restore the saved user when the application loads.
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('jobtrail_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem('jobtrail_user');
      return null;
    }
  });

  // Restore the saved authentication token.
  const [token, setToken] = useState(
    () => localStorage.getItem('jobtrail_token') || null
  );

  // Login
  const login = async (email, password) => {
    const data = await authApi.loginUser(email, password);

    if (!data?.user || !data?.token) {
      throw new Error(
        'Login failed: the server did not return a user and token.'
      );
    }

    // Save the authenticated session.
    localStorage.setItem(
      'jobtrail_user',
      JSON.stringify(data.user)
    );

    localStorage.setItem('jobtrail_token', data.token);

    setUser(data.user);
    setToken(data.token);

    return data.user;
  };

  // Register
  const register = async ({ name, email, password }) => {
    const data = await authApi.registerUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });

    if (!data?.user) {
      throw new Error(
        'Registration failed: the server did not return a user.'
      );
    }

    // Registration does not automatically log the user in.
    return data.user;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('jobtrail_user');
    localStorage.removeItem('jobtrail_token');

    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Access authentication context.
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside an AuthProvider.'
    );
  }

  return context;
};
