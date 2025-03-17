import React, { useState } from "react";

const AddStudentForm = ({ contract, account }) => {
  const [sectionId, setSectionId] = useState("");
  const [studentAddress, setStudentAddress] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await contract.methods
        .addStudent(sectionId, studentAddress)
        .send({ from: account });
      setMessage("Student added successfully!");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Student</h3>
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
      <button type="submit">Add Student</button>
      <p>{message}</p>
    </form>
  );
};

export default AddStudentForm;