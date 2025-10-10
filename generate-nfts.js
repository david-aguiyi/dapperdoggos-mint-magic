#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
    totalNFTs: 250, // Change this to your desired collection size
    outputDir: './generated-nfts',
    traitsDir: './DAPPER DOGGOS TRAIT FOLDER/DAPPER DOGGOS TRAIT FOLDER',
    imageSize: 1024,
    collectionName: 'Dapper Doggos',
    symbol: 'DAPPER',
    description: 'The most dapper doggos on the blockchain. Each DapperDoggo is a unique NFT with rare traits and exclusive benefits.',
    baseUri: 'ipfs://REPLACE_WITH_IPFS_HASH' // Update this after uploading to IPFS
};

// Define layer order (bottom to top)
const LAYER_ORDER = [
    { name: "Background", folder: "6_BACKGROUND" },
    { name: "Base", folder: "5_BASE LAYER (perm)" },
    { name: "Clothing", folder: "4_CLOTHING" },
    { name: "Mouth", folder: "3_MOUTH" },
    { name: "Eyes", folder: "2_EYES" },
    { name: "Hat", folder: "1_HAT" }
];

// Rarity weights for traits (optional - for more control over rarity)
const RARITY_WEIGHTS = {
    "Background": {
        "DAPPERDOGGOBG.png": 0.15,
        "BLUEDAPPERDOGGOBG.png": 0.12,
        "GREENBG.png": 0.10,
        "PINKBG.png": 0.10,
        "PURPLEBG.png": 0.10,
        "TEALBG.png": 0.10,
        "ORANGEBG.png": 0.08,
        "PEACHBG.png": 0.08,
        "YELLOW.png": 0.05,
        "CLOUDSBG.png": 0.05,
        "GREYSTRIPEBG.png": 0.03,
        "PEACHSTRIPEBG.png": 0.02,
        "PURPLESTRIPEBG.png": 0.01,
        "TEALSTRIPEBG.png": 0.01
    }
    // Add more rarity weights as needed
};

class NFTGenerator {
    constructor() {
        this.traits = {};
        this.generatedCombinations = new Set();
        this.rarityStats = {};
    }

    // Initialize by reading all trait folders
    initialize() {
        console.log('🔍 Reading trait folders...');
        
        for (const layer of LAYER_ORDER) {
            const folderPath = path.join(CONFIG.traitsDir, layer.folder);
            
            if (!fs.existsSync(folderPath)) {
                console.warn(`⚠️  Warning: Folder ${folderPath} does not exist`);
                continue;
            }

            const files = fs.readdirSync(folderPath)
                .filter(file => file.toLowerCase().endsWith('.png'))
                .map(file => ({
                    name: file.replace('.png', ''),
                    path: path.join(folderPath, file),
                    fileName: file
                }));

            this.traits[layer.name] = files;
            console.log(`✅ Found ${files.length} ${layer.name} traits`);
        }

        // Create output directories
        this.createOutputDirectories();
    }

