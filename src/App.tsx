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
      // Use backend for collection status (saves RPC calls)
      const response = await fetch(`${API_BASE_URL}/collection/status`);
      const data = await response.json();
      setMintedCount(data.itemsRedeemed);
      setTotalSupply(250);
      setIsSoldOut(data.isSoldOut);
    } catch (error) {
      console.error('Error fetching collection status:', error);
      // Set defaults if backend fails
      setMintedCount(4);
      setTotalSupply(250);
      setIsSoldOut(false);
    }
  };

  const connectWallet = async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    try {
      // Wait a moment for wallet to inject (if needed)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check for Solana wallet provider
      const provider = (window as any).solana || (window as any).phantom?.solana;
      
      console.log('Checking for wallet...', { 
        hasSolana: !!(window as any).solana,
        hasPhantom: !!(window as any).phantom,
        provider: provider 
      });
      
      if (provider && provider.connect) {
        console.log('Wallet provider found:', provider);
        const response = await provider.connect();
        console.log('Wallet connected:', response.publicKey.toString());
        setWalletAddress(response.publicKey.toString());
        setIsWalletConnected(true);
        toast.success('Wallet connected successfully!');
      } else {
        console.log('No wallet detected - opening Phantom download page');
        toast.error('Solana wallet not found! Please install Phantom or another Solana wallet.');
        window.open('https://phantom.app/', '_blank');
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      
      // Simple error handling
      if (error.code === 4001) {
        toast.error('Wallet connection was rejected by user.');
      } else if (error.message?.includes('User rejected')) {
        toast.error('Wallet connection was rejected. Please try again.');
      } else {
        toast.error(`Failed to connect wallet: ${error.message || 'Unknown error'}`);
      }
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
      console.log('🚀 Starting backend minting...');
      
      const response = await fetch(`${API_BASE_URL}/mint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: walletAddress,
          quantity: mintQuantity
        })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const result = await response.json();
      console.log('Mint response:', result);

      if (!response.ok) {
        if (result.isInsufficientFunds) {
          toast.error(`💰 ${result.message}`, {
            duration: 8000,
            action: {
              label: 'Add SOL',
              onClick: () => window.open('https://phantom.app/', '_blank')
            }
          });
        } else if (result.isSoldOut) {
          toast.error(`🚫 ${result.message}`);
          setIsSoldOut(true);
        } else {
          toast.error(`❌ ${result.error}: ${result.message}`);
        }
        return;
      }

      // Success!
      toast.success(`Successfully minted ${mintQuantity} NFT(s)! Check your wallet.`);
      fetchCollectionStatus(); // Refresh status

      // Show success modal
      setSuccessData({
        mint: result.mint,
        signature: result.signature,
        image: result.image || '/nfts/1.png',
        wallet: result.wallet,
        quantity: result.quantity
      });
      setShowSuccessModal(true);

    } catch (error: any) {
      console.error('❌ Minting error:', error);
      toast.error(`Error minting NFT: ${error.message || 'Network error'}`);
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
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">DapperDoggos NFT Mint</h1>
            <p className="hero-description">
              Mint your DapperDoggo NFT and join the pack!
            </p>
            
            {/* Minting UI */}
            <div className="mint-container">
              <div className="mint-info">
                <span className="minted-count">{mintedCount}</span> / <span className="total-supply">{totalSupply}</span> Minted
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
              </div>
              
              {isSoldOut ? (
                <p className="sold-out-message">SOLD OUT!</p>
              ) : (
                <>
                  <div className="mint-quantity-selector">
                    <button 
                      onClick={() => setMintQuantity(prev => Math.max(1, prev - 1))} 
                      disabled={mintQuantity <= 1 || isMinting}
                    >
                      -
                    </button>
                    <span>{mintQuantity}</span>
                    <button 
                      onClick={() => setMintQuantity(prev => Math.min(10, prev + 1))} 
                      disabled={mintQuantity >= 10 || isMinting}
                    >
                      +
                    </button>
                  </div>
                  <button 
                    className="mint-button" 
                    onClick={mintNFT} 
                    disabled={!isWalletConnected || isMinting || isSoldOut}
                  >
                    {isMinting ? 'Minting...' : `Mint ${mintQuantity} for ${(mintQuantity * 0.1).toFixed(1)} SOL`}
                  </button>
                  <p className="mint-price-info">
                    (Plus ~0.011 SOL network fee per NFT)
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Dog Ticker Section */}
      <section className="dog-ticker-section">
        <DogTicker />
      </section>

      {/* Mint Success Modal */}
      <MintSuccessModal 
        show={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
        mintData={successData} 
      />
    </div>
  );
}

export default App;