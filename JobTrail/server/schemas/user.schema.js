
import mongoose from 'mongoose';

// Education
const educationSchema = new mongoose.Schema({
  institution: { type: String, trim: true, default: '' },
  degree: { type: String, trim: true, default: '' },
  fieldOfStudy: { type: String, trim: true, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  grade: { type: String, trim: true, default: '' },
  currentlyStudying: { type: Boolean, default: false },
});

// Work experience and internships
const experienceSchema = new mongoose.Schema({
  company: { type: String, trim: true, default: '' },
  role: { type: String, trim: true, default: '' },
  location: { type: String, trim: true, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  description: { type: String, default: '' },
});

// Projects
const projectSchema = new mongoose.Schema({
  name: { type: String, trim: true, default: '' },
  description: { type: String, default: '' },
  technologies: { type: String, default: '' },
  url: { type: String, trim: true, default: '' },
});

// Certifications
const certificationSchema = new mongoose.Schema({
  name: { type: String, trim: true, default: '' },
  issuer: { type: String, trim: true, default: '' },
  issueDate: { type: String, default: '' },
  credentialUrl: { type: String, trim: true, default: '' },
});

// Achievements
const achievementSchema = new mongoose.Schema({
  title: { type: String, trim: true, default: '' },
  organization: { type: String, trim: true, default: '' },
  date: { type: String, default: '' },
  description: { type: String, default: '' },
});

// Complete professional profile
const profileSchema = new mongoose.Schema({
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  headline: { type: String, default: '' },
  professionalSummary: { type: String, default: '' },

  education: {
    type: [educationSchema],
    default: [],
  },

  skills: {
    type: [String],
    default: [],
  },

  experience: {
    type: [experienceSchema],
    default: [],
  },

  projects: {
    type: [projectSchema],
    default: [],
  },

  certifications: {
    type: [certificationSchema],
    default: [],
  },

  achievements: {
    type: [achievementSchema],
    default: [],
  },
}, { _id: false });

// Main User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },

  passwordHash: {
    type: String,
    required: true,
    minlength: 20,
    select: false,
  },

  // Written Master Resume, stored as plain text
  masterResume: {
    type: String,
    default: '',
    maxlength: 50000,
  },

  profile: {
    type: profileSchema,
    default: () => ({}),
  },
}, {
  timestamps: true,
  collection: 'users',
});

userSchema.index({ createdAt: 1 });

export const User = mongoose.model('User', userSchema);

export const APPLICATION_STATUSES = [
  'Wishlist',
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Accepted',
  'Rejected',
  'Withdrawn',
];
