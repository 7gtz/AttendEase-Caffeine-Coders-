import React, { useState, useEffect } from "react";

const SubjectList = ({ contract, account }) => {
  const [subjectName, setSubjectName] = useState("");
  const [classes, setClasses] = useState([]);
  const [message, setMessage] = useState("");

  const fetchSubjectClasses = async () => {
    if (!subjectName) {
      setMessage("Please enter a subject name.");
      return;
    }
    try {
      const classIds = await contract.methods
        .getSubjectClasses(subjectName)
        .call({ from: account });
      const classDetails = [];
      for (const classId of classIds) {
        const classData = await contract.methods.classes(classId).call({ from: account });
        classDetails.push({
          id: classData.id,
          sectionId: classData.sectionId,
          subjectId: classData.subjectId,
          geohash: classData.geohash,
          startTime: new Date(classData.startTime * 1000).toLocaleString(),
          endTime: new Date(classData.endTime * 1000).toLocaleString(),
          attendanceClosed: classData.attendanceClosed,
        });
      }
      setClasses(classDetails);
      setMessage("");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setClasses([]);
    }
  };

  return (
    <div>
      <h3>Subject Classes</h3>
      <div>
        <input
          type="text"
          placeholder="Subject Name"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
        />
        <button onClick={fetchSubjectClasses}>Fetch Classes</button>
      </div>
      {classes.length > 0 ? (
        <ul>
          {classes.map((cls) => (
            <li key={cls.id}>
              Class ID: {cls.id} | Section: {cls.sectionId} | Subject ID: {cls.subjectId} | 
              Geohash: {cls.geohash} | Start: {cls.startTime} | End: {cls.endTime} | 
              Closed: {cls.attendanceClosed ? "Yes" : "No"}
            </li>
          ))}
        </ul>
      ) : (
        <p>No classes available for this subject.</p>
      )}
      {message && <p>{message}</p>}
    </div>
  );
};

export default SubjectList;