    createOutputDirectories() {
        const dirs = [
            path.join(CONFIG.outputDir, 'images'),
            path.join(CONFIG.outputDir, 'metadata'),
            path.join(CONFIG.outputDir, 'traits')
        ];

        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    // Get weighted random trait based on rarity
    getWeightedTrait(layerName, traits) {
        const weights = RARITY_WEIGHTS[layerName];
        
        if (!weights) {
            // No weights defined, use equal probability
            return traits[Math.floor(Math.random() * traits.length)];
        }

        const totalWeight = traits.reduce((sum, trait) => {
            return sum + (weights[trait.fileName] || 0.1); // Default weight for unlisted traits
        }, 0);

        let random = Math.random() * totalWeight;
        
        for (const trait of traits) {
            const weight = weights[trait.fileName] || 0.1;
            random -= weight;
            if (random <= 0) {
                return trait;
            }
        }

        return traits[0]; // Fallback
    }

    // Generate a unique combination of traits
    generateUniqueCombination() {
        let attempts = 0;
        const maxAttempts = 10000;

        while (attempts < maxAttempts) {
            const combination = {};
            const traitNames = [];

            for (const layer of LAYER_ORDER) {
                const layerTraits = this.traits[layer.name];
                if (!layerTraits || layerTraits.length === 0) {
                    console.warn(`⚠️  No traits found for ${layer.name}`);
                    continue;
                }

                const selectedTrait = this.getWeightedTrait(layer.name, layerTraits);
                combination[layer.name] = selectedTrait;
                traitNames.push(selectedTrait.name);
            }

            const comboKey = traitNames.join('|');
            
            if (!this.generatedCombinations.has(comboKey)) {
                this.generatedCombinations.add(comboKey);
                return combination;
            }

            attempts++;
        }

        throw new Error(`Could not generate unique combination after ${maxAttempts} attempts`);
    }

    // Generate the layered image
    async generateImage(combination, index) {
        const canvas = createCanvas(CONFIG.imageSize, CONFIG.imageSize);
        const ctx = canvas.getContext('2d');

        // Draw layers in order (background first)
        for (const layer of LAYER_ORDER) {
            const trait = combination[layer.name];
            if (!trait) continue;

            try {
                const img = await loadImage(trait.path);
                ctx.drawImage(img, 0, 0, CONFIG.imageSize, CONFIG.imageSize);
            } catch (error) {
                console.error(`❌ Error loading image ${trait.path}:`, error.message);
            }
        }

        // Save the image
        const imagePath = path.join(CONFIG.outputDir, 'images', `${index}.png`);
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(imagePath, buffer);

        return imagePath;
    }

    // Generate metadata JSON
    generateMetadata(combination, index) {
        const attributes = [];

        for (const layer of LAYER_ORDER) {
            const trait = combination[layer.name];
            if (!trait) continue;

            attributes.push({
                trait_type: layer.name,
                value: trait.name
            });

            // Track rarity stats
            if (!this.rarityStats[layer.name]) {
                this.rarityStats[layer.name] = {};
            }
            if (!this.rarityStats[layer.name][trait.name]) {
                this.rarityStats[layer.name][trait.name] = 0;
            }
            this.rarityStats[layer.name][trait.name]++;
        }

        const metadata = {
            name: `${CONFIG.collectionName} #${index}`,
            symbol: CONFIG.symbol,
            description: CONFIG.description,
            image: `${CONFIG.baseUri}/${index}.png`,
            attributes: attributes,
            properties: {
                files: [{
                    uri: `${index}.png`,
                    type: "image/png"
                }],
                category: "image",
                creators: [{
                    address: "YOUR_CREATOR_ADDRESS", // Update this
                    share: 100
                }]
            }
        };

        return metadata;
    }

    // Save metadata to file
    saveMetadata(metadata, index) {
        const metadataPath = path.join(CONFIG.outputDir, 'metadata', `${index}.json`);
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    }

    // Save rarity statistics
    saveRarityStats() {
        const statsPath = path.join(CONFIG.outputDir, 'rarity-stats.json');
        fs.writeFileSync(statsPath, JSON.stringify(this.rarityStats, null, 2));
        console.log(`📊 Rarity statistics saved to ${statsPath}`);
    }

    // Generate all NFTs
    async generateAll() {
        console.log(`🚀 Starting generation of ${CONFIG.totalNFTs} NFTs...`);
        console.log(`📁 Output directory: ${CONFIG.outputDir}`);
        console.log(`🎨 Image size: ${CONFIG.imageSize}x${CONFIG.imageSize}`);
        console.log('');

        const startTime = Date.now();

        for (let i = 1; i <= CONFIG.totalNFTs; i++) {
            try {
                console.log(`🎯 Generating NFT #${i}...`);

                // Generate unique combination
                const combination = this.generateUniqueCombination();

                // Generate image
                await this.generateImage(combination, i);

                // Generate metadata
                const metadata = this.generateMetadata(combination, i);
                this.saveMetadata(metadata, i);

                // Progress update
                if (i % 100 === 0) {
                    const elapsed = (Date.now() - startTime) / 1000;
                    const rate = i / elapsed;
                    const remaining = (CONFIG.totalNFTs - i) / rate;
                    console.log(`📈 Progress: ${i}/${CONFIG.totalNFTs} (${(i/CONFIG.totalNFTs*100).toFixed(1)}%) - ETA: ${Math.round(remaining)}s`);
                }

            } catch (error) {
                console.error(`❌ Error generating NFT #${i}:`, error.message);
                break;
            }
        }

        // Save rarity statistics
        this.saveRarityStats();

        const totalTime = (Date.now() - startTime) / 1000;
        console.log('');
        console.log(`✅ Generation complete!`);
        console.log(`⏱️  Total time: ${Math.round(totalTime)}s`);
        console.log(`📊 Average time per NFT: ${(totalTime / CONFIG.totalNFTs).toFixed(2)}s`);
        console.log(`📁 Files saved to: ${CONFIG.outputDir}`);
        console.log('');
        console.log('🎉 Next steps:');
        console.log('1. Upload images and metadata to IPFS');
        console.log('2. Update baseUri in metadata files');
        console.log('3. Deploy your candy machine!');
    }
}

// Main execution
async function main() {
    try {
        // Check if canvas is installed
        try {
            await import('canvas');
        } catch (error) {
            console.error('❌ Canvas package not found. Please install it first:');
            console.error('npm install canvas');
            process.exit(1);
        }

        const generator = new NFTGenerator();
        generator.initialize();
        await generator.generateAll();

    } catch (error) {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    }
}

// Run if called directly
main().catch(console.error);

export { NFTGenerator, CONFIG, LAYER_ORDER };
