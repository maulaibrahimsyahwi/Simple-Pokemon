import React from "react";
import "./StatProgressBar.css";

function StatProgressBar({ statName, value1, value2 }) {
  const total = value1 + value2;
  const percentage1 = (value1 / total) * 100;
  const percentage2 = (value2 / total) * 100;

  return (
    <div className="stat-progress-bar-container">
      <div className="stat-label-container">
        <span className="stat-value pokemon1-value">{value1}</span>
        <span className="stat-name">{statName.toUpperCase()}</span>
        <span className="stat-value pokemon2-value">{value2}</span>
      </div>
      <div className="bar-wrapper">
        <div
          className="bar-segment pokemon1-segment"
          style={{ width: `${percentage1}%` }}
        ></div>
        <div
          className="bar-segment pokemon2-segment"
          style={{ width: `${percentage2}%` }}
        ></div>
      </div>
    </div>
  );
}

export default StatProgressBar;
