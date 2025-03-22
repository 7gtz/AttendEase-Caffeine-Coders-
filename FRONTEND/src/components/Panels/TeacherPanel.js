import React, { useState, useEffect } from "react";
import AttendanceList from "../Lists/AttendanceList";
import StartClassForm from "../Forms/StartClassForm";
import RequestAttendanceChangeForm from "../Forms/RequestAttendanceChangeForm";

const TeacherPanel = ({ contract, account }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchTeacherSubjects = async () => {
    setLoading(true);
    try {
      const sectionCounter = await contract.methods.sectionCounter().call();
      const teacherSubjects = [];

      for (let i = 0; i < sectionCounter; i++) {
        const section = await contract.methods.sections(i).call();
        if (section.subjectIds) {
          for (let j = 0; j < section.subjectIds.length; j++) {
            try {
              const subject = await contract.methods.sections(i).subjects(j).call();
              if (subject.teacher.toLowerCase() === account.toLowerCase()) {
                teacherSubjects.push({
                  sectionId: i,
                  subjectId: j,
                  name: subject.name
                });
              }
            } catch (error) {
              console.error(`Error fetching subject ${j} in section ${i}:`, error);
            }
          }
        }
      }

      setSubjects(teacherSubjects);
      setMessage(teacherSubjects.length === 0 ? "No subjects assigned yet." : "");
    } catch (error) {
      console.error("Error fetching teacher subjects:", error);
      setMessage("Error fetching subjects. Please try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (contract && account) {
      fetchTeacherSubjects();
    }
  }, [contract, account]);

  return (
    <div style={{ border: "1px solid #ccc", padding: "20px", marginTop: "20px" }}>
      <h3>Teacher Panel</h3>
      
      {loading ? (
        <p>Loading subjects...</p>
      ) : (
        <>
          {message && <p>{message}</p>}
          
          {subjects.length > 0 && (
            <div className="subject-list">
              <h4>Your Subjects:</h4>
              <ul>
                {subjects.map((subject, index) => (
                  <li key={index}>
                    {subject.name} (Section {subject.sectionId})
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginTop: "20px" }}>
            <div style={{ flex: "1", minWidth: "300px" }}>
              <StartClassForm 
                contract={contract} 
                account={account} 
                subjects={subjects}
              />
            </div>
            <div style={{ flex: "1", minWidth: "300px" }}>
              <RequestAttendanceChangeForm 
                contract={contract} 
                account={account}
              />
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <AttendanceList 
              contract={contract} 
              account={account} 
              isStudentMode={false}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default TeacherPanel;