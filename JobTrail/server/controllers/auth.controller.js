
import { authService } from '../services/auth.service.js';
import { userRepository } from '../repositories/user.mongo.repository.js';

export const authController = {

  async register(req, res) {
    const { name, email, password } = req.body || {};

    const result = await authService.register({
      name,
      email,
      password,
    });

    res.status(201).json({ data: result });
  },

  async login(req, res) {
    const { email, password } = req.body || {};

    const result = await authService.login({
      email,
      password,
    });

    res.status(200).json({ data: result });
  },

  async me(req, res) {
    const user = await authService.getMe(req.user.id);

    res.status(200).json({ data: user });
  },

  // Get logged-in user's complete profile
  async getProfile(req, res) {
    const user = await userRepository.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    res.status(200).json({
      data: user,
    });
  },

  // Update logged-in user's profile
  async updateProfile(req, res) {
    const user = await userRepository.updateProfile(
      req.user.id,
      req.body || {}
    );

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      data: user,
    });
  },
};
