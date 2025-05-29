#!/usr/bin/env node
/**
 * Production deployment script for Terminal 1
 * 
 * This script automates the deployment process for production:
 * 1. Installs production dependencies
 * 2. Generates Prisma client
 * 3. Runs database migrations
 * 4. Builds the Next.js application
 * 5. Starts the application using PM2 in production mode
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper function to execute commands and log output
function executeCommand(command, message) {
  console.log(`${colors.blue}> ${message}...${colors.reset}`);
  try {
    execSync(command, { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
    console.log(`${colors.green}✓ ${message} completed successfully${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}✗ ${message} failed: ${error.message}${colors.reset}`);
    return false;
  }
}

// Main deployment function
async function deploy() {
  console.log(`${colors.cyan}=== Starting production deployment for Terminal 1 ===${colors.reset}`);
  console.log(`${colors.yellow}Timestamp: ${new Date().toISOString()}${colors.reset}`);
  
  // Check if .env file exists
  if (!fs.existsSync(path.resolve(__dirname, '../.env'))) {
    console.error(`${colors.red}Error: .env file is missing. Please create it before deploying.${colors.reset}`);
    process.exit(1);
  }

  // Set NODE_ENV to production
  process.env.NODE_ENV = 'production';
  
  // 1. Install production dependencies
  if (!executeCommand('npm ci --production', 'Installing production dependencies')) {
    process.exit(1);
  }
  
  // 2. Generate Prisma client
  if (!executeCommand('npx prisma generate', 'Generating Prisma client')) {
    process.exit(1);
  }
  
  // 3. Run database migrations
  if (!executeCommand('npx prisma migrate deploy', 'Running database migrations')) {
    process.exit(1);
  }
  
  // 4. Build Next.js application
  if (!executeCommand('npm run build', 'Building Next.js application')) {
    process.exit(1);
  }
  
  // 5. Start application with PM2
  console.log(`${colors.blue}> Starting application with PM2...${colors.reset}`);
  
  // Check if the app is already running in PM2
  try {
    const pmList = execSync('pm2 list', { stdio: 'pipe' }).toString();
    if (pmList.includes('nextjs-app')) {
      // Restart the application if it's already running
      executeCommand('npm run pm2:restart', 'Restarting application with PM2');
    } else {
      // Start the application if it's not running
      executeCommand('npm run pm2:start', 'Starting application with PM2');
    }
  } catch (error) {
    // If PM2 is not installed, install it and start the app
    console.log(`${colors.yellow}PM2 not found, installing globally...${colors.reset}`);
    executeCommand('npm install -g pm2', 'Installing PM2 globally');
    executeCommand('npm run pm2:start', 'Starting application with PM2');
  }
  
  console.log(`${colors.green}=== Deployment completed successfully ===${colors.reset}`);
  console.log(`${colors.cyan}The application is now running in production mode.${colors.reset}`);
  console.log(`${colors.yellow}To view logs: npm run pm2:logs${colors.reset}`);
  console.log(`${colors.yellow}To monitor: npm run pm2:monit${colors.reset}`);
}

// Run the deployment
deploy().catch(error => {
  console.error(`${colors.red}Deployment failed: ${error.message}${colors.reset}`);
  process.exit(1);
});
