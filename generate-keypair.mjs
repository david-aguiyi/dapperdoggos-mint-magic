import nacl from "tweetnacl";
import bs58 from "bs58";
import fs from "fs";
import path from "path";

const keypair = nacl.sign.keyPair();
const secret = Array.from(keypair.secretKey);
const outDir = path.join(process.env.USERPROFILE, '.config', 'solana');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'devnet.json');
fs.writeFileSync(outPath, JSON.stringify(secret));
const pubKey = bs58.encode(keypair.publicKey);
console.log('Saved keypair to', outPath);
console.log('Public key (base58):', pubKey);
