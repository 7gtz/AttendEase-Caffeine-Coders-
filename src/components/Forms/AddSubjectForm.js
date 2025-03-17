import React, { useState } from "react";

const AddSubjectForm = ({ contract, account }) => {
  const [sectionId, setSectionId] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [teacherAddress, setTeacherAddress] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await contract.methods
        .addSubjectToSection(sectionId, subjectName, teacherAddress)
        .send({ from: account });
      setMessage("Subject added successfully!");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Subject</h3>
      <input
        type="number"
        placeholder="Section ID"
        value={sectionId}
        onChange={(e) => setSectionId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Subject Name"
        value={subjectName}
        onChange={(e) => setSubjectName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Teacher Address (0x...)"
        value={teacherAddress}
        onChange={(e) => setTeacherAddress(e.target.value)}
      />
      <button type="submit">Add Subject</button>
      <p>{message}</p>
    </form>
  );
};

export default AddSubjectForm;