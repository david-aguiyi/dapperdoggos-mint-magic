// Universal Solana Wallet Integration
// Supports: Phantom, Solflare, Backpack, Trust Wallet, Coinbase, and more!

export interface SolanaWallet {
  publicKey: string;
  connected: boolean;
}

export async function connectWallet(): Promise<string | null> {
  try {
    // Check if ANY Solana wallet is installed
    const provider = window.solana;
    
    if (!provider) {
      // No wallet detected - recommend Phantom (most popular)
      const install = confirm(
        "No Solana wallet detected!\n\n" +
        "You need a Solana wallet to mint NFTs.\n" +
        "Install Phantom wallet?\n\n" +
        "(Also works with Solflare, Backpack, Trust Wallet, etc.)"
      );
      
      if (install) {
        window.open("https://phantom.app/", "_blank");
      }
      return null;
    }

    // Connect to ANY Solana wallet (Phantom, Solflare, Backpack, etc.)
    const response = await provider.connect();
    const walletAddress = response.publicKey.toString();
    
    // Detect wallet type for logging
    const walletName = provider.isPhantom ? "Phantom" : 
                      provider.isSolflare ? "Solflare" :
                      provider.isBackpack ? "Backpack" :
                      provider.isCoinbase ? "Coinbase Wallet" :
                      provider.isTrust ? "Trust Wallet" :
                      "Unknown Solana Wallet";
    
    console.log(`Connected to ${walletName}:`, walletAddress);
    
    return walletAddress;
  } catch (err: any) {
    console.error("Wallet connection failed:", err);
    
    // Handle user rejection
    if (err.code === 4001) {
      console.log("User rejected connection request");
      return null;
    }
    
    return null;
  }
}

export async function disconnectWallet(): Promise<void> {
  try {
    const provider = window.solana;
    
    if (provider) {
      await provider.disconnect();
      console.log("Wallet disconnected");
    }
  } catch (err) {
    console.error("Wallet disconnection failed:", err);
  }
}

export function getWalletAddress(): string | null {
  try {
    const provider = window.solana;
    
    if (provider && provider.publicKey) {
      return provider.publicKey.toString();
    }
    
    return null;
  } catch (err) {
    console.error("Failed to get wallet address:", err);
    return null;
  }
}

export function isWalletConnected(): boolean {
  try {
    const provider = window.solana;
    return !!(provider && provider.isConnected);
  } catch (err) {
    console.error("Failed to check wallet connection:", err);
    return false;
  }
}

// Extend Window interface for TypeScript
// Supports ALL Solana wallets
declare global {
  interface Window {
    solana?: {
      // Universal properties
      isConnected: boolean;
      publicKey: {
        toString(): string;
      } | null;
      connect(): Promise<{ publicKey: { toString(): string } }>;
      disconnect(): Promise<void>;
      on(event: string, callback: () => void): void;
      removeListener(event: string, callback: () => void): void;
      
      // Wallet-specific identifiers
      isPhantom?: boolean;
      isSolflare?: boolean;
      isBackpack?: boolean;
      isCoinbase?: boolean;
      isTrust?: boolean;
    };
  }
}
