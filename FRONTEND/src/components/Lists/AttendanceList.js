import React, { useState, useEffect } from "react";

const AttendanceList = ({ contract, account, isStudentMode = false }) => {
  const [studentAddresses, setStudentAddresses] = useState(isStudentMode ? [account] : []);
  const [inputAddresses, setInputAddresses] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [threshold, setThreshold] = useState("");
  const [filterType, setFilterType] = useState("above"); // "above" or "below"
  const [sortField, setSortField] = useState("percentage"); // "percentage", "attended", "total"
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" or "desc"
  const [message, setMessage] = useState("");
  const [studentNames, setStudentNames] = useState({});
  
  const fetchStudentsInSection = async (section) => {
    try {
      const sectionCounter = await contract.methods.sectionCounter().call({ from: account });
      if (parseInt(section) >= sectionCounter) {
        setMessage("Invalid section ID.");
        return [];
      }

      const students = [];
      const MAX_STUDENTS = 100;
      for (let i = 0; i < MAX_STUDENTS; i++) {
        const student = await contract.methods
          .sectionStudents(section, i)
          .call({ from: account });
        if (student === "0x0000000000000000000000000000000000000000" || !student) break;
        students.push(student);
      }
      return students;
    } catch (error) {
      setMessage(`Error fetching students: ${error.message}`);
      return [];
    }
  };

  const fetchAttendance = async () => {
    if (!sectionId) {
      setMessage("Please enter a section ID.");
      return;
    }

    let students = studentAddresses;
    if (!isStudentMode && students.length === 0) {
      students = await fetchStudentsInSection(sectionId);
      setStudentAddresses(students);
    }

    if (students.length === 0) {
      setMessage("No students found for this section.");
      return;
    }

    try {
      const data = await Promise.all(
        students.map(async (student) => {
          const result = await contract.methods
            .getCombinedAttendance(student, sectionId)
            .call({ from: account });
          const name = await contract.methods.getUserName(student).call();
          return {
            student,
            name: name.length > 0 ? name : "Unnamed",
            attended: parseInt(result.attended),
            total: parseInt(result.total),
            percentage: result.total > 0 ? (parseInt(result.attended) / parseInt(result.total)) * 100 : 0,
          };
        })
      );
      sortData(data);
      setMessage("");
    } catch (error) {
      setMessage(`Error fetching attendance: ${error.message}`);
      setAttendanceData([]);
    }
  };

  const sortData = (data) => {
    const sorted = [...data].sort((a, b) => {
      const valueA = a[sortField];
      const valueB = b[sortField];
      return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
    });
    setAttendanceData(sorted);
  };

  const handleSort = () => {
    sortData(attendanceData);
  };

  const handleAddStudents = () => {
    const addresses = inputAddresses
      .split(",")
      .map((addr) => addr.trim())
      .filter((addr) => addr.startsWith("0x") && addr.length === 42);
    setStudentAddresses(isStudentMode ? [account] : [...new Set([...studentAddresses, ...addresses])]);
    setInputAddresses("");
  };

  const filterAttendance = () => {
    if (!threshold || isNaN(threshold)) {
      setMessage("Please enter a valid threshold percentage.");
      return;
    }
    const threshNum = parseFloat(threshold);
    const filtered = attendanceData.filter((data) =>
      filterType === "above" ? data.percentage >= threshNum : data.percentage <= threshNum
    );
    setAttendanceData(filtered);
    setMessage(`Filtered to show students ${filterType} ${threshNum}% attendance.`);
  };

  const resetList = () => {
    setAttendanceData([]);
    setStudentAddresses(isStudentMode ? [account] : []);
    setSectionId("");
    setThreshold("");
    setSortField("percentage");
    setSortOrder("asc");
    setMessage("");
  };

  useEffect(() => {
    if (isStudentMode && contract && account) {
      setStudentAddresses([account]);
    }
  }, [contract, account, isStudentMode]);

    return (
      <div className="records">
        <div>
          <h3>Attendance Records</h3>
          <div>
            {isStudentMode ? (
              <p>Viewing attendance for: {studentNames[account] || "Unnamed"} ({account})</p>
            ) : (
              <>
                <textarea
                  placeholder="Enter student addresses (comma-separated, e.g., 0x123..., 0x456...); leave blank to auto-fetch"
                  value={inputAddresses}
                  onChange={(e) => setInputAddresses(e.target.value)}
                  rows="3"
                />
                <div className="button-group">
                  <button className="att" onClick={handleAddStudents}>Add Students</button>
                </div>
              </>
            )}
            <div className="button-group">
              <input
                type="number"
                placeholder="Section ID"
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
              />
              <button className="att" onClick={fetchAttendance}>Fetch Attendance</button>
            </div>
          </div>
    
          {!isStudentMode && (
            <div className="button-group" style={{ marginTop: "10px" }}>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
              >
                <option value="percentage">Percentage</option>
                <option value="attended">Attended</option>
                <option value="total">Total</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
              <button className="att" onClick={handleSort}>Sort</button>
              <input
                type="number"
                placeholder="Threshold (%)"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                style={{ width: "100px" }}
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="above">Above</option>
                <option value="below">Below</option>
              </select>
              <button className="att" onClick={filterAttendance}>Filter</button>
              <button className="att" onClick={resetList}>Reset</button>
            </div>
          )}
    
          {attendanceData.length > 0 ? (
            <ul>
              {attendanceData.map((data, index) => (
                <li key={index}>
                  Student: {data.name} ({data.student}) | Section: {sectionId} | Attended: {data.attended} | 
                  Total: {data.total} | Percentage: {data.percentage.toFixed(2)}%
                </li>
              ))}
            </ul>
          ) : (
            <p>No attendance data available yet.</p>
          )}
          {message && <p>{message}</p>}
        </div>
      </div>
    );
};

export default AttendanceList;