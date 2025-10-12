import { useState, useEffect } from 'react';
import './App.css';
import DogTicker from './components/DogTicker';
import { useToast, ToastContainer } from './components/Toast';
import MintSuccessModal from './components/MintSuccessModal';

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [mintedCount, setMintedCount] = useState(0);
  const [totalSupply, setTotalSupply] = useState(249);
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [mintQuantity, setMintQuantity] = useState(1);
  const [isMinting, setIsMinting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(true);
  const [successData, setSuccessData] = useState({
    mint: 'DemoMintAddress123456789',
    signature: '5KjHK7VdJq8xYZ2rP9mN3wX4tQ1cR6sV8uB7gF9hD2eL3aM4nP5oT6rQ7sU8vW9x',
    image: '/nfts/1.png',
    wallet: 'YourWalletAddress123456',
    quantity: 2
  });
  
  const toast = useToast();

  const API_BASE_URL = 'https://dapperdoggos-api.onrender.com';

  // Fetch collection status
  useEffect(() => {
    fetchCollectionStatus();
  }, []);

  const fetchCollectionStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/collection/status`);
      const data = await response.json();
      setMintedCount(data.itemsRedeemed);
      setTotalSupply(data.totalItems);
      setIsSoldOut(data.isSoldOut);
    } catch (error) {
      console.error('Error fetching collection status:', error);
    }
  };

  const connectWallet = async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    try {
      // Check for Solana wallet providers (Phantom, Solflare, Backpack, etc.)
      const provider = (window as any).solana || (window as any).phantom?.solana;
      
      if (provider) {
        console.log('Wallet provider found:', provider);
        const response = await provider.connect();
        console.log('Wallet connected:', response.publicKey.toString());
        setWalletAddress(response.publicKey.toString());
        setIsWalletConnected(true);
        toast.success('Wallet connected successfully!');
      } else {
        toast.error('Solana wallet not found! Please install Phantom, Solflare, or another Solana wallet.');
        window.open('https://phantom.app/', '_blank');
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error(`Failed to connect wallet: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const mintNFT = async () => {
    if (!isWalletConnected || !walletAddress) {
      toast.error('Please connect your wallet first!');
      return;
    }

    setIsMinting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/mint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: walletAddress,
          quantity: mintQuantity
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const data = await response.json();
      console.log('Mint response:', data);
      
      if (!response.ok) {
        // Handle specific error types
        if (data.isInsufficientFunds) {
          toast.error(`💰 Insufficient Balance: You need ${data.requiredAmount} SOL but only have ${data.currentBalance} SOL`);
        } else {
          toast.error(`Mint failed: ${data.error || data.message || 'Unknown error'}`);
        }
        return;
      }
      
      if (data.success) {
        toast.success(`Successfully minted ${mintQuantity} NFT(s)! Check your wallet.`);
        fetchCollectionStatus(); // Refresh status
        
        // Show success modal with mint data
        setSuccessData({
          mint: data.mint,
          signature: data.signature,
          image: data.image,
          wallet: walletAddress,
          quantity: mintQuantity
        });
        setShowSuccessModal(true);
      } else {
        toast.error(`Mint failed: ${data.error || data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast.error('Mint failed. Please try again.');
    } finally {
      setIsMinting(false);
    }
  };

  const progress = (mintedCount / totalSupply) * 100;

  return (
    <div className="app">
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      
      {/* Connect Wallet Button */}
      <div className="wallet-button-container">
          <button 
            className={`connect-wallet-btn ${isWalletConnected ? 'connected' : ''}`}
            onClick={connectWallet}
            disabled={isWalletConnected || isConnecting}
          >
          <i className="fa-solid fa-wallet wallet-icon"></i>
            {isConnecting ? 'Connecting...' : isWalletConnected ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : 'Connect Wallet'}
          </button>
        </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="minting-banner">
            <span className="sparkle-static">✨</span>
            Minting Now Live
          </div>
          <h2 className="main-title">
            MINT YOUR <span className="gradient-text">DAPPERDOGGO</span>
          </h2>
          <p className="hero-description">
            Join the revolution of digital collectibles. Each DapperDoggo is a unique NFT with rare traits and exclusive benefits.
          </p>
        </div>
      </section>

      {/* NFT Ticker */}
      <DogTicker />

      {/* Minting Status */}
      <section className="minting-status">
        <div className="status-card">
          <div className="minted-info">
            <span className="minted-label">Minted</span>
            <span className="minted-count">{mintedCount}/{totalSupply}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {isSoldOut ? (
            <button className="sold-out-btn" disabled>
              <span className="x-icon">✕</span>
              Sold Out!
            </button>
          ) : (
            <div className="mint-controls">
              <div className="quantity-controls">
                <button 
                  onClick={() => setMintQuantity(Math.max(1, mintQuantity - 1))}
                  className="quantity-btn"
                  disabled={isMinting}
                >
                  −
                </button>
                <span className="quantity">{mintQuantity}</span>
                <button 
                  onClick={() => setMintQuantity(Math.min(totalSupply - mintedCount, mintQuantity + 1))}
                  className="quantity-btn"
                  disabled={isMinting}
                >
                  +
                </button>
              </div>
              <button 
                className="mint-btn"
                onClick={mintNFT}
                disabled={isMinting || !isWalletConnected || !walletAddress}
              >
                {isMinting ? (
                  <>
                    <span className="sparkle-rotating">✨</span>
                    Minting...
                  </>
                ) : (
                  <>
                    <span className="sparkle-static">✨</span>
                    Mint {mintQuantity} for {(mintQuantity * 0.1).toFixed(1)} SOL
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Mint Success Modal */}
      <MintSuccessModal 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        mintData={successData}
      />
    </div>
  );
}

export default App;
