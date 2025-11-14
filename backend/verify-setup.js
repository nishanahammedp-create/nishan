#!/usr/bin/env node

/**
 * Backend Setup Verification Script
 * Checks if all files are in place and properly configured
 */

const fs = require('fs');
const path = require('path');

const BACKEND_PATH = __dirname;

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const fullPath = path.join(BACKEND_PATH, filePath);
  const exists = fs.existsSync(fullPath);
  const icon = exists ? '✓' : '✗';
  const color = exists ? 'green' : 'red';
  log(`  ${icon} ${description}`, color);
  return exists;
}

function checkDirectory(dirPath, description) {
  const fullPath = path.join(BACKEND_PATH, dirPath);
  const exists = fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
  const icon = exists ? '✓' : '✗';
  const color = exists ? 'green' : 'red';
  log(`  ${icon} ${description}`, color);
  return exists;
}

// Start verification
log('\n🔍 ALERT 360 BACKEND VERIFICATION\n', 'blue');

let allGood = true;

// Check directories
log('📁 Checking Directories:', 'yellow');
allGood &= checkDirectory('src', 'src/ directory');
allGood &= checkDirectory('src/config', 'src/config/ directory');
allGood &= checkDirectory('src/models', 'src/models/ directory');
allGood &= checkDirectory('src/controllers', 'src/controllers/ directory');
allGood &= checkDirectory('src/routes', 'src/routes/ directory');
allGood &= checkDirectory('src/middleware', 'src/middleware/ directory');
allGood &= checkDirectory('src/utils', 'src/utils/ directory');

// Check config files
log('\n⚙️  Checking Configuration Files:', 'yellow');
allGood &= checkFile('.env', '.env file');
allGood &= checkFile('.env.example', '.env.example file');
allGood &= checkFile('package.json', 'package.json file');
allGood &= checkFile('src/server.js', 'Server entry point (server.js)');

// Check database config
log('\n🗄️  Checking Database Configuration:', 'yellow');
allGood &= checkFile('src/config/database.js', 'Database connection');
allGood &= checkFile('src/config/constants.js', 'Constants file');

// Check models
log('\n📊 Checking Models:', 'yellow');
allGood &= checkFile('src/models/User.js', 'User model');
allGood &= checkFile('src/models/Alert.js', 'Alert model');
allGood &= checkFile('src/models/Event.js', 'Event model');
allGood &= checkFile('src/models/Location.js', 'Location model');

// Check controllers
log('\n🎮 Checking Controllers:', 'yellow');
allGood &= checkFile('src/controllers/userController.js', 'User controller');
allGood &= checkFile('src/controllers/alertController.js', 'Alert controller');
allGood &= checkFile('src/controllers/eventController.js', 'Event controller');
allGood &= checkFile('src/controllers/weatherController.js', 'Weather controller');

// Check routes
log('\n🛣️  Checking Routes:', 'yellow');
allGood &= checkFile('src/routes/userRoutes.js', 'User routes');
allGood &= checkFile('src/routes/alertRoutes.js', 'Alert routes');
allGood &= checkFile('src/routes/eventRoutes.js', 'Event routes');
allGood &= checkFile('src/routes/weatherRoutes.js', 'Weather routes');

// Check middleware
log('\n🔐 Checking Middleware:', 'yellow');
allGood &= checkFile('src/middleware/auth.js', 'Authentication middleware');
allGood &= checkFile('src/middleware/errorHandler.js', 'Error handler middleware');

// Check utilities
log('\n🛠️  Checking Utilities:', 'yellow');
allGood &= checkFile('src/utils/logger.js', 'Logger utility');
allGood &= checkFile('src/utils/helpers.js', 'Helpers utility');

// Check documentation
log('\n📚 Checking Documentation:', 'yellow');
allGood &= checkFile('README.md', 'Backend README');
allGood &= checkFile('API_DOCUMENTATION.md', 'API Documentation');

// Final status
log('\n' + '='.repeat(50), 'blue');
if (allGood) {
  log('✓ All backend files are properly in place!', 'green');
  log('\n📋 Next Steps:', 'blue');
  log('  1. Ensure MongoDB is running: mongod', 'yellow');
  log('  2. Install dependencies: npm install', 'yellow');
  log('  3. Update .env with your API keys if needed', 'yellow');
  log('  4. Start server: npm run dev', 'yellow');
  log('  5. Test health endpoint: curl http://localhost:5000/health', 'yellow');
} else {
  log('✗ Some files are missing! Please check the list above.', 'red');
  process.exit(1);
}
log('='.repeat(50) + '\n', 'blue');

process.exit(0);
