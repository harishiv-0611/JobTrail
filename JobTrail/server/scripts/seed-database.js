console.log('Seed script is starting...');
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { env } from '../config/env.js';
import { User } from '../schemas/user.schema.js';
import { Application } from '../schemas/application.schema.js';

async function seedDatabase() {
  console.log('Starting database seed...');

  try {
    // Validate MongoDB connection string
    if (!env.MONGODB_URI) {
      throw new Error(
        'MONGODB_URI is missing. Check your server/.env file.'
      );
    }

    console.log('MongoDB URI configured:', Boolean(env.MONGODB_URI));

    // Connect to MongoDB
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log('Connected to MongoDB successfully.');

    // WARNING: This deletes all existing users and applications.
    await User.deleteMany({});
    await Application.deleteMany({});

    console.log('Cleared existing users and applications.');

    // Create demo users
    const passwordHash = await bcrypt.hash('Password@123', 10);

    const users = await User.insertMany([
      {
        name: 'Jane Doe',
        email: 'jane@gmail.com',
        passwordHash,
        masterResume:
          'Jane is a Senior Developer with 5+ years of experience.',
      },
      {
        name: 'John Smith',
        email: 'john@gmail.com',
        passwordHash,
        masterResume:
          'John is a Full Stack Developer specializing in React and Node.js.',
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@gmail.com',
        passwordHash,
        masterResume:
          'Sarah is a Product Manager with experience in SaaS.',
      },
    ]);

    console.log(`Created ${users.length} users.`);

    const createHistory = (entries) =>
      entries.map((entry) => ({
        ...entry,
        _id: new mongoose.Types.ObjectId(),
      }));

    // Create demo job applications
    const applications = await Application.insertMany([
      {
        userId: users[0]._id,
        company: 'Google',
        role: 'Senior Software Engineer',
        location: 'Mountain View, CA',
        status: 'Interview',
        jobUrl: 'https://careers.google.com/jobs/results/',
        source: 'LinkedIn',
        appliedDate: new Date('2026-10-15'),
        jobDescription:
          'We are looking for an experienced Senior Software Engineer.',
        interviews: [
          {
            type: 'Phone Screen',
            scheduledAt: new Date('2026-10-20'),
            completedAt: new Date('2026-10-20'),
            feedback: 'Great technical knowledge; moved to next round.',
            interviewer: 'Alex Chen',
            notes: 'Discussed system design and scalability.',
          },
          {
            type: 'Technical Round',
            scheduledAt: new Date('2026-10-25'),
          },
        ],
        notes: [
          {
            content: 'Very interested in this role and company culture.',
          },
          {
            content: 'Follow up on compensation details.',
          },
        ],
        history: createHistory([
          {
            status: 'Applied',
            at: new Date('2026-10-15'),
            notes: 'Initial application',
          },
          {
            status: 'Screening',
            at: new Date('2026-10-18'),
            notes: 'Phone screen scheduled',
          },
          {
            status: 'Interview',
            at: new Date('2026-10-20'),
            notes: 'Passed phone screen',
          },
        ]),
      },
      {
        userId: users[0]._id,
        company: 'Microsoft',
        role: 'Software Engineer II',
        location: 'Seattle, WA',
        status: 'Offer',
        jobUrl: 'https://careers.microsoft.com/',
        source: 'Company Website',
        appliedDate: new Date('2026-09-20'),
        jobDescription: 'Join our cloud infrastructure team.',
        interviews: [
          {
            type: 'Phone Screen',
            scheduledAt: new Date('2026-09-25'),
            completedAt: new Date('2026-09-25'),
          },
          {
            type: 'Technical Round',
            scheduledAt: new Date('2026-10-02'),
            completedAt: new Date('2026-10-02'),
          },
          {
            type: 'HR Round',
            scheduledAt: new Date('2026-10-10'),
            completedAt: new Date('2026-10-10'),
          },
        ],
        notes: [
          {
            content: 'Received offer - salary $150k + bonus.',
          },
        ],
        history: createHistory([
          { status: 'Applied', at: new Date('2026-09-20') },
          { status: 'Screening', at: new Date('2026-09-23') },
          { status: 'Interview', at: new Date('2026-09-25') },
          { status: 'Offer', at: new Date('2026-10-12') },
        ]),
      },
      {
        userId: users[0]._id,
        company: 'Amazon',
        role: 'Senior Developer',
        location: 'Seattle, WA',
        status: 'Rejected',
        jobUrl: 'https://amazon.jobs/',
        source: 'Indeed',
        appliedDate: new Date('2026-09-01'),
        jobDescription: 'Build scalable backend systems.',
        interviews: [
          {
            type: 'Phone Screen',
            scheduledAt: new Date('2026-09-10'),
            completedAt: new Date('2026-09-10'),
          },
        ],
        notes: [{ content: 'Did not pass phone screen.' }],
        history: createHistory([
          { status: 'Applied', at: new Date('2026-09-01') },
          { status: 'Screening', at: new Date('2026-09-08') },
          { status: 'Rejected', at: new Date('2026-09-12') },
        ]),
      },
      {
        userId: users[1]._id,
        company: 'Meta',
        role: 'Frontend Engineer',
        location: 'Menlo Park, CA',
        status: 'Applied',
        jobUrl: 'https://metacareers.com/',
        source: 'LinkedIn',
        appliedDate: new Date('2026-10-22'),
        jobDescription: 'Build next-generation UI experiences.',
        interviews: [],
        notes: [],
        history: createHistory([
          { status: 'Applied', at: new Date('2026-10-22') },
        ]),
      },
      {
        userId: users[1]._id,
        company: 'Apple',
        role: 'Software Engineer',
        location: 'Cupertino, CA',
        status: 'Wishlist',
        jobUrl: 'https://www.apple.com/jobs/',
        source: 'Company Website',
       appliedDate: new Date('2026-10-23'),
        jobDescription: 'Create innovative software for Apple products.',
        interviews: [],
        notes: [
          { content: 'Interested but not ready to apply yet.' },
        ],
        history: createHistory([
          { status: 'Wishlist', at: new Date('2026-10-23') },
        ]),
      },
      {
        userId: users[2]._id,
        company: 'Slack',
        role: 'Product Manager',
        location: 'San Francisco, CA',
        status: 'Interview',
        jobUrl: 'https://slack.com/careers/',
        source: 'Referral',
        appliedDate: new Date('2026-10-10'),
        jobDescription: 'Lead product strategy for enterprise features.',
        interviews: [
          {
            type: 'Phone Screen',
            scheduledAt: new Date('2026-10-17'),
            completedAt: new Date('2026-10-17'),
            feedback: 'Strong product sense.',
          },
          {
            type: 'Final Round',
            scheduledAt: new Date('2026-10-28'),
          },
        ],
        notes: [{ content: 'Referred by Mike Johnson.' }],
        history: createHistory([
          { status: 'Applied', at: new Date('2026-10-10') },
          { status: 'Screening', at: new Date('2026-10-15') },
          { status: 'Interview', at: new Date('2026-10-17') },
        ]),
      },
    ]);

    console.log(`Created ${applications.length} applications.`);

    console.log('\nSeed completed successfully.');
    console.log('\nDemo login credentials:');

    for (const user of users) {
      console.log(`- ${user.email} / Password@123`);
    }

    console.log('\nApplication status distribution:');

    const statusCounts = {};

    for (const application of applications) {
      statusCounts[application.status] =
        (statusCounts[application.status] || 0) + 1;
    }

    console.table(statusCounts);
  } catch (error) {
    console.error('\nDatabase seeding failed:');
    console.error(error);

    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('MongoDB connection closed.');
    }
  }
}

seedDatabase();
