import React from "react";
import "./ErrorDisplay.css";

function ErrorDisplay({ message, onRetry }) {
  return (
    <div className="error-container">
      <h3>Oops! Terjadi Kesalahan</h3>
      <p>{message || "Gagal memuat data. Periksa koneksi internet Anda."}</p>
      <button onClick={onRetry} className="retry-button">
        Coba Lagi
      </button>
    </div>
  );
}

export default ErrorDisplay;
