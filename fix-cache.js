import fs from 'fs';

// Read the cache file
const cacheData = JSON.parse(fs.readFileSync('cache-clean.json', 'utf8'));

// Remove the problematic item 221
delete cacheData.items['221'];

// Update the count
const itemCount = Object.keys(cacheData.items).length - 1; // -1 for collection item

console.log(`Removed item 221. Total items now: ${itemCount}`);

// Write the cleaned cache file
fs.writeFileSync('cache-clean.json', JSON.stringify(cacheData, null, 2));

console.log('Cache file cleaned successfully!');
