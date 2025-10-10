import fs from 'fs';
import path from 'path';

/**
 * UPDATE METADATA CREATORS
 * 
 * This script updates all 250 metadata files with the correct creator split:
 * - 15% to Artist Wallet
 * - 85% to Team/Marketing Wallet
 * 
 * Run this after updating the wallet addresses in config_fresh.json
 */

// ============= CONFIGURATION =============

const CONFIG = {
    metadataDir: './generated-nfts/metadata',
    
    // UPDATE THESE WITH YOUR ACTUAL WALLET ADDRESSES
    artistWallet: "ARTIST_WALLET_ADDRESS_HERE",
    teamWallet: "TEAM_MARKETING_WALLET_ADDRESS_HERE",
    
    // Revenue split
    artistShare: 15,
    teamShare: 85,
    
    // Royalty percentage (basis points: 500 = 5%)
    sellerFeeBasisPoints: 500
};

// ============= UPDATE LOGIC =============

function updateMetadataFiles() {
    console.log('🔄 Updating Metadata Creator Information');
    console.log('=' .repeat(50));
    console.log(`📁 Directory: ${CONFIG.metadataDir}`);
    console.log(`🎨 Artist (${CONFIG.artistShare}%): ${CONFIG.artistWallet}`);
    console.log(`👥 Team (${CONFIG.teamShare}%): ${CONFIG.teamWallet}`);
    console.log('=' .repeat(50));

    // Check if wallet addresses have been updated
    if (CONFIG.artistWallet === "ARTIST_WALLET_ADDRESS_HERE" || 
        CONFIG.teamWallet === "TEAM_MARKETING_WALLET_ADDRESS_HERE") {
        console.error('\n❌ ERROR: Please update wallet addresses in this script first!');
        console.error('   Edit lines 14-15 with your actual Solana wallet addresses.\n');
        process.exit(1);
    }

    // Get all JSON files
    if (!fs.existsSync(CONFIG.metadataDir)) {
        console.error(`\n❌ ERROR: Metadata directory not found: ${CONFIG.metadataDir}\n`);
        process.exit(1);
    }

    const files = fs.readdirSync(CONFIG.metadataDir)
        .filter(f => f.endsWith('.json'))
        .sort((a, b) => {
            const numA = parseInt(a.replace('.json', ''));
            const numB = parseInt(b.replace('.json', ''));
            return numA - numB;
        });

    console.log(`\n📊 Found ${files.length} metadata files to update...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const file of files) {
        try {
            const filePath = path.join(CONFIG.metadataDir, file);
            const metadata = JSON.parse(fs.readFileSync(filePath, 'utf8'));

            // Update creators array
            metadata.properties.creators = [
                {
                    address: CONFIG.artistWallet,
                    share: CONFIG.artistShare
                },
                {
                    address: CONFIG.teamWallet,
                    share: CONFIG.teamShare
                }
            ];

            // Update seller fee basis points
            metadata.seller_fee_basis_points = CONFIG.sellerFeeBasisPoints;

            // Write back to file
            fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));
            
            successCount++;
            if (successCount % 50 === 0 || successCount === files.length) {
                console.log(`✅ Updated ${successCount}/${files.length} files...`);
            }

        } catch (error) {
            console.error(`❌ Error updating ${file}:`, error.message);
            errorCount++;
        }
    }

    console.log('\n' + '=' .repeat(50));
    console.log(`✅ Successfully updated: ${successCount} files`);
    if (errorCount > 0) {
        console.log(`❌ Errors: ${errorCount} files`);
    }
    console.log('=' .repeat(50));

    // Show sample of updated file
    if (successCount > 0) {
        const sampleFile = path.join(CONFIG.metadataDir, '1.json');
        const sampleMetadata = JSON.parse(fs.readFileSync(sampleFile, 'utf8'));
        
        console.log(`\n📝 Sample Updated Metadata (1.json):`);
        console.log(`   Creators:`);
        sampleMetadata.properties.creators.forEach(creator => {
            const type = creator.address === CONFIG.artistWallet ? 'Artist' : 'Team';
            console.log(`     - ${type}: ${creator.address} (${creator.share}%)`);
        });
        console.log(`   Royalty: ${sampleMetadata.seller_fee_basis_points / 100}%`);
    }

    console.log(`\n🎉 Metadata update complete!\n`);
}

// ============= MAIN EXECUTION =============

try {
    updateMetadataFiles();
} catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
}


