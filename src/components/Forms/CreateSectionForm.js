import React, { useState } from "react";

const CreateSectionForm = ({ contract, account }) => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await contract.methods
        .createSection(name)
        .send({ from: account });
      setMessage("Section created successfully!");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Create Section</h3>
      <input
        type="text"
        placeholder="Section Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit">Create</button>
      <p>{message}</p>
    </form>
  );
};

export default CreateSectionForm;