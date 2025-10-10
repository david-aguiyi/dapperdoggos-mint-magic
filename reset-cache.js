import fs from 'fs';

// Read the cache file
const cacheData = JSON.parse(fs.readFileSync('cache-clean.json', 'utf8'));

// Clear the old candy machine ID
cacheData.program.candyMachine = "";
cacheData.program.candyGuard = "";
cacheData.program.candyMachineCreator = "";

// Write the reset cache file
fs.writeFileSync('cache-clean.json', JSON.stringify(cacheData, null, 2));

console.log('Cache file reset - ready for new deployment!');

