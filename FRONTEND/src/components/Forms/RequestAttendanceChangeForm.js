import React, { useState } from "react";
import "../styles/Panel.css";

const RequestAttendanceChangeForm = ({ contract, account }) => {
  const [classId, setClassId] = useState("");
  const [studentAddress, setStudentAddress] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await contract.methods
        .requestAdjustment(parseInt(classId), studentAddress)
        .send({ from: account });

      setMessage("Attendance adjustment requested successfully!");
      setClassId("");
      setStudentAddress("");
    } catch (error) {
      console.error("Error requesting adjustment:", error);
      setMessage("Error requesting adjustment. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="form-container">
      <h4>Request Attendance Change</h4>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Class ID:</label>
          <input
            type="number"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label>Student Address:</label>
          <input
            type="text"
            value={studentAddress}
            onChange={(e) => setStudentAddress(e.target.value)}
            placeholder="0x..."
            pattern="^0x[a-fA-F0-9]{40}$"
            required
          />
        </div>

        <div className="button-group">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Requesting..." : "Request Change"}
          </button>
        </div>
      </form>
      {message && (
        <p className={`message ${message.includes("Error") ? "error" : "success"}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default RequestAttendanceChangeForm;