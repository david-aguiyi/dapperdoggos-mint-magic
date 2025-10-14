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
      
      // REAL MINTING - Create actual NFTs!
      console.log('🎯 Starting REAL minting with user wallet...');
      
      // Import Umi modules dynamically
      const { createUmi } = await import('@metaplex-foundation/umi-bundle-defaults');
      const { fetchCandyMachine, mintV2, mint } = await import('@metaplex-foundation/mpl-candy-machine');
      const { setComputeUnitLimit } = await import('@metaplex-foundation/mpl-toolbox');
      const { transactionBuilder, publicKey as umiPublicKey, generateSigner } = await import('@metaplex-foundation/umi');
      
      // Create Umi instance
      const umi = createUmi('https://rpc.helius.xyz/?api-key=d4623b1b-e39d-4de0-89cd-3316afb58d20');
      
      // Set user's wallet as the identity (they sign and pay)
      umi.identity = {
        publicKey: umiPublicKey(walletAddress),
        signMessage: async (message) => {
          const signature = await provider.signMessage(message);
          return signature.signature;
        },
        signTransaction: async (transaction) => {
          const signed = await provider.signTransaction(transaction);
          return signed;
        },
        signAllTransactions: async (transactions) => {
          const signed = await provider.signAllTransactions(transactions);
          return signed;
        }
      };
      
      // Register Candy Machine program
      const { mplCandyMachine } = await import('@metaplex-foundation/mpl-candy-machine');
      umi.use(mplCandyMachine());
      
      // Fetch Candy Machine
      const candyMachineAddress = umiPublicKey('4b7xP29PX6CvwQV6x37GABKRiDE7kMx8Jht7hwuX7WBt');
      const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);
      
      console.log('🍬 Candy Machine loaded:', {
        address: candyMachine.publicKey,
        itemsRedeemed: candyMachine.itemsRedeemed.toString(),
        itemsAvailable: candyMachine.data.itemsAvailable.toString(),
      });
      
      // Check if sold out
      const remaining = candyMachine.data.itemsAvailable.toNumber() - candyMachine.itemsRedeemed.toNumber();
      if (remaining < mintQuantity) {
        toast.error(`🚫 Not enough NFTs available! Only ${remaining} remaining.`);
        return;
      }
      
      // Mint NFTs
      const mintResults = [];
      
      for (let i = 0; i < mintQuantity; i++) {
        console.log(`📦 Minting NFT ${i + 1}/${mintQuantity}...`);
        
        // Generate new NFT mint account
        const nftMint = generateSigner(umi);
        
        try {
          // Try mintV2 first, fallback to mint if it fails
          let tx;
          try {
            console.log('🎯 Attempting mintV2 (with guard)...');
            tx = await transactionBuilder()
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
          } catch (mintV2Error) {
            console.log('⚠️ mintV2 failed:', mintV2Error.message);
            console.log('🔄 Falling back to standard mint...');
            
            // Fallback to standard mint
            tx = await transactionBuilder()
              .add(setComputeUnitLimit(umi, { units: 800_000 }))
              .add(
                mint(umi, {
                  candyMachine: candyMachine.publicKey,
                  nftMint,
                  collectionMint: candyMachine.collectionMint,
                  collectionUpdateAuthority: candyMachine.authority,
                })
              )
              .sendAndConfirm(umi);
          }
          
          console.log(`✅ Successfully minted NFT ${i + 1}!`);
          console.log('📝 Transaction signature:', tx.signature);
          
          mintResults.push({
            mint: nftMint.publicKey,
            signature: tx.signature,
            name: `DapperDoggo #${candyMachine.itemsRedeemed.toNumber() + i + 1}`
          });
          
        } catch (mintError) {
          console.error(`❌ Failed to mint NFT ${i + 1}:`, mintError);
          throw new Error(`Failed to mint NFT ${i + 1}: ${mintError.message}`);
        }
      }
      
      // Success!
      console.log('🎉 ALL NFTS MINTED SUCCESSFULLY!');
      toast.success(`🎉 Successfully minted ${mintQuantity} NFT(s)! Check your wallet.`);
      
      // Update collection status
      fetchCollectionStatus();
      
      // Show success modal
      setSuccessData({
        mint: mintResults[0].mint.toString(),
        signature: mintResults[0].signature.toString(),
        image: '/nfts/1.png', // Default image
        wallet: walletAddress,
        quantity: mintQuantity
      });
      setShowSuccessModal(true);

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