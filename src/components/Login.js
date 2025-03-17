import React, { useState } from "react";

const Login = ({ onLogin }) => {
  const [message, setMessage] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const handleLogin = async () => {
    if (!window.ethereum) {
      setMessage("Please install MetaMask to login.");
      return;
    }

    if (isConnecting) {
      setMessage("Connection request already in progress. Please check MetaMask.");
      return;
    }

    setIsConnecting(true);
    setMessage("Connecting to MetaMask...");

    try {
      // Check if already connected
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        onLogin(accounts[0]);
        setMessage("Successfully logged in!");
      } else {
        // Request account access
        const newAccounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        if (newAccounts.length > 0) {
          onLogin(newAccounts[0]);
          setMessage("Successfully logged in!");
        } else {
          setMessage("No accounts found. Please connect your wallet.");
        }
      }
    } catch (error) {
      if (error.code === -32002) {
        setMessage("A MetaMask request is already pending. Please check your MetaMask extension.");
      } else {
        setMessage(`Login failed: ${error.message}`);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h2>Login to College Attendance</h2>
      <p>Please connect your MetaMask wallet to access the app.</p>
      <button
        onClick={handleLogin}
        disabled={isConnecting}
        style={{ padding: "10px 20px", fontSize: "16px" }}
      >
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Login;