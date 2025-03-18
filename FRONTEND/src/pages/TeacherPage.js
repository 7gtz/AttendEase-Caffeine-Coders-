import React from "react";
import TeacherPanel from "../components/Panels/TeacherPanel";

const TeacherPage = ({ contract, account, role }) => {
  return (
    <div>
      <h2>Teacher Dashboard</h2>
      {contract && account ? (
        <div className="panel">
          <p>Schedule classes and manage attendance.</p>
          <TeacherPanel contract={contract} account={account} />
        </div>
      ) : (
        <p>Please connect your wallet to access teacher features.</p>
      )}
    </div>
  );
};

export default TeacherPage;