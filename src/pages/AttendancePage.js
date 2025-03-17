import React from "react";
import MarkAttendanceForm from "../components/Forms/MarkAttendanceForm";
import RequestAttendanceChangeForm from "../components/Forms/RequestAttendanceChangeForm";
import GetCombinedAttendanceForm from "../components/Forms/GetCombinedAttendanceForm";
import AttendanceList from "../components/Lists/AttendanceList";

const AttendancePage = ({ contract, account }) => {
  return (
    <div>
      <h2>Attendance Management</h2>
      {contract && account ? (
        <div className="attendance">
          <p>View attendance records.</p>
          <RequestAttendanceChangeForm contract={contract} account={account} />
          <GetCombinedAttendanceForm contract={contract} account={account} />
          <AttendanceList contract={contract} account={account} isStudentMode={false} />
        </div>

       
      ) : (
        <p>Please connect your wallet to manage attendance.</p>
      )}
    </div>
  );
};

export default AttendancePage;