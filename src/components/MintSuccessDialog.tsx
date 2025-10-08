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
            <DialogContent className="max-w-md rounded-3xl bg-gradient-to-br from-card to-background border-4 border-primary font-fredoka">
                <div className="text-center space-y-6 p-4">
                    <h2 className="font-luckiest text-4xl text-primary animate-bounce-in">
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

                    <div className="space-y-2">
                        <p className="text-lg font-semibold text-foreground">
                            Your DapperDoggo has been minted!
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Welcome to the pack! 🐕
                        </p>
                    </div>

                    <div className="bg-muted/50 rounded-2xl p-4 space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Transaction Hash
                        </p>
                        <div className="flex items-center justify-between gap-2 bg-card rounded-xl p-3">
                            <code className="text-xs font-mono text-foreground truncate flex-1">
                                {txHash}
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
                                className="h-8 w-8"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="hero"
                            onClick={shareOnTwitter}
                            className="flex-1"
                        >
                            <Twitter className="h-5 w-5" />
                            Share on Twitter
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => onOpenChange(false)}
                            className="flex-1"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
