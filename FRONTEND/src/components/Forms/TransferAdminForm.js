import React, { useState } from "react";

const TransferAdminForm = ({ contract, account }) => {
  const [newAdmin, setNewAdmin] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await contract.methods
        .transferAdmin(newAdmin)
        .send({ from: account });
      setMessage("Admin transferred successfully!");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Transfer Admin</h3>
      <input
        type="text"
        placeholder="New Admin Address (0x...)"
        value={newAdmin}
        onChange={(e) => setNewAdmin(e.target.value)}
      />
      <button type="submit">Transfer</button>
      <p>{message}</p>
    </form>
  );
};

export default TransferAdminForm;