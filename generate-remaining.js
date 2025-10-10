import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
    startFrom: 202, // Start from NFT #202 (we have 1-201)
    totalNFTs: 250, // Target total
    outputDir: './generated-nfts',
    traitsDir: './DAPPER DOGGOS TRAIT FOLDER/DAPPER DOGGOS TRAIT FOLDER',
    imageSize: 1024,
    collectionName: 'Dapper Doggos',
    symbol: 'DAPPER',
    baseUri: 'ipfs://REPLACE_WITH_IPFS_HASH',
    creatorAddress: 'YOUR_CREATOR_ADDRESS',
    sellerFeeBasisPoints: 500,
    description: "The most dapper doggos on the blockchain. Each DapperDoggo is a unique NFT with rare traits and exclusive benefits."
};

// Layer order (bottom to top)
const LAYER_ORDER = [
    { name: 'Background', folder: '6_BACKGROUND' },
    { name: 'Base', folder: '5_BASE LAYER (perm)' },
    { name: 'Clothing', folder: '4_CLOTHING' },
    { name: 'Mouth', folder: '3_MOUTH' },
    { name: 'Eyes', folder: '2_EYES' },
    { name: 'Hat', folder: '1_HAT' }
];

class NFTGenerator {
    constructor() {
        this.traits = {};
        this.usedCombinations = new Set();
        this.loadExistingCombinations();
    }

    // Load existing combinations to avoid duplicates
    loadExistingCombinations() {
        const metadataDir = path.join(CONFIG.outputDir, 'metadata');
        if (fs.existsSync(metadataDir)) {
            const files = fs.readdirSync(metadataDir).filter(f => f.endsWith('.json'));
            console.log(`📋 Loading ${files.length} existing combinations...`);
            
            for (const file of files) {
                try {
                    const metadata = JSON.parse(fs.readFileSync(path.join(metadataDir, file), 'utf8'));
                    const combo = metadata.attributes.map(attr => attr.value).join('-');
                    this.usedCombinations.add(combo);
                } catch (e) {
                    console.warn(`⚠️  Could not load ${file}`);
                }
            }
            console.log(`✅ Loaded ${this.usedCombinations.size} existing combinations`);
        }
    }

    // Get traits for each layer
    getTraitsForLayer(layer) {
        if (this.traits[layer.name]) {
            return this.traits[layer.name];
        }

        const folderPath = path.join(CONFIG.traitsDir, layer.folder);
        if (!fs.existsSync(folderPath)) {
            throw new Error(`Trait folder not found: ${folderPath}`);
        }

        const files = fs.readdirSync(folderPath).filter(f => f.toLowerCase().endsWith('.png'));
        this.traits[layer.name] = files.map(file => ({
            name: file.replace('.png', ''),
            path: path.join(folderPath, file)
        }));

        return this.traits[layer.name];
    }

    // Generate random combination that's not used
    generateUniqueCombination() {
        let attempts = 0;
        const maxAttempts = 1000; // Prevent infinite loops

        while (attempts < maxAttempts) {
            const traits = [];
            let comboKey = '';

            for (const layer of LAYER_ORDER) {
                const options = this.getTraitsForLayer(layer);
                const randomTrait = options[Math.floor(Math.random() * options.length)];
                traits.push(randomTrait);
                comboKey += (comboKey ? '-' : '') + randomTrait.name;
            }

            if (!this.usedCombinations.has(comboKey)) {
                this.usedCombinations.add(comboKey);
                return traits;
            }

            attempts++;
        }

        throw new Error(`Could not generate unique combination after ${maxAttempts} attempts`);
    }

    // Generate layered image
    async generateImage(traits, index) {
        const canvas = createCanvas(CONFIG.imageSize, CONFIG.imageSize);
        const ctx = canvas.getContext('2d');

        // Draw each layer in order
        for (const trait of traits) {
            try {
                const img = await loadImage(trait.path);
                ctx.drawImage(img, 0, 0, CONFIG.imageSize, CONFIG.imageSize);
            } catch (error) {
                console.error(`❌ Error loading image ${trait.path}:`, error.message);
                throw error;
            }
        }

        // Save image
        const imagePath = path.join(CONFIG.outputDir, 'images', `${index}.png`);
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(imagePath, buffer);

        return imagePath;
    }

