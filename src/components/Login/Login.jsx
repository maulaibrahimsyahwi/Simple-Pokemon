import { useState } from "react";
import { useTranslation } from "react-i18next"; // Impor useTranslation
import "./Login.css";

function Login({ setIsLogin }) {
  const { t } = useTranslation(); // Gunakan hook useTranslation
  const [user, setUser] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleChange = (event) => {
    setUser({
      ...user,
      [event.target.name]: event.target.value,
    });
  };

  const handleLogin = (event) => {
    event.preventDefault();
    if (user.username?.toLowerCase() === "admin" && user.password === "admin") {
      setIsLogin(true);
    } else {
      setError(t("loginError"));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <img
          src="../../../public/Pokemon.webp"
          alt="Pokeball Logo"
          className="login-logo"
        />
        <h1>{t("loginWelcome")}</h1>
        <p className="login-subtitle">{t("loginSubtitle")}</p>

        <div className="input-group">
          <input
            type="text"
            name="username"
            placeholder={t("usernamePlaceholder")}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group password-group">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder={t("passwordPlaceholder")}
            onChange={handleChange}
            required
          />
          <span
            onClick={togglePasswordVisibility}
            className="password-toggle-icon"
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <p className="hint-toggle" onClick={() => setShowHint(true)}>
          {t("hintToggle")}
        </p>

        {showHint && (
          <div className="hint-box">
            <p>
              <strong>{t("hintUsername")}</strong>
            </p>
            <p>
              <strong>{t("hintPassword")}</strong>
            </p>
          </div>
        )}

        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="login-button">
          {t("loginButton")}
        </button>
      </form>
    </div>
  );
}

export default Login;
