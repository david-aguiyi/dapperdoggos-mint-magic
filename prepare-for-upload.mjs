import fs from 'fs';
import path from 'path';

/**
 * PREPARE ASSETS FOR SUGAR UPLOAD
 * 
 * Sugar expects assets in a specific format:
 * assets/
 *   0.png
 *   0.json
 *   1.png
 *   1.json
 *   ...
 */

const SOURCE_DIR = './generated-nfts';
const TARGET_DIR = './assets-mainnet';

console.log('📦 Preparing assets for mainnet deployment...\n');

// Create target directory
if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Copy and rename files
const imageDir = path.join(SOURCE_DIR, 'images');
const metadataDir = path.join(SOURCE_DIR, 'metadata');

let copied = 0;

for (let i = 1; i <= 250; i++) {
    const targetIndex = i - 1; // Sugar expects 0-based indexing
    
    // Copy image
    const sourceImage = path.join(imageDir, `${i}.png`);
    const targetImage = path.join(TARGET_DIR, `${targetIndex}.png`);
    
    if (fs.existsSync(sourceImage)) {
        fs.copyFileSync(sourceImage, targetImage);
    }
    
    // Copy metadata
    const sourceMetadata = path.join(metadataDir, `${i}.json`);
    const targetMetadata = path.join(TARGET_DIR, `${targetIndex}.json`);
    
    if (fs.existsSync(sourceMetadata)) {
        // Read, update, and write metadata
        const metadata = JSON.parse(fs.readFileSync(sourceMetadata, 'utf8'));
        
        // Update image reference
        metadata.image = `${targetIndex}.png`;
        metadata.properties.files[0].uri = `${targetIndex}.png`;
        
        // Update creator to current wallet (you'll split manually)
        metadata.properties.creators = [{
            address: "EWHcReRihcC4KCKrDeZ38RYwbmuMB69DUScY6nKPLwW3",
            share: 100
        }];
        
        fs.writeFileSync(targetMetadata, JSON.stringify(metadata, null, 2));
        copied++;
    }
    
    if (i % 50 === 0) {
        console.log(`✅ Prepared ${i}/250 assets...`);
    }
}

console.log(`\n✅ Successfully prepared ${copied} assets for upload!`);
console.log(`📁 Assets ready in: ${TARGET_DIR}`);
console.log(`\n🎯 Next: Run Sugar upload command`);


