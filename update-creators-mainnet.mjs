import fs from 'fs';
import path from 'path';

/**
 * UPDATE METADATA WITH CREATOR SPLIT
 * Artist: 15% - EuKLEAf54ae7SVLpchWDdCYBVhekbKf2D5hk95quaj1w
 * Team: 85% - 2KHb61igaD4F1ChHL9aizDtkFPnVKfMmhmfFciESoY1q
 */

const METADATA_DIR = './assets-mainnet';
const ARTIST_WALLET = 'EuKLEAf54ae7SVLpchWDdCYBVhekbKf2D5hk95quaj1w';
const TEAM_WALLET = '2KHb61igaD4F1ChHL9aizDtkFPnVKfMmhmfFciESoY1q';

console.log('🔄 Updating 250 NFT metadata files with creator split...\n');
console.log(`🎨 Artist (15%): ${ARTIST_WALLET}`);
console.log(`👥 Team (85%): ${TEAM_WALLET}\n`);

let updated = 0;
let errors = 0;

for (let i = 0; i < 250; i++) {
    const filePath = path.join(METADATA_DIR, `${i}.json`);
    
    try {
        if (fs.existsSync(filePath)) {
            const metadata = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            // Update creators array
            metadata.properties.creators = [
                {
                    address: ARTIST_WALLET,
                    share: 15
                },
                {
                    address: TEAM_WALLET,
                    share: 85
                }
            ];
            
            // Ensure royalty is 5%
            metadata.seller_fee_basis_points = 500;
            
            // Write back
            fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));
            updated++;
            
            if ((i + 1) % 50 === 0) {
                console.log(`✅ Updated ${i + 1}/250 files...`);
            }
        }
    } catch (error) {
        console.error(`❌ Error updating ${i}.json:`, error.message);
        errors++;
    }
}

console.log(`\n✅ Successfully updated ${updated} metadata files!`);
if (errors > 0) {
    console.log(`❌ Errors: ${errors} files`);
}

console.log('\n📊 Revenue Split Configuration:');
console.log('   Primary Sales (Minting): 100% → Team Wallet');
console.log('   Team manually sends 15% to Artist');
console.log('\n   Secondary Sales (Royalties): AUTOMATIC SPLIT');
console.log('   Artist: 15% of 5% royalty');
console.log('   Team: 85% of 5% royalty');

console.log('\n🎯 Ready for mainnet deployment!');


