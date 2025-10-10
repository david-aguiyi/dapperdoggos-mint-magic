import fs from 'fs';

// Read the cache file
const cacheData = JSON.parse(fs.readFileSync('cache-clean.json', 'utf8'));

// Count items (excluding collection item -1)
const items = Object.keys(cacheData.items).filter(key => key !== '-1');
console.log(`Total items in cache: ${items.length}`);

// Check for any gaps in numbering
const itemNumbers = items.map(key => parseInt(key)).sort((a, b) => a - b);
console.log(`Item numbers: ${itemNumbers.slice(0, 10)}...${itemNumbers.slice(-10)}`);

// Check for missing numbers
const maxItem = Math.max(...itemNumbers);
const expectedNumbers = Array.from({length: maxItem + 1}, (_, i) => i);
const missingNumbers = expectedNumbers.filter(num => !itemNumbers.includes(num));

if (missingNumbers.length > 0) {
    console.log(`Missing item numbers: ${missingNumbers.slice(0, 10)}`);
} else {
    console.log('No missing item numbers found');
}

