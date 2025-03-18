import React from "react";
import TeacherPanel from "../components/Panels/TeacherPanel";

const TeacherPage = ({ contract, account}) => {
  return (
    <div>
      <h2>Teacher Dashboard</h2>
      {contract && account ? (
        <div>
          <p>Schedule classes and manage attendance.</p>
          {role === "teacher" || role === "admin" ? (
            <TeacherPanel contract={contract} account={account} />
          ) : (
            <p>You do not have permission to access the Teacher Panel.</p>
          )}
        </div>
      ) : (
        <p>Please connect your wallet to access teacher features.</p>
      )}
    </div>
  );
};

export default TeacherPage;