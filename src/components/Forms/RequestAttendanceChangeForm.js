import React, { useState } from "react";

const RequestAttendanceChangeForm = ({ contract, account }) => {
  const [classId, setClassId] = useState("");
  const [studentAddress, setStudentAddress] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await contract.methods
        .requestAdjustment(classId, studentAddress)
        .send({ from: account });
      setMessage("Adjustment requested successfully!");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Request Attendance Change</h3>
      <input
        type="number"
        placeholder="Class ID"
        value={classId}
        onChange={(e) => setClassId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Student Address (0x...)"
        value={studentAddress}
        onChange={(e) => setStudentAddress(e.target.value)}
      />
      <button type="submit" className="att">Request</button>
      <p>{message}</p>
    </form>
  );
};

export default RequestAttendanceChangeForm;