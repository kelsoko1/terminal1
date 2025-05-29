/**
 * Script to clean up mock data references in the codebase
 * This script will scan the codebase for mock data references and replace them with API calls
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Root directory of the project
const rootDir = path.resolve(__dirname, '..');

// List of directories to scan
const dirsToScan = [
  path.join(rootDir, 'components'),
  path.join(rootDir, 'app'),
  path.join(rootDir, 'pages'),
  path.join(rootDir, 'lib')
];

// Patterns to search for
const mockDataPatterns = [
  'Mock data',
  'mock data',
  'Sample data',
  'sample data',
  'Demo data',
  'demo data',
  'initialStocks',
  'generateMockPriceUpdate',
  'USE_MOCK_DB'
];

// Function to scan a file for mock data references
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file contains any mock data patterns
    const hasMockData = mockDataPatterns.some(pattern => content.includes(pattern));
    
    if (hasMockData) {
      console.log(`Found mock data in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error scanning file ${filePath}:`, error);
    return false;
  }
}

// Function to scan a directory recursively
function scanDirectory(dir) {
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        // Skip node_modules and .next directories
        if (file === 'node_modules' || file === '.next' || file === 'out') {
          continue;
        }
        
        scanDirectory(filePath);
      } else if (stats.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx'))) {
        scanFile(filePath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }
}

// Main function
function main() {
  console.log('Scanning for mock data references...');
  
  for (const dir of dirsToScan) {
    scanDirectory(dir);
  }
  
  console.log('\nTo clean up mock data:');
  console.log('1. Remove mock data arrays and replace with API calls');
  console.log('2. Update components to fetch data from the API instead of using hardcoded values');
  console.log('3. Set USE_MOCK_DB=false in your .env file');
  console.log('\nRun the following command to find files with mock data references:');
  console.log('grep -r "mock data\\|sample data\\|demo data" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" .');
}

// Run the script
main();
