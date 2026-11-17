
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../services/auth.service.js';
import { userRepository } from '../repositories/index.js';
import { AppError } from '../utils/AppError.js';

export async function authenticate(req, res, next) {
  try {
    // 1. Read the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(
        401,
        'UNAUTHORIZED',
        'Authentication token is required'
      );
    }
    // 2. Extract token
    const token = authHeader.slice(7).trim();

    if (!token) {
      throw new AppError(
        401,
        'UNAUTHORIZED',
        'Authentication token is required'
      );
    }

    // 3. Verify JWT signature, expiry, and algorithm
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });

    // 4. Ensure the token contains a subject
    if (
      !payload ||
      typeof payload === 'string' ||
      typeof payload.sub !== 'string' ||
      !payload.sub
    ) {
      throw new AppError(
        401,
        'UNAUTHORIZED',
        'Invalid authentication token'
      );
    }
    // 5. Verify that the user still exists
    const user = await userRepository.findById(payload.sub);

    if (!user) {
      throw new AppError(
        401,
        'UNAUTHORIZED',
        'User account no longer exists'
      );
    }

    // 6. Attach authenticated user details to the request
    req.user = {
      id: user.id ?? user._id,
      email: user.email,
      name: user.name,
    };

    // 7. Continue to the protected route
    return next();
  } catch (err) {
    // Preserve application errors
    if (err instanceof AppError) {
      return next(err);
    }

    // Normalize JWT verification errors
    if (
      err instanceof jwt.JsonWebTokenError ||
      err instanceof jwt.TokenExpiredError ||
      err instanceof jwt.NotBeforeError
    ) {
      return next(
        new AppError(
          401,
          'UNAUTHORIZED',
          'Invalid or expired authentication token'
        )
      );
    }

    // Pass unexpected errors to the central error handler
    return next(err);
  }
}
