import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, Sparkles, Minus, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MintSuccessDialog } from "@/components/MintSuccessDialog";
import { useConfetti } from "@/hooks/useConfetti";
import { DogTicker } from "@/components/DogTicker";
import dogNft from "@/assets/dapper-dog-nft.jpg";
import { connectWallet, disconnectWallet, isWalletConnected as checkWalletConnected, getWalletAddress } from "@/utils/wallet";

const Index = () => {
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState("");
    const [mintedCount, setMintedCount] = useState(0);
    const [totalSupply, setTotalSupply] = useState(10);
    const [isSoldOut, setIsSoldOut] = useState(false);
    const [isLoadingCollection, setIsLoadingCollection] = useState(true);
    const [isMinting, setIsMinting] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [txHash, setTxHash] = useState("");
    const [nftImageUrl, setNftImageUrl] = useState<string | null>(null);
    const [mintQuantity, setMintQuantity] = useState(1);
    const { fireConfetti } = useConfetti();

    // Fetch collection status from backend
    const fetchCollectionStatus = async () => {
        try {
            const apiBase = "https://dapperdoggos-api.onrender.com";
            const response = await fetch(`${apiBase}/collection/status`);
            const data = await response.json();
            
            if (data.success) {
                setMintedCount(data.itemsRedeemed);
                setTotalSupply(data.totalItems);
                setIsSoldOut(data.isSoldOut);
            }
        } catch (error) {
            console.error("Failed to fetch collection status:", error);
            // Set default values if API fails
            setMintedCount(0);
            setTotalSupply(10);
            setIsSoldOut(false);
        } finally {
            setIsLoadingCollection(false);
        }
    };

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
        fetchCollectionStatus();
    }, []);

    // Refresh collection status periodically
    useEffect(() => {
        const interval = setInterval(() => {
            fetchCollectionStatus();
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const handleConnectWallet = async () => {
        console.log("🔗 Connect wallet button clicked!");
        try {
            console.log("📞 Calling connectWallet()...");
            const address = await connectWallet();
            console.log("✅ connectWallet returned:", address);
            
            if (address) {
                setWalletAddress(address);
                setIsWalletConnected(true);
                console.log("🎉 Wallet connected successfully!");
                toast({
                    title: "Wallet Connected! 🎉",
                    description: "Ready to mint your DapperDoggo!",
                });
            } else {
                console.log("❌ No address returned from connectWallet");
                toast({
                    title: "Connection Failed",
                    description: "Please install Phantom wallet or try again.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("💥 Wallet connection error:", error);
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

        // Prevent double-clicks and concurrent minting
        if (isMinting) {
            console.log("Mint already in progress, ignoring duplicate request");
            return;
        }

        setIsMinting(true);
        try {
            const apiBase = "https://dapperdoggos-api.onrender.com";
            const resp = await fetch(`${apiBase}/mint`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ wallet: walletAddress, quantity: mintQuantity }),
            });
            
            let json;
            try {
                json = await resp.json();
            } catch (e) {
                // If response is not JSON, create a basic error
                throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
            }
            
            if (!resp.ok) {
                // Create a more descriptive error with the backend response
                const errorMessage = json.error || json.message || "Mint failed";
                console.log("Backend response:", { status: resp.status, json, errorMessage });
                const error = new Error(errorMessage) as Error & { 
                    status?: number; 
                    isSoldOut?: boolean; 
                    isInsufficientFunds?: boolean;
                    isPartialMint?: boolean;
                    requiredAmount?: string;
                    currentBalance?: string;
                    mintedCount?: number;
                    requestedCount?: number;
                };
                error.status = resp.status;
                error.isSoldOut = json.isSoldOut || false;
                error.isInsufficientFunds = json.isInsufficientFunds || false;
                error.isPartialMint = json.isPartialMint || false;
                error.requiredAmount = json.requiredAmount;
                error.currentBalance = json.currentBalance;
                error.mintedCount = json.mintedCount;
                error.requestedCount = json.requestedCount;
                throw error;
            }

            const signature = json.signature || json.mint || "";
            const image = json.image || null;

            setTxHash(signature);
            setNftImageUrl(image);
            setShowSuccessDialog(true);
            fireConfetti();
            
            // Refresh collection status after successful mint
            await fetchCollectionStatus();

            toast({
                title: "Mint Successful! 🎊",
                description: json.message || "Your DapperDoggo has been minted!",
            });

            console.log("Mint success:", {
                signature,
                explorerUrl: json.explorerUrl,
                wallet: json.wallet
            });
        } catch (err: unknown) {
            console.error("Mint failed", err);
            const message =
                err && typeof err === "object" && "message" in err
                    ? (err as Record<string, unknown>)["message"]
                    : String(err);
            
            console.log("Error details:", { message, err, isSoldOut: (err as any)?.isSoldOut, isInsufficientFunds: (err as any)?.isInsufficientFunds, isPartialMint: (err as any)?.isPartialMint });
            
            // Check if it's a partial mint error (should be prevented now, but handle it)
            if (err && typeof err === "object" && "isPartialMint" in err && (err as any).isPartialMint) {
                const mintedCount = (err as any).mintedCount || 0;
                const requestedCount = (err as any).requestedCount || mintQuantity;
                toast({
                    title: "⚠️ Partial Mint Occurred",
                    description: `Only ${mintedCount} out of ${requestedCount} NFTs were minted. The remaining NFTs could not be minted due to insufficient balance. Please check your wallet.`,
                    variant: "destructive",
                    duration: 10000,
                });
                // Refresh collection status to show updated count
                await fetchCollectionStatus();
            }
            // Check if it's an insufficient funds error
            else if (err && typeof err === "object" && "isInsufficientFunds" in err && (err as any).isInsufficientFunds) {
                const requiredAmount = (err as any).requiredAmount || (mintQuantity * 0.1).toFixed(1);
                const currentBalance = (err as any).currentBalance;
                const balanceInfo = currentBalance ? ` You currently have ${currentBalance} SOL.` : '';
                toast({
                    title: "Insufficient Balance 💰",
                    description: `You need at least ${requiredAmount} SOL to mint ${mintQuantity} NFT${mintQuantity > 1 ? 's' : ''} (including gas fees).${balanceInfo} Please add more SOL to your wallet.`,
                    variant: "destructive",
                    duration: 8000,
                });
            }
            // Check if it's a sold out error from backend
            else if (err && typeof err === "object" && "isSoldOut" in err && (err as any).isSoldOut) {
                toast({
                    title: "Collection Sold Out! 🎉",
                    description: "All DapperDoggos have been minted! Check secondary markets.",
                    variant: "default",
                });
                setIsSoldOut(true);
            } else if (String(message).toLowerCase().includes('insufficient') || String(message).toLowerCase().includes('not enough sol')) {
                const requiredAmount = (mintQuantity * 0.1).toFixed(1);
                toast({
                    title: "Insufficient Balance 💰",
                    description: `You need at least ${requiredAmount} SOL to mint ${mintQuantity} NFT${mintQuantity > 1 ? 's' : ''}. Please add more SOL to your wallet and try again.`,
                    variant: "destructive",
                });
            } else if (String(message).toLowerCase().includes('sold out') || String(message).includes('0 item(s) available')) {
                toast({
                    title: "Collection Sold Out! 🎉",
                    description: "All DapperDoggos have been minted! Check secondary markets.",
                    variant: "default",
                });
                setIsSoldOut(true);
            } else if (String(message).includes('timeout') || String(message).includes('AccountNotFound') || String(message).includes('Command failed')) {
                toast({
                    title: "Network Issue",
                    description: "Solana network is experiencing connectivity issues. Please try again later.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Mint failed",
                    description: String(message),
                    variant: "destructive",
                });
            }
        } finally {
            setIsMinting(false);
        }
    };

    const progress = totalSupply > 0 ? (mintedCount / totalSupply) * 100 : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-purple-50 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="flex justify-end items-center px-8 py-6">
                {!isWalletConnected ? (
                    <Button 
                        variant="hero" 
                        onClick={() => {
                            console.log("🔘 Button clicked directly!");
                            handleConnectWallet();
                        }}
                        className="cursor-pointer hover:scale-105 transition-transform"
                    >
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
            <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-16">
                {/* Minting Live Badge */}
                <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 mb-2 border-2 border-primary/20 shadow-lg">
                    <p className="font-fredoka font-semibold text-sm text-primary flex items-center gap-2">
                        <Sparkles className="h-3 w-3 animate-pulse" />
                        Minting Now Live
                    </p>
                </div>

                {/* Title */}
                <div className="text-center mb-3 max-w-4xl">
                    <h1 className="font-luckiest text-6xl md:text-7xl mb-2">
                        <span className="text-foreground">Mint Your</span>
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                            DapperDoggo
                        </span>
                    </h1>
                    <p className="font-fredoka text-lg text-foreground/70 max-w-2xl mx-auto mb-3">
                        Join the revolution of digital collectibles. Each
                        DapperDoggo is a unique NFT with rare traits and
                        exclusive benefits.
                    </p>
                </div>

                {/* Dog Ticker */}
                <DogTicker />

                {/* Mint Counter & Button */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-4 border-2 border-primary/10 mt-3">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="font-fredoka text-xs text-foreground/60">
                                {isLoadingCollection ? "Loading..." : "Minted"}
                            </span>
                            <span className="font-fredoka font-bold text-lg text-foreground">
                                <span className="text-primary">
                                    {isLoadingCollection ? "..." : mintedCount}
                                </span>{" "}
                                / {totalSupply}
                            </span>
                        </div>
                        <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
                            <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Quantity Selector and Mint Button */}
                    <div className="flex items-center gap-3">
                        {/* Quantity Counter */}
                        <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2 border-2 border-primary/20">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg hover:bg-primary/20"
                                disabled={mintQuantity <= 1 || isMinting}
                                onClick={() => setMintQuantity(Math.max(1, mintQuantity - 1))}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-fredoka font-bold text-lg text-foreground min-w-[2rem] text-center">
                                {mintQuantity}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg hover:bg-primary/20"
                                disabled={isMinting || isSoldOut || mintQuantity >= (totalSupply - mintedCount)}
                                onClick={() => setMintQuantity(Math.min(totalSupply - mintedCount, mintQuantity + 1))}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Mint Button */}
                        <Button
                            variant="hero"
                            size="default"
                            className="flex-1 text-base py-4"
                            disabled={
                                !isWalletConnected ||
                                isMinting ||
                                isSoldOut ||
                                isLoadingCollection
                            }
                            onClick={mintNFT}
                        >
                            {isLoadingCollection ? (
                                "Loading..."
                            ) : isSoldOut ? (
                                "Sold Out! 🎉"
                            ) : !isWalletConnected ? (
                                "Connect Wallet"
                            ) : isMinting ? (
                                <>
                                    <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                                    Minting...
                                </>
                            ) : (
                                `Mint ${mintQuantity} for ${(mintQuantity * 0.1).toFixed(1)} SOL`
                            )}
                        </Button>
                    </div>
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
