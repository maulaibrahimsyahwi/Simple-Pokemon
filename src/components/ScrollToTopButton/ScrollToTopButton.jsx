import { useState, useEffect } from "react";
import "./ScrollToTopButton.css";

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

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

    // Membersihkan event listener saat komponen dibongkar
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  // Fungsi untuk scroll ke atas secara perlahan
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="scroll-to-top">
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="scroll-button"
          title="Kembali ke atas"
        >
          ▲
        </button>
      )}
    </div>
  );
}

export default ScrollToTopButton;
