import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
  migrations: [
    // Initial migration - creates all tables
    {
      toVersion: 1,
      steps: [
        // No steps needed for initial migration since tables are created automatically
      ],
    },
    // Add more migrations here as the schema evolves
  ],
}); 