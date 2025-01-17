const path = require('path');
const fs = require('fs');

// Function to test if a path would escape the base directory
function testPathTraversal(basePath, testPath) {
    const fullPath = path.normalize(path.join(basePath, testPath));
    console.log(`Test case: ${testPath}`);
    console.log(`Normalized path: ${fullPath}`);
    console.log(`Base path escaped: ${!fullPath.startsWith(basePath)}\n`);
}

// Get the models directory path
const modelsDir = path.resolve(__dirname, 'models');

console.log('Security Test Cases:\n');

// Test Case 1: Normal model file (should pass)
testPathTraversal(modelsDir, 'user.js');

// Test Case 2: Attempted directory traversal (should be blocked)
testPathTraversal(modelsDir, '../config/db.js');

// Test Case 3: Complex traversal attempt (should be blocked)
testPathTraversal(modelsDir, '../config/../config/db.js');

// Now test the actual model loading
console.log('Testing Model Loading:\n');
try {
    const db = require('./models');
    console.log('Models loaded successfully:', Object.keys(db));
} catch (error) {
    console.error('Error loading models:', error);
}