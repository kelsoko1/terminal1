const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Paths
const rootDir = path.resolve(__dirname, '..');
const prismaDir = path.join(rootDir, 'prisma');
const localSchemaPath = path.join(prismaDir, 'schema.local.prisma');
const localDbPath = path.join(rootDir, 'local.db');

// Check if local schema exists
if (!fs.existsSync(localSchemaPath)) {
  console.error('Local schema file not found:', localSchemaPath);
  process.exit(1);
}

// Create local SQLite database file if it doesn't exist
if (!fs.existsSync(localDbPath)) {
  console.log('Creating empty SQLite database file...');
  fs.writeFileSync(localDbPath, '');
}

// Generate Prisma client for local database
console.log('Generating Prisma client for local database...');
try {
  execSync(`npx prisma generate --schema=${localSchemaPath}`, {
    stdio: 'inherit',
    cwd: rootDir
  });
  console.log('Local Prisma client generated successfully!');
} catch (error) {
  console.error('Error generating local Prisma client:', error);
  process.exit(1);
}

// Create local database migrations
console.log('Creating local database migrations...');
try {
  // Check if migrations directory exists for local schema
  const localMigrationsDir = path.join(prismaDir, 'migrations-local');
  if (!fs.existsSync(localMigrationsDir)) {
    fs.mkdirSync(localMigrationsDir, { recursive: true });
  }

  // Create initial migration
  execSync(`npx prisma migrate dev --name init --schema=${localSchemaPath} --create-only`, {
    stdio: 'inherit',
    cwd: rootDir,
    env: {
      ...process.env,
      LOCAL_DATABASE_URL: `file:${localDbPath}`
    }
  });
  
  console.log('Local database migrations created successfully!');
} catch (error) {
  console.error('Error creating local database migrations:', error);
  process.exit(1);
}

// Apply migrations to local database
console.log('Applying migrations to local database...');
try {
  execSync(`npx prisma migrate deploy --schema=${localSchemaPath}`, {
    stdio: 'inherit',
    cwd: rootDir,
    env: {
      ...process.env,
      LOCAL_DATABASE_URL: `file:${localDbPath}`
    }
  });
  console.log('Local database migrations applied successfully!');
} catch (error) {
  console.error('Error applying local database migrations:', error);
  process.exit(1);
}

console.log('Local database setup complete!');
