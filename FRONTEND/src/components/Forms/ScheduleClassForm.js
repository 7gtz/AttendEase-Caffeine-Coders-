import React, { useState } from "react";

const ScheduleClassForm = ({ contract, account }) => {
  const [sectionId, setSectionId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [geohash, setGeohash] = useState("");
  const [duration, setDuration] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await contract.methods
        .startClass(
          sectionId,
          subjectId,
          `0x${Buffer.from(geohash).toString("hex").padEnd(64, "0")}`,
          duration
        )
        .send({ from: account });
      setMessage("Class scheduled successfully!");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Schedule Class</h3>
      <input
        type="number"
        placeholder="Section ID"
        value={sectionId}
        onChange={(e) => setSectionId(e.target.value)}
      />
      <input
        type="number"
        placeholder="Subject ID"
        value={subjectId}
        onChange={(e) => setSubjectId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Geohash (e.g., 9z7g8k12)"
        value={geohash}
        onChange={(e) => setGeohash(e.target.value)}
      />
      <input
        type="number"
        placeholder="Duration (minutes)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />
      <button type="submit">Schedule</button>
      <p>{message}</p>
    </form>
  );
};

export default ScheduleClassForm;