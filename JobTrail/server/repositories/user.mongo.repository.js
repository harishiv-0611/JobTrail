
import { User } from '../schemas/user.schema.js';
import bcrypt from 'bcrypt';

function cloneSafe(user) {
  if (!user) return null;

  const userObj = user.toObject ? user.toObject() : user;
  const { passwordHash, ...safeUser } = userObj;

  return safeUser;
}

export const userRepository = {
  // Create a new user
  async create({ name, email, passwordHash, masterResume = '' }) {
    try {
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        passwordHash,
        masterResume,
      });

      return cloneSafe(user);
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Email already exists');
      }

      throw error;
    }
  },

  // Find user by email
  async findByEmail(email) {
    const normalized = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalized,
    }).select('+passwordHash');

    if (!user) return null;

    return user.toObject();
  },

  // Find user by MongoDB ID
  async findById(id) {
    const user = await User.findById(id);
    return cloneSafe(user);
  },

  // Update basic user information
  async update(id, changes) {
    const updateFields = {};

    if (changes.name !== undefined) {
      updateFields.name = changes.name;
    }

    if (changes.masterResume !== undefined) {
      updateFields.masterResume = changes.masterResume;
    }

    if (Object.keys(updateFields).length === 0) {
      throw new Error('No valid fields provided');
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateFields },
      {
        new: true,
        runValidators: true,
      }
    );

    return cloneSafe(user);
  },

  // Update complete professional profile
  async updateProfile(id, changes) {
    const allowedFields = [
      'phone',
      'location',
      'headline',
      'professionalSummary',
      'education',
      'skills',
      'experience',
      'projects',
      'certifications',
      'achievements',
    ];

    const profileUpdates = {};

    for (const field of allowedFields) {
      if (changes[field] !== undefined) {
        profileUpdates[`profile.${field}`] = changes[field];
      }
    }

    if (changes.name !== undefined) {
      profileUpdates.name = changes.name;
    }

    if (changes.masterResume !== undefined) {
      profileUpdates.masterResume = changes.masterResume;
    }

    if (Object.keys(profileUpdates).length === 0) {
      throw new Error('No valid profile fields provided');
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: profileUpdates },
      {
        new: true,
        runValidators: true,
      }
    );

    return cloneSafe(user);
  },

  // Seed demo user
  async seedDemoUser() {
    const existing = await this.findByEmail('jane@gmail.com');

    if (existing) return existing;

    const passwordHash = await bcrypt.hash(
      'Password@123',
      10
    );

    const user = await User.create({
      name: 'Jane Doe',
      email: 'jane@gmail.com',
      passwordHash,
      masterResume: '',
    });

    return cloneSafe(user);
  },
};