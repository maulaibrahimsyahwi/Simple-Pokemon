import { useState, useEffect, useRef } from "react";
import "./ScrollToTopButton.css";
import { FaCaretUp } from "react-icons/fa";

function ScrollToTopButton({ isOverlayOpen }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeoutRef = useRef(null);
  const footerRef = useRef(null);

  useEffect(() => {
    // Menemukan elemen footer sekali saat komponen dimuat
    footerRef.current = document.querySelector(".footer-container");
  }, []);

  const toggleVisibility = () => {
    const footer = footerRef.current;
    let isFooterVisible = false;

    if (footer) {
      const footerRect = footer.getBoundingClientRect();
      // Cek apakah bagian atas footer terlihat di layar
      isFooterVisible = footerRect.top < window.innerHeight;
    }

    // Tampilkan tombol jika scroll > 300px DAN footer tidak terlihat
    if (window.scrollY > 300 && !isFooterVisible) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    // Panggil sekali untuk memeriksa posisi saat load
    toggleVisibility();

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

  const handleMouseEnter = () => {
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    clearTimeout(tooltipTimeoutRef.current);
    setShowTooltip(false);
  };

  return (
    <div
      className={`scroll-to-top ${
        isVisible && !isOverlayOpen ? "visible" : ""
      }`}
    >
      <div
        className="scroll-button-wrapper"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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
