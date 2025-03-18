import React, { useState, useEffect } from "react";
import "../styles/Panel.css";

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

  const fetchStudentNames = async (addresses) => {
    try {
      const newNames = {};
      const addressesToFetch = addresses.filter(addr => !studentNames[addr]);
      
      if (addressesToFetch.length > 0) {
        const names = await Promise.all(
          addressesToFetch.map(async (addr) => {
            try {
              const name = await contract.methods.getUserName(addr).call();
              return { addr, name: name.length > 0 ? name : "Unnamed" };
            } catch (error) {
              console.error(`Error fetching name for ${addr}:`, error);
              return { addr, name: "Unnamed" };
            }
          })
        );
        
        names.forEach(({ addr, name }) => {
          newNames[addr] = name;
        });
        
        setStudentNames(prev => ({ ...prev, ...newNames }));
      }
    } catch (error) {
      console.error("Error in batch name fetching:", error);
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
      await fetchStudentNames(students);

      const data = await Promise.all(
        students.map(async (student) => {
          const result = await contract.methods
            .getCombinedAttendance(student, sectionId)
            .call({ from: account });
          
          return {
            student,
            name: studentNames[student] || "Unnamed",
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

  const exportToCSV = () => {
    if (attendanceData.length === 0) {
      setMessage("No data to export");
      return;
    }

    const headers = ["Name", "Address", "Section", "Attended", "Total", "Percentage"];
    const csvData = attendanceData.map(data => [
      data.name,
      data.student,
      sectionId,
      data.attended,
      data.total,
      data.percentage.toFixed(2) + "%"
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_section_${sectionId}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (isStudentMode && contract && account) {
      setStudentAddresses([account]);
      fetchStudentNames([account]);
    }
  }, [contract, account, isStudentMode]);

  return (
    <div className="records-container">
      <div className="records-header">
        <h4>Attendance Records</h4>
        {isStudentMode ? (
          <p>Viewing attendance for: {studentNames[account] || "Unnamed"} ({account})</p>
        ) : (
          <div className="records-controls">
            <div className="control-group">
              <textarea
                placeholder="Enter student addresses (comma-separated, e.g., 0x123..., 0x456...); leave blank to auto-fetch"
                value={inputAddresses}
                onChange={(e) => setInputAddresses(e.target.value)}
                rows="3"
              />
              <button className="btn btn-primary" onClick={handleAddStudents}>Add Students</button>
            </div>

            <div className="control-group">
              <div className="input-row">
                <input
                  type="number"
                  placeholder="Section ID"
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                />
                <button className="btn btn-primary" onClick={fetchAttendance}>Fetch Attendance</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {!isStudentMode && attendanceData.length > 0 && (
        <div className="records-filters">
          <div className="filter-group">
            <label>Sort by:</label>
            <div className="input-row">
              <select value={sortField} onChange={(e) => setSortField(e.target.value)}>
                <option value="percentage">Percentage</option>
                <option value="attended">Attended</option>
                <option value="total">Total</option>
              </select>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
              <button className="btn btn-secondary" onClick={handleSort}>Sort</button>
            </div>
          </div>

          <div className="filter-group">
            <label>Filter by attendance:</label>
            <div className="input-row">
              <input
                type="number"
                placeholder="Threshold (%)"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="above">Above</option>
                <option value="below">Below</option>
              </select>
              <button className="btn btn-secondary" onClick={filterAttendance}>Filter</button>
            </div>
          </div>

          <div className="action-buttons">
            <button className="btn btn-secondary" onClick={resetList}>Reset</button>
            <button className="btn btn-primary" onClick={exportToCSV}>Export to CSV</button>
          </div>
        </div>
      )}

      {attendanceData.length > 0 ? (
        <div className="records-content">
          <div className="table-container">
            <table className="records-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Address</th>
                  <th>Section</th>
                  <th>Attended</th>
                  <th>Total</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((data, index) => (
                  <tr key={index}>
                    <td>{data.name}</td>
                    <td>{data.student}</td>
                    <td>{sectionId}</td>
                    <td>{data.attended}</td>
                    <td>{data.total}</td>
                    <td>{data.percentage.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="records-summary">
            <div className="summary-item">
              <span>Total Students:</span>
              <strong>{attendanceData.length}</strong>
            </div>
            <div className="summary-item">
              <span>Average Attendance:</span>
              <strong>
                {(attendanceData.reduce((sum, data) => sum + data.percentage, 0) / attendanceData.length).toFixed(2)}%
              </strong>
            </div>
          </div>
        </div>
      ) : (
        <p className="no-data">No attendance data available yet.</p>
      )}
      
      {message && (
        <div className={`message ${message.includes("Error") ? "error" : "success"}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default AttendanceList;