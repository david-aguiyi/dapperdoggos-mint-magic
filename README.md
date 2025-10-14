# DapperDoggos — Mint Magic (Mainnet)

> **Note:** This project was initially scaffolded with Lovable but is now fully independent. Lovable does not affect production deployment or functionality.

This project contains the assets and frontend for the DapperDoggos NFT mint using Metaplex Sugar (Candy Machine v3) on Solana devnet.

## Important IDs

-   Collection mint: `7WEpDzHKABME2i1wznBhLG5qgC1Fry55GUoPgoEdFRhR`
-   Candy Machine ID: `DpzM97a4dwJ5qnFphJ8kr5uNxwQ6LDZLq6pqNDnkA5eo`
-   Example minted NFT (test mint): `CM5RGQDGqmb3hLcQf9cUGAF8cTDwDfV9kWBsCGs1Z3WU`

## Quick commands

Verify the on-chain candy machine:

```powershell
.\sugar-windows-latest.exe verify --keypair C:\Users\Agavid\.config\solana\devnet.json --rpc-url https://api.devnet.solana.com
```

Deploy (attach collection mint and write config lines):

```powershell
.\sugar-windows-latest.exe deploy --keypair C:\Users\Agavid\.config\solana\devnet.json --collection-mint <COLLECTION_MINT> --config .\config.json --rpc-url https://api.devnet.solana.com
```

Mint one NFT (test):

```powershell
.\sugar-windows-latest.exe mint --keypair C:\Users\Agavid\.config\solana\devnet.json --rpc-url https://api.devnet.solana.com
```

Run the frontend (Vite):

```powershell
# Ensure .env contains VITE_CANDY_MACHINE_ID, VITE_RPC_URL, VITE_WALLET_KEYPAIR
npm install
npm run dev
# Open http://localhost:8080/
```

## Notes & troubleshooting

-   Metadata files must be UTF-8 without BOM.
-   `config.json` holds creators, seller fee, uploadMethod (bundlr), and guard config.
-   If you see `DuplicateCreatorAddress` during mint, check `config.json` for duplicate creators and update on-chain via `sugar config update`.

## Where things live

-   Assets and metadata: `assets/`
-   Candy Machine config: `config.json`
-   Upload cache: `cache.json`
-   Scripts for convenience: `scripts/` (includes `mint-collection-from-cache.mjs` used during setup)

---

If you'd like, I can run a UI mint from the frontend and commit this README change for you.


```powershell

.\sugar-windows-latest.exe mint --keypair C:\Users\Agavid\.config\solana\devnet.json --rpc-url https://api.devnet.solana.com

```



Run the frontend (Vite):



```powershell

# Ensure .env contains VITE_CANDY_MACHINE_ID, VITE_RPC_URL, VITE_WALLET_KEYPAIR

npm install

npm run dev

# Open http://localhost:8080/

```



## Notes & troubleshooting



-   Metadata files must be UTF-8 without BOM.

-   `config.json` holds creators, seller fee, uploadMethod (bundlr), and guard config.

-   If you see `DuplicateCreatorAddress` during mint, check `config.json` for duplicate creators and update on-chain via `sugar config update`.



## Where things live



-   Assets and metadata: `assets/`

-   Candy Machine config: `config.json`

-   Upload cache: `cache.json`

-   Scripts for convenience: `scripts/` (includes `mint-collection-from-cache.mjs` used during setup)



---



If you'd like, I can run a UI mint from the frontend and commit this README change for you.


