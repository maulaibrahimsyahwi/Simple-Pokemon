import { useState } from "react";
import "./Login.css";

function Login({ setIsLogin }) {
  const [user, setUser] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showHint, setShowHint] = useState(false); // State baru untuk hint box

  const handleChange = (event) => {
    setUser({
      ...user,
      [event.target.name]: event.target.value,
    });
  };

  const handleLogin = (event) => {
    event.preventDefault();
    if (user.username === "admin" && user.password === "admin") {
      setIsLogin(true);
    } else {
      setError("Username atau password salah!");
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
        <h1>Welcome, Trainer!</h1>
        <p className="login-subtitle">
          Masukkan kredensial untuk memulai petualanganmu.
        </p>

        <div className="input-group">
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group password-group">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
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

        {/* --- BAGIAN HINT BOX DIPERBARUI --- */}
        <p className="hint-toggle" onClick={() => setShowHint(true)}>
          Butuh petunjuk?
        </p>

        {showHint && (
          <div className="hint-box">
            <p>
              <strong>Username:</strong> admin
            </p>
            <p>
              <strong>Password:</strong> admin
            </p>
          </div>
        )}
        {/* --- AKHIR BAGIAN YANG DIPERBARUI --- */}

        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="login-button">
          Masuk
        </button>
      </form>
    </div>
  );
}

export default Login;
