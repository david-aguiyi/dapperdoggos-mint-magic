import fs from 'fs';

// Read the cache file
const cacheData = JSON.parse(fs.readFileSync('cache-clean.json', 'utf8'));

let removedCount = 0;
const itemsToRemove = [];

// Check all items for empty links
for (const [key, item] of Object.entries(cacheData.items)) {
    if (key === '-1') continue; // Skip collection item
    
    if (!item.image_link || !item.metadata_link || 
        item.image_link === '' || item.metadata_link === '') {
        itemsToRemove.push(key);
        console.log(`Item ${key} has empty links - will be removed`);
    }
}

// Remove problematic items
itemsToRemove.forEach(key => {
    delete cacheData.items[key];
    removedCount++;
});

const totalItems = Object.keys(cacheData.items).length - 1; // -1 for collection item

console.log(`Removed ${removedCount} items with empty links. Total items now: ${totalItems}`);

// Write the cleaned cache file
fs.writeFileSync('cache-clean.json', JSON.stringify(cacheData, null, 2));

console.log('Cache file cleaned successfully!');

