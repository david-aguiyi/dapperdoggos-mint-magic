import { useState, useEffect } from 'react';
import './App.css';
import DogTicker from './components/DogTicker';
import { useToast, ToastContainer } from './components/Toast';
import MintSuccessModal from './components/MintSuccessModal';

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [mintedCount, setMintedCount] = useState(4); // Set default values
  const [totalSupply, setTotalSupply] = useState(250);
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [mintQuantity, setMintQuantity] = useState(1);
  const [isMinting, setIsMinting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({
    mint: '',
    signature: '',
    image: '',
    wallet: '',
    quantity: 1
  });
  
  const toast = useToast();

  const API_BASE_URL = 'https://dapperdoggos-api.onrender.com';

  useEffect(() => {
    fetchCollectionStatus();
  }, []);

  const fetchCollectionStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/collection/status`);
      const data = await response.json();
      setMintedCount(data.itemsRedeemed || 4);
      setTotalSupply(250);
      setIsSoldOut(data.isSoldOut || false);
    } catch (error) {
      console.error('Error fetching collection status:', error);
      // Use defaults
      setMintedCount(4);
      setTotalSupply(250);
      setIsSoldOut(false);
    }
  };

  const connectWallet = async () => {
    console.log('Connect wallet clicked');
    if (isConnecting) return;
    
    setIsConnecting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const provider = (window as any).solana || (window as any).phantom?.solana;
      console.log('Wallet provider:', provider);
      
      if (provider && provider.connect) {
        const response = await provider.connect();
        console.log('Wallet connected:', response.publicKey.toString());
        setWalletAddress(response.publicKey.toString());
        setIsWalletConnected(true);
        toast.success('Wallet connected successfully!');
      } else {
        console.log('No wallet detected');
        toast.error('Solana wallet not found! Please install Phantom.');
        window.open('https://phantom.app/', '_blank');
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error(`Failed to connect wallet: ${error.message || 'Unknown error'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const mintNFT = async () => {
    console.log('🎯 USER-PAYS MINTING SYSTEM');
    if (!isWalletConnected || !walletAddress) {
      toast.error('👛 Please connect your wallet first!');
      return;
    }

    setIsMinting(true);
    
    try {
      console.log('🚀 Starting user-pays minting...');
      console.log('👤 User wallet:', walletAddress);
      console.log('💰 User will pay:', (mintQuantity * 0.1).toFixed(1), 'SOL + fees');
      
      // Get the Solana provider
      const provider = (window as any).solana || (window as any).phantom?.solana;
      
      if (!provider) {
        throw new Error('Solana wallet not found');
      }

      // Create connection
      const { Connection, PublicKey, LAMPORTS_PER_SOL } = await import('@solana/web3.js');
      const connection = new Connection('https://rpc.helius.xyz/?api-key=d4623b1b-e39d-4de0-89cd-3316afb58d20', 'confirmed');
      
      // Check user balance
      const userBalance = await connection.getBalance(new PublicKey(walletAddress));
      const userBalanceSOL = userBalance / LAMPORTS_PER_SOL;
      const requiredSOL = (mintQuantity * 0.1) + 0.01;
      
      console.log('💰 User balance:', userBalanceSOL.toFixed(4), 'SOL');
      console.log('💸 Required:', requiredSOL.toFixed(2), 'SOL');
      
      if (userBalanceSOL < requiredSOL) {
        toast.error(`💰 Insufficient balance! You need ${requiredSOL.toFixed(2)} SOL (${(mintQuantity * 0.1).toFixed(1)} SOL for ${mintQuantity} NFT(s) + ~0.01 SOL fees). You have ${userBalanceSOL.toFixed(4)} SOL.`);
        return;
      }

      // Show user what they'll pay
      toast.info(`💰 You will pay: ${(mintQuantity * 0.1).toFixed(1)} SOL for ${mintQuantity} NFT(s) + transaction fees`);
      
      // USER-PAYS MINTING via Backend API
      console.log('🎯 Starting USER-PAYS minting via backend...');
      
      const response = await fetch(`${API_BASE_URL}/mint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: walletAddress, quantity: mintQuantity }),
      });

      const result = await response.json();
      console.log('Mint result:', result);

      if (response.ok) {
        toast.success(`🎉 Successfully minted ${mintQuantity} NFT(s)! Check your wallet.`);
        fetchCollectionStatus();
        setSuccessData({
          mint: result.mint,
          signature: result.signature,
          image: result.image || '/nfts/1.png',
          wallet: result.wallet,
          quantity: result.quantity
        });
        setShowSuccessModal(true);
      } else {
        if (result.isInsufficientFunds) {
          toast.error(`💰 ${result.message}`);
        } else if (result.isSoldOut) {
          toast.error(`🚫 ${result.message}`);
          setIsSoldOut(true);
        } else {
          toast.error(`❌ ${result.error}: ${result.message}`);
        }
      }

    } catch (error: any) {
      console.error('❌ Minting error:', error);
      toast.error(`Error: ${error.message || 'Unknown error'}`);
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
                            {isMinting ? 'Minting...' : `Mint ${mintQuantity} for ${(mintQuantity * 0.1).toFixed(1)} SOL (You Pay)`}
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