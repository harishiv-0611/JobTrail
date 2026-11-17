import { env } from '../config/env.js';

const repositories = env.DB_TYPE === 'mongodb'
  ? await Promise.all([
      import('./user.mongo.repository.js'),
      import('./application.mongo.repository.js'),
    ])
  : await Promise.all([
      import('./user.memory.repository.js'),
      import('./application.memory.repository.js'),
    ]);

export const userRepository = repositories[0].userRepository;
export const applicationRepository = repositories[1].applicationRepository;
