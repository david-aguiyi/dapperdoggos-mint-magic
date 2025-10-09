# Frontend — DapperDoggos Mint (devnet)

This file explains how to run the frontend locally and how to configure it to connect to your deployed Candy Machine.

## Environment

Create a `.env` file in the project root (already added during setup). Required variables:

```
VITE_CANDY_MACHINE_ID=DpzM97a4dwJ5qnFphJ8kr5uNxwQ6LDZLq6pqNDnkA5eo
VITE_RPC_URL=https://api.devnet.solana.com
VITE_WALLET_KEYPAIR=C:\Users\Agavid\.config\solana\devnet.json
```

Notes:

-   `VITE_WALLET_KEYPAIR` should point to a local keypair file (JSON array secret) for the devnet wallet you use to interact with the Candy Machine.
-   For production or multiple environments, consider using `.env.development` / `.env.production` and loading appropriately.

## Install and run

```powershell
npm install
npm run dev
# Open http://localhost:8080/
```

The app is a Vite React app — hot reload is enabled.

## Minting via UI

-   Open the frontend at `http://localhost:8080/`.
-   Connect your wallet (if the UI supports wallet adapters) or have `VITE_WALLET_KEYPAIR` point to a funded devnet keypair to mint from the local button.
-   Click the mint button — the app will call your Candy Machine to mint an NFT.

## Troubleshooting

-   DuplicateCreatorAddress: If you see `DuplicateCreatorAddress` on mint, check `config.json` and update on-chain via `sugar config update`.
-   Metadata parse errors: Ensure assets metadata in `assets/*.json` are valid JSON UTF-8 without BOM.
-   If the UI can't find the Candy Machine ID, confirm `.env` loads (Vite requires env names prefixed with `VITE_`).

## Useful sugar commands

-   Verify: `.\sugar-windows-latest.exe verify --keypair <KEYPAIR> --rpc-url https://api.devnet.solana.com`
-   Mint: `.\sugar-windows-latest.exe mint --keypair <KEYPAIR> --rpc-url https://api.devnet.solana.com`

---

If you'd like, I can commit these files to git (create a commit) or open the UI and walk through a manual user mint now.
