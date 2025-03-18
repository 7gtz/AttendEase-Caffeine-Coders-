import React, { useState } from "react";
import "../styles/Panel.css";

const StartClassForm = ({ contract, account, subjects }) => {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [duration, setDuration] = useState("");
  const [geohash, setGeohash] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!selectedSubject) {
        setMessage("Please select a subject");
        return;
      }

      const [sectionId, subjectId] = selectedSubject.split("-");
      
      // Get current location
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          try {
            // Convert lat/long to geohash (you'll need to implement this)
            const locationGeohash = position.coords.latitude.toString() + "," + position.coords.longitude.toString();
            
            await contract.methods
              .startClass(
                parseInt(sectionId),
                parseInt(subjectId),
                locationGeohash,
                parseInt(duration)
              )
              .send({ from: account });

            setMessage("Class started successfully!");
            setSelectedSubject("");
            setDuration("");
            setGeohash("");
          } catch (error) {
            console.error("Error starting class:", error);
            setMessage("Error starting class. Please try again.");
          }
        }, (error) => {
          setMessage("Error getting location. Please enable location services.");
          console.error("Geolocation error:", error);
        });
      } else {
        setMessage("Geolocation is not supported by your browser");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error starting class. Please try again.");
    }
    
    setLoading(false);
  };

  return (
    <div className="form-container">
      <h4>Start New Class</h4>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Subject:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            required
          >
            <option value="">Select a subject</option>
            {subjects.map((subject, index) => (
              <option key={index} value={`${subject.sectionId}-${subject.subjectId}`}>
                {subject.name} (Section {subject.sectionId})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Duration (minutes):</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="1"
            required
          />
        </div>

        <div className="button-group">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Starting..." : "Start Class"}
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

export default StartClassForm; 