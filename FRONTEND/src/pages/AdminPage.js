import React from "react";
import AdminPanel from "../components/Panels/AdminPanel";

const AdminPage = ({ contract, account, role }) => {
  return (
    <div>
      <h2>Admin Dashboard</h2>
      {contract && account ? (
        <div className="panel">
          <h3>Admin Panel</h3>
          <p>Welcome to the Admin Panel.</p>
          <p>Manage sections, subjects, students, and adjustments.</p>
          <AdminPanel contract={contract} account={account} />
        </div>
      ) : (
        <p>Please connect your wallet to access admin features.</p>
      )}
    </div>
  );
};

export default AdminPage;