    // Create metadata JSON
    createMetadata(index, traits) {
        return {
            name: `${CONFIG.collectionName} #${index}`,
            symbol: CONFIG.symbol,
            description: CONFIG.description,
            image: `${CONFIG.baseUri}/${index}.png`,
            external_url: "",
            attributes: traits.map((trait, i) => ({
                trait_type: LAYER_ORDER[i].name,
                value: trait.name
            })),
            properties: {
                files: [{
                    uri: `${index}.png`,
                    type: "image/png"
                }],
                category: "image",
                creators: [{
                    address: CONFIG.creatorAddress,
                    share: 100
                }]
            },
            seller_fee_basis_points: CONFIG.sellerFeeBasisPoints
        };
    }

    // Save metadata
    saveMetadata(index, metadata) {
        const metadataPath = path.join(CONFIG.outputDir, 'metadata', `${index}.json`);
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    }

    // Generate single NFT
    async generateNFT(index) {
        console.log(`🎯 Generating NFT #${index}...`);
        
        const traits = this.generateUniqueCombination();
        const imagePath = await this.generateImage(traits, index);
        const metadata = this.createMetadata(index, traits);
        
        this.saveMetadata(index, metadata);
        
        return {
            index,
            traits: traits.map(t => t.name),
            imagePath,
            metadata
        };
    }

    // Generate remaining NFTs
    async generateRemaining() {
        const startTime = Date.now();
        const remainingCount = CONFIG.totalNFTs - CONFIG.startFrom + 1;
        
        console.log(`🚀 Generating remaining ${remainingCount} NFTs (${CONFIG.startFrom} to ${CONFIG.totalNFTs})...`);
        console.log(`📁 Output directory: ${CONFIG.outputDir}`);
        console.log(`🎨 Image size: ${CONFIG.imageSize}x${CONFIG.imageSize}`);

        // Ensure output directories exist
        fs.mkdirSync(path.join(CONFIG.outputDir, 'images'), { recursive: true });
        fs.mkdirSync(path.join(CONFIG.outputDir, 'metadata'), { recursive: true });

        // Load existing trait counts
        console.log('\n🔍 Loading trait information...');
        for (const layer of LAYER_ORDER) {
            const traits = this.getTraitsForLayer(layer);
            console.log(`✅ Found ${traits.length} ${layer.name} traits`);
        }

        const results = [];
        
        for (let i = CONFIG.startFrom; i <= CONFIG.totalNFTs; i++) {
            try {
                const result = await this.generateNFT(i);
                results.push(result);
                
                // Progress update every 10 NFTs
                if (i % 10 === 0 || i === CONFIG.totalNFTs) {
                    const progress = ((i - CONFIG.startFrom + 1) / remainingCount * 100).toFixed(1);
                    const elapsed = (Date.now() - startTime) / 1000;
                    const avgTime = elapsed / (i - CONFIG.startFrom + 1);
                    const eta = avgTime * (CONFIG.totalNFTs - i);
                    console.log(`📈 Progress: ${i - CONFIG.startFrom + 1}/${remainingCount} (${progress}%) - ETA: ${eta.toFixed(0)}s`);
                }
                
                // Force garbage collection every 25 NFTs
                if (i % 25 === 0) {
                    if (global.gc) {
                        global.gc();
                        console.log(`🧹 Memory cleanup at NFT #${i}`);
                    }
                }
                
            } catch (error) {
                console.error(`❌ Error generating NFT #${i}:`, error.message);
                break;
            }
        }

        const totalTime = (Date.now() - startTime) / 1000;
        const avgTime = totalTime / results.length;

        console.log('\n📊 Generation complete!');
        console.log(`⏱️  Total time: ${totalTime.toFixed(0)}s`);
        console.log(`📊 Average time per NFT: ${avgTime.toFixed(2)}s`);
        console.log(`📁 Files saved to: ${CONFIG.outputDir}`);
        console.log(`🎉 Total NFTs now: ${CONFIG.totalNFTs}`);

        return results;
    }
}

// Main execution
async function main() {
    try {
        const generator = new NFTGenerator();
        await generator.generateRemaining();
        
        console.log('\n🎉 Next steps:');
        console.log('1. Upload images and metadata to IPFS');
        console.log('2. Update baseUri in metadata files');
        console.log('3. Deploy your candy machine!');
        
    } catch (error) {
        console.error('❌ Generation failed:', error);
        process.exit(1);
    }
}

// Run if called directly
console.log('🚀 Starting NFT Generator...');
main().catch(console.error);

export { NFTGenerator, CONFIG, LAYER_ORDER };
