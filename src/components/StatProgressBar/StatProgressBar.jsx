import { useState, useEffect } from "react";
import "./StatProgressBar.css";

function StatProgressBar({ statName, value1, value2 }) {
  const [displayedValue1, setDisplayedValue1] = useState(0);
  const [displayedValue2, setDisplayedValue2] = useState(0);

  useEffect(() => {
    let animationFrameId;
    const duration = 1000; // 1 second animation
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      setDisplayedValue1(Math.floor(progress * value1));
      setDisplayedValue2(Math.floor(progress * value2));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [value1, value2]);

  const total = value1 + value2;
  const percentage1 = (value1 / total) * 100;
  const percentage2 = (value2 / total) * 100;

  return (
    <div className="stat-progress-bar-container">
      <div className="stat-label-container">
        <span className="stat-value pokemon1-value">{displayedValue1}</span>
        <span className="stat-name">{statName.toUpperCase()}</span>
        <span className="stat-value pokemon2-value">{displayedValue2}</span>
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
