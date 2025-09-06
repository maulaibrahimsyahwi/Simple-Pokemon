import { useState, useEffect } from "react";
import "./ScrollToTopButton.css";
import { FaCaretUp } from "react-icons/fa";

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false); // State untuk tooltip

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

  return (
    <div className={`scroll-to-top ${isVisible ? "visible" : ""}`}>
      <div
        className="scroll-button-wrapper"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
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
