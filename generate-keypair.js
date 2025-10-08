const nacl = require('tweetnacl');
const bs58 = require('bs58');
const fs = require('fs');

const keypair = nacl.sign.keyPair();
const secret = Array.from(keypair.secretKey);
const outDir = process.env.USERPROFILE + '/.config/solana';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = outDir + '/devnet.json';
fs.writeFileSync(outPath, JSON.stringify(secret));
const pubKey = bs58.encode(keypair.publicKey);
console.log('Saved keypair to', outPath);
console.log('Public key (base58):', pubKey);
