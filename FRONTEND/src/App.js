import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useNavigate } from "react-router-dom";
import getWeb3 from "./utils/getWeb3";
import loadContract from "./utils/loadContract";
import Header from "./components/Header";
import Login from "./components/Login";
import PrivateRoute from "./components/PrivateRoute";
import AdminPage from "./pages/AdminPage";
import AttendancePage from "./pages/AttendancePage";
import HomePage from "./pages/HomePage";
import SectionsPage from "./pages/SectionsPage";
import StudentPage from "./pages/StudentPage";
import SubjectsPage from "./pages/SubjectsPage";
import TeacherPage from "./pages/TeacherPage";
import "./App.css";
import "./App2.css";


function App() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState("student"); // "admin", "teacher", "student"
  const [userName, setUserName] = useState("User");

  const handleLogin = async (account) => {
    try {
      const web3Instance = await getWeb3();
      if (web3Instance) {
        const contractInstance = await loadContract(web3Instance);
        setWeb3(web3Instance);
        setAccount(account);
        setContract(contractInstance);
        setIsAuthenticated(true);

        try {
          // First check if the contract is accessible
          const adminAddress = await contractInstance.methods.admin().call();
          console.log("Admin address:", adminAddress);
          
          // Then try to get the user name
          const name = await contractInstance.methods.getUserName(account).call();
          console.log("User name:", name);
          setUserName(name.length > 0 ? name : "User");
        } catch (error) {
          console.warn("Error fetching user data:", error);
          setUserName("User"); // Set default name if we can't fetch it
        }

        // For now, set everyone as admin for testing
        setRole("admin");
      }
    } catch (error) {
      console.error("Login error:", error);
      // Don't throw the error, just log it and continue
      setUserName("User");
      setRole("admin");
    }
  };
  
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0 && !isAuthenticated) {
          handleLogin(accounts[0]);
        }
      }
    };
    checkConnection();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          handleLogin(accounts[0]);
        } else {
          setIsAuthenticated(false);
          setAccount("");
          setContract(null);
          setWeb3(null);
          setRole("student");
        }
      });
    }
  }, [isAuthenticated]);

  return (
    <Router>
      <div className="App">
        {isAuthenticated && <Header account={account} role={role} userName={userName} />}
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route
            path="/"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <HomePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <AdminPage contract={contract} account={account} role={role} />
              </PrivateRoute>
            }
          />
          <Route
            path="/teacher"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <TeacherPage contract={contract} account={account} role={role} />
              </PrivateRoute>
            }
          />
          <Route
            path="/student"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <StudentPage contract={contract} account={account} role={role} />
              </PrivateRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <AttendancePage contract={contract} account={account} role={role} />
              </PrivateRoute>
            }
          />
          <Route
            path="/sections"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <SectionsPage contract={contract} account={account} role={role} />
              </PrivateRoute>
            }
          />
          <Route
            path="/subjects"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <SubjectsPage contract={contract} account={account} role={role} />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;