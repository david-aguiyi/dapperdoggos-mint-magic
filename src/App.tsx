import { useState, useEffect } from 'react';
import './App.css';
import DogTicker from './components/DogTicker';
import { useToast, ToastContainer } from './components/Toast';
import MintSuccessModal from './components/MintSuccessModal';

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [mintedCount, setMintedCount] = useState(0);
  const [totalSupply, setTotalSupply] = useState(250);
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [mintQuantity, setMintQuantity] = useState(1);
  const [isMinting, setIsMinting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [successData, setSuccessData] = useState({
    mint: '',
    signature: '',
    image: '',
    wallet: '',
    quantity: 1
  });
  
  const toast = useToast();

  const API_BASE_URL = 'https://dapperdoggos-api.onrender.com';

  // Fetch collection status and detect mobile
  useEffect(() => {
    fetchCollectionStatus();
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);

  const fetchCollectionStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/collection/status`);
      const data = await response.json();
      setMintedCount(data.itemsRedeemed);
      setTotalSupply(250); // Override backend total with correct value
      setIsSoldOut(data.isSoldOut);
    } catch (error) {
      console.error('Error fetching collection status:', error);
    }
  };

  const connectWallet = async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    try {
      console.log('🔗 Starting wallet connection...');
      console.log('📱 Mobile device:', isMobile);
      console.log('🌐 User agent:', navigator.userAgent);
      
      // Check for available wallet providers
      const phantomProvider = (window as any).phantom?.solana || (window as any).solana;
      const solflareProvider = (window as any).solflare;
      const backpackProvider = (window as any).backpack;
      const coinbaseProvider = (window as any).coinbase?.solana;
      
      console.log('💳 Available providers:', {
        phantom: !!phantomProvider,
        solflare: !!solflareProvider,
        backpack: !!backpackProvider,
        coinbase: !!coinbaseProvider
      });
      
      // Try wallets in order of preference
      const wallets = [
        { name: 'Phantom', provider: phantomProvider, url: 'https://phantom.app/' },
        { name: 'Solflare', provider: solflareProvider, url: 'https://solflare.com/' },
        { name: 'Backpack', provider: backpackProvider, url: 'https://backpack.app/' },
        { name: 'Coinbase', provider: coinbaseProvider, url: 'https://www.coinbase.com/wallet' }
      ];
      
      let connected = false;
      let lastError = null;
      
      for (const wallet of wallets) {
        if (!wallet.provider) {
          console.log(`❌ ${wallet.name} not available`);
          continue;
        }
        
        try {
          console.log(`🔄 Trying to connect ${wallet.name}...`);
          
          // Check if wallet is already connected
          if (wallet.provider.isConnected && wallet.provider.isConnected()) {
            console.log(`✅ ${wallet.name} already connected`);
            const publicKey = wallet.provider.publicKey;
            if (publicKey) {
              setWalletAddress(publicKey.toString());
              setIsWalletConnected(true);
              toast.success(`${wallet.name} wallet already connected!`);
              connected = true;
              break;
            }
          }
          
          // Attempt connection
          const response = await wallet.provider.connect();
          console.log(`✅ ${wallet.name} connected successfully:`, response.publicKey.toString());
          
          setWalletAddress(response.publicKey.toString());
          setIsWalletConnected(true);
          toast.success(`${wallet.name} wallet connected successfully!`);
          connected = true;
          break;
          
        } catch (error: any) {
          console.error(`❌ ${wallet.name} connection failed:`, error);
          lastError = error;
          
          // Handle specific error codes
          if (error.code === 4001) {
            console.log(`🚫 ${wallet.name} connection rejected by user`);
            toast.error(`${wallet.name} connection was rejected. Please try again.`);
            break; // Don't try other wallets if user rejected
          } else if (error.code === 4100) {
            console.log(`🔒 ${wallet.name} unauthorized`);
            continue; // Try next wallet
          } else if (error.code === 4900) {
            console.log(`🔌 ${wallet.name} disconnected`);
            continue; // Try next wallet
          }
          
          // For other errors, try next wallet
          continue;
        }
      }
      
      if (!connected) {
        console.error('❌ All wallet connections failed');
        
        if (lastError) {
          console.error('Last error details:', lastError);
          
          // Provide specific error messages
          if (lastError.code === 4001) {
            toast.error('Wallet connection was rejected. Please try again.');
          } else if (lastError.message?.includes('User rejected')) {
            toast.error('Wallet connection was rejected. Please try again.');
          } else if (lastError.message?.includes('0e')) {
            toast.error('Wallet connection failed. Please try refreshing the page and connecting again.', {
              action: {
                label: 'Retry',
                onClick: () => {
                  setTimeout(() => connectWallet(), 1000);
                }
              }
            });
          } else {
            toast.error(`Wallet connection failed: ${lastError.message || 'Unknown error'}`);
          }
        } else {
          // No wallets available
          if (isMobile) {
            toast.error('No Solana wallet found on this device!', {
              action: {
                label: 'Install Phantom',
                onClick: () => window.open('https://phantom.app/', '_blank')
              }
            });
          } else {
            toast.error('Solana wallet not found! Please install Phantom or another Solana wallet.');
            window.open('https://phantom.app/', '_blank');
          }
        }
      }
      
    } catch (error: any) {
      console.error('💥 Critical wallet connection error:', error);
      toast.error(`Critical error: ${error.message || 'Please refresh the page and try again.'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const mintNFT = async () => {
    if (!isWalletConnected || !walletAddress) {
      toast.error('👛 Please connect your wallet first! Click the "Connect Wallet" button at the top.');
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
      
      {/* Mobile Wallet Banner */}
      {isMobile && !isWalletConnected && (
        <div className="mobile-wallet-banner">
          <div className="banner-content">
            <span className="banner-icon">📱</span>
            <div className="banner-text">
              <strong>Mobile Wallet Required</strong>
              <p>Install Phantom or Solflare to mint NFTs on mobile</p>
            </div>
            <button 
              className="banner-action-btn"
              onClick={() => window.open('https://phantom.app/', '_blank')}
            >
              Install Phantom
            </button>
          </div>
        </div>
      )}

      {/* Connect Wallet Button */}
      <div className="wallet-button-container">
          <button 
            className={`connect-wallet-btn ${isWalletConnected ? 'connected' : ''}`}
            onClick={connectWallet}
            disabled={isWalletConnected || isConnecting}
          >
          <i className="fa-solid fa-wallet wallet-icon"></i>
            {isConnecting ? (
              <>
                <span className="connecting-spinner">⏳</span>
                Connecting...
              </>
            ) : isWalletConnected ? (
              <>
                <span className="connected-indicator">✅</span>
                {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
              </>
            ) : (
              <>
                <span className="disconnected-indicator">🔌</span>
                Connect Wallet
              </>
            )}
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
                disabled={isMinting}
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
