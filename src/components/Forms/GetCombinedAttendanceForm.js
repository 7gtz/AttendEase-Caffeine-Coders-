import React, { useState } from "react";

const GetCombinedAttendanceForm = ({ contract, account }) => {
  const [studentAddress, setStudentAddress] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await contract.methods
        .getCombinedAttendance(studentAddress, sectionId)
        .call({ from: account });
      setMessage(`Attended: ${result.attended}, Total: ${result.total}`);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Get Combined Attendance</h3>
      <input
        type="text"
        placeholder="Student Address (0x...)"
        value={studentAddress}
        onChange={(e) => setStudentAddress(e.target.value)}
      />
      <input
        type="number"
        placeholder="Section ID"
        value={sectionId}
        onChange={(e) => setSectionId(e.target.value)}
      />
      <button type="submit" className="att">Get Attendance</button>
      <p>{message}</p>
    </form>
  );
};

export default GetCombinedAttendanceForm;