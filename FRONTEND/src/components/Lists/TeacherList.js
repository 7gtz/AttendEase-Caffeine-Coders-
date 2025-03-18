import React, { useState, useEffect } from "react";

const TeacherList = ({ contract, account }) => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const isTeacherPromises = [];
      const namePromises = [];
      const sectionCounter = await contract.methods.sectionCounter().call();
      
      // Get all unique teacher addresses
      const uniqueTeachers = new Set();
      for (let i = 0; i < sectionCounter; i++) {
        const section = await contract.methods.sections(i).call();
        if (section.subjectIds) {
          for (let j = 0; j < section.subjectIds.length; j++) {
            const subject = await contract.methods.sections(i).subjects(j).call();
            if (subject.teacher) {
              uniqueTeachers.add(subject.teacher);
            }
          }
        }
      }

      const teacherArray = Array.from(uniqueTeachers);
      const teacherData = await Promise.all(
        teacherArray.map(async (address) => {
          const name = await contract.methods.getUserName(address).call();
          const isTeacher = await contract.methods.isTeacher(address).call();
          return {
            address,
            name: name || "Unnamed",
            isActive: isTeacher
          };
        })
      );

      setTeachers(teacherData);
      setMessage("");
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setMessage("Error fetching teachers. Please try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (contract && account) {
      fetchTeachers();
    }
  }, [contract, account]);

  return (
    <div className="teacher-list">
      <h3>Teachers</h3>
      {loading ? (
        <p>Loading teachers...</p>
      ) : (
        <>
          {message && <p className="error">{message}</p>}
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher, index) => (
                <tr key={index}>
                  <td>{teacher.name}</td>
                  <td>{teacher.address}</td>
                  <td>{teacher.isActive ? "Active" : "Inactive"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {teachers.length === 0 && <p>No teachers found.</p>}
        </>
      )}
    </div>
  );
};

export default TeacherList; 