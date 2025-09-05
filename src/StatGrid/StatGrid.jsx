import React from "react";
import { colours } from "../data/colours";
import "./StatGrid.css";

function StatGrid({ stats, winningStats = [], showBreakdown = false }) {
  if (!stats) return null;

  const statKeys = Object.keys(stats);

  return (
    <div className="stats-grid">
      {statKeys.map((statName) => {
        const statInfo = winningStats.find((s) => s.statName === statName);
        const isWinning =
          showBreakdown && statInfo && statInfo.winStatus !== "tie";
        const statValue = stats[statName];
        const statColor =
          colours[statName] ||
          (statName === "hp"
            ? "#f54242"
            : statName === "attack"
            ? "#f58a42"
            : statName === "defense"
            ? "#72f542"
            : statName === "special-attack"
            ? "#42b6f5"
            : statName === "special-defense"
            ? "#4269f5"
            : statName === "speed"
            ? "#f5e142"
            : "");

        return (
          <div key={statName} className="stat-item">
            <span className="stat-name" style={{ backgroundColor: statColor }}>
              {statName.toUpperCase().replace("-", ".")}
            </span>
            <span className={`stat-value ${isWinning ? "winning" : ""}`}>
              {statValue}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default StatGrid;
