import React from "react";
import ScheduleClassForm from "../Forms/ScheduleClassForm";
import CloseAttendanceForm from "../Forms/CloseAttendanceForm";
import GetSubjectClassForm from "../Forms/GetSubjectClassForm";
import SubjectList from "../Lists/SubjectList";
import AttendanceList from "../Lists/AttendanceList";

const TeacherPanel = ({ contract, account }) => {
  return (
    <div style={{ border: "1px solid #ccc", padding: "20px", marginTop: "20px" }}>
      <h3>Teacher Panel</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        <div style={{ flex: "1", minWidth: "300px" }}>
          <ScheduleClassForm contract={contract} account={account} />
          <CloseAttendanceForm contract={contract} account={account} />
          <GetSubjectClassForm contract={contract} account={account} />
        </div>
        <div style={{ flex: "1", minWidth: "300px" }}>
          <SubjectList contract={contract} account={account} />
        </div>
      </div>
      <AttendanceList contract={contract} account={account} isStudentMode={false} />
    </div>
  );
};

export default TeacherPanel;