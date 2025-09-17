import React from "react";
import Footer from "../Footer/Footer"; // Impor Footer di sini
import "./LoadingMore.css";

const loadingAnimation = "/assets/loading-more.gif";
const LoadingMore = ({ isLoading, onLoadMore }) => {
  return (
    <div className="loading-more-container">
      {isLoading ? (
        // Tampilkan animasi jika sedang loading
        <img
          src={loadingAnimation}
          alt="Loading..."
          className="loading-more-gif"
        />
      ) : (
        // Tampilkan tombol dan footer jika tidak sedang loading
        <div className="load-more-content">
          <div className="load-more-wrapper">
            <button onClick={onLoadMore} className="load-more-button">
              Load More
            </button>
          </div>
          <Footer />
        </div>
      )}
    </div>
  );
};

export default LoadingMore;
