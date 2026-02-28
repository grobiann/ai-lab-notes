import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { config } from '../config/env';
import { UserService } from '../services/UserService';

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Database initialized for seeding');

    const userService = new UserService();

    try {
      const adminUser = await userService.createUser(
        config.admin.username,
        config.admin.email,
        config.admin.password,
        'admin'
      );
      console.log(`✓ Admin user created: ${adminUser.username}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        console.log(`✓ Admin user already exists: ${config.admin.username}`);
      } else {
        throw error;
      }
    }

    console.log('Seeding completed successfully');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
