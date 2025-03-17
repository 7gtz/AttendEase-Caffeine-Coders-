import React, { useState } from "react";

const GetSubjectClassForm = ({ contract, account }) => {
  const [subjectName, setSubjectName] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const classIds = await contract.methods
        .getSubjectClasses(subjectName)
        .call({ from: account });
      setMessage(`Class IDs: ${classIds.join(", ")}`);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Get Subject Classes</h3>
      <input
        type="text"
        placeholder="Subject Name"
        value={subjectName}
        onChange={(e) => setSubjectName(e.target.value)}
      />
      <button type="submit">Get Classes</button>
      <p>{message}</p>
    </form>
  );
};

export default GetSubjectClassForm;