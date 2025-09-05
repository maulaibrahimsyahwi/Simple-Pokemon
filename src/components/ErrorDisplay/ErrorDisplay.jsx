import React from "react";
import { useTranslation } from "react-i18next"; // Impor useTranslation
import "./ErrorDisplay.css";

function ErrorDisplay({ message, onRetry }) {
  const { t } = useTranslation(); // Gunakan hook useTranslation
  return (
    <div className="error-container">
      <h3>Oops! {t("errorMessage")}</h3>
      <p>{message || t("errorMessage")}</p>
      <button onClick={onRetry} className="retry-button">
        {t("retryButton")}
      </button>
    </div>
  );
}

export default ErrorDisplay;
