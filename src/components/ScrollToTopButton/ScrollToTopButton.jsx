import { useState, useEffect, useRef } from "react";
import "./ScrollToTopButton.css";
import { FaCaretUp } from "react-icons/fa";

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeoutRef = useRef(null); // Gunakan useRef untuk menyimpan ID timeout

  // Fungsi untuk menampilkan tombol saat halaman di-scroll ke bawah
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Menambahkan event listener saat komponen dimuat
  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Fungsi untuk menampilkan tooltip dengan delay
  const handleMouseEnter = () => {
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 500); // Delay 500 ms
  };

  // Fungsi untuk menyembunyikan tooltip segera dan membatalkan delay
  const handleMouseLeave = () => {
    clearTimeout(tooltipTimeoutRef.current);
    setShowTooltip(false);
  };

  return (
    <div className={`scroll-to-top ${isVisible ? "visible" : ""}`}>
      <div
        className="scroll-button-wrapper"
        onMouseEnter={handleMouseEnter} // Terapkan fungsi baru
        onMouseLeave={handleMouseLeave} // Terapkan fungsi baru
      >
        <FaCaretUp onClick={scrollToTop} className="scroll-button" />
        {showTooltip && (
          <span className="scroll-button-tooltip">Back To Top</span>
        )}
      </div>
    </div>
  );
}

export default ScrollToTopButton;
