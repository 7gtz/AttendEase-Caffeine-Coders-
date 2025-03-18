import React, { useState } from "react";

const ApproveAdjustmentForm = ({ contract, account }) => {
  const [requestId, setRequestId] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await contract.methods
        .approveAdjustment(requestId)
        .send({ from: account });
      setMessage("Adjustment approved successfully!");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Approve Adjustment</h3>
      <input
        type="text"
        placeholder="Request ID (bytes32)"
        value={requestId}
        onChange={(e) => setRequestId(e.target.value)}
      />
      <button type="submit">Approve</button>
      <p>{message}</p>
    </form>
  );
};

export default ApproveAdjustmentForm;