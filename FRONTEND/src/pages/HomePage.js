import React from "react";

const HomePage = () => {
  return (
    <div className="view">
    <div className="photo">
      <img className="logo" src="/finallogo.jpg" alt="My Image"  />
    </div>
    <div className="home">
      <h2>Welcome to AttendEase!</h2>
      <p>
        Manage your college attendance on the Educhain network. Navigate to the appropriate dashboard:
      </p>
      <p className="desc">
      AttendEase is a Web3-based attendance system that ensures secure, transparent, and fraud-proof tracking using blockchain and smart contracts. Students check in via geohash, and records are immutably stored. With Web3 wallet authentication and real-time access, it streamlines attendance management while eliminating manual errors and tampering. 
      </p>
    </div>
  </div>
  );
};

export default HomePage;