import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MintSuccessDialog } from "@/components/MintSuccessDialog";
import { useConfetti } from "@/hooks/useConfetti";
import { DogTicker } from "@/components/DogTicker";
import dogNft from "@/assets/dapper-dog-nft.jpg";

const Index = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [mintedCount, setMintedCount] = useState(342);
  const [isMinting, setIsMinting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [txHash, setTxHash] = useState("");
  const { fireConfetti } = useConfetti();

  // Simulate real-time minting by incrementing counter
  useEffect(() => {
    const interval = setInterval(() => {
      setMintedCount(prev => {
        if (prev >= 1000) return 1000;
        return prev + Math.floor(Math.random() * 3);
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const connectWallet = async () => {
    const mockAddress = "0x" + Math.random().toString(16).substr(2, 40);
    setWalletAddress(mockAddress);
    setIsWalletConnected(true);
    toast({
      title: "Wallet Connected! 🎉",
      description: "Ready to mint your DapperDoggo!",
    });
  };

  const mintNFT = async () => {
    setIsMinting(true);
    
    setTimeout(() => {
      const mockTxHash = "0x" + Math.random().toString(16).substr(2, 64);
      setTxHash(mockTxHash);
      setMintedCount(prev => Math.min(prev + 1, 1000));
      setIsMinting(false);
      setShowSuccessDialog(true);
      fireConfetti();
      
      toast({
        title: "Mint Successful! 🎊",
        description: "Your DapperDoggo has been minted!",
      });
    }, 2500);
  };

  const progress = (mintedCount / 1000) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-purple-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center font-luckiest text-white text-xl">
            DD
          </div>
          <h2 className="font-luckiest text-2xl text-foreground">DapperDoggos</h2>
        </div>

        <nav className="hidden md:flex gap-8 font-fredoka font-semibold text-foreground/70">
          <a href="#" className="hover:text-foreground transition-colors">Home</a>
          <a href="#" className="hover:text-foreground transition-colors">Mint</a>
          <a href="#" className="hover:text-foreground transition-colors">Gallery</a>
          <a href="#" className="hover:text-foreground transition-colors">Rarity</a>
        </nav>

        {!isWalletConnected ? (
          <Button variant="hero" onClick={connectWallet}>
            <Wallet className="mr-2 h-5 w-5" />
            Connect Wallet
          </Button>
        ) : (
          <div className="bg-card border-2 border-primary/20 rounded-full px-5 py-3 flex items-center gap-2">
            <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
            <span className="font-fredoka font-semibold text-sm text-foreground">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-8">
        {/* Minting Live Badge */}
        <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border-2 border-primary/20 shadow-lg">
          <p className="font-fredoka font-semibold text-primary flex items-center gap-2">
            <Sparkles className="h-4 w-4 animate-pulse" />
            Minting Now Live
          </p>
        </div>

        {/* Title */}
        <div className="text-center mb-8 max-w-4xl">
          <h1 className="font-luckiest text-6xl md:text-7xl mb-4">
            <span className="text-foreground">Mint Your</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
              DapperDoggo
            </span>
          </h1>
          <p className="font-fredoka text-lg text-foreground/70 max-w-2xl mx-auto">
            Join the revolution of digital collectibles. Each DapperDoggo is a unique NFT with rare traits and exclusive benefits.
          </p>
        </div>

        {/* Mint Counter & Button */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-xl w-full space-y-6 border-2 border-primary/10 mb-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-fredoka text-sm text-foreground/60">Minted</span>
              <span className="font-fredoka font-bold text-2xl text-foreground">
                <span className="text-primary">{mintedCount}</span> / 1000
              </span>
            </div>
            <div className="relative h-3 bg-muted/30 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Button 
            variant="hero" 
            size="lg"
            className="w-full text-xl py-6"
            disabled={!isWalletConnected || isMinting || mintedCount >= 1000}
            onClick={mintNFT}
          >
            {!isWalletConnected ? (
              "Connect Wallet to Mint"
            ) : isMinting ? (
              <>
                <Sparkles className="mr-2 h-6 w-6 animate-spin" />
                Minting...
              </>
            ) : mintedCount >= 1000 ? (
              "Sold Out!"
            ) : (
              "Mint Now for 0.08 ETH"
            )}
          </Button>
        </div>

        {/* Dog Ticker */}
        <DogTicker />
      </main>

      {/* Success Dialog */}
      <MintSuccessDialog 
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        nftImage={dogNft}
        txHash={txHash}
      />
    </div>
  );
};

export default Index;