import { useState, useEffect } from "react";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./components/Login/Login";
import Profile from "./components/Profile/Profile";

import "./App.css";

export default function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);

  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <div className="app">
      {token ? (
        <Profile token={token} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}

      <ToastContainer position="top-center" autoClose={2500} />
    </div>
  );
}
