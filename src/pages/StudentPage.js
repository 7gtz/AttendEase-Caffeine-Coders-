import React, { useState } from "react";
import MarkAttendanceForm from "../components/Forms/MarkAttendanceForm";

const StudentPage = ({ contract, account, role }) => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleSetName = async (e) => {
    e.preventDefault();
    try {
      await contract.methods.setUserName(name).send({ from: account });
      setMessage("Name set successfully!");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };
  return (
    <div>
      <h2>Student Dashboard</h2>
      {contract && account ? (
        <div>
          <p>Manage your attendance as a student.</p>
          <form onSubmit={handleSetName}>
            <input
              type="text"
              placeholder="Set your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength="32"
            />
            <button type="submit">Set Name</button>
            {message && <p>{message}</p>}
          </form>
          <MarkAttendanceForm contract={contract} account={account} />
        </div>
      ) : (
        <p>Please connect your wallet to access student features.</p>
      )}
    </div>
  );
};

export default StudentPage;