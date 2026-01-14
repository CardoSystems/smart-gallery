#!/usr/bin/env node

/**
 * Image Detection Script
 * Automatically detects available images in all configured photo sets
 * 
 * Usage:
 *   node scripts/detect-images.js
 *   npm run detect-images
 *   node scripts/detect-images.js --debug
 */

const fs = require('fs');
const path = require('path');

const CDN_BASE_URL = 'https://cdn.xperia.pt';

/**
 * Load photo sets from config
 */
function loadPhotoSetsFromConfig() {
  const configPath = path.join(__dirname, '../src/config/photo-sets.config.ts');
  
  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    
    // Extract PHOTO_SETS array using regex
    const match = content.match(/export const PHOTO_SETS: PhotoSet\[\] = \[([\s\S]*?)\];/);
    if (!match) {
      throw new Error('Could not parse PHOTO_SETS from config');
    }
    
    const arrayContent = match[1];
    const photoSets = [];
    
    // Extract each object
    const objectRegex = /\{\s*id:\s*'([^']+)'[^}]*?cdnPath:\s*'([^']+)'[^}]*?fileName:\s*'([^']+)'[^}]*?\}/g;
    let objectMatch;
    
    while ((objectMatch = objectRegex.exec(arrayContent)) !== null) {
      photoSets.push({
        key: objectMatch[1],
        basePath: objectMatch[2],
        filePattern: (i) => `${objectMatch[3]}-${i}.jpg`,
      });
    }
    
    if (photoSets.length === 0) {
      throw new Error('No photo sets found in config');
    }
    
    return photoSets;
  } catch (error) {
    console.warn('⚠️ Warning: Could not load from config:', error.message);
    console.log('Using fallback configuration...\n');
    
    return [
      {
        key: '1904-SD',
        basePath: 'santaeufemia.pt/1904-SD',
        filePattern: (i) => `Festa-${i}.jpg`,
      },
      {
        key: '2004-SD',
        basePath: 'santaeufemia.pt/2004-SD',
        filePattern: (i) => `Festa-${i}.jpg`,
      },
    ];
  }
}

const IMAGE_SETS = loadPhotoSetsFromConfig();

/**
 * Check if an image exists
 */
async function checkImageExists(url, debug = false) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-cache',
    });
    const exists = response.ok && response.status === 200;
    
    if (debug) {
      console.log(`   [DEBUG] URL: ${url}`);
      console.log(`   [DEBUG] Status: ${response.status} (${response.statusText})`);
      console.log(`   [DEBUG] Exists: ${exists}\n`);
    }
    
    return exists;
  } catch (error) {
    if (debug) {
      console.log(`   [DEBUG] URL: ${url}`);
      console.log(`   [DEBUG] Error: ${error.message}\n`);
    }
    return false;
  }
}

/**
 * Binary search to find the last available image
 */
async function findLastImage(cdnBaseUrl, basePath, filePattern, maxImages = 200, debug = false) {
  console.log(`🔍 Detecting images in ${basePath}...`);
  console.log(`   CDN URL: ${cdnBaseUrl}${basePath}`);
  console.log(`   Max images to check: ${maxImages}\n`);
  
  let left = 1;
  let right = maxImages;
  let lastFound = 0;
  let iterations = 0;

  while (left <= right) {
    iterations++;
    const mid = Math.floor((left + right) / 2);
    const url = `${cdnBaseUrl}${basePath}/${filePattern(mid)}`;
    
    if (debug) {
      console.log(`   [Iteration ${iterations}] Checking index ${mid} (range: ${left}-${right})`);
    }
    
    const exists = await checkImageExists(url, debug);

    if (exists) {
      lastFound = mid;
      left = mid + 1;
      process.stdout.write(`\r   Checking... found up to ${lastFound} (iterations: ${iterations})`);
      if (debug) console.log(`   ✓ Image ${mid} exists, searching higher\n`);
    } else {
      right = mid - 1;
      if (debug) console.log(`   ✗ Image ${mid} missing, searching lower\n`);
    }
  }

  console.log(''); // New line
  console.log(`   Total iterations: ${iterations}\n`);
  return lastFound;
}

/**
 * Main detection function
 */
async function detectAllImages(debug = false) {
  console.log('🎨 Starting image detection...\n');
  if (debug) {
    console.log('📋 DEBUG MODE ENABLED - Verbose logging active\n');
  }
  
  const results = {};

  for (const imageSet of IMAGE_SETS) {
    console.log(`\n📁 Processing: ${imageSet.key}`);
    const startTime = Date.now();
    
    try {
      const count = await findLastImage(
        CDN_BASE_URL,
        imageSet.basePath,
        imageSet.filePattern,
        200,
        debug
      );
      const elapsed = Date.now() - startTime;

      results[imageSet.key] = count;
      console.log(`✅ ${imageSet.key}: ${count} images (${elapsed}ms)\n`);
    } catch (error) {
      console.error(`❌ ${imageSet.key}: Detection failed - ${error.message}\n`);
      results[imageSet.key] = 'ERROR';
    }
  }

  console.log('📊 Detection Summary:');
  console.log('━'.repeat(50));
  Object.entries(results).forEach(([key, count]) => {
    if (count === 'ERROR') {
      console.log(`   ❌ ${key}: FAILED`);
    } else {
      console.log(`   ${key}: ${count} images`);
    }
  });
  console.log('━'.repeat(50));
  console.log('\n💡 Update your code with these counts or use the auto-detection utilities.\n');

  return results;
}

// Check for debug flag
const debugMode = process.argv.includes('--debug');

// Run the detection
detectAllImages(debugMode).catch(console.error);
