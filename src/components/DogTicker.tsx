import './DogTicker.css';

function DogTicker() {
  // Array of NFT image numbers
  const nftImages = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45];

  return (
    <div className="dog-ticker-container">
      <div className="dog-ticker">
        <div className="dog-ticker-track">
          {/* First set of images */}
          {nftImages.map((num) => (
            <div key={`first-${num}`} className="dog-ticker-item">
              <img 
                src={`/nfts/${num}.png`} 
                alt={`DapperDoggo #${num}`}
                className="dog-ticker-image"
              />
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {nftImages.map((num) => (
            <div key={`second-${num}`} className="dog-ticker-item">
              <img 
                src={`/nfts/${num}.png`} 
                alt={`DapperDoggo #${num}`}
                className="dog-ticker-image"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DogTicker;
