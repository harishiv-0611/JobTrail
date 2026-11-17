
import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', authenticate, authController.me);

router.get(
  '/profile',
  authenticate,
  authController.getProfile
);

router.patch(
  '/profile',
  authenticate,
  authController.updateProfile
);

export default router;
