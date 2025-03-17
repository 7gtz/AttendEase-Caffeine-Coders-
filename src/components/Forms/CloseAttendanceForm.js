import React, { useState } from "react";

const CloseAttendanceForm = ({ contract, account }) => {
  const [classId, setClassId] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await contract.methods
        .closeAttendance(classId)
        .send({ from: account });
      setMessage("Attendance closed successfully!");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Close Attendance</h3>
      <input
        type="number"
        placeholder="Class ID"
        value={classId}
        onChange={(e) => setClassId(e.target.value)}
      />
      <button type="submit">Close</button>
      <p>{message}</p>
    </form>
  );
};

export default CloseAttendanceForm;