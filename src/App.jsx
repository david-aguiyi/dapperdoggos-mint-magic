import React, { useState, useEffect } from 'react';
import './App.css';
import DogTicker from './components/DogTicker';

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [mintedCount, setMintedCount] = useState(0);
  const [totalSupply, setTotalSupply] = useState(249);
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [mintQuantity, setMintQuantity] = useState(1);
  const [isMinting, setIsMinting] = useState(false);

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
    try {
      if (window.solana && window.solana.isPhantom) {
        const response = await window.solana.connect();
        setWalletAddress(response.publicKey.toString());
        setIsWalletConnected(true);
      } else {
        alert('Phantom wallet not found! Please install Phantom wallet.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const mintNFT = async () => {
    if (!isWalletConnected) {
      alert('Please connect your wallet first!');
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
          walletAddress,
          quantity: mintQuantity
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Successfully minted ${mintQuantity} NFT(s)! View on Explorer: ${data.explorerUrl}`);
        fetchCollectionStatus(); // Refresh status
      } else {
        alert(`Mint failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
      alert('Mint failed. Please try again.');
    } finally {
      setIsMinting(false);
    }
  };

  const progress = (mintedCount / totalSupply) * 100;

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">
              <span className="logo-text">DD</span>
            </div>
            <h1 className="brand-name">DAPPERDOGGOS</h1>
          </div>
          <button 
            className={`connect-wallet-btn ${isWalletConnected ? 'connected' : ''}`}
            onClick={connectWallet}
            disabled={isWalletConnected}
          >
            {isWalletConnected ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : 'Connect Wallet'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="minting-banner">
            <span className="sparkle">✨</span>
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
                disabled={isMinting || !isWalletConnected}
              >
                {isMinting ? 'Minting...' : `Mint ${mintQuantity} for ${(mintQuantity * 0.1).toFixed(1)} SOL`}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;
