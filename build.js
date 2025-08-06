// Simple build script for Vercel
// This ensures the public directory is recognized as the output

const fs = require('fs');
const path = require('path');

console.log('✅ Build process started');
console.log('📁 Public directory contains static files');

// Verify public directory exists
if (fs.existsSync('public')) {
    console.log('✅ Public directory found');
    
    // List files in public directory
    const files = fs.readdirSync('public');
    console.log('📄 Files in public directory:', files.length);
    
    if (files.includes('index.html')) {
        console.log('✅ index.html found in public directory');
    } else {
        console.error('❌ index.html not found in public directory');
        process.exit(1);
    }
} else {
    console.error('❌ Public directory not found');
    process.exit(1);
}

console.log('✅ Build completed successfully');
