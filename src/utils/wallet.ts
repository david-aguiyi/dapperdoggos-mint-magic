// Phantom Wallet Integration
export interface PhantomWallet {
  publicKey: string;
  connected: boolean;
}

export async function connectWallet(): Promise<string | null> {
  try {
    // Check if Phantom is installed
    const provider = window.solana;
    
    if (!provider || !provider.isPhantom) {
      alert("Please install the Phantom wallet extension!");
      window.open("https://phantom.app/", "_blank");
      return null;
    }

    // Connect to Phantom
    const response = await provider.connect();
    console.log("Connected wallet:", response.publicKey.toString());
    
    return response.publicKey.toString();
  } catch (err) {
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
    
    if (provider && provider.isPhantom) {
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
    
    if (provider && provider.isPhantom && provider.publicKey) {
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
    return !!(provider && provider.isPhantom && provider.isConnected);
  } catch (err) {
    console.error("Failed to check wallet connection:", err);
    return false;
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    solana?: {
      isPhantom: boolean;
      isConnected: boolean;
      publicKey: {
        toString(): string;
      } | null;
      connect(): Promise<{ publicKey: { toString(): string } }>;
      disconnect(): Promise<void>;
      on(event: string, callback: () => void): void;
      removeListener(event: string, callback: () => void): void;
    };
  }
}
