import React, { useState } from "react";
import geohash from "ngeohash";

const MarkAttendanceForm = ({ contract, account }) => {
  const [classId, setClassId] = useState("");
  const [studentGeohash, setStudentGeohash] = useState("");
  const [message, setMessage] = useState("");

  const getCurrentGeohash = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported by your browser.");
      return;
    }

    setMessage("Fetching your location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const hash = geohash.encode(latitude, longitude, 9); // Precision 9 (~38m accuracy)
        setStudentGeohash(hash);
        setMessage(`Geohash set to: ${hash}`);
      },
      (error) => {
        setMessage(`Error getting location: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!classId || !studentGeohash) {
      setMessage("Please provide a class ID and get your geohash.");
      return;
    }

    try {
      await contract.methods
        .markAttendance(classId, studentGeohash)
        .send({ from: account });
      setMessage("Attendance marked successfully!");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Mark Attendance</h3>
      <input
        type="number"
        placeholder="Class ID"
        value={classId}
        onChange={(e) => setClassId(e.target.value)}
      />
      <div>
        <input
          type="text"
          placeholder="Your Geohash"
          value={studentGeohash}
          onChange={(e) => setStudentGeohash(e.target.value)}
          readOnly // Optional: Make it read-only to enforce geolocation
        />
        <button type="button" onClick={getCurrentGeohash}>
          Get My Location
        </button>
      </div>
      <button type="submit">Mark Attendance</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default MarkAttendanceForm;