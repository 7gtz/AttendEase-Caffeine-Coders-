import React from "react";
import AddStudentForm from "../Forms/AddStudentForm";
import AddSubjectForm from "../Forms/AddSubjectForm";
import CreateSectionForm from "../Forms/CreateSectionForm";
import RemoveStudentForm from "../Forms/RemoveStudentForm";
import TransferAdminForm from "../Forms/TransferAdminForm";
import ApproveAdjustmentForm from "../Forms/ApproveAdjustmentForm";
import SectionList from "../Lists/SectionList";
import TeacherList from "../Lists/TeacherList";

const AdminPanel = ({ contract, account }) => {
  return (
    <div style={{ border: "1px solid #ccc", padding: "20px", marginTop: "20px" }}>
      <h3>Admin Panel</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        <div style={{ flex: "1", minWidth: "300px" }}>
          <CreateSectionForm contract={contract} account={account} />
          <AddStudentForm contract={contract} account={account} />
          <RemoveStudentForm contract={contract} account={account} />
        </div>
        <div style={{ flex: "1", minWidth: "300px" }}>
          <AddSubjectForm contract={contract} account={account} />
          <ApproveAdjustmentForm contract={contract} account={account} />
          <TransferAdminForm contract={contract} account={account} />
        </div>
      </div>
      <div style={{ marginTop: "20px" }}>
        <TeacherList contract={contract} account={account} />
      </div>
      <div style={{ marginTop: "20px" }}>
        <SectionList contract={contract} account={account} />
      </div>
    </div>
  );
};

export default AdminPanel;