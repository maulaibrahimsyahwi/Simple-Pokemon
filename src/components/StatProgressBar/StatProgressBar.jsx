import { useState, useEffect } from "react";
import "./StatProgressBar.css";

function StatProgressBar({ statName, value1, value2 }) {
  const [displayedValue1, setDisplayedValue1] = useState(0);
  const [displayedValue2, setDisplayedValue2] = useState(0);

  // States baru untuk animasi bar, dimulai dari 50%
  const [barWidth1, setBarWidth1] = useState(50);
  const [barWidth2, setBarWidth2] = useState(50);

  useEffect(() => {
    let animationFrameId;
    const duration = 1000;
    const startTime = performance.now();

    // Animasi angka berjalan segera
    const animateNumber = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      setDisplayedValue1(Math.floor(progress * value1));
      setDisplayedValue2(Math.floor(progress * value2));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateNumber);
      }
    };

    // Tunda sedikit pembaruan state untuk bar agar transisi berjalan
    const delayId = setTimeout(() => {
      const total = value1 + value2;
      setBarWidth1((value1 / total) * 100);
      setBarWidth2((value2 / total) * 100);
    }, 100);

    requestAnimationFrame(animateNumber);

    return () => {
      clearTimeout(delayId);
      cancelAnimationFrame(animationFrameId);
    };
  }, [value1, value2]);

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
          style={{ width: `${barWidth1}%` }}
        ></div>
        <div
          className="bar-segment pokemon2-segment"
          style={{ width: `${barWidth2}%` }}
        ></div>
      </div>
    </div>
  );
}

export default StatProgressBar;
