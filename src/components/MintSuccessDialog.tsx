import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Twitter } from "lucide-react";

interface MintSuccessDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    nftImage: string;
    txHash: string;
}

export const MintSuccessDialog = ({
    open,
    onOpenChange,
    nftImage,
    txHash,
}: MintSuccessDialogProps) => {
    const shareOnTwitter = () => {
        const text = "Just minted my DapperDoggo NFT! 🐶✨ #DapperDoggos #NFT";
        window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
            "_blank"
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg w-full rounded-3xl bg-gradient-to-br from-card to-background border-4 border-primary font-fredoka">
                <div className="text-center space-y-3 p-3">
                    <h2 className="font-luckiest text-2xl text-primary animate-bounce-in">
                        Congrats! 🎉
                    </h2>

                    <div className="relative mx-auto w-48 h-48">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-3xl animate-pulse-glow" />
                        <img
                            src={nftImage}
                            alt="Your DapperDoggo NFT"
                            className="relative rounded-2xl w-full h-full object-cover border-4 border-card"
                        />
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">
                            Your DapperDoggo has been minted!
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Welcome to the pack! 🐕
                        </p>
                    </div>

                    <div className="bg-muted/50 rounded-2xl p-2 space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Transaction Hash
                        </p>
                        <div className="flex items-center gap-2 bg-card rounded-xl p-2">
                            <code className="text-sm font-mono text-foreground flex-1 min-w-0">
                                {txHash.length > 20 
                                    ? `${txHash.slice(0, 10)}...${txHash.slice(-10)}` 
                                    : txHash}
                            </code>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                    window.open(
                                        `https://explorer.solana.com/tx/${txHash}?cluster=devnet`,
                                        "_blank"
                                    )
                                }
                                className="h-7 w-7 flex-shrink-0"
                                title="View on Solana Explorer"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-center">
                        <Button
                            variant="hero"
                            onClick={shareOnTwitter}
                            className="w-32 text-sm py-3"
                        >
                            <Twitter className="h-4 w-4 mr-2" />
                            Share
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => onOpenChange(false)}
                            className="w-32 text-sm py-3"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
