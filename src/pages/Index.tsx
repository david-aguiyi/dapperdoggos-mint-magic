import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MintSuccessDialog } from "@/components/MintSuccessDialog";
import { useConfetti } from "@/hooks/useConfetti";
import { DogTicker } from "@/components/DogTicker";
import dogNft from "@/assets/dapper-dog-nft.jpg";
import { connectWallet, disconnectWallet, isWalletConnected as checkWalletConnected, getWalletAddress } from "@/utils/wallet";

const Index = () => {
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState("");
    const [mintedCount, setMintedCount] = useState(342);
    const [isMinting, setIsMinting] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [txHash, setTxHash] = useState("");
    const [nftImageUrl, setNftImageUrl] = useState<string | null>(null);
    const { fireConfetti } = useConfetti();

    // Check for existing wallet connection on page load
    useEffect(() => {
        const checkWalletConnection = () => {
            if (checkWalletConnected()) {
                const address = getWalletAddress();
                if (address) {
                    setWalletAddress(address);
                    setIsWalletConnected(true);
                }
            }
        };

        checkWalletConnection();
    }, []);

    // Simulate real-time minting by incrementing counter
    useEffect(() => {
        const interval = setInterval(() => {
            setMintedCount((prev) => {
                if (prev >= 1000) return 1000;
                return prev + Math.floor(Math.random() * 3);
            });
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    const handleConnectWallet = async () => {
        try {
            const address = await connectWallet();
            if (address) {
                setWalletAddress(address);
                setIsWalletConnected(true);
                toast({
                    title: "Wallet Connected! 🎉",
                    description: "Ready to mint your DapperDoggo!",
                });
            } else {
                toast({
                    title: "Connection Failed",
                    description: "Please install Phantom wallet or try again.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Wallet connection error:", error);
            toast({
                title: "Connection Error",
                description: "Failed to connect wallet. Please try again.",
                variant: "destructive",
            });
        }
    };

    const mintNFT = async () => {
        if (!walletAddress) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your wallet first.",
                variant: "destructive",
            });
            return;
        }

        setIsMinting(true);
        try {
            const apiBase = process.env.VITE_API_URL || "http://localhost:3001";
            const resp = await fetch(`${apiBase}/mint`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ wallet: walletAddress }),
            });
            const json = await resp.json();
            if (!resp.ok) throw new Error(json.error || JSON.stringify(json));

            const signature = json.signature || json.mint || "";
            const image = json.image || null;

            setTxHash(signature);
            setNftImageUrl(image);
            setMintedCount((prev) => Math.min(prev + 1, 1000));
            setShowSuccessDialog(true);
            fireConfetti();

            toast({
                title: "Mint Successful! 🎊",
                description: "Your DapperDoggo has been minted!",
            });
        } catch (err: unknown) {
            console.error("Mint failed", err);
            const message =
                err && typeof err === "object" && "message" in err
                    ? (err as Record<string, unknown>)["message"]
                    : String(err);
            toast({
                title: "Mint failed",
                description: String(message),
            });
        } finally {
            setIsMinting(false);
        }
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
                    <h2 className="font-luckiest text-2xl text-foreground">
                        DapperDoggos
                    </h2>
                </div>

                {!isWalletConnected ? (
                    <Button variant="hero" onClick={handleConnectWallet}>
                        <Wallet className="mr-2 h-5 w-5" />
                        Connect Wallet
                    </Button>
                ) : (
                    <div className="bg-card border-2 border-primary/20 rounded-full px-5 py-3 flex items-center gap-2">
                        <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
                        <span className="font-fredoka font-semibold text-sm text-foreground">
                            {walletAddress.slice(0, 6)}...
                            {walletAddress.slice(-4)}
                        </span>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-8">
                {/* Minting Live Badge */}
                <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4 border-2 border-primary/20 shadow-lg">
                    <p className="font-fredoka font-semibold text-sm text-primary flex items-center gap-2">
                        <Sparkles className="h-3 w-3 animate-pulse" />
                        Minting Now Live
                    </p>
                </div>

                {/* Title */}
                <div className="text-center mb-6 max-w-4xl">
                    <h1 className="font-luckiest text-6xl md:text-7xl mb-4">
                        <span className="text-foreground">Mint Your</span>
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                            DapperDoggo
                        </span>
                    </h1>
                    <p className="font-fredoka text-lg text-foreground/70 max-w-2xl mx-auto mb-6">
                        Join the revolution of digital collectibles. Each
                        DapperDoggo is a unique NFT with rare traits and
                        exclusive benefits.
                    </p>
                </div>

                {/* Dog Ticker */}
                <DogTicker />

                {/* Mint Counter & Button */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-4 border-2 border-primary/10 mt-6">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="font-fredoka text-xs text-foreground/60">
                                Minted
                            </span>
                            <span className="font-fredoka font-bold text-lg text-foreground">
                                <span className="text-primary">
                                    {mintedCount}
                                </span>{" "}
                                / 1000
                            </span>
                        </div>
                        <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
                            <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <Button
                        variant="hero"
                        size="default"
                        className="w-full text-base py-4"
                        disabled={
                            !isWalletConnected ||
                            isMinting ||
                            mintedCount >= 1000
                        }
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
                            "Mint Now for 0.08 ETH"
                        )}
                    </Button>
                </div>
            </main>

            {/* Success Dialog */}
            <MintSuccessDialog
                open={showSuccessDialog}
                onOpenChange={setShowSuccessDialog}
                nftImage={nftImageUrl || dogNft}
                txHash={txHash}
            />
        </div>
    );
};

export default Index;
