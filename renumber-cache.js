import fs from 'fs';

// Read the cache file
const cacheData = JSON.parse(fs.readFileSync('cache-clean.json', 'utf8'));

// Get all items except collection (-1)
const items = Object.keys(cacheData.items).filter(key => key !== '-1');

// Create new sequential numbering
const newItems = {};
let newIndex = 0;

// Keep collection item as is
newItems['-1'] = cacheData.items['-1'];

// Renumber all other items sequentially
items.forEach(oldKey => {
    newItems[newIndex.toString()] = cacheData.items[oldKey];
    newIndex++;
});

// Replace items in cache data
cacheData.items = newItems;

console.log(`Renumbered ${items.length} items from 0 to ${newIndex - 1}`);

// Write the renumbered cache file
fs.writeFileSync('cache-clean.json', JSON.stringify(cacheData, null, 2));

console.log('Cache file renumbered successfully!');

