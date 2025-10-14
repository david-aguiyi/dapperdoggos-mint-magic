import { useState, useEffect } from 'react';
import './App.css';
import DogTicker from './components/DogTicker';
import { useToast, ToastContainer } from './components/Toast';
import MintSuccessModal from './components/MintSuccessModal';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { mplCandyMachine, fetchCandyMachine, mintV2 } from '@metaplex-foundation/mpl-candy-machine';
import { setComputeUnitLimit } from '@metaplex-foundation/mpl-toolbox';
import { transactionBuilder, publicKey as umiPublicKey, generateSigner } from '@metaplex-foundation/umi';

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
      // Simple wallet connection - just like before
      const provider = (window as any).solana || (window as any).phantom?.solana;
      
      if (provider && provider.connect) {
        console.log('Wallet provider found:', provider);
        const response = await provider.connect();
        console.log('Wallet connected:', response.publicKey.toString());
        setWalletAddress(response.publicKey.toString());
        setIsWalletConnected(true);
        toast.success('Wallet connected successfully!');
      } else {
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
      console.log('🚀 Starting frontend minting with Umi...');
      
      // Get wallet provider
      const provider = (window as any).solana || (window as any).phantom?.solana;
      if (!provider) {
        toast.error('Wallet provider not found!');
        return;
      }

      // Candy Machine ID
      const CANDY_MACHINE_ID = '4b7xP29PX6CvwQV6x37GABKRiDE7kMx8Jht7hwuX7WBt';
      
      // Using Helius RPC with your free API key (100k requests/day)
      const RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=d4623b1b-e39d-4de0-89cd-3316afb58d20';
      
      const umi = createUmi(RPC_URL).use(walletAdapterIdentity(provider));
      
      console.log('✅ Umi initialized');

      // Fetch Candy Machine
      const candyMachineAddress = umiPublicKey(CANDY_MACHINE_ID);
      const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);
      
      console.log('🍬 Candy Machine loaded:', {
        address: candyMachine.publicKey,
        itemsRedeemed: candyMachine.itemsRedeemed.toString(),
        itemsAvailable: candyMachine.data.itemsAvailable.toString(),
      });

      // Check if sold out
      const remaining = Number(candyMachine.data.itemsAvailable) - Number(candyMachine.itemsRedeemed);
      if (remaining < mintQuantity) {
        toast.error(`Only ${remaining} NFT(s) remaining!`);
        setIsMinting(false);
        return;
      }
      
      const mintResults = [];

      for (let i = 0; i < mintQuantity; i++) {
        console.log(`🎨 Minting NFT ${i + 1}/${mintQuantity}...`);

        // Generate new NFT mint account
        const nftMint = generateSigner(umi);

        // Build and send mint transaction
        const tx = await transactionBuilder()
          .add(setComputeUnitLimit(umi, { units: 800_000 }))
          .add(
            mintV2(umi, {
              candyMachine: candyMachine.publicKey,
              nftMint,
              collectionMint: candyMachine.collectionMint,
              collectionUpdateAuthority: candyMachine.authority,
            })
          )
          .sendAndConfirm(umi);

        console.log(`✅ NFT ${i + 1} minted!`);
        console.log('Signature:', tx.signature);
        
        mintResults.push({
          mint: nftMint.publicKey,
          signature: tx.signature,
        });
      }

      // Success!
      toast.success(`Successfully minted ${mintQuantity} NFT(s)! Check your wallet.`);
      fetchCollectionStatus();

      // Show success modal
        setSuccessData({
        mint: mintResults[0].mint.toString(),
        signature: Buffer.from(mintResults[0].signature).toString('base64'),
        image: '/nfts/1.png', // Placeholder
          wallet: walletAddress,
          quantity: mintQuantity
        });
        setShowSuccessModal(true);

    } catch (error: any) {
      console.error('❌ Minting error:', error);
      
      if (error.message?.includes('User rejected')) {
        toast.error('Transaction was rejected');
      } else if (error.message?.includes('insufficient')) {
        toast.error('Insufficient SOL balance');
      } else {
        toast.error(`Mint failed: ${error.message || 'Unknown error'}`);
      }
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
