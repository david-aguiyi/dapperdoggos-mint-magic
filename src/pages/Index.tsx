import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MintSuccessDialog } from "@/components/MintSuccessDialog";
import { useConfetti } from "@/hooks/useConfetti";
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
    }, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const connectWallet = async () => {
    // Simulate wallet connection
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
    
    // Simulate minting transaction
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-accent/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="relative z-10 max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="font-luckiest text-6xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent animate-bounce-in">
            DapperDoggos
          </h1>
          <p className="font-fredoka text-xl text-muted-foreground">
            Adopt your unique digital pup! 🐕
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-card rounded-[2.5rem] shadow-[var(--shadow-playful)] p-8 space-y-6 border-4 border-primary/20">
          {/* Wallet Connection */}
          <div className="flex justify-between items-center">
            {!isWalletConnected ? (
              <Button 
                variant="outline" 
                onClick={connectWallet}
                className="flex-1"
              >
                <Wallet className="mr-2 h-5 w-5" />
                Connect Wallet
              </Button>
            ) : (
              <div className="flex-1 bg-muted/50 rounded-full px-5 py-3 flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
                <span className="font-fredoka font-semibold text-sm text-foreground">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
            )}
          </div>

          {/* NFT Display */}
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-primary via-secondary to-accent rounded-[2rem] opacity-75 group-hover:opacity-100 blur transition duration-500 animate-pulse-glow" />
            <div className="relative bg-card rounded-3xl p-4 shadow-2xl">
              <img 
                src={dogNft} 
                alt="DapperDoggo NFT" 
                className="w-full h-auto rounded-2xl animate-float"
              />
            </div>
          </div>

          {/* Mint Counter */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-fredoka font-bold text-3xl text-foreground">
                <span className="text-primary animate-pulse">{mintedCount}</span> / 1000
              </span>
              <span className="font-fredoka text-sm text-muted-foreground">
                Minted
              </span>
            </div>
            <div className="relative h-4 bg-muted rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Mint Button */}
          <Button 
            variant="hero" 
            size="lg"
            className="w-full"
            disabled={!isWalletConnected || isMinting || mintedCount >= 1000}
            onClick={mintNFT}
          >
            {!isWalletConnected ? (
              "Connect Wallet to Mint"
            ) : isMinting ? (
              <>
                <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                Minting...
              </>
            ) : mintedCount >= 1000 ? (
              "Sold Out!"
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Mint NFT - 0.05 ETH
              </>
            )}
          </Button>

          {/* Info */}
          <p className="text-center text-sm text-muted-foreground font-fredoka">
            Join the pack of adorable DapperDoggos! 🐾
          </p>
        </div>

        {/* Footer Links */}
        <div className="mt-6 flex justify-center gap-6 text-sm font-fredoka">
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
            About
          </a>
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
            Roadmap
          </a>
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
            Discord
          </a>
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
            Twitter
          </a>
        </div>
      </div>

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