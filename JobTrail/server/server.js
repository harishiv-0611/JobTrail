import app from './app.js';
import { env } from './config/env.js';
import { connectMongoDB } from './config/mongodb.js';
import { userRepository, applicationRepository } from './repositories/index.js';

async function start() {
  try {
    if (env.DB_TYPE === 'mongodb') {
      await connectMongoDB();
    }

    const demoUser = await userRepository.seedDemoUser();
    await applicationRepository.seedDemoApplication(demoUser.id ?? demoUser._id);

    app.listen(env.PORT, () => {
      console.log(`JobTrail Server listening on http://localhost:${env.PORT} )`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
