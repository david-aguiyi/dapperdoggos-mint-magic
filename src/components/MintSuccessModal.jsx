import React from 'react';
import './MintSuccessModal.css';

const MintSuccessModal = ({ isOpen, onClose, mintData }) => {
  if (!isOpen || !mintData) return null;

  const { mint, signature, image, wallet, quantity } = mintData;
  
  // Truncate transaction hash for display
  const truncateHash = (hash) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  // Twitter post template
  const twitterText = `🎉 Just minted ${quantity} DapperDoggo${quantity > 1 ? 's' : ''} NFT${quantity > 1 ? 's' : ''}! 🐕✨\n\n#DapperDoggos #NFT #Solana #Web3\n\nCheck out my new collection!`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;

  return (
    <div className="mint-success-overlay" onClick={onClose}>
      <div className="mint-success-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="close-btn" onClick={onClose}>
          <i className="fa-solid fa-times"></i>
        </button>

        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon">🎉</div>
          <h2 className="success-title">Mint Successful!</h2>
          <p className="success-message">
            Congratulations! You've successfully minted {quantity} DapperDoggo{quantity > 1 ? 's' : ''}!
          </p>
        </div>

        {/* NFT Images */}
        <div className="nft-images-container">
          <div className="nft-image-wrapper">
            {image ? (
              <img src={image} alt="Minted NFT" className="nft-image" />
            ) : (
              <div className="nft-placeholder">
                <i className="fa-solid fa-image"></i>
                <span>NFT Image</span>
              </div>
            )}
            {quantity > 1 && (
              <div className="quantity-badge">+{quantity - 1}</div>
            )}
          </div>
        </div>

        {/* Transaction Info */}
        <div className="transaction-info">
          <div className="info-item">
            <span className="info-label">Transaction:</span>
            <a 
              href={`https://explorer.solana.com/tx/${signature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="transaction-link"
            >
              {truncateHash(signature)}
              <i className="fa-solid fa-external-link-alt"></i>
            </a>
          </div>
          <div className="info-item">
            <span className="info-label">Wallet:</span>
            <span className="wallet-address">
              {wallet.slice(0, 6)}...{wallet.slice(-4)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <a 
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="twitter-btn"
          >
            <i className="fa-brands fa-twitter"></i>
            Share on Twitter
          </a>
          <button className="close-modal-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MintSuccessModal;
