import React, { useState } from "react";

const RemoveStudentForm = ({ contract, account }) => {
  const [sectionId, setSectionId] = useState("");
  const [studentAddress, setStudentAddress] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await contract.methods
        .removeStudent(sectionId, studentAddress)
        .send({ from: account });
      setMessage("Student removed successfully!");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Remove Student</h3>
      <input
        type="number"
        placeholder="Section ID"
        value={sectionId}
        onChange={(e) => setSectionId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Student Address (0x...)"
        value={studentAddress}
        onChange={(e) => setStudentAddress(e.target.value)}
      />
      <button type="submit">Remove</button>
      <p>{message}</p>
    </form>
  );
};

export default RemoveStudentForm;