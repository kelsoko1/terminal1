const fs = require('fs');
const path = require('path');

// Path to the providers.tsx file
const providersPath = path.join(process.cwd(), 'app', 'providers.tsx');

// Check if the file exists
if (fs.existsSync(providersPath)) {
  console.log('Found providers.tsx file');
  
  // Read the file content
  let content = fs.readFileSync(providersPath, 'utf8');
  
  // Check if it contains the problematic import
  if (content.includes("import { AuthProvider } from '@/lib/auth/auth-context'")) {
    console.log('Found problematic import, fixing...');
    
    // Replace the import with a relative path
    content = content.replace(
      "import { AuthProvider } from '@/lib/auth/auth-context'",
      "import { AuthProvider } from '../lib/auth/auth-context'"
    );
    
    // Write the file back
    fs.writeFileSync(providersPath, content, 'utf8');
    console.log('Fixed providers.tsx import path');
  } else {
    console.log('Import already fixed or using a different pattern');
  }
} else {
  console.log('providers.tsx file not found at expected location');
}

// Check for other @/ imports in API routes
const apiDir = path.join(process.cwd(), 'app', 'api');

function fixImportsInFile(filePath) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix auth import
    if (content.includes("import { authOptions } from '@/lib/auth'")) {
      content = content.replace(
        "import { authOptions } from '@/lib/auth'",
        "import { authOptions } from '../../lib/auth/authOptions'"
      );
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed auth import in ${filePath}`);
    }
    
    // Fix other potential @/ imports if needed
  }
}

// Check subscription plan route
const subscriptionPlanRoute = path.join(apiDir, 'subscription-plans', 'route.ts');
fixImportsInFile(subscriptionPlanRoute);

// Check subscriptions route
const subscriptionsRoute = path.join(apiDir, 'subscriptions', 'route.ts');
fixImportsInFile(subscriptionsRoute);

// Check subscription by id route
const subscriptionByIdRoute = path.join(apiDir, 'subscriptions', '[id]', 'route.ts');
fixImportsInFile(subscriptionByIdRoute);

console.log('Import paths check and fix completed');
