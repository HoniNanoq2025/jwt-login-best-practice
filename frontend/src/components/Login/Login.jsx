import { useState } from "react";
import { toast } from "react-toastify";
import styles from "./Login.module.css";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3042/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Login succesfuld!");

        onLogin(data.token);
      } else {
        toast.error(data.message || "Ugyldigt login");
      }
    } catch (err) {
      console.error("Fejl i handleSubmit:", err);
      toast.error("Noget gik galt ved login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.login} onSubmit={handleSubmit}>
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Adgangskode"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Logger ind..." : "Log ind"}{" "}
      </button>
    </form>
  );
}
