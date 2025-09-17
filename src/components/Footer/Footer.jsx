import { useTranslation } from "react-i18next";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import "./Footer.css";

function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-left">
          <h3>{t("appTitle")}</h3>
          <p className="footer-tagline">{t("appTagline")}</p>
          <div className="footer-copyright">
            <p>{t("copyrightOwner", { year: currentYear })}</p>
            <p>{t("copyrightRights")}</p>
          </div>
        </div>

        <div className="footer-right">
          <div className="footer-connect">
            <h4>{t("connect")}</h4>
            <div className="footer-social-links">
              <a
                href="https://github.com/maulaibrahimsyahwi/simple-pokemon"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="GitHub"
              >
                <FaGithub />
              </a>
              <a
                href="https://www.linkedin.com/in/maulaibrahimsyahwi/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="LinkedIn"
              >
                <FaLinkedin />
              </a>
            </div>
          </div>
          <div className="footer-meta">
            <p>
              {t("madeWithReact")} | {t("footerAttribution")}{" "}
              <a
                href="https://pokeapi.co/"
                target="_blank"
                rel="noopener noreferrer"
              >
                PokéAPI
              </a>
            </p>
            <span onClick={handleBackToTop} className="back-to-top">
              {t("backToTop")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
